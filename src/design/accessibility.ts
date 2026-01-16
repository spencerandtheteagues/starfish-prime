/**
 * Silverguard Accessibility Design System
 *
 * WCAG AAA compliant accessibility utilities and constants
 * Designed for elderly users with varying abilities
 */

import { Dimensions, Platform, AccessibilityInfo, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TOUCH TARGET SIZES (Apple Human Interface Guidelines + Senior-Friendly)
// ============================================================================

export const TouchTargets = {
  // Minimum touch target size (Apple recommends 44pt, we use 60pt for seniors)
  minimum: 60,

  // Standard button sizes
  small: 60,      // For secondary actions
  medium: 72,     // For primary actions
  large: 88,      // For important actions
  extraLarge: 120, // For critical actions like SOS

  // Specific use cases
  sosButton: 280,  // Emergency SOS button
  tile: 160,       // Home screen tiles
  listItem: 80,    // List items with actions
  iconButton: 60,  // Icon-only buttons

  // Spacing between touch targets
  spacing: 16,     // Minimum spacing to prevent mis-taps
};

// ============================================================================
// FONT SIZES (Scaled for readability)
// ============================================================================

export const FontSizes = {
  // Base sizes (will be multiplied by fontScale)
  xs: 14,
  sm: 16,
  base: 18,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,

  // Specific use cases
  body: 20,
  heading: 32,
  title: 40,
  display: 48,

  // Minimum readable size for seniors
  minimumReadable: 18,
};

// ============================================================================
// TIMING (Longer durations for seniors)
// ============================================================================

export const Timing = {
  // Animation durations
  fast: 200,
  normal: 300,
  slow: 500,

  // Touch-and-hold durations
  holdToActivate: 3000,  // 3 seconds for critical actions
  holdToCancel: 1500,    // 1.5 seconds to cancel

  // Timeout durations
  tapTimeout: 500,       // Time to register a tap
  doubleTabGap: 500,     // Gap between double taps

  // Feedback timing
  feedbackDelay: 0,      // Immediate feedback
};

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

export const HapticFeedback = {
  // Trigger haptic feedback for different actions
  async light() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Vibration.vibrate(10);
    }
  },

  async medium() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(20);
    }
  },

  async heavy() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Vibration.vibrate(40);
    }
  },

  async success() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
    }
  },

  async warning() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }
  },

  async error() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
    }
  },

  async sos() {
    // Distinct pattern for SOS activation
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 200);
    } else {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    }
  },
};

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Scale font size based on user preferences
 */
export const scaledFontSize = (baseSize: number, fontScale: number = 1.0): number => {
  const scaled = baseSize * fontScale;
  // Ensure minimum readability
  return Math.max(scaled, FontSizes.minimumReadable);
};

/**
 * Scale touch target based on screen size
 */
export const scaledTouchTarget = (baseSize: number): number => {
  const scale = Math.min(SCREEN_WIDTH / 375, 1.5);
  return Math.max(baseSize * scale, TouchTargets.minimum);
};

/**
 * Get accessibility role for React Native
 */
export const getAccessibilityRole = (type: string): string => {
  const roles: Record<string, string> = {
    button: 'button',
    link: 'link',
    image: 'image',
    text: 'text',
    heading: 'header',
    list: 'list',
    listItem: 'listitem',
    checkbox: 'checkbox',
    radio: 'radiobutton',
    switch: 'switch',
    alert: 'alert',
    progressbar: 'progressbar',
  };
  return roles[type] || 'none';
};

/**
 * Generate accessibility props for a component
 */
export interface AccessibilityProps {
  accessible: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole: string;
  accessibilityState?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
  };
}

export const createAccessibilityProps = (
  label: string,
  role: string = 'button',
  options?: {
    hint?: string;
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    busy?: boolean;
  }
): AccessibilityProps => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityRole: getAccessibilityRole(role),
    accessibilityState: {
      selected: options?.selected,
      disabled: options?.disabled,
      checked: options?.checked,
      busy: options?.busy,
    },
  };
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Add screen reader listener
 */
export const addScreenReaderListener = (
  callback: (enabled: boolean) => void
) => {
  return AccessibilityInfo.addEventListener('screenReaderChanged', callback);
};

// ============================================================================
// CONTRAST UTILITIES
// ============================================================================

/**
 * Calculate contrast ratio between two colors
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export const calculateContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 255) / 255;
    const g = ((rgb >> 8) & 255) / 255;
    const b = (rgb & 255) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if colors meet WCAG AAA contrast requirements
 */
export const meetsWCAGAAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const ResponsiveUtils = {
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // Breakpoints
  isSmallScreen: SCREEN_WIDTH < 375,
  isMediumScreen: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeScreen: SCREEN_WIDTH >= 414,

  // Calculate responsive value
  responsive: (small: number, medium: number, large: number): number => {
    if (SCREEN_WIDTH < 375) return small;
    if (SCREEN_WIDTH < 414) return medium;
    return large;
  },

  // Calculate percentage of screen width
  widthPercent: (percent: number): number => {
    return (SCREEN_WIDTH * percent) / 100;
  },

  // Calculate percentage of screen height
  heightPercent: (percent: number): number => {
    return (SCREEN_HEIGHT * percent) / 100;
  },
};

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

export const FocusUtils = {
  // Focus trap for modals
  createFocusTrap: () => {
    // Implementation would use refs to manage focus within a modal
    // This is a placeholder for the actual implementation
  },

  // Restore focus after modal closes
  restoreFocus: () => {
    // Implementation would restore focus to the element that opened the modal
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TouchTargets,
  FontSizes,
  Timing,
  HapticFeedback,
  scaledFontSize,
  scaledTouchTarget,
  createAccessibilityProps,
  announceForAccessibility,
  isScreenReaderEnabled,
  addScreenReaderListener,
  calculateContrastRatio,
  meetsWCAGAAA,
  ResponsiveUtils,
  FocusUtils,
};
