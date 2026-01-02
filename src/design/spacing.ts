/**
 * SilverGuard Spacing System
 * 8pt grid system for consistent spacing across both apps
 *
 * Base unit: 8pt
 * All spacing values are multiples of 8pt for perfect grid alignment
 */

// ============================================================================
// BASE SPACING SCALE (8pt Grid)
// ============================================================================

/**
 * Core spacing scale based on 8pt grid
 */
export const Spacing = {
  xxxs: 2,   // 0.25rem - Tight spacing within components
  xxs: 4,    // 0.5rem  - Very small gaps
  xs: 8,     // 1rem    - Small spacing
  sm: 12,    // 1.5rem  - Compact spacing
  md: 16,    // 2rem    - Standard spacing (default)
  lg: 24,    // 3rem    - Comfortable spacing
  xl: 32,    // 4rem    - Large spacing
  xxl: 48,   // 6rem    - Extra large spacing
  xxxl: 64,  // 8rem    - Maximum spacing
};

// ============================================================================
// SENIOR APP SPACING (More Generous)
// ============================================================================

/**
 * Senior App specific spacing
 * More generous spacing for better touch targets and clarity
 */
export const SeniorSpacing = {
  // Screen padding
  screenHorizontal: 24,  // lg - Left/right screen padding
  screenVertical: 24,    // lg - Top/bottom screen padding
  screenTop: 16,         // md - Top padding (below nav)
  screenBottom: 32,      // xl - Bottom padding (above safe area)

  // Card padding
  cardPadding: 24,       // lg - Internal card padding
  cardMargin: 16,        // md - Space between cards

  // Button spacing
  buttonPaddingVertical: 20,    // Custom - Vertical padding in buttons
  buttonPaddingHorizontal: 24,  // lg - Horizontal padding in buttons
  buttonGap: 16,                // md - Space between buttons
  buttonMarginTop: 24,          // lg - Space above buttons

  // Element spacing
  elementGap: 24,        // lg - Space between major elements
  sectionGap: 32,        // xl - Space between sections
  listItemGap: 20,       // Custom - Space between list items

  // Input spacing
  inputPadding: 24,      // lg - Internal input padding
  inputGap: 16,          // md - Space between input fields
  labelMarginBottom: 12, // sm - Space below labels

  // Touch target spacing
  touchTargetGap: 16,    // md - Minimum space between touch targets
  touchTargetMargin: 20, // Custom - Comfortable margin around targets

  // Icon spacing
  iconMargin: 16,        // md - Space around icons
  iconTextGap: 12,       // sm - Space between icon and text
};

// ============================================================================
// FAMILY APP SPACING (More Compact)
// ============================================================================

/**
 * Family App specific spacing
 * More compact for information density
 */
export const FamilySpacing = {
  // Screen padding
  screenHorizontal: 16,  // md - Left/right screen padding
  screenVertical: 16,    // md - Top/bottom screen padding
  screenTop: 12,         // sm - Top padding (below nav)
  screenBottom: 16,      // md - Bottom padding (above tab bar)

  // Card padding
  cardPadding: 16,       // md - Internal card padding
  cardMargin: 12,        // sm - Space between cards

  // Button spacing
  buttonPaddingVertical: 12,    // sm - Vertical padding in buttons
  buttonPaddingHorizontal: 16,  // md - Horizontal padding in buttons
  buttonGap: 12,                // sm - Space between buttons
  buttonMarginTop: 16,          // md - Space above buttons

  // Element spacing
  elementGap: 16,        // md - Space between elements
  sectionGap: 24,        // lg - Space between sections
  listItemGap: 12,       // sm - Space between list items

  // Input spacing
  inputPadding: 12,      // sm - Internal input padding (vertical)
  inputPaddingHorizontal: 16, // md - Horizontal input padding
  inputGap: 12,          // sm - Space between input fields
  labelMarginBottom: 8,  // xs - Space below labels

  // Touch target spacing
  touchTargetGap: 8,     // xs - Space between touch targets
  touchTargetMargin: 12, // sm - Margin around touch targets

  // Icon spacing
  iconMargin: 12,        // sm - Space around icons
  iconTextGap: 8,        // xs - Space between icon and text

  // Dashboard specific
  statsCardGap: 12,      // sm - Space between stat cards
  activityItemGap: 16,   // md - Space between activity items
  chartMargin: 16,       // md - Margin around charts

  // Tab bar
  tabBarHeight: 64,      // Custom - Total tab bar height (including safe area)
  tabBarPadding: 8,      // xs - Internal tab bar padding
};

