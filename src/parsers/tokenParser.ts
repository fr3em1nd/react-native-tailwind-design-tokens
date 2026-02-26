import type { DesignTokens, TokenTransformers } from '../types';
import { defaultTokens } from '../core/defaults';
import deepmerge from 'deepmerge';

/**
 * Default token transformers for converting values to React Native compatible formats
 */
export const defaultTransformers: TokenTransformers = {
  color: (value: string) => {
    // Handle CSS variables or other formats
    if (value.startsWith('var(')) {
      console.warn(`CSS variables not supported in React Native: ${value}`);
      return value;
    }
    return value;
  },

  spacing: (value: number | string) => {
    if (typeof value === 'number') return value;
    // Handle rem/em values (assume 16px base)
    if (typeof value === 'string') {
      if (value.endsWith('rem')) {
        return parseFloat(value) * 16;
      }
      if (value.endsWith('em')) {
        return parseFloat(value) * 16;
      }
      if (value.endsWith('px')) {
        return parseFloat(value);
      }
      return parseFloat(value) || 0;
    }
    return 0;
  },

  fontSize: (value: number | string) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value.endsWith('rem')) {
        return parseFloat(value) * 16;
      }
      if (value.endsWith('px')) {
        return parseFloat(value);
      }
      return parseFloat(value) || 16;
    }
    return 16;
  },

  fontWeight: (value: string | number) => {
    const weights: Record<string, string> = {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    };

    if (typeof value === 'string' && weights[value.toLowerCase()]) {
      return weights[value.toLowerCase()] as any;
    }
    return String(value) as any;
  },

  borderRadius: (value: number | string) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value.endsWith('px')) {
        return parseFloat(value);
      }
      if (value.endsWith('rem')) {
        return parseFloat(value) * 16;
      }
      if (value === 'full') {
        return 9999;
      }
      return parseFloat(value) || 0;
    }
    return 0;
  },

  shadow: (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return {
        shadowColor: value.color || '#000000',
        shadowOffset: {
          width: value.offsetX || 0,
          height: value.offsetY || 0,
        },
        shadowOpacity: 1,
        shadowRadius: value.blur || 0,
        elevation: Math.round((value.blur || 0) / 2), // Android elevation approximation
      };
    }
    return {};
  },

  opacity: (value: number) => {
    if (typeof value === 'number') {
      return value > 1 ? value / 100 : value;
    }
    return parseFloat(String(value)) || 1;
  },
};

/**
 * Parse and normalize design tokens from various formats
 */
