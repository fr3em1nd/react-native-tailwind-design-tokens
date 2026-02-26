/**
 * Example usage of rn-tailwind-tokens in a React Native app
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Import from the generated styles file
// Run: npx rn-tokens generate --tokens ./design-tokens.json --output ./styles/tokens.ts
import { styles, tw, tokens } from './styles/tokens';

// Or use the built-in utilities
import {
  tw as defaultTw,
  cx,
  getColor,
  getSpacing,
  createStyled
} from 'rn-tailwind-tokens/react-native';

/**
 * Basic usage with tw() utility
 */
export function BasicExample() {
  return (
    <View style={tw('flex-1', 'bg-white', 'p-4')}>
      <Text style={tw('text-2xl', 'font-bold', 'text-gray-900', 'mb-4')}>
        Welcome to the App
      </Text>
      <Text style={tw('text-base', 'text-gray-600', 'leading-relaxed')}>
        This is an example of using Tailwind-style utilities with React Native.
      </Text>
    </View>
  );
}

/**
 * Conditional styling with cx()
 */
export function ConditionalExample({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={cx(
        'p-4',
        'rounded-lg',
        'border',
        { 'bg-blue-500': isActive, 'border-blue-500': isActive },
        { 'bg-white': !isActive, 'border-gray-300': !isActive }
      )}
    >
      <Text
        style={cx(
          'text-base',
          'font-medium',
          { 'text-white': isActive },
          { 'text-gray-900': !isActive }
        )}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Card component example
 */
export function Card({
  title,
  description,
  onPress
}: {
  title: string;
  description: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw(
        'bg-white',
        'rounded-xl',
        'p-6',
        'shadow-md',
        'border',
        'border-gray-100'
      )}
    >
      <Text style={tw('text-lg', 'font-semibold', 'text-gray-900', 'mb-2')}>
        {title}
      </Text>
      <Text style={tw('text-sm', 'text-gray-600', 'leading-relaxed')}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Button component with variants
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline';

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onPress,
}: {
  children: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const variantStyles = {
    primary: {
      container: tw('bg-blue-500'),
      text: tw('text-white'),
    },
    secondary: {
      container: tw('bg-gray-100'),
      text: tw('text-gray-900'),
    },
    outline: {
      container: tw('bg-transparent', 'border', 'border-blue-500'),
      text: tw('text-blue-500'),
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        tw('py-3', 'px-6', 'rounded-lg', 'items-center', 'justify-center'),
        currentVariant.container,
        disabled && tw('opacity-50'),
      ]}
    >
      <Text style={[tw('text-base', 'font-semibold'), currentVariant.text]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * List item component
 */
export function ListItem({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={tw('flex-row', 'items-center', 'py-4', 'px-4', 'bg-white')}>
      {icon && (
        <View style={tw('w-10', 'h-10', 'rounded-full', 'bg-gray-100', 'items-center', 'justify-center', 'mr-3')}>
          {icon}
        </View>
      )}
      <View style={tw('flex-1')}>
        <Text style={tw('text-base', 'font-medium', 'text-gray-900')}>
          {title}
        </Text>
        {subtitle && (
          <Text style={tw('text-sm', 'text-gray-500', 'mt-1')}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Using custom tokens with createStyled
 */
const customTheme = createStyled({
  colors: {
    brand: {
      light: '#818cf8',
      DEFAULT: '#6366f1',
      dark: '#4f46e5',
    },
  },
  spacing: {
    'card': 20,
  },
});

export function BrandedCard({ title }: { title: string }) {
  const { tw: brandTw } = customTheme;

  return (
    <View style={brandTw('bg-brand', 'p-card', 'rounded-lg')}>
      <Text style={brandTw('text-white', 'text-lg', 'font-bold')}>
        {title}
      </Text>
    </View>
  );
}

/**
 * Accessing raw token values
 */
export function TokenAccessExample() {
  const primaryColor = getColor('blue-500');
  const spacing = getSpacing('4');

  return (
    <View style={{ padding: spacing, backgroundColor: primaryColor }}>
      <Text style={tw('text-white')}>
        Using raw token values: {primaryColor}
      </Text>
    </View>
  );
}

/**
 * Full screen example
 */
export function HomeScreen() {
  return (
    <ScrollView style={tw('flex-1', 'bg-gray-50')}>
      <View style={tw('p-4')}>
        {/* Header */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-3xl', 'font-bold', 'text-gray-900')}>
            Dashboard
          </Text>
          <Text style={tw('text-base', 'text-gray-600', 'mt-1')}>
            Welcome back!
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={tw('flex-row', 'flex-wrap', 'gap-4', 'mb-6')}>
          <View style={[tw('bg-blue-500', 'rounded-xl', 'p-4'), { flex: 1, minWidth: 140 }]}>
            <Text style={tw('text-white', 'text-sm', 'opacity-80')}>Total Users</Text>
            <Text style={tw('text-white', 'text-2xl', 'font-bold', 'mt-1')}>1,234</Text>
          </View>
          <View style={[tw('bg-green-500', 'rounded-xl', 'p-4'), { flex: 1, minWidth: 140 }]}>
            <Text style={tw('text-white', 'text-sm', 'opacity-80')}>Revenue</Text>
            <Text style={tw('text-white', 'text-2xl', 'font-bold', 'mt-1')}>$12.4k</Text>
          </View>
        </View>

        {/* Cards */}
        <View style={tw('gap-4')}>
          <Card
            title="Getting Started"
            description="Learn how to use the app with our quick start guide."
          />
          <Card
            title="Documentation"
            description="Explore the full API reference and examples."
          />
        </View>

        {/* Buttons */}
        <View style={tw('mt-6', 'gap-3')}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </View>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;