// ============================================================================
// COMMON LAYOUT SPACING
// ============================================================================

/**
 * Common layout spacing used across both apps
 */
export const LayoutSpacing = {
  // Navigation
  navBarHeight: 56,           // Standard nav bar height
  navBarHeightLarge: 80,      // Senior app nav bar height
  navBarPadding: 16,          // md
  backButtonSize: 44,         // Standard touch target
  backButtonSizeLarge: 80,    // Senior app back button

  // Modal & Dialog
  modalPadding: 24,           // lg
  modalMargin: 32,            // xl
  dialogPadding: 24,          // lg
  dialogButtonGap: 12,        // sm

  // List
  listItemHeight: 64,         // Standard list item height
  listItemHeightLarge: 100,   // Senior app list item height
  listItemPadding: 16,        // md
  listItemPaddingLarge: 24,   // lg
  listSeparatorHeight: 1,     // Border separator

  // Bottom Sheet
  bottomSheetHandle: 4,       // Handle thickness
  bottomSheetHandleWidth: 40, // Handle width (Family)
  bottomSheetHandleWidthLarge: 80, // Handle width (Senior)
  bottomSheetPadding: 16,     // md
  bottomSheetPaddingLarge: 24, // lg

  // Safe Area (additional padding beyond system safe area)
  safeAreaTop: 8,             // xs
  safeAreaBottom: 16,         // md
  safeAreaBottomLarge: 24,    // lg
};

// ============================================================================
// COMPONENT SPECIFIC SPACING
// ============================================================================

/**
 * Spacing for specific component types
 */
export const ComponentSpacing = {
  // Buttons
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8, // Space between icon and text
  },
  buttonLarge: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
  },

  // Cards
  card: {
    padding: 16,
    gap: 12, // Space between card elements
  },
  cardLarge: {
    padding: 24,
    gap: 16,
  },

  // Forms
  form: {
    fieldGap: 16,
    sectionGap: 24,
    labelGap: 8,
  },
  formLarge: {
    fieldGap: 24,
    sectionGap: 32,
    labelGap: 12,
  },

  // Headers
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    titleMarginBottom: 8,
  },
  headerLarge: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    titleMarginBottom: 12,
  },

  // Status Badges
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 4, // Icon to text
  },
  badgeLarge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },

  // Notification Banner
  notification: {
    padding: 12,
    iconMargin: 12,
    gap: 8,
  },
  notificationLarge: {
    padding: 24,
    iconMargin: 16,
    gap: 12,
  },
};

// ============================================================================
// BORDER RADIUS (Included for convenience)
// ============================================================================

/**
 * Border radius values
 */
export const BorderRadius = {
  // Senior App (Softer, friendlier)
  senior: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
    circle: '50%',
  },

  // Family App (Modern, clean)
  family: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
    circle: '50%',
  },
};

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Get spacing value by key
 * @param size - Spacing key
 * @returns Spacing value in points
 */
export const getSpacing = (size: keyof typeof Spacing): number => {
  return Spacing[size];
};

/**
 * Create custom spacing based on 8pt grid
 * @param multiplier - Grid multiplier (e.g., 1.5 = 12pt)
 * @returns Spacing value in points
 */
