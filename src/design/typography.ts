/**
 * SilverGuard Typography System
 * Font definitions and text styles for both Senior and Family apps
 *
 * Senior App: Extra large fonts (24pt minimum)
 * Family App: Standard modern fonts (16pt base)
 */

import { TextStyle, Platform } from 'react-native';

// ============================================================================
// FONT FAMILIES
// ============================================================================

/**
 * Platform-specific font families
 * iOS: SF Pro Text / SF Pro Display
 * Android: Roboto
 */
export const FontFamily = {
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium', // Android doesn't have semibold in default
    bold: 'Roboto-Bold',
  },
};

/**
 * Get platform-specific font family
 */
export const getFont = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular'): string => {
  return Platform.select({
    ios: FontFamily.ios[weight],
    android: FontFamily.android[weight],
    default: 'System',
  }) as string;
};

// ============================================================================
// FONT WEIGHTS
// ============================================================================

export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

// ============================================================================
// SILVERGUARD SENIOR - EXTRA LARGE TYPOGRAPHY
// ============================================================================

/**
 * Senior App Typography Scale
 * MINIMUM 24pt for all body text
 * Extra large for easy reading
 */
export const SeniorTypography = {
  // Display Styles (Main headings)
  displayLarge: {
    fontSize: 48,
    lineHeight: 58, // 1.2x
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,

  displayMedium: {
    fontSize: 40,
    lineHeight: 48, // 1.2x
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,

  // Heading Styles
  heading1: {
    fontSize: 32,
    lineHeight: 40, // 1.25x
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  } as TextStyle,

  heading2: {
    fontSize: 28,
    lineHeight: 35, // 1.25x
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
  } as TextStyle,

  // Body Styles (MINIMUM 24pt)
  bodyLarge: {
    fontSize: 26,
    lineHeight: 39, // 1.5x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  bodyMedium: {
    fontSize: 24, // MINIMUM SIZE
    lineHeight: 36, // 1.5x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  // Button Text (Large and bold)
  button: {
    fontSize: 28,
    lineHeight: 36, // 1.3x
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  } as TextStyle,

  // Caption (Rarely used, still large)
  caption: {
    fontSize: 22,
    lineHeight: 31, // 1.4x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  // Number Input (Extra large for health data)
  numberInput: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  } as TextStyle,
};

// ============================================================================
// SILVERGUARD FAMILY - MODERN TYPOGRAPHY
// ============================================================================

/**
 * Family App Typography Scale
 * Standard 16pt base with modern hierarchy
 */
export const FamilyTypography = {
  // Display Styles
  displayLarge: {
    fontSize: 32,
    lineHeight: 38, // 1.2x
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,

  displayMedium: {
    fontSize: 28,
    lineHeight: 34, // 1.2x
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  } as TextStyle,

  // Heading Styles
  heading1: {
    fontSize: 24,
    lineHeight: 31, // 1.3x
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  } as TextStyle,

  heading2: {
    fontSize: 20,
    lineHeight: 26, // 1.3x
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
  } as TextStyle,

  heading3: {
    fontSize: 18,
    lineHeight: 23, // 1.3x
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
  } as TextStyle,

  // Body Styles
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26, // 1.5x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  bodyRegular: {
    fontSize: 16, // Base size
    lineHeight: 24, // 1.5x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    lineHeight: 21, // 1.5x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  // Caption & Metadata
  caption: {
    fontSize: 12,
    lineHeight: 17, // 1.4x
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  // Button Text
  button: {
    fontSize: 16,
    lineHeight: 22, // 1.4x
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  } as TextStyle,

  // Input Text
  input: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,

  // Label Text
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
    letterSpacing: 0,
  } as TextStyle,

  // Tab Bar Text
  tabBar: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  } as TextStyle,
};

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Create text style with color
 * @param baseStyle - Base typography style
 * @param color - Text color
 * @returns Combined text style
 */
export const withColor = (baseStyle: TextStyle, color: string): TextStyle => {
  return {
    ...baseStyle,
    color,
  };
};

/**
 * Create text style with custom weight
 * @param baseStyle - Base typography style
 * @param weight - Font weight
 * @returns Combined text style
 */
export const withWeight = (
  baseStyle: TextStyle,
  weight: 'regular' | 'medium' | 'semibold' | 'bold'
): TextStyle => {
  return {
    ...baseStyle,
    fontWeight: FontWeight[weight],
  };
};

/**
 * Create centered text style
 * @param baseStyle - Base typography style
 * @returns Text style with center alignment
 */
export const centered = (baseStyle: TextStyle): TextStyle => {
  return {
    ...baseStyle,
    textAlign: 'center',
  };
};

/**
 * Create uppercase text style
 * @param baseStyle - Base typography style
 * @returns Text style with uppercase transform
 */
export const uppercase = (baseStyle: TextStyle): TextStyle => {
  return {
    ...baseStyle,
    textTransform: 'uppercase',
  };
};

/**
 * Scale font size for accessibility
 * @param baseSize - Base font size
 * @param scale - Scale factor (1.0 = no change, 1.2 = 20% larger)
 * @returns Scaled font size
 */
export const scaleFontSize = (baseSize: number, scale: number = 1.0): number => {
  return Math.round(baseSize * scale);
};

/**
 * Get appropriate line height for font size
 * @param fontSize - Font size
 * @param multiplier - Line height multiplier (default 1.5)
 * @returns Calculated line height
 */
export const getLineHeight = (fontSize: number, multiplier: number = 1.5): number => {
  return Math.round(fontSize * multiplier);
};

// ============================================================================
// COMMON TEXT STYLES (Composable)
// ============================================================================

/**
 * Common text style modifiers
 */
export const TextModifiers = {
  // Alignment
  centerAlign: { textAlign: 'center' as TextStyle['textAlign'] },
  leftAlign: { textAlign: 'left' as TextStyle['textAlign'] },
  rightAlign: { textAlign: 'right' as TextStyle['textAlign'] },

  // Transform
  uppercase: { textTransform: 'uppercase' as TextStyle['textTransform'] },
  capitalize: { textTransform: 'capitalize' as TextStyle['textTransform'] },
  lowercase: { textTransform: 'lowercase' as TextStyle['textTransform'] },

  // Decoration
  underline: { textDecorationLine: 'underline' as TextStyle['textDecorationLine'] },
  lineThrough: { textDecorationLine: 'line-through' as TextStyle['textDecorationLine'] },

  // Emphasis
  italic: { fontStyle: 'italic' as TextStyle['fontStyle'] },
};

// ============================================================================
// ACCESSIBILITY TEXT SCALING
// ============================================================================

/**
 * Text scaling presets for accessibility
 */
export const AccessibilityScale = {
  normal: 1.0,
  medium: 1.15,
  large: 1.3,
  extraLarge: 1.5,
};

/**
 * Scale typography for accessibility
 * @param typography - Base typography object
 * @param scale - Scale factor
 * @returns Scaled typography object
 */
export const scaleTypography = <T extends Record<string, TextStyle>>(
  typography: T,
  scale: number
): T => {
  const scaled = {} as T;
  Object.keys(typography).forEach((key) => {
    const style = typography[key];
    scaled[key as keyof T] = {
      ...style,
      fontSize: style.fontSize ? scaleFontSize(style.fontSize, scale) : style.fontSize,
      lineHeight: style.lineHeight ? scaleFontSize(style.lineHeight, scale) : style.lineHeight,
    } as T[keyof T];
  });
  return scaled;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SeniorTypographyScale = typeof SeniorTypography;
export type FamilyTypographyScale = typeof FamilyTypography;
export type TextModifier = keyof typeof TextModifiers;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  Senior: SeniorTypography,
  Family: FamilyTypography,
  Modifiers: TextModifiers,
  utils: {
    withColor,
    withWeight,
    centered,
    uppercase,
    scaleFontSize,
    getLineHeight,
    scaleTypography,
  },
  FontWeight,
  AccessibilityScale,
};
