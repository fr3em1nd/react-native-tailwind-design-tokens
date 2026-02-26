import type { TailwindConfig, TailwindTheme, DesignTokens } from '../types';
import deepmerge from 'deepmerge';

/**
 * Parse a Tailwind CSS config and convert to design tokens
 */
export function parseTailwindConfig(config: TailwindConfig): DesignTokens {
  const theme = config.theme || {};
  const extend = theme.extend || {};

  // Merge base theme with extensions
  const mergedTheme = deepmerge(theme, extend) as TailwindTheme;

  const tokens: DesignTokens = {};

  // Convert colors
  if (mergedTheme.colors) {
    tokens.colors = convertTailwindColors(mergedTheme.colors);
  }

  // Convert spacing
  if (mergedTheme.spacing) {
    tokens.spacing = convertTailwindSpacing(mergedTheme.spacing);
  }

  // Convert fontSize
  if (mergedTheme.fontSize) {
    tokens.fontSize = convertTailwindFontSize(mergedTheme.fontSize);
  }

  // Convert fontWeight
  if (mergedTheme.fontWeight) {
    tokens.fontWeight = convertTailwindFontWeight(mergedTheme.fontWeight);
  }

  // Convert fontFamily
  if (mergedTheme.fontFamily) {
    tokens.fontFamily = mergedTheme.fontFamily;
  }

  // Convert borderRadius
  if (mergedTheme.borderRadius) {
    tokens.borderRadius = convertTailwindBorderRadius(mergedTheme.borderRadius);
  }

  // Convert boxShadow
  if (mergedTheme.boxShadow) {
    tokens.shadow = convertTailwindBoxShadow(mergedTheme.boxShadow);
  }

  // Convert opacity
  if (mergedTheme.opacity) {
    tokens.opacity = convertTailwindOpacity(mergedTheme.opacity);
  }

  // Convert lineHeight
  if (mergedTheme.lineHeight) {
    tokens.lineHeight = convertTailwindLineHeight(mergedTheme.lineHeight);
  }

  // Convert letterSpacing
  if (mergedTheme.letterSpacing) {
    tokens.letterSpacing = convertTailwindLetterSpacing(mergedTheme.letterSpacing);
  }

  // Convert borderWidth
  if (mergedTheme.borderWidth) {
    tokens.borderWidth = convertTailwindBorderWidth(mergedTheme.borderWidth);
  }

  return tokens;
}

/**
 * Convert Tailwind colors to tokens
 */
function convertTailwindColors(
  colors: Record<string, string | Record<string, string>>
): Record<string, string | Record<string, string>> {
  const result: Record<string, string | Record<string, string>> = {};

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'function') {
      // Skip function-based colors (require CSS variable context)
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      result[key] = {};
      for (const [shade, color] of Object.entries(value)) {
        if (typeof color === 'string') {
          (result[key] as Record<string, string>)[shade] = color;
        }
      }
    } else if (typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Convert Tailwind spacing to numeric values
 */
function convertTailwindSpacing(spacing: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(spacing)) {
    result[key] = parseValue(value);
  }

  return result;
}

/**
 * Convert Tailwind fontSize to tokens
 */
function convertTailwindFontSize(
  fontSize: Record<string, string | [string, Record<string, string>]>
): Record<string, number | [number, Record<string, any>]> {
  const result: Record<string, number | [number, Record<string, any>]> = {};

  for (const [key, value] of Object.entries(fontSize)) {
    if (Array.isArray(value)) {
      const [size, options] = value;
      const parsedOptions: Record<string, any> = {};

      if (options.lineHeight) {
        parsedOptions.lineHeight = parseValue(options.lineHeight);
      }
      if (options.letterSpacing) {
        parsedOptions.letterSpacing = parseValue(options.letterSpacing);
      }
      if (options.fontWeight) {
        parsedOptions.fontWeight = options.fontWeight;
      }

      result[key] = [parseValue(size), parsedOptions];
    } else {
      result[key] = parseValue(value);
    }
  }

  return result;
}

/**
 * Convert Tailwind fontWeight to tokens
 */
function convertTailwindFontWeight(
  fontWeight: Record<string, string>
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(fontWeight)) {
    // Keep as string for React Native
    result[key] = value;
  }

  return result;
}

/**
 * Convert Tailwind borderRadius to numeric values
 */
function convertTailwindBorderRadius(
  borderRadius: Record<string, string>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(borderRadius)) {
    if (value === 'full' || value === '9999px') {
      result[key] = 9999;
    } else {
      result[key] = parseValue(value);
    }
  }

  return result;
}

