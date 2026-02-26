import type {
  DesignTokens,
  GeneratedStyles,
  RNStyle,
  UtilityClass,
  StyleSheet,
  TokenTransformers,
  ViewStyle,
  TextStyle,
} from '../types';
import { defaultTransformers } from '../parsers/tokenParser';

/**
 * Generate React Native styles from design tokens
 */
export function generateStyles(
  tokens: DesignTokens,
  options: {
    prefix?: string;
    platform?: 'ios' | 'android' | 'web' | 'all';
    transformers?: TokenTransformers;
  } = {}
): StyleSheet {
  const { prefix = '', platform = 'all', transformers = {} } = options;
  const mergedTransformers = { ...defaultTransformers, ...transformers };

  const styles: GeneratedStyles = {};
  const utilities: UtilityClass[] = [];

  // Generate color utilities
  if (tokens.colors) {
    generateColorStyles(tokens.colors, styles, utilities, prefix);
  }

  // Generate spacing utilities
  if (tokens.spacing) {
    generateSpacingStyles(tokens.spacing, styles, utilities, prefix);
  }

  // Generate typography utilities
  if (tokens.fontSize) {
    generateFontSizeStyles(tokens.fontSize, styles, utilities, prefix, mergedTransformers);
  }

  if (tokens.fontWeight) {
    generateFontWeightStyles(tokens.fontWeight, styles, utilities, prefix);
  }

  if (tokens.fontFamily) {
    generateFontFamilyStyles(tokens.fontFamily, styles, utilities, prefix);
  }

  if (tokens.lineHeight) {
    generateLineHeightStyles(tokens.lineHeight, styles, utilities, prefix);
  }

  if (tokens.letterSpacing) {
    generateLetterSpacingStyles(tokens.letterSpacing, styles, utilities, prefix);
  }

  // Generate border utilities
  if (tokens.borderRadius) {
    generateBorderRadiusStyles(tokens.borderRadius, styles, utilities, prefix);
  }

  if (tokens.borderWidth) {
    generateBorderWidthStyles(tokens.borderWidth, styles, utilities, prefix);
  }

  // Generate shadow utilities
  if (tokens.shadow) {
    generateShadowStyles(tokens.shadow, styles, utilities, prefix, platform);
  }

  // Generate opacity utilities
  if (tokens.opacity) {
    generateOpacityStyles(tokens.opacity, styles, utilities, prefix);
  }

  // Generate layout utilities (flex, position, etc.)
  generateLayoutStyles(styles, utilities, prefix);

  return {
    styles,
    utilities,
    tokens,
    metadata: {
      generatedAt: new Date(),
      version: '1.0.0',
      source: 'tokens',
    },
  };
}

/**
 * Generate color-based style utilities
 */
function generateColorStyles(
  colors: Record<string, string | Record<string, string>>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const flatColors = flattenColors(colors);

  for (const [colorName, colorValue] of Object.entries(flatColors)) {
    const baseName = prefix ? `${prefix}-` : '';

    // Background color
    const bgName = `${baseName}bg-${colorName}`;
    styles[bgName] = { backgroundColor: colorValue };
    utilities.push({
      name: bgName,
      style: styles[bgName],
      category: 'backgroundColor',
    });

    // Text color
    const textName = `${baseName}text-${colorName}`;
    styles[textName] = { color: colorValue };
    utilities.push({
      name: textName,
      style: styles[textName],
      category: 'textColor',
    });

    // Border color
    const borderName = `${baseName}border-${colorName}`;
    styles[borderName] = { borderColor: colorValue };
    utilities.push({
      name: borderName,
      style: styles[borderName],
      category: 'borderColor',
    });

    // Tint color (for images)
    const tintName = `${baseName}tint-${colorName}`;
    styles[tintName] = { tintColor: colorValue } as any;
    utilities.push({
      name: tintName,
      style: styles[tintName],
      category: 'tintColor',
    });
  }
}

/**
 * Generate spacing style utilities
 */
