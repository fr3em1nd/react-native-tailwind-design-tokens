/**
 * React Native specific exports and utilities
 * Import from 'rn-tailwind-tokens/react-native' for React Native optimized code
 */

import type { GeneratedStyles, RNStyle, DesignTokens } from './types';
import { defaultTokens } from './core/defaults';
import { generateStyles } from './generators/styleGenerator';

// Re-export core functionality
export { TokenManager, createTokenManager } from './core/TokenManager';
export { defaultTokens } from './core/defaults';
export { generateStyles, exportStyles } from './generators/styleGenerator';
export type { DesignTokens, RNStyle, GeneratedStyles } from './types';

/**
 * Pre-generated default styles
 */
let cachedStyles: GeneratedStyles | null = null;
let cachedTokens: DesignTokens | null = null;

/**
 * Get pre-generated styles from default tokens
 * Use with React Native's StyleSheet.create() for better performance:
 * const styles = StyleSheet.create(getDefaultStyles());
 */
export function getDefaultStyles(): GeneratedStyles {
  if (!cachedStyles) {
    const stylesheet = generateStyles(defaultTokens);
    cachedStyles = stylesheet.styles;
    cachedTokens = stylesheet.tokens;
  }
  return cachedStyles;
}

/**
 * Get default tokens
 */
export function getTokens(): DesignTokens {
  if (!cachedTokens) {
    getDefaultStyles();
  }
  return cachedTokens!;
}

/**
 * Utility function to combine multiple style classes
 * Similar to the `cn` utility in class-variance-authority
 */
export function tw(
  ...classNames: (string | undefined | null | false)[]
): RNStyle {
  const styles = getDefaultStyles();
  return classNames
    .filter((name): name is string => typeof name === 'string')
    .map((name) => styles[name])
    .filter(Boolean)
    .reduce((acc, style) => ({ ...acc, ...style }), {} as RNStyle);
}

/**
 * Create a styled component factory
 */
export function createStyled<T extends GeneratedStyles = GeneratedStyles>(
  customTokens?: Partial<DesignTokens>
): {
  styles: T;
  tw: (...classNames: (string | undefined | null | false)[]) => RNStyle;
  tokens: DesignTokens;
} {
  const mergedTokens = customTokens
    ? { ...defaultTokens, ...customTokens }
    : defaultTokens;

  const stylesheet = generateStyles(mergedTokens);
  const styles = stylesheet.styles as T;

  const twFn = (...classNames: (string | undefined | null | false)[]): RNStyle => {
    return classNames
      .filter((name): name is string => typeof name === 'string')
      .map((name) => styles[name as keyof T] as RNStyle)
      .filter(Boolean)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as RNStyle);
  };

  return {
    styles,
    tw: twFn,
    tokens: stylesheet.tokens,
  };
}

/**
 * Create conditional styles based on conditions
 */
export function cx(
  ...inputs: (string | Record<string, boolean> | undefined | null | false)[]
): RNStyle {
  const styles = getDefaultStyles();
  const classNames: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classNames.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classNames.push(key);
        }
      }
    }
  }

  return classNames
    .map((name) => styles[name])
    .filter(Boolean)
    .reduce((acc, style) => ({ ...acc, ...style }), {} as RNStyle);
}

/**
 * Theme provider utilities
 */
export interface Theme {
  colors: DesignTokens['colors'];
  spacing: DesignTokens['spacing'];
  fontSize: DesignTokens['fontSize'];
  [key: string]: any;
}

/**
 * Create a theme from tokens
 */
export function createTheme(tokens: Partial<DesignTokens> = {}): Theme {
  const merged = { ...defaultTokens, ...tokens };
  return merged as Theme;
}

/**
 * Get a specific color from the theme
 */
export function getColor(
  colorPath: string,
  tokens: DesignTokens = defaultTokens
): string | undefined {
  const parts = colorPath.split('-');
  const colors = tokens.colors;

  if (!colors) return undefined;

  if (parts.length === 1) {
    const value = colors[parts[0]];
    return typeof value === 'string' ? value : undefined;
  }

  const [colorName, ...rest] = parts;
  const colorGroup = colors[colorName];

  if (typeof colorGroup === 'object' && colorGroup !== null) {
    return colorGroup[rest.join('-')];
  }

  return undefined;
}

/**
 * Get a specific spacing value from tokens
 */
export function getSpacing(
  key: string,
  tokens: DesignTokens = defaultTokens
): number | undefined {
  const spacing = tokens.spacing;
  if (!spacing) return undefined;

  const value = spacing[key];
  return typeof value === 'number' ? value : undefined;
}

/**
 * Responsive style utilities for React Native
 */
export interface ResponsiveValue<T> {
  default: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

/**
 * Get breakpoint values for responsive styles
 * Note: React Native doesn't have CSS media queries, but this can be used with
 * Dimensions API or react-native-responsive-screen
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Helper to get responsive value based on screen width
 */
export function responsive<T>(
  screenWidth: number,
  values: ResponsiveValue<T>
): T {
  if (screenWidth >= breakpoints.xl && values.xl !== undefined) {
    return values.xl;
  }
  if (screenWidth >= breakpoints.lg && values.lg !== undefined) {
    return values.lg;
  }
  if (screenWidth >= breakpoints.md && values.md !== undefined) {
    return values.md;
  }
  if (screenWidth >= breakpoints.sm && values.sm !== undefined) {
    return values.sm;
  }
  return values.default;
}

// Export styles getter as default
export default getDefaultStyles;
