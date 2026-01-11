/**
 * SilverGuard Senior App - React Native StyleSheet
 * Production-ready styles for elderly/dementia-friendly interface
 *
 * Key Requirements:
 * - EXTRA LARGE text (24pt minimum)
 * - High contrast (WCAG AAA - 7:1 minimum)
 * - Large touch targets (80x80pt minimum)
 * - Simple, clear visual hierarchy
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Dimensions } from 'react-native';
import { SeniorColors } from './colors';
import { SeniorTypography } from './typography';
import { SeniorSpacing, LayoutSpacing, BorderRadius } from './spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// LAYOUT STYLES
// ============================================================================

export const layoutStyles = StyleSheet.create({
  // Screen Container
  screen: {
    flex: 1,
    backgroundColor: SeniorColors.background,
  } as ViewStyle,

  screenWithPadding: {
    flex: 1,
    backgroundColor: SeniorColors.background,
    paddingHorizontal: SeniorSpacing.screenHorizontal,
    paddingVertical: SeniorSpacing.screenVertical,
  } as ViewStyle,

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SeniorSpacing.screenHorizontal,
    paddingTop: SeniorSpacing.screenTop,
    paddingBottom: SeniorSpacing.screenBottom,
  } as ViewStyle,

  // Centered content
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorSpacing.screenHorizontal,
  } as ViewStyle,

  // Section
  section: {
    marginBottom: SeniorSpacing.sectionGap,
  } as ViewStyle,
});

// ============================================================================
// NAVIGATION STYLES
// ============================================================================

export const navigationStyles = StyleSheet.create({
  // Navigation Bar
  navBar: {
    height: LayoutSpacing.navBarHeightLarge,
    backgroundColor: SeniorColors.background,
    borderBottomWidth: 2,
    borderBottomColor: SeniorColors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SeniorSpacing.screenHorizontal,
  } as ViewStyle,

  navTitle: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.primary,
    flex: 1,
    textAlign: 'center',
  } as TextStyle,

  backButton: {
    width: LayoutSpacing.backButtonSizeLarge,
    height: LayoutSpacing.backButtonSizeLarge,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.senior.md,
    backgroundColor: SeniorColors.surface,
  } as ViewStyle,

  backButtonText: {
    fontSize: 48,
    color: SeniorColors.primary.blue,
  } as TextStyle,
});

// ============================================================================
// HOME SCREEN STYLES
// ============================================================================

export const homeStyles = StyleSheet.create({
  // Home Container
  homeContainer: {
    flex: 1,
    backgroundColor: SeniorColors.background,
  } as ViewStyle,

  // Header Section
  header: {
    paddingHorizontal: SeniorSpacing.screenHorizontal,
    paddingTop: SeniorSpacing.screenTop + 20,
    paddingBottom: SeniorSpacing.elementGap,
    backgroundColor: SeniorColors.surface,
    borderBottomWidth: 2,
    borderBottomColor: SeniorColors.border.light,
  } as ViewStyle,

  welcomeText: {
    ...SeniorTypography.displayMedium,
    color: SeniorColors.text.primary,
    marginBottom: 8,
  } as TextStyle,

  dateText: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.secondary,
  } as TextStyle,

  // Button Grid (2x2)
  buttonGrid: {
    flex: 1,
    padding: SeniorSpacing.screenHorizontal,
    gap: SeniorSpacing.buttonGap,
  } as ViewStyle,

  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    gap: SeniorSpacing.buttonGap,
  } as ViewStyle,

  // Home Button
  homeButton: {
    flex: 1,
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.lg,
    borderWidth: 2,
    borderColor: SeniorColors.border.default,
    padding: SeniorSpacing.cardPadding,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  } as ViewStyle,

  homeButtonActive: {
    borderColor: SeniorColors.primary.blue,
    backgroundColor: '#F0F9FF', // Light blue tint
  } as ViewStyle,

  homeButtonIcon: {
    fontSize: 64,
    color: SeniorColors.primary.blue,
    marginBottom: 12,
  } as TextStyle,

  homeButtonLabel: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.primary,
    textAlign: 'center',
  } as TextStyle,

  // Emergency Button (Special styling)
  emergencyButton: {
    flex: 1,
    backgroundColor: SeniorColors.sos.primary,
    borderRadius: BorderRadius.senior.xl,
    borderWidth: 3,
    borderColor: SeniorColors.sos.dark,
    padding: SeniorSpacing.cardPadding,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
    shadowColor: SeniorColors.sos.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  emergencyButtonIcon: {
    fontSize: 64,
    color: SeniorColors.text.inverse,
    marginBottom: 12,
  } as TextStyle,

  emergencyButtonLabel: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.inverse,
    textAlign: 'center',
  } as TextStyle,
});

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = StyleSheet.create({
  // Primary Button
  primaryButton: {
    backgroundColor: SeniorColors.primary.blue,
    borderRadius: BorderRadius.senior.lg,
    paddingVertical: SeniorSpacing.buttonPaddingVertical,
    paddingHorizontal: SeniorSpacing.buttonPaddingHorizontal,
    minHeight: 90,
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  primaryButtonText: {
    ...SeniorTypography.button,
    color: SeniorColors.text.inverse,
    textAlign: 'center',
  } as TextStyle,

  primaryButtonDisabled: {
    backgroundColor: SeniorColors.gray[300],
  } as ViewStyle,

  primaryButtonTextDisabled: {
    color: SeniorColors.gray[400],
  } as TextStyle,

  // Secondary Button
  secondaryButton: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.lg,
    borderWidth: 2,
    borderColor: SeniorColors.primary.blue,
    paddingVertical: SeniorSpacing.buttonPaddingVertical,
    paddingHorizontal: SeniorSpacing.buttonPaddingHorizontal,
    minHeight: 90,
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  secondaryButtonText: {
    ...SeniorTypography.button,
    color: SeniorColors.primary.blue,
    textAlign: 'center',
  } as TextStyle,

  secondaryButtonActive: {
    backgroundColor: SeniorColors.gray[100],
  } as ViewStyle,

  // SOS Button (Large emergency button)
  sosButton: {
    backgroundColor: SeniorColors.sos.primary,
    borderRadius: BorderRadius.senior.xl,
    paddingVertical: 32,
    paddingHorizontal: 48,
    minHeight: 120,
    minWidth: 280,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: SeniorColors.sos.dark,
    shadowColor: SeniorColors.sos.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,

  sosButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: SeniorColors.text.inverse,
    textAlign: 'center',
  } as TextStyle,

  // Icon Button
  iconButton: {
    backgroundColor: SeniorColors.surface,
    borderRadius: BorderRadius.senior.lg,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  iconButtonActive: {
    backgroundColor: SeniorColors.gray[200],
  } as ViewStyle,

  iconButtonIcon: {
    fontSize: 48,
    color: SeniorColors.primary.blue,
  } as TextStyle,

  // Full Width Button
  fullWidthButton: {
    width: '100%',
    marginTop: SeniorSpacing.buttonMarginTop,
  } as ViewStyle,
});

// ============================================================================
// CARD STYLES
// ============================================================================

export const cardStyles = StyleSheet.create({
  // Base Card
  card: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.md,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    padding: SeniorSpacing.cardPadding,
    marginBottom: SeniorSpacing.cardMargin,
  } as ViewStyle,

  // Medication Card
  medicationCard: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.md,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    padding: SeniorSpacing.cardPadding,
    marginBottom: SeniorSpacing.listItemGap,
    minHeight: 180,
  } as ViewStyle,

  medicationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,

  medicationName: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.primary,
    flex: 1,
  } as TextStyle,

  medicationDosage: {
    ...SeniorTypography.bodyLarge,
    color: SeniorColors.text.secondary,
    marginBottom: 8,
  } as TextStyle,

  medicationTime: {
    ...SeniorTypography.heading2,
    color: SeniorColors.primary.blue,
    marginBottom: 16,
  } as TextStyle,

  // Appointment Card
  appointmentCard: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.md,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    padding: SeniorSpacing.cardPadding,
    marginBottom: SeniorSpacing.listItemGap,
    minHeight: 200,
  } as ViewStyle,

  appointmentDate: {
    ...SeniorTypography.heading1,
    color: SeniorColors.primary.blue,
    marginBottom: 12,
  } as TextStyle,

  appointmentTitle: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.primary,
    marginBottom: 8,
  } as TextStyle,

  appointmentDoctor: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.secondary,
    marginBottom: 8,
  } as TextStyle,

  appointmentLocation: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.tertiary,
  } as TextStyle,

  // Health Entry Card
  healthCard: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.md,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    padding: SeniorSpacing.cardPadding,
    marginBottom: SeniorSpacing.listItemGap,
  } as ViewStyle,

  healthMetricName: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.primary,
    marginBottom: 8,
  } as TextStyle,

  healthMetricValue: {
    ...SeniorTypography.displayMedium,
    color: SeniorColors.primary.blue,
    marginBottom: 4,
  } as TextStyle,

  healthMetricUnit: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.tertiary,
    marginBottom: 12,
  } as TextStyle,

  healthMetricTimestamp: {
    ...SeniorTypography.caption,
    color: SeniorColors.gray[400],
  } as TextStyle,
});

// ============================================================================
// STATUS BADGE STYLES
// ============================================================================

export const badgeStyles = StyleSheet.create({
  // Base Badge
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.senior.pill,
    alignSelf: 'flex-start',
  } as ViewStyle,

  badgeText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  // Status Badges
  badgePending: {
    backgroundColor: SeniorColors.warning.background,
  } as ViewStyle,

  badgePendingText: {
    color: SeniorColors.warning.primary,
  } as TextStyle,

  badgeTaken: {
    backgroundColor: SeniorColors.success.background,
  } as ViewStyle,

  badgeTakenText: {
    color: SeniorColors.success.primary,
  } as TextStyle,

  badgeMissed: {
    backgroundColor: SeniorColors.error.background,
  } as ViewStyle,

  badgeMissedText: {
    color: SeniorColors.error.primary,
  } as TextStyle,

  badgeSkipped: {
    backgroundColor: SeniorColors.gray[200],
  } as ViewStyle,

  badgeSkippedText: {
    color: SeniorColors.gray[700],
  } as TextStyle,
});

// ============================================================================
// INPUT STYLES
// ============================================================================

export const inputStyles = StyleSheet.create({
  // Text Input
  input: {
    backgroundColor: SeniorColors.background,
    borderWidth: 2,
    borderColor: SeniorColors.border.default,
    borderRadius: BorderRadius.senior.md,
    paddingVertical: SeniorSpacing.inputPadding,
    paddingHorizontal: SeniorSpacing.inputPadding,
    fontSize: 24,
    fontWeight: '400',
    color: SeniorColors.text.primary,
    minHeight: 90,
  } as TextStyle,

  inputFocused: {
    borderWidth: 3,
    borderColor: SeniorColors.primary.blue,
  } as ViewStyle,

  inputError: {
    borderWidth: 3,
    borderColor: SeniorColors.error.primary,
  } as ViewStyle,

  inputLabel: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.primary,
    marginBottom: SeniorSpacing.labelMarginBottom,
  } as TextStyle,

  inputHelper: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.tertiary,
    marginTop: 8,
  } as TextStyle,

  inputErrorText: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.error.primary,
    marginTop: 8,
  } as TextStyle,

  // Number Input (for health data)
  numberInput: {
    backgroundColor: SeniorColors.background,
    borderWidth: 2,
    borderColor: SeniorColors.border.default,
    borderRadius: BorderRadius.senior.md,
    paddingVertical: 32,
    paddingHorizontal: 32,
    fontSize: 40,
    fontWeight: '700',
    color: SeniorColors.text.primary,
    minHeight: 120,
    textAlign: 'center',
  } as TextStyle,

  // Input Container
  inputContainer: {
    marginBottom: SeniorSpacing.inputGap,
  } as ViewStyle,

  // Increment/Decrement Buttons
  numberInputControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
  } as ViewStyle,

  incrementButton: {
    width: 80,
    height: 80,
    backgroundColor: SeniorColors.primary.blue,
    borderRadius: BorderRadius.senior.circle as any,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  incrementButtonText: {
    fontSize: 48,
    fontWeight: '700',
    color: SeniorColors.text.inverse,
  } as TextStyle,
});

// ============================================================================
// MODAL & DIALOG STYLES
// ============================================================================

export const modalStyles = StyleSheet.create({
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SeniorSpacing.screenHorizontal,
  } as ViewStyle,

  // Modal Container
  modalContainer: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.lg,
    padding: 32,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  // Confirmation Dialog
  dialogIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  dialogTitle: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,

  dialogMessage: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  } as TextStyle,

  dialogButtons: {
    gap: 12,
  } as ViewStyle,

  // Medication Reminder Modal
  reminderModal: {
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.lg,
    padding: 32,
    width: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  reminderIcon: {
    fontSize: 96,
    textAlign: 'center',
    color: SeniorColors.primary.blue,
    marginBottom: 24,
  } as TextStyle,

  reminderMedicationName: {
    ...SeniorTypography.displayMedium,
    color: SeniorColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,

  reminderDosage: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,

  reminderTime: {
    ...SeniorTypography.heading2,
    color: SeniorColors.primary.blue,
    textAlign: 'center',
    marginBottom: 32,
  } as TextStyle,
});

// ============================================================================
// NOTIFICATION/BANNER STYLES
// ============================================================================

export const notificationStyles = StyleSheet.create({
  // Banner Container
  banner: {
    borderRadius: BorderRadius.senior.md,
    padding: SeniorSpacing.cardPadding,
    marginHorizontal: SeniorSpacing.screenHorizontal,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  bannerIcon: {
    fontSize: 48,
    marginRight: 16,
  } as TextStyle,

  bannerContent: {
    flex: 1,
  } as ViewStyle,

  bannerTitle: {
    ...SeniorTypography.heading2,
    marginBottom: 4,
  } as TextStyle,

  bannerMessage: {
    ...SeniorTypography.bodyMedium,
  } as TextStyle,

  // Success Banner
  bannerSuccess: {
    backgroundColor: SeniorColors.success.background,
    borderWidth: 2,
    borderColor: SeniorColors.success.light,
  } as ViewStyle,

  bannerSuccessIcon: {
    color: SeniorColors.success.primary,
  } as TextStyle,

  bannerSuccessTitle: {
    color: SeniorColors.success.primary,
  } as TextStyle,

  bannerSuccessMessage: {
    color: SeniorColors.success.primary,
  } as TextStyle,

  // Error Banner
  bannerError: {
    backgroundColor: SeniorColors.error.background,
    borderWidth: 2,
    borderColor: SeniorColors.error.light,
  } as ViewStyle,

  bannerErrorIcon: {
    color: SeniorColors.error.primary,
  } as TextStyle,

  bannerErrorTitle: {
    color: SeniorColors.error.primary,
  } as TextStyle,

  bannerErrorMessage: {
    color: SeniorColors.error.primary,
  } as TextStyle,

  // Warning Banner
  bannerWarning: {
    backgroundColor: SeniorColors.warning.background,
    borderWidth: 2,
    borderColor: SeniorColors.warning.light,
  } as ViewStyle,

  bannerWarningIcon: {
    color: SeniorColors.warning.primary,
  } as TextStyle,

  bannerWarningTitle: {
    color: SeniorColors.warning.primary,
  } as TextStyle,

  bannerWarningMessage: {
    color: SeniorColors.warning.primary,
  } as TextStyle,
});

// ============================================================================
// LOADING & EMPTY STATES
// ============================================================================

export const stateStyles = StyleSheet.create({
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SeniorColors.background,
  } as ViewStyle,

  loadingSpinner: {
    // Use ActivityIndicator with size="large" and color
  } as ViewStyle,

  loadingText: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.secondary,
    marginTop: 16,
  } as TextStyle,

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorSpacing.screenHorizontal,
  } as ViewStyle,

  emptyIcon: {
    fontSize: 96,
    color: SeniorColors.gray[300],
    marginBottom: 24,
  } as TextStyle,

  emptyTitle: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,

  emptyMessage: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
  } as TextStyle,
});

// ============================================================================
// LIST STYLES
// ============================================================================

export const listStyles = StyleSheet.create({
  // List Container
  list: {
    paddingHorizontal: SeniorSpacing.screenHorizontal,
    paddingTop: SeniorSpacing.screenTop,
    paddingBottom: SeniorSpacing.screenBottom,
  } as ViewStyle,

  listHeader: {
    ...SeniorTypography.heading1,
    color: SeniorColors.text.primary,
    marginBottom: 20,
  } as TextStyle,

  listSeparator: {
    height: SeniorSpacing.listItemGap,
  } as ViewStyle,

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SeniorColors.background,
    borderRadius: BorderRadius.senior.md,
    borderWidth: 2,
    borderColor: SeniorColors.border.light,
    padding: SeniorSpacing.cardPadding,
    minHeight: 100,
  } as ViewStyle,

  listItemIcon: {
    fontSize: 48,
    color: SeniorColors.primary.blue,
    marginRight: 16,
  } as TextStyle,

  listItemContent: {
    flex: 1,
  } as ViewStyle,

  listItemTitle: {
    ...SeniorTypography.heading2,
    color: SeniorColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  listItemSubtitle: {
    ...SeniorTypography.bodyMedium,
    color: SeniorColors.text.secondary,
  } as TextStyle,

  listItemArrow: {
    fontSize: 32,
    color: SeniorColors.gray[400],
  } as TextStyle,
});

// ============================================================================
// HELPER/UTILITY STYLES
// ============================================================================

export const utilityStyles = StyleSheet.create({
  // Flex utilities
  flexRow: {
    flexDirection: 'row',
  } as ViewStyle,

  flexColumn: {
    flexDirection: 'column',
  } as ViewStyle,

  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  flexBetween: {
    justifyContent: 'space-between',
  } as ViewStyle,

  flex1: {
    flex: 1,
  } as ViewStyle,

  // Text alignment
  textCenter: {
    textAlign: 'center',
  } as TextStyle,

  textLeft: {
    textAlign: 'left',
  } as TextStyle,

  textRight: {
    textAlign: 'right',
  } as TextStyle,

  // Margin utilities
  mt8: { marginTop: 8 } as ViewStyle,
  mt16: { marginTop: 16 } as ViewStyle,
  mt24: { marginTop: 24 } as ViewStyle,
  mb8: { marginBottom: 8 } as ViewStyle,
  mb16: { marginBottom: 16 } as ViewStyle,
  mb24: { marginBottom: 24 } as ViewStyle,
  mr8: { marginRight: 8 } as ViewStyle,
  mr16: { marginRight: 16 } as ViewStyle,
  ml8: { marginLeft: 8 } as ViewStyle,
  ml16: { marginLeft: 16 } as ViewStyle,

  // Padding utilities
  p8: { padding: 8 } as ViewStyle,
  p16: { padding: 16 } as ViewStyle,
  p24: { padding: 24 } as ViewStyle,

  // Divider
  divider: {
    height: 2,
    backgroundColor: SeniorColors.border.light,
    marginVertical: 16,
  } as ViewStyle,
});

// ============================================================================
// EXPORT ALL STYLES
// ============================================================================

export default {
  layout: layoutStyles,
  navigation: navigationStyles,
  home: homeStyles,
  button: buttonStyles,
  card: cardStyles,
  badge: badgeStyles,
  input: inputStyles,
  modal: modalStyles,
  notification: notificationStyles,
  state: stateStyles,
  list: listStyles,
  utility: utilityStyles,
};