function generateSpacingStyles(
  spacing: Record<string, number | string>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(spacing)) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;

    // Margin utilities
    const margins: [string, ViewStyle][] = [
      [`${baseName}m-${key}`, { margin: numValue }],
      [`${baseName}mx-${key}`, { marginHorizontal: numValue }],
      [`${baseName}my-${key}`, { marginVertical: numValue }],
      [`${baseName}mt-${key}`, { marginTop: numValue }],
      [`${baseName}mr-${key}`, { marginRight: numValue }],
      [`${baseName}mb-${key}`, { marginBottom: numValue }],
      [`${baseName}ml-${key}`, { marginLeft: numValue }],
      [`${baseName}ms-${key}`, { marginStart: numValue }],
      [`${baseName}me-${key}`, { marginEnd: numValue }],
    ];

    for (const [name, style] of margins) {
      styles[name] = style;
      utilities.push({ name, style, category: 'margin' });
    }

    // Padding utilities
    const paddings: [string, ViewStyle][] = [
      [`${baseName}p-${key}`, { padding: numValue }],
      [`${baseName}px-${key}`, { paddingHorizontal: numValue }],
      [`${baseName}py-${key}`, { paddingVertical: numValue }],
      [`${baseName}pt-${key}`, { paddingTop: numValue }],
      [`${baseName}pr-${key}`, { paddingRight: numValue }],
      [`${baseName}pb-${key}`, { paddingBottom: numValue }],
      [`${baseName}pl-${key}`, { paddingLeft: numValue }],
      [`${baseName}ps-${key}`, { paddingStart: numValue }],
      [`${baseName}pe-${key}`, { paddingEnd: numValue }],
    ];

    for (const [name, style] of paddings) {
      styles[name] = style;
      utilities.push({ name, style, category: 'padding' });
    }

    // Size utilities
    const sizes: [string, ViewStyle][] = [
      [`${baseName}w-${key}`, { width: numValue }],
      [`${baseName}h-${key}`, { height: numValue }],
      [`${baseName}size-${key}`, { width: numValue, height: numValue }],
      [`${baseName}min-w-${key}`, { minWidth: numValue }],
      [`${baseName}min-h-${key}`, { minHeight: numValue }],
      [`${baseName}max-w-${key}`, { maxWidth: numValue }],
      [`${baseName}max-h-${key}`, { maxHeight: numValue }],
    ];

    for (const [name, style] of sizes) {
      styles[name] = style;
      utilities.push({ name, style, category: 'sizing' });
    }

    // Gap utilities
    const gaps: [string, ViewStyle][] = [
      [`${baseName}gap-${key}`, { gap: numValue }],
      [`${baseName}gap-x-${key}`, { columnGap: numValue }],
      [`${baseName}gap-y-${key}`, { rowGap: numValue }],
    ];

    for (const [name, style] of gaps) {
      styles[name] = style;
      utilities.push({ name, style, category: 'gap' });
    }

    // Position utilities
    const positions: [string, ViewStyle][] = [
      [`${baseName}top-${key}`, { top: numValue }],
      [`${baseName}right-${key}`, { right: numValue }],
      [`${baseName}bottom-${key}`, { bottom: numValue }],
      [`${baseName}left-${key}`, { left: numValue }],
      [`${baseName}inset-${key}`, { top: numValue, right: numValue, bottom: numValue, left: numValue }],
      [`${baseName}inset-x-${key}`, { left: numValue, right: numValue }],
      [`${baseName}inset-y-${key}`, { top: numValue, bottom: numValue }],
    ];

    for (const [name, style] of positions) {
      styles[name] = style;
      utilities.push({ name, style, category: 'position' });
    }
  }

  // Negative spacing
  for (const [key, value] of Object.entries(spacing)) {
    if (key === '0' || key === 'px') continue;

    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const negValue = -numValue;

    const negMargins: [string, ViewStyle][] = [
      [`${baseName}-m-${key}`, { margin: negValue }],
      [`${baseName}-mx-${key}`, { marginHorizontal: negValue }],
      [`${baseName}-my-${key}`, { marginVertical: negValue }],
      [`${baseName}-mt-${key}`, { marginTop: negValue }],
      [`${baseName}-mr-${key}`, { marginRight: negValue }],
      [`${baseName}-mb-${key}`, { marginBottom: negValue }],
      [`${baseName}-ml-${key}`, { marginLeft: negValue }],
    ];

    for (const [name, style] of negMargins) {
      styles[name] = style;
      utilities.push({ name, style, category: 'margin' });
    }
  }
}

