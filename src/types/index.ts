// React Native Style Types (compatible with RN StyleSheet)
// These are simplified versions that work without the react-native package

export interface ViewStyle {
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  aspectRatio?: number;
  backfaceVisibility?: 'visible' | 'hidden';
  backgroundColor?: string;
  borderBottomColor?: string;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomWidth?: number;
  borderColor?: string;
  borderLeftColor?: string;
  borderLeftWidth?: number;
  borderRadius?: number;
  borderRightColor?: string;
  borderRightWidth?: number;
  borderStyle?: 'solid' | 'dotted' | 'dashed';
  borderTopColor?: string;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  bottom?: number | string;
  display?: 'none' | 'flex';
  elevation?: number;
  flex?: number;
  flexBasis?: number | string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: number;
  columnGap?: number;
  rowGap?: number;
  height?: number | string;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  left?: number | string;
  margin?: number | string;
  marginBottom?: number | string;
  marginEnd?: number | string;
  marginHorizontal?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  marginStart?: number | string;
  marginTop?: number | string;
  marginVertical?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  padding?: number | string;
  paddingBottom?: number | string;
  paddingEnd?: number | string;
  paddingHorizontal?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  paddingStart?: number | string;
  paddingTop?: number | string;
  paddingVertical?: number | string;
  position?: 'absolute' | 'relative';
  right?: number | string;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  top?: number | string;
  transform?: any[];
  width?: number | string;
  zIndex?: number;
  [key: string]: any;
}

export interface TextStyle extends ViewStyle {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textDecorationColor?: string;
  textShadowColor?: string;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  writingDirection?: 'auto' | 'ltr' | 'rtl';
}

export interface ImageStyle extends ViewStyle {
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  tintColor?: string;
  overlayColor?: string;
}

// Design Token Types
export interface ColorToken {
  value: string;
  description?: string;
  type: 'color';
}

export interface SpacingToken {
  value: number | string;
  description?: string;
  type: 'spacing';
}

export interface FontSizeToken {
  value: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  description?: string;
  type: 'fontSize';
}

export interface FontWeightToken {
  value: string | number;
  description?: string;
  type: 'fontWeight';
}

export interface FontFamilyToken {
  value: string;
  description?: string;
  type: 'fontFamily';
}

export interface BorderRadiusToken {
  value: number | string;
  description?: string;
  type: 'borderRadius';
}

export interface ShadowToken {
  value: {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread?: number;
    color: string;
  };
  description?: string;
  type: 'shadow';
}

export interface OpacityToken {
  value: number;
  description?: string;
  type: 'opacity';
}

export type DesignToken =
  | ColorToken
  | SpacingToken
  | FontSizeToken
  | FontWeightToken
  | FontFamilyToken
  | BorderRadiusToken
  | ShadowToken
  | OpacityToken;

export interface DesignTokens {
  colors?: Record<string, string | Record<string, string>>;
  spacing?: Record<string, number | string>;
  fontSize?: Record<string, number | string | [number | string, Record<string, any>]>;
  fontWeight?: Record<string, string | number>;
  fontFamily?: Record<string, string | string[]>;
  borderRadius?: Record<string, number | string>;
  shadow?: Record<string, ShadowToken['value'] | string>;
  opacity?: Record<string, number>;
  lineHeight?: Record<string, number | string>;
  letterSpacing?: Record<string, number | string>;
  borderWidth?: Record<string, number>;
  // Extended tokens
  [key: string]: Record<string, any> | undefined;
}

// Tailwind Config Types
export interface TailwindTheme {
  colors?: Record<string, string | Record<string, string>>;
  spacing?: Record<string, string>;
  fontSize?: Record<string, string | [string, Record<string, string>]>;
  fontWeight?: Record<string, string>;
  fontFamily?: Record<string, string[]>;
  borderRadius?: Record<string, string>;
  boxShadow?: Record<string, string>;
  opacity?: Record<string, string>;
  lineHeight?: Record<string, string>;
  letterSpacing?: Record<string, string>;
  borderWidth?: Record<string, string>;
  extend?: Partial<TailwindTheme>;
}

export interface TailwindConfig {
  theme?: TailwindTheme;
  [key: string]: any;
}

// Figma Token Types
export interface FigmaTokenValue {
  value: string | number | Record<string, any>;
  type: string;
  description?: string;
}

export interface FigmaTokenSet {
  [key: string]: FigmaTokenValue | FigmaTokenSet;
}

export interface FigmaTokensFile {
  [tokenSet: string]: FigmaTokenSet;
}

// React Native Style Types
export type RNStyle = ViewStyle | TextStyle | ImageStyle;

export interface GeneratedStyles {
  [className: string]: RNStyle;
}

// Configuration Types
export interface TokenConfig {
  /**
   * Path to design tokens JSON file
   */
  tokensPath?: string;

  /**
   * Path to Tailwind config file
   */
  tailwindPath?: string;

  /**
   * Figma configuration for token sync
   */
  figma?: FigmaConfig;

  /**
   * Output path for generated styles
   */
  outputPath?: string;

  /**
   * Custom token transformers
   */
  transformers?: TokenTransformers;

  /**
   * Platform-specific settings
   */
  platform?: 'ios' | 'android' | 'web' | 'all';

  /**
   * Enable watch mode
   */
  watch?: boolean;

  /**
   * Custom prefix for generated classes
   */
  prefix?: string;

  /**
   * Include default Tailwind utilities
   */
  includeDefaults?: boolean;
}

export interface FigmaConfig {
  /**
   * Figma personal access token
   */
  accessToken: string;

  /**
   * Figma file ID containing design tokens
   */
  fileId?: string;

  /**
   * URL to Figma Tokens plugin JSON export
   */
  tokensUrl?: string;

  /**
   * Token sets to include
   */
  tokenSets?: string[];

  /**
   * Polling interval for sync (in ms)
   */
  syncInterval?: number;
}

export interface TokenTransformers {
  color?: (value: string) => string;
  spacing?: (value: number | string) => number;
  fontSize?: (value: number | string) => number;
  fontWeight?: (value: string | number) => TextStyle['fontWeight'];
  borderRadius?: (value: number | string) => number;
  shadow?: (value: any) => ViewStyle;
  opacity?: (value: number) => number;
  [key: string]: ((value: any) => any) | undefined;
}

// Event Types
export interface TokenChangeEvent {
  type: 'add' | 'update' | 'delete';
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

export type TokenChangeCallback = (event: TokenChangeEvent) => void;

// Utility Class Types
export interface UtilityClass {
  name: string;
  style: RNStyle;
  category: string;
  variants?: string[];
}

export interface StyleSheet {
  styles: GeneratedStyles;
  utilities: UtilityClass[];
  tokens: DesignTokens;
  metadata: {
    generatedAt: Date;
    version: string;
    source: 'tokens' | 'tailwind' | 'figma' | 'merged';
  };
}
