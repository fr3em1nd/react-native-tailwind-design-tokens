// Main entry point for rn-tailwind-tokens

// Core exports
export { TokenManager, createTokenManager } from './core/TokenManager';
export { defaultTokens } from './core/defaults';

// Parser exports
export {
  parseTokens,
  loadTokensFromFile,
  validateTokens,
  defaultTransformers,
} from './parsers/tokenParser';
export { parseTailwindConfig, loadTailwindConfig } from './parsers/tailwindParser';
export {
  parseFigmaTokens,
  fetchFigmaTokens,
  watchFigmaTokens,
} from './parsers/figmaParser';

// Generator exports
export { generateStyles, exportStyles } from './generators/styleGenerator';

// Watcher exports
export { TokenWatcher, createWatcher, watchAndRegenerate } from './watch/watcher';

// Type exports
export type {
  // Token types
  DesignTokens,
  DesignToken,
  ColorToken,
  SpacingToken,
  FontSizeToken,
  FontWeightToken,
  FontFamilyToken,
  BorderRadiusToken,
  ShadowToken,
  OpacityToken,
  // Config types
  TokenConfig,
  FigmaConfig,
  TokenTransformers,
  // Tailwind types
  TailwindConfig,
  TailwindTheme,
  // Figma types
  FigmaTokensFile,
  FigmaTokenSet,
  FigmaTokenValue,
  // Style types
  RNStyle,
  GeneratedStyles,
  UtilityClass,
  StyleSheet,
  // Event types
  TokenChangeEvent,
  TokenChangeCallback,
} from './types';

// Convenience function for quick setup
export async function createStyles(config: {
  tokens?: string | Record<string, any>;
  tailwind?: string;
  figma?: {
    accessToken: string;
    fileId?: string;
    tokensUrl?: string;
  };
  output?: string;
  includeDefaults?: boolean;
}): Promise<{
  styles: Record<string, any>;
  tokens: Record<string, any>;
  tw: (...classNames: string[]) => any;
}> {
  const { TokenManager } = await import('./core/TokenManager');

  const tokenConfig: any = {
    includeDefaults: config.includeDefaults ?? true,
    outputPath: config.output,
  };

  if (typeof config.tokens === 'string') {
    tokenConfig.tokensPath = config.tokens;
  }

  if (config.tailwind) {
    tokenConfig.tailwindPath = config.tailwind;
  }

  if (config.figma) {
    tokenConfig.figma = config.figma;
  }

  const manager = new TokenManager(tokenConfig);
  await manager.init();

  // If tokens was an object, merge it
  if (typeof config.tokens === 'object' && config.tokens !== null) {
    await manager.update(config.tokens);
  }

  const stylesheet = manager.generate();

  // Export if output path specified
  if (config.output) {
    await manager.export();
  }

  // Create tw utility function
  const tw = (...classNames: (string | undefined | null | false)[]) => {
    return classNames
      .filter(Boolean)
      .map((name) => stylesheet.styles[name as string])
      .filter(Boolean)
      .reduce((acc, style) => ({ ...acc, ...style }), {});
  };

  return {
    styles: stylesheet.styles,
    tokens: stylesheet.tokens,
    tw,
  };
}