export const customSpacing = (multiplier: number): number => {
  return 8 * multiplier;
};

/**
 * Get responsive spacing based on screen width
 * @param baseSize - Base spacing size
 * @param screenWidth - Screen width
 * @returns Adjusted spacing value
 */
export const responsiveSpacing = (baseSize: number, screenWidth: number): number => {
  // For small screens (< 375px), reduce spacing by 25%
  if (screenWidth < 375) {
    return Math.round(baseSize * 0.75);
  }
  // For large screens (> 414px), increase spacing by 15%
  if (screenWidth > 414) {
    return Math.round(baseSize * 1.15);
  }
  return baseSize;
};

/**
 * Create margin style object
 * @param top - Top margin
 * @param right - Right margin
 * @param bottom - Bottom margin
 * @param left - Left margin
 * @returns Margin style object
 */
export const margin = (
  top: number = 0,
  right: number = 0,
  bottom: number = 0,
  left: number = 0
) => ({
  marginTop: top,
  marginRight: right,
  marginBottom: bottom,
  marginLeft: left,
});

/**
 * Create padding style object
 * @param top - Top padding
 * @param right - Right padding
 * @param bottom - Bottom padding
 * @param left - Left padding
 * @returns Padding style object
 */
export const padding = (
  top: number = 0,
  right: number = 0,
  bottom: number = 0,
  left: number = 0
) => ({
  paddingTop: top,
  paddingRight: right,
  paddingBottom: bottom,
  paddingLeft: left,
});

/**
 * Create symmetric margin
 * @param vertical - Top and bottom margin
 * @param horizontal - Left and right margin
 * @returns Margin style object
 */
export const marginSymmetric = (vertical: number, horizontal: number) => ({
  marginVertical: vertical,
  marginHorizontal: horizontal,
});

/**
 * Create symmetric padding
 * @param vertical - Top and bottom padding
 * @param horizontal - Left and right padding
 * @returns Padding style object
 */
export const paddingSymmetric = (vertical: number, horizontal: number) => ({
  paddingVertical: vertical,
  paddingHorizontal: horizontal,
});

/**
 * Create uniform margin
 * @param value - Margin value for all sides
 * @returns Margin style object
 */
export const marginUniform = (value: number) => ({
  margin: value,
});

/**
 * Create uniform padding
 * @param value - Padding value for all sides
 * @returns Padding style object
 */
export const paddingUniform = (value: number) => ({
  padding: value,
});

// ============================================================================
// GRID HELPERS
// ============================================================================

/**
 * Calculate grid item width
 * @param screenWidth - Screen width
 * @param columns - Number of columns
 * @param gap - Gap between items
 * @param padding - Screen horizontal padding
 * @returns Item width
 */
export const gridItemWidth = (
  screenWidth: number,
  columns: number,
  gap: number,
  padding: number
): number => {
  const availableWidth = screenWidth - (padding * 2) - (gap * (columns - 1));
  return availableWidth / columns;
};

/**
 * Calculate list item height including gap
 * @param itemHeight - Base item height
 * @param gap - Gap between items
 * @returns Total height including gap
 */
export const listItemHeightWithGap = (itemHeight: number, gap: number): number => {
  return itemHeight + gap;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SpacingKey = keyof typeof Spacing;
export type SeniorSpacingKey = keyof typeof SeniorSpacing;
export type FamilySpacingKey = keyof typeof FamilySpacing;
export type LayoutSpacingKey = keyof typeof LayoutSpacing;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  Base: Spacing,
  Senior: SeniorSpacing,
  Family: FamilySpacing,
  Layout: LayoutSpacing,
  Component: ComponentSpacing,
  BorderRadius,
  utils: {
    getSpacing,
    customSpacing,
    responsiveSpacing,
    margin,
    padding,
    marginSymmetric,
    paddingSymmetric,
    marginUniform,
    paddingUniform,
    gridItemWidth,
    listItemHeightWithGap,
  },
};