/**
 * Generate font size utilities
 */
function generateFontSizeStyles(
  fontSize: Record<string, any>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string,
  transformers: TokenTransformers
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(fontSize)) {
    let size: number;
    let additionalStyles: Partial<TextStyle> = {};

    if (Array.isArray(value)) {
      const [rawSize, options] = value;
      size = transformers.fontSize!(rawSize);

      if (options?.lineHeight !== undefined) {
        additionalStyles.lineHeight = transformers.fontSize!(options.lineHeight);
      }
      if (options?.letterSpacing !== undefined) {
        additionalStyles.letterSpacing = transformers.spacing!(options.letterSpacing);
      }
    } else {
      size = transformers.fontSize!(value);
    }

    const name = `${baseName}text-${key}`;
    styles[name] = { fontSize: size, ...additionalStyles };
    utilities.push({ name, style: styles[name], category: 'fontSize' });
  }
}

/**
 * Generate font weight utilities
 */
function generateFontWeightStyles(
  fontWeight: Record<string, string | number>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(fontWeight)) {
    const name = `${baseName}font-${key}`;
    styles[name] = { fontWeight: String(value) as TextStyle['fontWeight'] };
    utilities.push({ name, style: styles[name], category: 'fontWeight' });
  }
}

/**
 * Generate font family utilities
 */
function generateFontFamilyStyles(
  fontFamily: Record<string, string | string[]>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(fontFamily)) {
    const name = `${baseName}font-${key}`;
    const family = Array.isArray(value) ? value[0] : value;
    styles[name] = { fontFamily: family };
    utilities.push({ name, style: styles[name], category: 'fontFamily' });
  }
}

/**
 * Generate line height utilities
 */
function generateLineHeightStyles(
  lineHeight: Record<string, number | string>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(lineHeight)) {
    const name = `${baseName}leading-${key}`;
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 1;
    styles[name] = { lineHeight: numValue };
    utilities.push({ name, style: styles[name], category: 'lineHeight' });
  }
}

/**
 * Generate letter spacing utilities
 */
function generateLetterSpacingStyles(
  letterSpacing: Record<string, number | string>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(letterSpacing)) {
    const name = `${baseName}tracking-${key}`;
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    styles[name] = { letterSpacing: numValue };
    utilities.push({ name, style: styles[name], category: 'letterSpacing' });
  }
}

/**
 * Generate border radius utilities
 */
function generateBorderRadiusStyles(
  borderRadius: Record<string, number | string>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(borderRadius)) {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const suffix = key === 'DEFAULT' ? '' : `-${key}`;

    // All corners
    const roundedName = `${baseName}rounded${suffix}`;
    styles[roundedName] = { borderRadius: numValue };
    utilities.push({ name: roundedName, style: styles[roundedName], category: 'borderRadius' });

    // Individual corners
    const corners: [string, ViewStyle][] = [
      [`${baseName}rounded-t${suffix}`, { borderTopLeftRadius: numValue, borderTopRightRadius: numValue }],
      [`${baseName}rounded-r${suffix}`, { borderTopRightRadius: numValue, borderBottomRightRadius: numValue }],
      [`${baseName}rounded-b${suffix}`, { borderBottomLeftRadius: numValue, borderBottomRightRadius: numValue }],
      [`${baseName}rounded-l${suffix}`, { borderTopLeftRadius: numValue, borderBottomLeftRadius: numValue }],
      [`${baseName}rounded-tl${suffix}`, { borderTopLeftRadius: numValue }],
      [`${baseName}rounded-tr${suffix}`, { borderTopRightRadius: numValue }],
      [`${baseName}rounded-bl${suffix}`, { borderBottomLeftRadius: numValue }],
      [`${baseName}rounded-br${suffix}`, { borderBottomRightRadius: numValue }],
    ];

    for (const [name, style] of corners) {
      styles[name] = style;
      utilities.push({ name, style, category: 'borderRadius' });
    }
  }
}