export function parseTokens(
  tokens: DesignTokens,
  options: {
    transformers?: TokenTransformers;
    includeDefaults?: boolean;
    prefix?: string;
  } = {}
): DesignTokens {
  const { transformers = {}, includeDefaults = false, prefix = '' } = options;

  const mergedTransformers = { ...defaultTransformers, ...transformers };

  // Start with defaults if requested
  let baseTokens: DesignTokens = includeDefaults ? { ...defaultTokens } : {};

  // Deep merge user tokens
  const mergedTokens = deepmerge(baseTokens, tokens);

  // Transform and normalize tokens
  const normalizedTokens: DesignTokens = {};

  // Process colors
  if (mergedTokens.colors) {
    normalizedTokens.colors = processNestedTokens(
      mergedTokens.colors,
      mergedTransformers.color!,
      prefix
    );
  }

  // Process spacing
  if (mergedTokens.spacing) {
    normalizedTokens.spacing = processTokens(
      mergedTokens.spacing,
      mergedTransformers.spacing!,
      prefix
    );
  }

  // Process fontSize
  if (mergedTokens.fontSize) {
    normalizedTokens.fontSize = processFontSize(mergedTokens.fontSize, mergedTransformers);
  }

  // Process fontWeight
  if (mergedTokens.fontWeight) {
    normalizedTokens.fontWeight = processTokens(
      mergedTokens.fontWeight,
      mergedTransformers.fontWeight!,
      prefix
    ) as Record<string, string | number>;
  }

  // Process fontFamily
  if (mergedTokens.fontFamily) {
    normalizedTokens.fontFamily = processFontFamily(mergedTokens.fontFamily);
  }

  // Process borderRadius
  if (mergedTokens.borderRadius) {
    normalizedTokens.borderRadius = processTokens(
      mergedTokens.borderRadius,
      mergedTransformers.borderRadius!,
      prefix
    );
  }

  // Process opacity
  if (mergedTokens.opacity) {
    normalizedTokens.opacity = processTokens(
      mergedTokens.opacity,
      mergedTransformers.opacity!,
      prefix
    );
  }

  // Process shadow
  if (mergedTokens.shadow) {
    normalizedTokens.shadow = mergedTokens.shadow;
  }

  // Process lineHeight
  if (mergedTokens.lineHeight) {
    normalizedTokens.lineHeight = processTokens(
      mergedTokens.lineHeight,
      (v) => (typeof v === 'number' ? v : parseFloat(String(v)) || 1),
      prefix
    );
  }

  // Process letterSpacing
  if (mergedTokens.letterSpacing) {
    normalizedTokens.letterSpacing = processTokens(
      mergedTokens.letterSpacing,
      mergedTransformers.spacing!,
      prefix
    );
  }

  // Process borderWidth
  if (mergedTokens.borderWidth) {
    normalizedTokens.borderWidth = processTokens(
      mergedTokens.borderWidth,
      (v) => (typeof v === 'number' ? v : parseFloat(String(v)) || 0),
      prefix
    );
  }

  return normalizedTokens;
}

/**
 * Process simple key-value tokens
 */
function processTokens<T>(
  tokens: Record<string, any>,
  transformer: (value: any) => T,
  prefix: string
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [key, value] of Object.entries(tokens)) {
    const prefixedKey = prefix ? `${prefix}-${key}` : key;
    result[prefixedKey] = transformer(value);
  }

  return result;
}

/**
 * Process nested tokens (like colors with shades)
 */
function processNestedTokens(
  tokens: Record<string, any>,
  transformer: (value: string) => string,
  prefix: string
): Record<string, string | Record<string, string>> {
  const result: Record<string, string | Record<string, string>> = {};

  for (const [key, value] of Object.entries(tokens)) {
    const prefixedKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null) {
      result[prefixedKey] = {};
      for (const [shade, colorValue] of Object.entries(value)) {
        (result[prefixedKey] as Record<string, string>)[shade] = transformer(colorValue as string);
      }
    } else {
      result[prefixedKey] = transformer(value as string);
    }
  }

  return result;
}

/**
 * Process fontSize tokens with optional lineHeight
 */
function processFontSize(
  tokens: Record<string, any>,
  transformers: TokenTransformers
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (Array.isArray(value)) {
      const [size, options] = value;
      result[key] = [
        transformers.fontSize!(size),
        options ? { ...options } : {},
      ];
    } else {
      result[key] = transformers.fontSize!(value);
    }
  }

  return result;
}

/**
 * Process fontFamily tokens
 */
function processFontFamily(
  tokens: Record<string, string | string[]>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (Array.isArray(value)) {
      // Take the first font in the stack for React Native
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Load tokens from a JSON file path
 */
export async function loadTokensFromFile(filePath: string): Promise<DesignTokens> {
  const fs = await import('fs').then((m) => m.promises);
  const path = await import('path');

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const content = await fs.readFile(absolutePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Validate tokens structure
 */
export function validateTokens(tokens: unknown): tokens is DesignTokens {
  if (typeof tokens !== 'object' || tokens === null) {
    return false;
  }

  const validKeys = [
    'colors',
    'spacing',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'borderRadius',
    'shadow',
    'opacity',
    'lineHeight',
    'letterSpacing',
    'borderWidth',
  ];

  for (const key of Object.keys(tokens)) {
    if (!validKeys.includes(key)) {
      console.warn(`Unknown token key: ${key}`);
    }
  }

  return true;
}
