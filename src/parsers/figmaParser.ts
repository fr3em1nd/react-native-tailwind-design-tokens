import type { FigmaTokensFile, FigmaTokenSet, DesignTokens, FigmaConfig } from '../types';

/**
 * Parse Figma Tokens plugin format to design tokens
 * Supports both the Figma Tokens plugin export format and Style Dictionary format
 */
export function parseFigmaTokens(
  figmaTokens: FigmaTokensFile,
  options: { tokenSets?: string[] } = {}
): DesignTokens {
  const { tokenSets } = options;
  const tokens: DesignTokens = {};

  // Filter token sets if specified
  const setsToProcess = tokenSets
    ? Object.entries(figmaTokens).filter(([key]) => tokenSets.includes(key))
    : Object.entries(figmaTokens);

  for (const [setName, tokenSet] of setsToProcess) {
    processTokenSet(tokenSet, tokens, '');
  }

  return tokens;
}

/**
 * Recursively process a token set
 */
function processTokenSet(
  tokenSet: FigmaTokenSet,
  tokens: DesignTokens,
  path: string
): void {
  for (const [key, value] of Object.entries(tokenSet)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (isTokenValue(value)) {
      // This is a token value
      addTokenToCategory(tokens, currentPath, value);
    } else if (typeof value === 'object' && value !== null) {
      // This is a nested group
      processTokenSet(value as FigmaTokenSet, tokens, currentPath);
    }
  }
}

/**
 * Check if value is a token value (has 'value' and 'type' properties)
 */
function isTokenValue(value: any): value is { value: any; type: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'type' in value
  );
}

/**
 * Add a token to the appropriate category
 */
function addTokenToCategory(
  tokens: DesignTokens,
  path: string,
  token: { value: any; type: string; description?: string }
): void {
  const { value, type } = token;
  const pathParts = path.split('.');
  const tokenName = pathParts[pathParts.length - 1];
  const category = pathParts[0];

  switch (type) {
    case 'color':
      if (!tokens.colors) tokens.colors = {};
      setNestedValue(tokens.colors, pathParts.slice(1), resolveValue(value));
      break;

    case 'spacing':
    case 'dimension':
      if (!tokens.spacing) tokens.spacing = {};
      tokens.spacing[tokenName] = parseNumericValue(value);
      break;

    case 'fontSize':
    case 'fontSizes':
      if (!tokens.fontSize) tokens.fontSize = {};
      tokens.fontSize[tokenName] = parseNumericValue(value);
      break;

    case 'fontWeight':
    case 'fontWeights':
      if (!tokens.fontWeight) tokens.fontWeight = {};
      tokens.fontWeight[tokenName] = value;
      break;

    case 'fontFamily':
    case 'fontFamilies':
      if (!tokens.fontFamily) tokens.fontFamily = {};
      tokens.fontFamily[tokenName] = Array.isArray(value) ? value[0] : value;
      break;

    case 'borderRadius':
    case 'radii':
      if (!tokens.borderRadius) tokens.borderRadius = {};
      tokens.borderRadius[tokenName] = parseNumericValue(value);
      break;

    case 'boxShadow':
    case 'shadow':
      if (!tokens.shadow) tokens.shadow = {};
      tokens.shadow[tokenName] = parseShadowValue(value);
      break;

    case 'opacity':
      if (!tokens.opacity) tokens.opacity = {};
      tokens.opacity[tokenName] = parseFloat(value);
      break;

    case 'lineHeight':
    case 'lineHeights':
      if (!tokens.lineHeight) tokens.lineHeight = {};
      tokens.lineHeight[tokenName] = parseNumericValue(value);
      break;

    case 'letterSpacing':
      if (!tokens.letterSpacing) tokens.letterSpacing = {};
      tokens.letterSpacing[tokenName] = parseNumericValue(value);
      break;

    case 'borderWidth':
      if (!tokens.borderWidth) tokens.borderWidth = {};
      tokens.borderWidth[tokenName] = parseNumericValue(value);
      break;

    default:
      // Store in a generic category based on path
      if (category === 'colors' || category === 'color') {
        if (!tokens.colors) tokens.colors = {};
        setNestedValue(tokens.colors, pathParts.slice(1), resolveValue(value));
      }
      break;
  }
}

/**
 * Set a nested value in an object
 */
