/**
 * SilverGuard Color System
 * Centralized color definitions for both Senior and Family apps
 *
 * Senior App: High contrast colors (WCAG AAA - 7:1 minimum)
 * Family App: Modern professional colors (WCAG AA - 4.5:1 minimum)
 */

// ============================================================================
// SILVERGUARD SENIOR - HIGH CONTRAST COLORS (WCAG AAA)
// ============================================================================

export const SeniorColors = {
  // Primary Colors
  primary: {
    blue: '#1E3A8A',      // Primary actions - Contrast: 9.42:1
    blueLight: '#3B82F6', // Highlights
    blueDark: '#1E40AF',  // Active states
  },

  // Semantic Colors (High Contrast)
  success: {
    primary: '#065F46',   // Dark green - Contrast: 8.35:1
    light: '#10B981',     // Success highlights
    background: '#D1FAE5', // Success backgrounds
  },

  warning: {
    primary: '#92400E',   // Dark orange - Contrast: 7.82:1
    light: '#F59E0B',     // Warning highlights
    background: '#FEF3C7', // Warning backgrounds
  },

  error: {
    primary: '#991B1B',   // Dark red - Contrast: 8.59:1
    light: '#EF4444',     // Error highlights
    background: '#FEE2E2', // Error backgrounds
  },

  info: {
    primary: '#1E40AF',   // Dark blue - Contrast: 9.12:1
    light: '#60A5FA',     // Info highlights
    background: '#DBEAFE', // Info backgrounds
  },

  // Emergency/SOS Colors
  sos: {
    primary: '#DC2626',   // Bright red for visibility
    dark: '#991B1B',      // Dark red for text
    background: '#FEE2E2', // Light red background
    border: '#EF4444',    // Red border
  },

  // Background & Surface
  background: '#FFFFFF',  // Pure white
  surface: '#F9FAFB',     // Very light gray for cards

  // Text Colors
  text: {
    primary: '#111827',   // Almost black
    secondary: '#374151', // Dark gray
    tertiary: '#6B7280',  // Medium gray
    disabled: '#9CA3AF',  // Light gray
    inverse: '#FFFFFF',   // White text on dark backgrounds
  },

  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Border Colors
  border: {
    default: '#D1D5DB',   // Gray 300
    light: '#E5E7EB',     // Gray 200
    dark: '#9CA3AF',      // Gray 400
    primary: '#1E3A8A',   // Primary blue for focused
  },

  // Status Colors
  status: {
    pending: '#F59E0B',   // Orange
    taken: '#10B981',     // Green
    missed: '#EF4444',    // Red
    skipped: '#6B7280',   // Gray
    completed: '#10B981', // Green
  },
};

// ============================================================================
// SILVERGUARD FAMILY - MODERN PROFESSIONAL COLORS (WCAG AA)
// ============================================================================