/**
 * Generate border width utilities
 */
function generateBorderWidthStyles(
  borderWidth: Record<string, number>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(borderWidth)) {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`;

    // All sides
    const borderName = `${baseName}border${suffix}`;
    styles[borderName] = { borderWidth: value };
    utilities.push({ name: borderName, style: styles[borderName], category: 'borderWidth' });

    // Individual sides
    const sides: [string, ViewStyle][] = [
      [`${baseName}border-t${suffix}`, { borderTopWidth: value }],
      [`${baseName}border-r${suffix}`, { borderRightWidth: value }],
      [`${baseName}border-b${suffix}`, { borderBottomWidth: value }],
      [`${baseName}border-l${suffix}`, { borderLeftWidth: value }],
      [`${baseName}border-x${suffix}`, { borderLeftWidth: value, borderRightWidth: value }],
      [`${baseName}border-y${suffix}`, { borderTopWidth: value, borderBottomWidth: value }],
    ];

    for (const [name, style] of sides) {
      styles[name] = style;
      utilities.push({ name, style, category: 'borderWidth' });
    }
  }
}

/**
 * Generate shadow utilities
 */
function generateShadowStyles(
  shadow: Record<string, any>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string,
  platform: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(shadow)) {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`;
    const name = `${baseName}shadow${suffix}`;

    let style: ViewStyle;

    if (typeof value === 'object' && value !== null) {
      style = {
        shadowColor: value.color || '#000000',
        shadowOffset: {
          width: value.offsetX || 0,
          height: value.offsetY || 0,
        },
        shadowOpacity: 1,
        shadowRadius: value.blur || 0,
      };

      // Add elevation for Android
      if (platform === 'android' || platform === 'all') {
        (style as any).elevation = Math.round((value.blur || 0) / 2);
      }
    } else {
      style = {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      };
    }

    styles[name] = style;
    utilities.push({ name, style: styles[name], category: 'shadow' });
  }
}

/**
 * Generate opacity utilities
 */
function generateOpacityStyles(
  opacity: Record<string, number>,
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  for (const [key, value] of Object.entries(opacity)) {
    const name = `${baseName}opacity-${key}`;
    styles[name] = { opacity: value };
    utilities.push({ name, style: styles[name], category: 'opacity' });
  }
}

/**
 * Generate layout utilities (flex, position, display, etc.)
 */
