import chokidar from 'chokidar';
import type { TokenChangeCallback, TokenChangeEvent } from '../types';

export interface WatcherOptions {
  /**
   * Files/directories to watch
   */
  paths: string | string[];

  /**
   * Debounce time in milliseconds
   */
  debounce?: number;

  /**
   * Ignore patterns
   */
  ignore?: string[];

  /**
   * Follow symlinks
   */
  followSymlinks?: boolean;

  /**
   * Use polling (useful for network drives)
   */
  usePolling?: boolean;

  /**
   * Polling interval in milliseconds
   */
  interval?: number;
}

/**
 * File watcher for design token files
 */
export class TokenWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private callbacks: Set<TokenChangeCallback> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private options: Required<WatcherOptions>;

  constructor(options: WatcherOptions) {
    this.options = {
      paths: options.paths,
      debounce: options.debounce ?? 300,
      ignore: options.ignore ?? ['**/node_modules/**', '**/.git/**'],
      followSymlinks: options.followSymlinks ?? true,
      usePolling: options.usePolling ?? false,
      interval: options.interval ?? 100,
    };
  }

  /**
   * Start watching for file changes
   */
  start(): void {
    if (this.watcher) {
      return;
    }

    this.watcher = chokidar.watch(this.options.paths, {
      ignored: this.options.ignore,
      persistent: true,
      followSymlinks: this.options.followSymlinks,
      usePolling: this.options.usePolling,
      interval: this.options.interval,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('change', (path) => this.handleChange('update', path))
      .on('add', (path) => this.handleChange('add', path))
      .on('unlink', (path) => this.handleChange('delete', path))
      .on('error', (error) => console.error('Watcher error:', error));
  }

  /**
   * Stop watching
   */
  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Subscribe to change events
   */
  onChange(callback: TokenChangeCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Handle file change with debouncing
   */
  private handleChange(type: TokenChangeEvent['type'], path: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const event: TokenChangeEvent = {
        type,
        path,
        timestamp: new Date(),
      };

      this.callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in change callback:', error);
        }
      });
    }, this.options.debounce);
  }

  /**
   * Get watched paths
   */
  getWatched(): Record<string, string[]> {
    return this.watcher?.getWatched() ?? {};
  }

  /**
   * Add paths to watch
   */
  add(paths: string | string[]): void {
    this.watcher?.add(paths);
  }

  /**
   * Remove paths from watch
   */
  unwatch(paths: string | string[]): void {
    this.watcher?.unwatch(paths);
  }
}

/**
 * Create a watcher instance
 */
export function createWatcher(options: WatcherOptions): TokenWatcher {
  return new TokenWatcher(options);
}

/**
 * Watch token files and regenerate on changes
 */
export async function watchAndRegenerate(
  options: WatcherOptions & {
    onRegenerate: (path: string) => Promise<void>;
    onError?: (error: Error) => void;
  }
): Promise<TokenWatcher> {
  const { onRegenerate, onError, ...watcherOptions } = options;
  const watcher = new TokenWatcher(watcherOptions);

  watcher.onChange(async (event) => {
    console.log(`[${event.type}] ${event.path}`);

    try {
      await onRegenerate(event.path);
      console.log('Styles regenerated successfully');
    } catch (error) {
      console.error('Error regenerating styles:', error);
      onError?.(error as Error);
    }
  });

  watcher.start();
  return watcher;
}