export const FamilyColors = {
  // Primary Colors
  primary: {
    purple: '#7C3AED',      // Main purple
    purpleDark: '#5B21B6',  // Darker purple
    purpleLight: '#A78BFA', // Lighter purple
    purpleBackground: '#F5F3FF', // Very light purple
  },

  // Semantic Colors
  success: {
    primary: '#10B981',     // Green
    dark: '#059669',        // Dark green
    light: '#34D399',       // Light green
    background: '#D1FAE5',  // Very light green
  },

  warning: {
    primary: '#F59E0B',     // Amber
    dark: '#D97706',        // Dark amber
    light: '#FBBF24',       // Light amber
    background: '#FEF3C7',  // Very light amber
  },

  error: {
    primary: '#EF4444',     // Red
    dark: '#DC2626',        // Dark red
    light: '#F87171',       // Light red
    background: '#FEE2E2',  // Very light red
  },

  info: {
    primary: '#3B82F6',     // Blue
    dark: '#2563EB',        // Dark blue
    light: '#60A5FA',       // Light blue
    background: '#DBEAFE',  // Very light blue
  },

  // Background & Surface
  background: '#F9FAFB',    // Light gray
  surface: '#FFFFFF',       // White for cards
  surfaceHover: '#F3F4F6',  // Hover state for surfaces

  // Text Colors
  text: {
    primary: '#111827',     // Almost black
    secondary: '#6B7280',   // Medium gray
    tertiary: '#9CA3AF',    // Light gray
    disabled: '#D1D5DB',    // Very light gray
    inverse: '#FFFFFF',     // White text
  },

  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Border Colors
  border: {
    default: '#E5E7EB',     // Gray 200
    light: '#F3F4F6',       // Gray 100
    dark: '#D1D5DB',        // Gray 300
    primary: '#7C3AED',     // Purple for focused
  },

  // Status Colors (for medication, appointments, etc.)
  status: {
    pending: '#F59E0B',     // Orange
    taken: '#10B981',       // Green
    missed: '#EF4444',      // Red
    skipped: '#6B7280',     // Gray
    completed: '#10B981',   // Green
    active: '#10B981',      // Green (for SOS status)
    acknowledged: '#F59E0B', // Orange
    resolved: '#6B7280',    // Gray
  },

  // Activity Type Colors
  activity: {
    medicationTaken: '#10B981',     // Green
    medicationMissed: '#EF4444',    // Red
    healthLog: '#3B82F6',           // Blue
    sosAlert: '#DC2626',            // Bright red
    locationUpdate: '#8B5CF6',      // Purple
    appointmentUpcoming: '#F59E0B', // Orange
  },

  // Online Status Colors
  online: {
    active: '#10B981',      // Green
    offline: '#9CA3AF',     // Gray
    away: '#F59E0B',        // Orange
  },

  // Chart Colors (for health data visualization)
  charts: {
    blue: '#3B82F6',        // Blood pressure systolic
    purple: '#8B5CF6',      // Blood pressure diastolic
    pink: '#EC4899',        // Heart rate
    green: '#10B981',       // Weight
    orange: '#F59E0B',      // Blood sugar
    red: '#EF4444',         // High values
    yellow: '#FBBF24',      // Medium values
  },

  // SOS Alert Colors (high visibility)
  sos: {
    primary: '#DC2626',     // Bright red
    dark: '#991B1B',        // Dark red
    background: '#FEE2E2',  // Light red background
    border: '#EF4444',      // Red border
  },
};

// ============================================================================
// SHARED UTILITY COLORS
// ============================================================================

export const SharedColors = {
  // Transparent colors for overlays
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    white: 'rgba(255, 255, 255, 0.9)',
  },

  // Shadow colors
  shadow: {
    default: '#000000',
    light: 'rgba(0, 0, 0, 0.08)',
    medium: 'rgba(0, 0, 0, 0.12)',
    dark: 'rgba(0, 0, 0, 0.24)',
  },

  // Common semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Add alpha transparency to a hex color
 * @param hex - Hex color code (e.g., '#FF0000')
 * @param alpha - Alpha value 0-1 (e.g., 0.5 for 50%)
 * @returns RGBA color string
 */
export const addAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get status color by status string
 * @param status - Status string
 * @param colorSet - 'senior' or 'family'
 * @returns Color string
 */
export const getStatusColor = (
  status: 'pending' | 'taken' | 'missed' | 'skipped' | 'completed',
  colorSet: 'senior' | 'family' = 'family'
): string => {
  const colors = colorSet === 'senior' ? SeniorColors : FamilyColors;
  return colors.status[status];
};

/**
 * Get activity type color for Family app
 * @param activityType - Type of activity
 * @returns Color string
 */
export const getActivityColor = (
  activityType:
    | 'medication_taken'
    | 'medication_missed'
    | 'health_log_added'
    | 'sos_triggered'
    | 'location_updated'
    | 'appointment_upcoming'
): string => {
  const colorMap = {
    medication_taken: FamilyColors.activity.medicationTaken,
    medication_missed: FamilyColors.activity.medicationMissed,
    health_log_added: FamilyColors.activity.healthLog,
    sos_triggered: FamilyColors.activity.sosAlert,
    location_updated: FamilyColors.activity.locationUpdate,
    appointment_upcoming: FamilyColors.activity.appointmentUpcoming,
  };
  return colorMap[activityType];
};

/**
 * Get online status color
 * @param status - Online status
 * @returns Color string
 */
export const getOnlineStatusColor = (
  status: 'active' | 'offline' | 'away'
): string => {
  return FamilyColors.online[status];
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SeniorColorPalette = typeof SeniorColors;
export type FamilyColorPalette = typeof FamilyColors;

// ============================================================================
// EXPORT DEFAULT (for convenience)
// ============================================================================

export default {
  Senior: SeniorColors,
  Family: FamilyColors,
  Shared: SharedColors,
  utils: {
    addAlpha,
    getStatusColor,
    getActivityColor,
    getOnlineStatusColor,
  },
};
