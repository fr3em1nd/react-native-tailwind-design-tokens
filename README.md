# rn-tailwind-tokens

Generate React Native styles from Tailwind CSS + design tokens with Figma sync support.

[![npm version](https://badge.fury.io/js/rn-tailwind-tokens.svg)](https://www.npmjs.com/package/rn-tailwind-tokens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Tailwind-style utilities** - Use familiar class names like `bg-blue-500`, `p-4`, `flex-row`
- **Design tokens** - Define your design system in JSON format
- **Figma sync** - Automatically sync tokens from Figma using the Tokens plugin
- **Auto-updates** - Watch for changes and regenerate styles automatically
- **TypeScript support** - Full type definitions and IntelliSense
- **Zero runtime** - Styles are generated at build time

## Installation

```bash
npm install rn-tailwind-tokens
# or
yarn add rn-tailwind-tokens
# or
pnpm add rn-tailwind-tokens
```

## Quick Start

### 1. Generate styles from defaults

```tsx
import { tw, getDefaultStyles } from 'rn-tailwind-tokens/react-native';

function MyComponent() {
  return (
    <View style={tw('flex-1', 'bg-white', 'p-4')}>
      <Text style={tw('text-lg', 'font-bold', 'text-gray-900')}>
        Hello World
      </Text>
    </View>
  );
}
```

### 2. Use custom design tokens

Create a `design-tokens.json` file:

```json
{
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    },
    "brand": "#ff6b6b"
  },
  "spacing": {
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "fontSize": {
    "body": 16,
    "heading": [24, { "lineHeight": 32 }]
  }
}
```

Generate styles using the CLI:

```bash
npx rn-tokens generate --tokens ./design-tokens.json --output ./src/styles/tokens.ts
```

Use in your app:

```tsx
import { styles, tw } from './styles/tokens';

function MyComponent() {
  return (
    <View style={styles['bg-primary-500']}>
      <Text style={tw('text-heading', 'text-white')}>
        Custom Tokens
      </Text>
    </View>
  );
}
```

### 3. Sync from Figma

```bash
# One-time sync
npx rn-tokens sync --token YOUR_FIGMA_TOKEN --file-id YOUR_FILE_ID --output ./src/styles/tokens.ts

# Watch for changes
npx rn-tokens sync --token YOUR_FIGMA_TOKEN --tokens-url YOUR_TOKENS_URL --output ./src/styles/tokens.ts --watch
```

## CLI Commands

### `rn-tokens generate`

Generate React Native styles from design tokens.

```bash
rn-tokens generate [options]

Options:
  -t, --tokens <path>      Path to design tokens JSON file
  -c, --tailwind <path>    Path to Tailwind config file
  -o, --output <path>      Output path (default: ./src/styles/tokens.ts)
  -f, --format <format>    Output format: ts, js, json (default: ts)
  -p, --prefix <prefix>    Custom prefix for generated classes
  --no-defaults            Exclude default Tailwind utilities
  --platform <platform>    Target platform: ios, android, web, all
```

### `rn-tokens watch`

Watch for token changes and regenerate.

```bash
rn-tokens watch [options]
```

### `rn-tokens sync`

Sync design tokens from Figma.

```bash
rn-tokens sync [options]

Options:
  --token <token>          Figma personal access token (required)
  --file-id <fileId>       Figma file ID
  --tokens-url <url>       URL to Figma Tokens plugin export
  --token-sets <sets...>   Token sets to include
  --watch                  Watch for Figma changes
  --interval <ms>          Sync interval in ms (default: 60000)
```

### `rn-tokens init`

Create a config file.

```bash
rn-tokens init [--force]
```

### `rn-tokens validate`

Validate a token file.

```bash
rn-tokens validate <path>
```

## Programmatic API

### TokenManager

```typescript
import { TokenManager } from 'rn-tailwind-tokens';

const manager = new TokenManager({
  tokensPath: './design-tokens.json',
  tailwindPath: './tailwind.config.js',
  outputPath: './src/styles/tokens.ts',
  includeDefaults: true,
  watch: true,
  figma: {
    accessToken: 'YOUR_TOKEN',
    fileId: 'YOUR_FILE_ID',
    syncInterval: 60000,
  },
});

// Initialize and load tokens
await manager.init();

// Generate styles
const stylesheet = manager.generate();

// Export to file
await manager.export();

// Listen for changes
manager.onChange((event) => {
  console.log('Tokens changed:', event);
});

// Clean up
await manager.dispose();
```

### Quick Setup

```typescript
import { createStyles } from 'rn-tailwind-tokens';

const { styles, tw, tokens } = await createStyles({
  tokens: './design-tokens.json',
  output: './src/styles/tokens.ts',
  includeDefaults: true,
});
```

## React Native Utilities

### `tw()` - Combine styles

```tsx
import { tw } from 'rn-tailwind-tokens/react-native';

<View style={tw('flex-row', 'items-center', 'p-4')}>
  <Text style={tw('text-lg', 'font-bold')}>Title</Text>
</View>
```

### `cx()` - Conditional styles

```tsx
import { cx } from 'rn-tailwind-tokens/react-native';

<View style={cx(
  'p-4',
  'rounded-lg',
  { 'bg-blue-500': isActive },
  { 'bg-gray-200': !isActive }
)}>
```

### `createStyled()` - Custom theme

```tsx
import { createStyled } from 'rn-tailwind-tokens/react-native';

const { styles, tw, tokens } = createStyled({
  colors: {
    brand: '#ff6b6b',
  },
});
```

### Theme utilities

```tsx
import { getColor, getSpacing, createTheme } from 'rn-tailwind-tokens/react-native';

const primaryColor = getColor('blue-500'); // '#3b82f6'
const padding = getSpacing('4'); // 16

const theme = createTheme({
  colors: { brand: '#ff6b6b' },
});
```

## Design Token Format

### Colors

```json
{
  "colors": {
    "primary": "#3b82f6",
    "secondary": {
      "light": "#f3f4f6",
      "DEFAULT": "#6b7280",
      "dark": "#374151"
    }
  }
}
```

### Spacing

```json
{
  "spacing": {
    "0": 0,
    "1": 4,
    "2": 8,
    "4": 16,
    "8": 32
  }
}
```

### Typography

```json
{
  "fontSize": {
    "sm": 14,
    "base": 16,
    "lg": [18, { "lineHeight": 28 }],
    "xl": [20, { "lineHeight": 28, "letterSpacing": 0.5 }]
  },
  "fontWeight": {
    "normal": "400",
    "medium": "500",
    "bold": "700"
  },
  "fontFamily": {
    "sans": "System",
    "mono": "Courier"
  }
}
```

### Borders & Shadows

```json
{
  "borderRadius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "full": 9999
  },
  "shadow": {
    "sm": {
      "offsetX": 0,
      "offsetY": 1,
      "blur": 2,
      "color": "rgba(0, 0, 0, 0.05)"
    }
  }
}
```

## Figma Tokens Integration

### Using Figma Tokens Plugin

1. Install the [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978) plugin
2. Export your tokens as JSON
3. Use the exported file or URL with the sync command

### Token Structure

The package supports both Figma Tokens plugin format and Style Dictionary format:

```json
{
  "global": {
    "colors": {
      "primary": {
        "value": "#3b82f6",
        "type": "color"
      }
    },
    "spacing": {
      "sm": {
        "value": "8px",
        "type": "spacing"
      }
    }
  }
}
```

## Generated Utility Classes

The package generates Tailwind-compatible utility classes:

### Layout
- `flex`, `hidden`
- `flex-row`, `flex-col`, `flex-wrap`
- `justify-start`, `justify-center`, `justify-between`
- `items-start`, `items-center`, `items-stretch`
- `self-start`, `self-center`, `self-end`

### Spacing
- `p-{size}`, `px-{size}`, `py-{size}`, `pt-{size}`, etc.
- `m-{size}`, `mx-{size}`, `my-{size}`, `mt-{size}`, etc.
- `gap-{size}`, `gap-x-{size}`, `gap-y-{size}`

### Sizing
- `w-{size}`, `h-{size}`, `size-{size}`
- `min-w-{size}`, `min-h-{size}`
- `max-w-{size}`, `max-h-{size}`

### Colors
- `bg-{color}`, `text-{color}`, `border-{color}`
- `tint-{color}` (for Image components)

### Typography
- `text-{size}` (fontSize)
- `font-{weight}` (fontWeight)
- `font-{family}` (fontFamily)
- `leading-{size}` (lineHeight)
- `tracking-{size}` (letterSpacing)

### Borders
- `rounded`, `rounded-{size}`, `rounded-{corner}-{size}`
- `border`, `border-{size}`, `border-{side}-{size}`

### Effects
- `shadow`, `shadow-{size}`
- `opacity-{value}`

### Position
- `relative`, `absolute`
- `top-{size}`, `right-{size}`, `bottom-{size}`, `left-{size}`
- `inset-{size}`, `inset-x-{size}`, `inset-y-{size}`
- `z-{index}`

## TypeScript Support

Generated files include full TypeScript definitions:

```typescript
import { styles, tw, StyleName } from './styles/tokens';

// Type-safe style names
const validStyle: StyleName = 'bg-blue-500'; // OK
const invalidStyle: StyleName = 'invalid';   // Type error

// tw function accepts StyleName
tw('bg-blue-500', 'p-4', 'rounded-lg'); // OK
```

## Configuration File

Create a `tokens.config.json` for project-wide settings:

```json
{
  "tokensPath": "./design-tokens.json",
  "tailwindPath": "./tailwind.config.js",
  "outputPath": "./src/styles/tokens.ts",
  "includeDefaults": true,
  "platform": "all",
  "prefix": "",
  "figma": {
    "accessToken": "${FIGMA_TOKEN}",
    "fileId": "your-file-id",
    "syncInterval": 60000
  }
}
```

## Author

**Solomon Monotilla**

If you find this package helpful, consider supporting its development:

[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue.svg)](https://paypal.me/jobmyt)

**Buy me a coffee:** info@jobmyt.com (PayPal)

## License

MIT

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- [GitHub Issues](https://github.com/fr3em1ns/react-native-tailwind-design-tokens/issues)
- [Documentation](https://github.com/fr3em1ns/react-native-tailwind-design-tokens#readme)