function generateLayoutStyles(
  styles: GeneratedStyles,
  utilities: UtilityClass[],
  prefix: string
): void {
  const baseName = prefix ? `${prefix}-` : '';

  // Display
  const displayStyles: [string, ViewStyle][] = [
    [`${baseName}flex`, { display: 'flex' }],
    [`${baseName}hidden`, { display: 'none' }],
  ];

  // Flex direction
  const flexDirectionStyles: [string, ViewStyle][] = [
    [`${baseName}flex-row`, { flexDirection: 'row' }],
    [`${baseName}flex-row-reverse`, { flexDirection: 'row-reverse' }],
    [`${baseName}flex-col`, { flexDirection: 'column' }],
    [`${baseName}flex-col-reverse`, { flexDirection: 'column-reverse' }],
  ];

  // Flex wrap
  const flexWrapStyles: [string, ViewStyle][] = [
    [`${baseName}flex-wrap`, { flexWrap: 'wrap' }],
    [`${baseName}flex-wrap-reverse`, { flexWrap: 'wrap-reverse' }],
    [`${baseName}flex-nowrap`, { flexWrap: 'nowrap' }],
  ];

  // Flex grow/shrink
  const flexGrowShrinkStyles: [string, ViewStyle][] = [
    [`${baseName}flex-1`, { flex: 1 }],
    [`${baseName}flex-auto`, { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' }],
    [`${baseName}flex-initial`, { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' }],
    [`${baseName}flex-none`, { flex: 0 }],
    [`${baseName}grow`, { flexGrow: 1 }],
    [`${baseName}grow-0`, { flexGrow: 0 }],
    [`${baseName}shrink`, { flexShrink: 1 }],
    [`${baseName}shrink-0`, { flexShrink: 0 }],
  ];

  // Justify content
  const justifyStyles: [string, ViewStyle][] = [
    [`${baseName}justify-start`, { justifyContent: 'flex-start' }],
    [`${baseName}justify-end`, { justifyContent: 'flex-end' }],
    [`${baseName}justify-center`, { justifyContent: 'center' }],
    [`${baseName}justify-between`, { justifyContent: 'space-between' }],
    [`${baseName}justify-around`, { justifyContent: 'space-around' }],
    [`${baseName}justify-evenly`, { justifyContent: 'space-evenly' }],
  ];

  // Align items
  const alignItemsStyles: [string, ViewStyle][] = [
    [`${baseName}items-start`, { alignItems: 'flex-start' }],
    [`${baseName}items-end`, { alignItems: 'flex-end' }],
    [`${baseName}items-center`, { alignItems: 'center' }],
    [`${baseName}items-baseline`, { alignItems: 'baseline' }],
    [`${baseName}items-stretch`, { alignItems: 'stretch' }],
  ];

  // Align self
  const alignSelfStyles: [string, ViewStyle][] = [
    [`${baseName}self-auto`, { alignSelf: 'auto' }],
    [`${baseName}self-start`, { alignSelf: 'flex-start' }],
    [`${baseName}self-end`, { alignSelf: 'flex-end' }],
    [`${baseName}self-center`, { alignSelf: 'center' }],
    [`${baseName}self-stretch`, { alignSelf: 'stretch' }],
    [`${baseName}self-baseline`, { alignSelf: 'baseline' }],
  ];

  // Align content
  const alignContentStyles: [string, ViewStyle][] = [
    [`${baseName}content-start`, { alignContent: 'flex-start' }],
    [`${baseName}content-end`, { alignContent: 'flex-end' }],
    [`${baseName}content-center`, { alignContent: 'center' }],
    [`${baseName}content-between`, { alignContent: 'space-between' }],
    [`${baseName}content-around`, { alignContent: 'space-around' }],
    [`${baseName}content-stretch`, { alignContent: 'stretch' }],
  ];

  // Position
  const positionStyles: [string, ViewStyle][] = [
    [`${baseName}relative`, { position: 'relative' }],
    [`${baseName}absolute`, { position: 'absolute' }],
  ];

  // Overflow
  const overflowStyles: [string, ViewStyle][] = [
    [`${baseName}overflow-visible`, { overflow: 'visible' }],
    [`${baseName}overflow-hidden`, { overflow: 'hidden' }],
    [`${baseName}overflow-scroll`, { overflow: 'scroll' }],
  ];

  // Z-index
  const zIndexStyles: [string, ViewStyle][] = [
    [`${baseName}z-0`, { zIndex: 0 }],
    [`${baseName}z-10`, { zIndex: 10 }],
    [`${baseName}z-20`, { zIndex: 20 }],
    [`${baseName}z-30`, { zIndex: 30 }],
    [`${baseName}z-40`, { zIndex: 40 }],
    [`${baseName}z-50`, { zIndex: 50 }],
  ];

  // Text alignment
  const textAlignStyles: [string, TextStyle][] = [
    [`${baseName}text-left`, { textAlign: 'left' }],
    [`${baseName}text-center`, { textAlign: 'center' }],
    [`${baseName}text-right`, { textAlign: 'right' }],
    [`${baseName}text-justify`, { textAlign: 'justify' }],
    [`${baseName}text-auto`, { textAlign: 'auto' }],
  ];

  // Text decoration
  const textDecorationStyles: [string, TextStyle][] = [
    [`${baseName}underline`, { textDecorationLine: 'underline' }],
    [`${baseName}line-through`, { textDecorationLine: 'line-through' }],
    [`${baseName}no-underline`, { textDecorationLine: 'none' }],
  ];

  // Text transform
  const textTransformStyles: [string, TextStyle][] = [
    [`${baseName}uppercase`, { textTransform: 'uppercase' }],
    [`${baseName}lowercase`, { textTransform: 'lowercase' }],
    [`${baseName}capitalize`, { textTransform: 'capitalize' }],
    [`${baseName}normal-case`, { textTransform: 'none' }],
  ];

  // Font style
  const fontStyleStyles: [string, TextStyle][] = [
    [`${baseName}italic`, { fontStyle: 'italic' }],
    [`${baseName}not-italic`, { fontStyle: 'normal' }],
  ];

  // Combine all layout styles
  const allLayoutStyles = [
    ...displayStyles,
    ...flexDirectionStyles,
    ...flexWrapStyles,
    ...flexGrowShrinkStyles,
    ...justifyStyles,
    ...alignItemsStyles,
    ...alignSelfStyles,
    ...alignContentStyles,
    ...positionStyles,
    ...overflowStyles,
    ...zIndexStyles,
    ...textAlignStyles,
    ...textDecorationStyles,
    ...textTransformStyles,
    ...fontStyleStyles,
  ];

  for (const [name, style] of allLayoutStyles) {
    styles[name] = style;
    utilities.push({ name, style, category: 'layout' });
  }
}

/**
 * Flatten nested color object
 */
function flattenColors(
  colors: Record<string, string | Record<string, string>>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(colors)) {
    const colorKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null) {
      const nested = flattenColors(value, colorKey);
      Object.assign(result, nested);
    } else {
      result[colorKey] = value;
    }
  }

  return result;
}

/**
 * Export styles to a file
 */
export async function exportStyles(
  stylesheet: StyleSheet,
  outputPath: string,
  options: {
    format?: 'ts' | 'js' | 'json';
    includeTypes?: boolean;
  } = {}
): Promise<void> {
  const fs = await import('fs').then((m) => m.promises);
  const path = await import('path');

  const { format = 'ts', includeTypes = true } = options;
  const absolutePath = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);

  let content: string;

  switch (format) {
    case 'json':
      content = JSON.stringify(stylesheet.styles, null, 2);
      break;

    case 'js':
      content = generateJSOutput(stylesheet);
      break;

    case 'ts':
    default:
      content = generateTSOutput(stylesheet, includeTypes);
      break;
  }

  // Ensure directory exists
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf-8');
}

/**
 * Generate TypeScript output
 */
function generateTSOutput(stylesheet: StyleSheet, includeTypes: boolean): string {
  const styleEntries = Object.entries(stylesheet.styles)
    .map(([key, value]) => `  '${key}': ${JSON.stringify(value)},`)
    .join('\n');

  const tokenExports = Object.entries(stylesheet.tokens)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)} as const;`)
    .join('\n\n');

  return `// Auto-generated by rn-tailwind-tokens