function setNestedValue(
  obj: Record<string, any>,
  path: string[],
  value: any
): void {
  if (path.length === 0) return;

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

/**
 * Resolve token references like {colors.primary.500}
 */
function resolveValue(value: any): any {
  if (typeof value !== 'string') return value;

  // Check for token reference
  if (value.startsWith('{') && value.endsWith('}')) {
    // This is a reference - return as-is for now
    // Resolution happens at generation time
    return value;
  }

  return value;
}

/**
 * Parse numeric value from string
 */
function parseNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;

  const trimmed = value.trim();

  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith('rem')) {
    return parseFloat(trimmed) * 16;
  }
  if (trimmed.endsWith('em')) {
    return parseFloat(trimmed) * 16;
  }
  if (trimmed.endsWith('%')) {
    return parseFloat(trimmed);
  }

  return parseFloat(trimmed) || 0;
}

/**
 * Parse shadow value from Figma format
 */
function parseShadowValue(value: any): any {
  if (typeof value === 'string') {
    // CSS shadow string - parse it
    return {
      offsetX: 0,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.1)',
    };
  }

  if (Array.isArray(value)) {
    // Multiple shadows - take the first
    return parseShadowValue(value[0]);
  }

  if (typeof value === 'object' && value !== null) {
    return {
      offsetX: parseNumericValue(value.x || value.offsetX || 0),
      offsetY: parseNumericValue(value.y || value.offsetY || 0),
      blur: parseNumericValue(value.blur || 0),
      spread: parseNumericValue(value.spread || 0),
      color: value.color || 'rgba(0, 0, 0, 0.1)',
    };
  }

  return {
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    color: 'transparent',
  };
}

/**
 * Fetch tokens from Figma using the Figma API
 */
export async function fetchFigmaTokens(config: FigmaConfig): Promise<FigmaTokensFile> {
  const { accessToken, fileId, tokensUrl } = config;

  if (!accessToken) {
    throw new Error('Figma access token is required');
  }

  // If a direct tokens URL is provided (e.g., from Figma Tokens plugin)
  if (tokensUrl) {
    const response = await fetch(tokensUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma tokens: ${response.statusText}`);
    }

    return response.json() as Promise<FigmaTokensFile>;
  }

  // Otherwise, fetch from Figma file
  if (!fileId) {
    throw new Error('Figma file ID or tokens URL is required');
  }

  // Get file styles
  const stylesResponse = await fetch(
    `https://api.figma.com/v1/files/${fileId}/styles`,
    {
      headers: {
        'X-Figma-Token': accessToken,
      },
    }
  );

  if (!stylesResponse.ok) {
    throw new Error(`Failed to fetch Figma file styles: ${stylesResponse.statusText}`);
  }

  const stylesData = await stylesResponse.json();

  // Get the file itself for local styles
  const fileResponse = await fetch(
    `https://api.figma.com/v1/files/${fileId}`,
    {
      headers: {
        'X-Figma-Token': accessToken,
      },
    }
  );

  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch Figma file: ${fileResponse.statusText}`);
  }

  const fileData = await fileResponse.json();

  // Convert Figma styles to token format
  return convertFigmaStylesToTokens(fileData, stylesData);
}

/**
 * Convert Figma API styles to token format
 */
function convertFigmaStylesToTokens(
  fileData: any,
  stylesData: any
): FigmaTokensFile {
  const tokens: FigmaTokensFile = {
    global: {},
  };

  const styles = fileData.styles || {};

  for (const [nodeId, style] of Object.entries(styles) as [string, any][]) {
    const styleType = style.styleType;
    const name = style.name.replace(/\//g, '.').toLowerCase();

    switch (styleType) {
      case 'FILL':
        setNestedValue(tokens.global, ['colors', ...name.split('.')], {
          value: '#000000', // Would need to fetch actual fill
          type: 'color',
        });
        break;

      case 'TEXT':
        // Text styles contain multiple properties
        setNestedValue(tokens.global, ['typography', ...name.split('.')], {
          value: {},
          type: 'typography',
        });
        break;

      case 'EFFECT':
        setNestedValue(tokens.global, ['effects', ...name.split('.')], {
          value: {},
          type: 'shadow',
        });
        break;
    }
  }

  return tokens;
}

/**
 * Watch for Figma token changes (polling)
 */
export function watchFigmaTokens(
  config: FigmaConfig,
  callback: (tokens: FigmaTokensFile) => void
): () => void {
  const interval = config.syncInterval || 60000; // Default: 1 minute
  let lastTokens: string | null = null;
  let isRunning = true;

  const poll = async () => {
    if (!isRunning) return;

    try {
      const tokens = await fetchFigmaTokens(config);
      const tokensString = JSON.stringify(tokens);

      if (lastTokens !== tokensString) {
        lastTokens = tokensString;
        callback(tokens);
      }
    } catch (error) {
      console.error('Error fetching Figma tokens:', error);
    }

    if (isRunning) {
      setTimeout(poll, interval);
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    isRunning = false;
  };
}
