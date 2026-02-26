import { describe, it, expect } from 'vitest';
import { generateStyles } from '../generators/styleGenerator';
import { parseTokens } from '../parsers/tokenParser';
import { defaultTokens } from '../core/defaults';

describe('generateStyles', () => {
  it('should generate styles from default tokens', () => {
    const stylesheet = generateStyles(defaultTokens);

    expect(stylesheet.styles).toBeDefined();
    expect(stylesheet.tokens).toBeDefined();
    expect(stylesheet.metadata).toBeDefined();
  });

  it('should generate color utilities', () => {
    const tokens = {
      colors: {
        primary: '#3b82f6',
        secondary: {
          light: '#f1f5f9',
          dark: '#334155',
        },
      },
    };

    const stylesheet = generateStyles(tokens);

    expect(stylesheet.styles['bg-primary']).toEqual({ backgroundColor: '#3b82f6' });
    expect(stylesheet.styles['text-primary']).toEqual({ color: '#3b82f6' });
    expect(stylesheet.styles['bg-secondary-light']).toEqual({ backgroundColor: '#f1f5f9' });
    expect(stylesheet.styles['bg-secondary-dark']).toEqual({ backgroundColor: '#334155' });
  });

  it('should generate spacing utilities', () => {
    const tokens = {
      spacing: {
        '0': 0,
        '1': 4,
        '4': 16,
      },
    };

    const stylesheet = generateStyles(tokens);

    expect(stylesheet.styles['p-0']).toEqual({ padding: 0 });
    expect(stylesheet.styles['p-1']).toEqual({ padding: 4 });
    expect(stylesheet.styles['p-4']).toEqual({ padding: 16 });
    expect(stylesheet.styles['m-4']).toEqual({ margin: 16 });
    expect(stylesheet.styles['px-4']).toEqual({ paddingHorizontal: 16 });
    expect(stylesheet.styles['my-4']).toEqual({ marginVertical: 16 });
  });

  it('should generate font size utilities', () => {
    const tokens = {
      fontSize: {
        sm: 14,
        lg: [18, { lineHeight: 28 }],
      },
    };

    const stylesheet = generateStyles(tokens);

    expect(stylesheet.styles['text-sm']).toEqual({ fontSize: 14 });
    expect(stylesheet.styles['text-lg']).toEqual({ fontSize: 18, lineHeight: 28 });
  });

  it('should generate border radius utilities', () => {
    const tokens = {
      borderRadius: {
        none: 0,
        sm: 4,
        full: 9999,
      },
    };

    const stylesheet = generateStyles(tokens);

    expect(stylesheet.styles['rounded-none']).toEqual({ borderRadius: 0 });
    expect(stylesheet.styles['rounded-sm']).toEqual({ borderRadius: 4 });
    expect(stylesheet.styles['rounded-full']).toEqual({ borderRadius: 9999 });
  });

  it('should generate layout utilities', () => {
    const stylesheet = generateStyles({});

    expect(stylesheet.styles['flex']).toEqual({ display: 'flex' });
    expect(stylesheet.styles['flex-row']).toEqual({ flexDirection: 'row' });
    expect(stylesheet.styles['flex-col']).toEqual({ flexDirection: 'column' });
    expect(stylesheet.styles['justify-center']).toEqual({ justifyContent: 'center' });
    expect(stylesheet.styles['items-center']).toEqual({ alignItems: 'center' });
  });

  it('should generate shadow utilities', () => {
    const tokens = {
      shadow: {
        sm: {
          offsetX: 0,
          offsetY: 1,
          blur: 2,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    };

    const stylesheet = generateStyles(tokens);

    expect(stylesheet.styles['shadow-sm']).toMatchObject({
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
    });
  });

  it('should apply prefix to generated styles', () => {
    const tokens = {
      colors: {
        blue: '#3b82f6',
      },
    };

    const stylesheet = generateStyles(tokens, { prefix: 'tw' });

    expect(stylesheet.styles['tw-bg-blue']).toBeDefined();
    expect(stylesheet.styles['tw-text-blue']).toBeDefined();
  });
});

describe('parseTokens', () => {
  it('should parse basic tokens', () => {
    const input = {
      colors: {
        primary: '#3b82f6',
      },
      spacing: {
        '4': '16px',
      },
    };

    const parsed = parseTokens(input);

    expect(parsed.colors?.primary).toBe('#3b82f6');
    expect(parsed.spacing?.['4']).toBe(16);
  });

  it('should convert rem values to pixels', () => {
    const input = {
      spacing: {
        '4': '1rem',
      },
      fontSize: {
        lg: '1.125rem',
      },
    };

    const parsed = parseTokens(input);

    expect(parsed.spacing?.['4']).toBe(16);
    expect(parsed.fontSize?.lg).toBe(18);
  });

  it('should merge with defaults when includeDefaults is true', () => {
    const input = {
      colors: {
        brand: '#ff6b6b',
      },
    };

    const parsed = parseTokens(input, { includeDefaults: true });

    expect(parsed.colors?.brand).toBe('#ff6b6b');
    expect(parsed.colors?.black).toBe('#000000');
  });
});