/**
 * Convert Tailwind boxShadow to React Native shadow tokens
 */
function convertTailwindBoxShadow(
  boxShadow: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(boxShadow)) {
    if (value === 'none') {
      result[key] = {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        color: 'transparent',
      };
      continue;
    }

    // Parse CSS box-shadow syntax
    const parsed = parseBoxShadow(value);
    if (parsed) {
      result[key] = parsed;
    }
  }

  return result;
}

/**
 * Parse CSS box-shadow value
 */
function parseBoxShadow(shadow: string): any | null {
  // Handle multiple shadows - take the first one
  const firstShadow = shadow.split(',')[0].trim();

  // Basic regex for box-shadow: offsetX offsetY blur spread? color
  const match = firstShadow.match(
    /^(-?\d+(?:\.\d+)?(?:px|rem|em)?)\s+(-?\d+(?:\.\d+)?(?:px|rem|em)?)\s+(-?\d+(?:\.\d+)?(?:px|rem|em)?)\s*(-?\d+(?:\.\d+)?(?:px|rem|em)?)?\s*(.*)?$/
  );

  if (!match) {
    // Try parsing named shadow formats or return default
    return {
      offsetX: 0,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.1)',
    };
  }

  const [, offsetX, offsetY, blur, spread, color] = match;

  return {
    offsetX: parseValue(offsetX),
    offsetY: parseValue(offsetY),
    blur: parseValue(blur),
    spread: spread ? parseValue(spread) : 0,
    color: color?.trim() || 'rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Convert Tailwind opacity to numeric values
 */
function convertTailwindOpacity(opacity: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(opacity)) {
    const num = parseFloat(value);
    // Tailwind uses 0-100, we need 0-1
    result[key] = num > 1 ? num / 100 : num;
  }

  return result;
}

/**
 * Convert Tailwind lineHeight to numeric values
 */
function convertTailwindLineHeight(
  lineHeight: Record<string, string>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(lineHeight)) {
    result[key] = parseValue(value);
  }

  return result;
}

/**
 * Convert Tailwind letterSpacing to numeric values
 */
function convertTailwindLetterSpacing(
  letterSpacing: Record<string, string>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(letterSpacing)) {
    result[key] = parseValue(value);
  }

  return result;
}

/**
 * Convert Tailwind borderWidth to numeric values
 */
function convertTailwindBorderWidth(
  borderWidth: Record<string, string>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(borderWidth)) {
    result[key] = parseValue(value);
  }

  return result;
}

/**
 * Parse a CSS value to a number (handling rem, em, px)
 */
function parseValue(value: string | number): number {
  if (typeof value === 'number') return value;

  const trimmed = value.trim();

  if (trimmed.endsWith('rem')) {
    return parseFloat(trimmed) * 16;
  }
  if (trimmed.endsWith('em')) {
    return parseFloat(trimmed) * 16;
  }
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith('%')) {
    // Percentage - keep as is for certain contexts
    return parseFloat(trimmed);
  }

  return parseFloat(trimmed) || 0;
}

/**
 * Load and parse a Tailwind config file
 */
export async function loadTailwindConfig(filePath: string): Promise<TailwindConfig> {
  const fs = await import('fs').then((m) => m.promises);
  const path = await import('path');

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const content = await fs.readFile(absolutePath, 'utf-8');

  // Handle different config formats
  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  }

  // For JS/TS configs, try to evaluate
  // Note: This is a simplified version - production might need proper module loading
  try {
    // Try to parse as JSON-like object
    const jsonMatch = content.match(/module\.exports\s*=\s*({[\s\S]*})/);
    if (jsonMatch) {
      // This is a simplified parser - for complex configs, use a proper JS evaluator
      const configStr = jsonMatch[1]
        .replace(/\/\/.*$/gm, '') // Remove comments
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

      return new Function(`return ${configStr}`)();
    }

    // Try export default
    const exportMatch = content.match(/export\s+default\s+({[\s\S]*})/);
    if (exportMatch) {
      const configStr = exportMatch[1]
        .replace(/\/\/.*$/gm, '')
        .replace(/,(\s*[}\]])/g, '$1');

      return new Function(`return ${configStr}`)();
    }
  } catch (error) {
    console.warn('Could not parse Tailwind config as JS, attempting JSON parse');
  }

  // Fallback: try JSON parse directly
  return JSON.parse(content);
}
