import { Command } from 'commander';
import pc from 'picocolors';
import { TokenManager } from '../core/TokenManager';
import type { TokenConfig } from '../types';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('rn-tokens')
  .description('Generate React Native styles from Tailwind + design tokens')
  .version(VERSION);

/**
 * Generate command - main command to generate styles
 */
program
  .command('generate')
  .alias('gen')
  .description('Generate React Native styles from design tokens')
  .option('-t, --tokens <path>', 'Path to design tokens JSON file')
  .option('-c, --tailwind <path>', 'Path to Tailwind config file')
  .option('-o, --output <path>', 'Output path for generated styles', './src/styles/tokens.ts')
  .option('-f, --format <format>', 'Output format (ts, js, json)', 'ts')
  .option('-p, --prefix <prefix>', 'Custom prefix for generated classes')
  .option('--no-defaults', 'Exclude default Tailwind utilities')
  .option('--platform <platform>', 'Target platform (ios, android, web, all)', 'all')
  .action(async (options) => {
    console.log(pc.cyan('🎨 Generating React Native styles...'));

    try {
      const config: TokenConfig = {
        tokensPath: options.tokens,
        tailwindPath: options.tailwind,
        outputPath: options.output,
        prefix: options.prefix,
        includeDefaults: options.defaults,
        platform: options.platform,
      };

      const manager = new TokenManager(config);
      await manager.init();
      const stylesheet = manager.generate();

      await manager.export(options.output, {
        format: options.format,
        includeTypes: options.format === 'ts',
      });

      const styleCount = Object.keys(stylesheet.styles).length;
      console.log(pc.green(`✓ Generated ${styleCount} styles to ${options.output}`));
    } catch (error) {
      console.error(pc.red('Error generating styles:'), error);
      process.exit(1);
    }
  });

/**
 * Watch command - watch for changes and regenerate
 */
program
  .command('watch')
  .description('Watch for token changes and regenerate styles')
  .option('-t, --tokens <path>', 'Path to design tokens JSON file')
  .option('-c, --tailwind <path>', 'Path to Tailwind config file')
  .option('-o, --output <path>', 'Output path for generated styles', './src/styles/tokens.ts')
  .option('-f, --format <format>', 'Output format (ts, js, json)', 'ts')
  .option('-p, --prefix <prefix>', 'Custom prefix for generated classes')
  .option('--no-defaults', 'Exclude default Tailwind utilities')
  .action(async (options) => {
    console.log(pc.cyan('👀 Watching for token changes...'));

    try {
      const config: TokenConfig = {
        tokensPath: options.tokens,
        tailwindPath: options.tailwind,
        outputPath: options.output,
        prefix: options.prefix,
        includeDefaults: options.defaults,
        watch: true,
      };

      const manager = new TokenManager(config);
      await manager.init();
      manager.generate();
      await manager.export(options.output, {
        format: options.format,
        includeTypes: options.format === 'ts',
      });

      console.log(pc.green('✓ Initial generation complete'));
      console.log(pc.dim('Press Ctrl+C to stop watching'));

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log(pc.yellow('\nStopping watcher...'));
        await manager.dispose();
        process.exit(0);
      });
    } catch (error) {
      console.error(pc.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Sync command - sync from Figma
 */
program
  .command('sync')
  .description('Sync design tokens from Figma')
  .requiredOption('--token <token>', 'Figma personal access token')
  .option('--file-id <fileId>', 'Figma file ID')
  .option('--tokens-url <url>', 'URL to Figma Tokens plugin export')
  .option('--token-sets <sets...>', 'Token sets to include')
  .option('-o, --output <path>', 'Output path for generated styles', './src/styles/tokens.ts')
  .option('-f, --format <format>', 'Output format (ts, js, json)', 'ts')
  .option('--watch', 'Watch for Figma changes')
  .option('--interval <ms>', 'Sync interval in milliseconds', '60000')
  .action(async (options) => {
    console.log(pc.cyan('📥 Syncing from Figma...'));

    try {
      const config: TokenConfig = {
        outputPath: options.output,
        figma: {
          accessToken: options.token,
          fileId: options.fileId,
          tokensUrl: options.tokensUrl,
          tokenSets: options.tokenSets,
          syncInterval: options.watch ? parseInt(options.interval, 10) : undefined,
        },
        watch: options.watch,
      };

      const manager = new TokenManager(config);
      await manager.init();
      manager.generate();
      await manager.export(options.output, {
        format: options.format,
        includeTypes: options.format === 'ts',
      });

      console.log(pc.green('✓ Figma tokens synced successfully'));

      if (options.watch) {
        console.log(pc.dim(`Watching for Figma changes (interval: ${options.interval}ms)`));
        console.log(pc.dim('Press Ctrl+C to stop'));

        process.on('SIGINT', async () => {
          console.log(pc.yellow('\nStopping Figma sync...'));
          await manager.dispose();
          process.exit(0);
        });
      }
    } catch (error) {
      console.error(pc.red('Error syncing from Figma:'), error);
      process.exit(1);
    }
  });

/**
 * Init command - create a config file
 */
program
  .command('init')
  .description('Initialize a config file')
  .option('-f, --force', 'Overwrite existing config')
  .action(async (options) => {
    const fs = await import('fs').then((m) => m.promises);
    const path = await import('path');

    const configPath = path.resolve(process.cwd(), 'tokens.config.json');

    try {
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);

      if (exists && !options.force) {
        console.log(pc.yellow('Config file already exists. Use --force to overwrite.'));
        return;
      }

      const defaultConfig: TokenConfig = {
        tokensPath: './design-tokens.json',
        outputPath: './src/styles/tokens.ts',
        includeDefaults: true,
        platform: 'all',
        prefix: '',
      };

      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      console.log(pc.green(`✓ Created config file: ${configPath}`));
    } catch (error) {
      console.error(pc.red('Error creating config:'), error);
      process.exit(1);
    }
  });

/**
 * Validate command - validate token files
 */
program
  .command('validate')
  .description('Validate design token files')
  .argument('<path>', 'Path to token file')
  .action(async (tokenPath) => {
    console.log(pc.cyan(`Validating ${tokenPath}...`));

    try {
      const fs = await import('fs').then((m) => m.promises);
      const path = await import('path');

      const absolutePath = path.isAbsolute(tokenPath)
        ? tokenPath
        : path.resolve(process.cwd(), tokenPath);

      const content = await fs.readFile(absolutePath, 'utf-8');
      const tokens = JSON.parse(content);

      // Basic validation
      const validCategories = [
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

      const categories = Object.keys(tokens);
      const unknownCategories = categories.filter((c) => !validCategories.includes(c));

      if (unknownCategories.length > 0) {
        console.log(pc.yellow(`⚠ Unknown token categories: ${unknownCategories.join(', ')}`));
      }

      let tokenCount = 0;
      for (const [category, values] of Object.entries(tokens)) {
        if (typeof values === 'object' && values !== null) {
          tokenCount += countTokens(values);
        }
      }

      console.log(pc.green(`✓ Valid token file`));
      console.log(pc.dim(`  Categories: ${categories.length}`));
      console.log(pc.dim(`  Tokens: ${tokenCount}`));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(pc.red('✗ Invalid JSON syntax'));
      } else {
        console.error(pc.red('✗ Error validating tokens:'), error);
      }
      process.exit(1);
    }
  });

/**
 * Count tokens recursively
 */
function countTokens(obj: Record<string, any>): number {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countTokens(value);
    } else {
      count++;
    }
  }
  return count;
}

// Parse arguments
program.parse();
