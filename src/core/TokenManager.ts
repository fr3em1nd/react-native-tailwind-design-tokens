import type {
  DesignTokens,
  TokenConfig,
  StyleSheet,
  TokenChangeCallback,
  FigmaTokensFile,
} from '../types';
import { parseTokens, loadTokensFromFile } from '../parsers/tokenParser';
import { parseTailwindConfig, loadTailwindConfig } from '../parsers/tailwindParser';
import { parseFigmaTokens, fetchFigmaTokens, watchFigmaTokens } from '../parsers/figmaParser';
import { generateStyles, exportStyles } from '../generators/styleGenerator';
import { TokenWatcher, createWatcher } from '../watch/watcher';
import { defaultTokens } from './defaults';
import deepmerge from 'deepmerge';

/**
 * Main class for managing design tokens and generating React Native styles
 */
export class TokenManager {
  private config: TokenConfig;
  private tokens: DesignTokens = {};
  private stylesheet: StyleSheet | null = null;
  private watcher: TokenWatcher | null = null;
  private figmaWatcherCleanup: (() => void) | null = null;
  private changeCallbacks: Set<TokenChangeCallback> = new Set();

  constructor(config: TokenConfig = {}) {
    this.config = {
      includeDefaults: true,
      platform: 'all',
      ...config,
    };
  }

  /**
   * Initialize the token manager
   */
  async init(): Promise<void> {
    await this.loadTokens();

    if (this.config.watch) {
      this.startWatching();
    }
  }

  /**
   * Load tokens from all configured sources
   */
  async loadTokens(): Promise<DesignTokens> {
    let mergedTokens: DesignTokens = {};

    // Start with defaults if configured
    if (this.config.includeDefaults) {
      mergedTokens = { ...defaultTokens };
    }

    // Load from tokens file
    if (this.config.tokensPath) {
      try {
        const fileTokens = await loadTokensFromFile(this.config.tokensPath);
        const parsed = parseTokens(fileTokens, {
          transformers: this.config.transformers,
          prefix: this.config.prefix,
        });
        mergedTokens = deepmerge(mergedTokens, parsed);
      } catch (error) {
        console.error(`Error loading tokens from ${this.config.tokensPath}:`, error);
      }
    }

    // Load from Tailwind config
    if (this.config.tailwindPath) {
      try {
        const tailwindConfig = await loadTailwindConfig(this.config.tailwindPath);
        const tailwindTokens = parseTailwindConfig(tailwindConfig);
        const parsed = parseTokens(tailwindTokens, {
          transformers: this.config.transformers,
          prefix: this.config.prefix,
        });
        mergedTokens = deepmerge(mergedTokens, parsed);
      } catch (error) {
        console.error(`Error loading Tailwind config from ${this.config.tailwindPath}:`, error);
      }
    }

    // Load from Figma
    if (this.config.figma?.accessToken) {
      try {
        const figmaTokens = await fetchFigmaTokens(this.config.figma);
        const parsed = parseFigmaTokens(figmaTokens, {
          tokenSets: this.config.figma.tokenSets,
        });
        mergedTokens = deepmerge(mergedTokens, parsed);
      } catch (error) {
        console.error('Error fetching Figma tokens:', error);
      }
    }

    this.tokens = mergedTokens;
    return this.tokens;
  }

  /**
   * Generate React Native styles from loaded tokens
   */
  generate(): StyleSheet {
    this.stylesheet = generateStyles(this.tokens, {
      prefix: this.config.prefix,
      platform: this.config.platform,
      transformers: this.config.transformers,
    });

    return this.stylesheet;
  }

  /**
   * Export generated styles to a file
   */
  async export(
    outputPath?: string,
    options?: { format?: 'ts' | 'js' | 'json'; includeTypes?: boolean }
  ): Promise<void> {
    const path = outputPath || this.config.outputPath;

    if (!path) {
      throw new Error('Output path is required');
    }

    if (!this.stylesheet) {
      this.generate();
    }

    await exportStyles(this.stylesheet!, path, options);
  }

  /**
   * Get the current tokens
   */
  getTokens(): DesignTokens {
    return this.tokens;
  }

  /**
   * Get the generated stylesheet
   */
  getStylesheet(): StyleSheet | null {
    return this.stylesheet;
  }

  /**
   * Get generated styles
   */
  getStyles(): StyleSheet['styles'] {
    if (!this.stylesheet) {
      this.generate();
    }
    return this.stylesheet!.styles;
  }

  /**
   * Update tokens and regenerate styles
   */
  async update(newTokens: Partial<DesignTokens>): Promise<StyleSheet> {
    this.tokens = deepmerge(this.tokens, newTokens);
    return this.generate();
  }

  /**
   * Subscribe to token changes
   */
  onChange(callback: TokenChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    return () => this.changeCallbacks.delete(callback);
  }

  /**
   * Start watching for file changes
   */
  startWatching(): void {
    const watchPaths: string[] = [];

    if (this.config.tokensPath) {
      watchPaths.push(this.config.tokensPath);
    }

    if (this.config.tailwindPath) {
      watchPaths.push(this.config.tailwindPath);
    }

    if (watchPaths.length > 0) {
      this.watcher = createWatcher({ paths: watchPaths });

      this.watcher.onChange(async (event) => {
        console.log(`Token file changed: ${event.path}`);

        try {
          await this.loadTokens();
          this.generate();

          if (this.config.outputPath) {
            await this.export();
          }

          // Notify callbacks
          this.changeCallbacks.forEach((callback) => callback(event));
        } catch (error) {
          console.error('Error updating tokens:', error);
        }
      });

      this.watcher.start();
      console.log('Watching for token changes...');
    }

    // Start Figma polling if configured
    if (this.config.figma?.accessToken && this.config.figma.syncInterval) {
      this.figmaWatcherCleanup = watchFigmaTokens(this.config.figma, async (figmaTokens) => {
        console.log('Figma tokens updated');

        const parsed = parseFigmaTokens(figmaTokens, {
          tokenSets: this.config.figma?.tokenSets,
        });

        await this.update(parsed);

        if (this.config.outputPath) {
          await this.export();
        }
      });
    }
  }

  /**
   * Stop watching for changes
   */
  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.stop();
      this.watcher = null;
    }

    if (this.figmaWatcherCleanup) {
      this.figmaWatcherCleanup();
      this.figmaWatcherCleanup = null;
    }
  }

  /**
   * Load and merge additional tokens
   */
  async mergeTokensFromFile(filePath: string): Promise<void> {
    const fileTokens = await loadTokensFromFile(filePath);
    const parsed = parseTokens(fileTokens, {
      transformers: this.config.transformers,
      prefix: this.config.prefix,
    });
    this.tokens = deepmerge(this.tokens, parsed);
  }

  /**
   * Load and merge Figma tokens
   */
  async mergeFigmaTokens(figmaTokens: FigmaTokensFile): Promise<void> {
    const parsed = parseFigmaTokens(figmaTokens, {
      tokenSets: this.config.figma?.tokenSets,
    });
    this.tokens = deepmerge(this.tokens, parsed);
  }

  /**
   * Reset to default tokens
   */
  reset(): void {
    this.tokens = this.config.includeDefaults ? { ...defaultTokens } : {};
    this.stylesheet = null;
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    await this.stopWatching();
    this.changeCallbacks.clear();
    this.tokens = {};
    this.stylesheet = null;
  }
}

/**
 * Create and initialize a TokenManager instance
 */
export async function createTokenManager(config: TokenConfig): Promise<TokenManager> {
  const manager = new TokenManager(config);
  await manager.init();
  return manager;
}