// Generated at: ${stylesheet.metadata.generatedAt.toISOString()}

import { StyleSheet } from 'react-native';

${includeTypes ? `export type StyleName = keyof typeof styles;\n` : ''}

export const styles = StyleSheet.create({
${styleEntries}
});

${tokenExports}

// Utility function to combine styles
export function tw(...classNames: (StyleName | undefined | null | false)[]): any {
  return classNames
    .filter(Boolean)
    .map((name) => styles[name as StyleName])
    .reduce((acc, style) => ({ ...acc, ...style }), {});
}

// Re-export tokens for direct access
export const tokens = ${JSON.stringify(stylesheet.tokens, null, 2)};

export default styles;
`;
}

/**
 * Generate JavaScript output
 */
function generateJSOutput(stylesheet: StyleSheet): string {
  const styleEntries = Object.entries(stylesheet.styles)
    .map(([key, value]) => `  '${key}': ${JSON.stringify(value)},`)
    .join('\n');

  return `// Auto-generated by rn-tailwind-tokens
// Generated at: ${stylesheet.metadata.generatedAt.toISOString()}

const { StyleSheet } = require('react-native');

const styles = StyleSheet.create({
${styleEntries}
});

// Utility function to combine styles
function tw(...classNames) {
  return classNames
    .filter(Boolean)
    .map((name) => styles[name])
    .reduce((acc, style) => ({ ...acc, ...style }), {});
}

const tokens = ${JSON.stringify(stylesheet.tokens, null, 2)};

module.exports = { styles, tw, tokens };
module.exports.default = styles;
`;
}
