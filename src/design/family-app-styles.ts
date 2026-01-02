/**
 * SilverGuard Family App - React Native StyleSheet
 * Production-ready styles for modern caregiver dashboard
 *
 * Key Requirements:
 * - Modern, clean interface
 * - Information-dense but organized
 * - Professional color scheme
 * - Standard 16pt base font size
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Dimensions } from 'react-native';
import { FamilyColors } from './colors';
import { FamilyTypography } from './typography';
import { FamilySpacing, LayoutSpacing, BorderRadius } from './spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// LAYOUT STYLES
// ============================================================================

export const layoutStyles = StyleSheet.create({
  // Screen Container
  screen: {
    flex: 1,
    backgroundColor: FamilyColors.background,
  } as ViewStyle,

  screenWithPadding: {
    flex: 1,
    backgroundColor: FamilyColors.background,
    paddingHorizontal: FamilySpacing.screenHorizontal,
    paddingVertical: FamilySpacing.screenVertical,
  } as ViewStyle,

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: FamilySpacing.screenHorizontal,
    paddingTop: FamilySpacing.screenTop,
    paddingBottom: FamilySpacing.screenBottom + FamilySpacing.tabBarHeight,
  } as ViewStyle,

  // Centered content
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  // Section
  section: {
    marginBottom: FamilySpacing.sectionGap,
  } as ViewStyle,

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  sectionTitle: {
    ...FamilyTypography.heading2,
    color: FamilyColors.text.primary,
  } as TextStyle,

  sectionAction: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.primary.purple,
  } as TextStyle,
});

// ============================================================================
// NAVIGATION STYLES
// ============================================================================

export const navigationStyles = StyleSheet.create({
  // Top Navigation Bar
  navBar: {
    height: LayoutSpacing.navBarHeight,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  navTitle: {
    ...FamilyTypography.heading1,
    color: FamilyColors.text.primary,
    flex: 1,
    textAlign: 'center',
  } as TextStyle,

  navBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  navRightButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  // Bottom Tab Bar
  tabBar: {
    height: FamilySpacing.tabBarHeight,
    backgroundColor: FamilyColors.surface,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
    flexDirection: 'row',
    paddingBottom: 8,
  } as ViewStyle,

  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: FamilySpacing.tabBarPadding,
  } as ViewStyle,

  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  } as TextStyle,

  tabIconActive: {
    color: FamilyColors.primary.purple,
  } as TextStyle,

  tabIconInactive: {
    color: FamilyColors.gray[400],
  } as TextStyle,

  tabLabel: {
    ...FamilyTypography.tabBar,
  } as TextStyle,

  tabLabelActive: {
    color: FamilyColors.primary.purple,
  } as TextStyle,

  tabLabelInactive: {
    color: FamilyColors.gray[500],
  } as TextStyle,

  tabBadge: {
    position: 'absolute',
    top: 4,
    right: '30%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FamilyColors.error.primary,
  } as ViewStyle,
});

// ============================================================================
// DASHBOARD STYLES
// ============================================================================

export const dashboardStyles = StyleSheet.create({
  // Dashboard Container
  dashboardScroll: {
    flexGrow: 1,
    paddingBottom: FamilySpacing.tabBarHeight + 16,
  } as ViewStyle,

  // Senior Info Card
  seniorInfoCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    padding: FamilySpacing.cardPadding,
    marginHorizontal: FamilySpacing.screenHorizontal,
    marginTop: FamilySpacing.screenTop,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  seniorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FamilyColors.primary.purpleBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,

  seniorAvatarText: {
    ...FamilyTypography.heading1,
    color: FamilyColors.primary.purple,
  } as TextStyle,

  seniorInfo: {
    flex: 1,
  } as ViewStyle,

  seniorName: {
    ...FamilyTypography.heading2,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  seniorStatus: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  } as TextStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  } as ViewStyle,

  statusOnline: {
    backgroundColor: FamilyColors.online.active,
  } as ViewStyle,

  statusOffline: {
    backgroundColor: FamilyColors.online.offline,
  } as ViewStyle,

  notificationBell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: FamilyColors.error.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  } as ViewStyle,

  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: FamilyColors.text.inverse,
  } as TextStyle,

  // Quick Stats Section
  quickStats: {
    paddingHorizontal: FamilySpacing.screenHorizontal,
    marginBottom: 24,
  } as ViewStyle,

  statsRow: {
    flexDirection: 'row',
    gap: FamilySpacing.statsCardGap,
  } as ViewStyle,

  statCard: {
    flex: 1,
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  statLabel: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.secondary,
    marginBottom: 8,
  } as TextStyle,

  statValue: {
    ...FamilyTypography.heading1,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  statSubtext: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.tertiary,
  } as TextStyle,

  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  } as TextStyle,

  // SOS Alert Banner
  sosAlertBanner: {
    backgroundColor: FamilyColors.sos.background,
    borderWidth: 2,
    borderColor: FamilyColors.sos.border,
    borderRadius: BorderRadius.family.md,
    padding: FamilySpacing.cardPadding,
    marginHorizontal: FamilySpacing.screenHorizontal,
    marginBottom: 16,
    shadowColor: FamilyColors.sos.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  } as ViewStyle,

  sosAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  sosAlertIcon: {
    fontSize: 32,
    color: FamilyColors.sos.primary,
    marginRight: 12,
  } as TextStyle,

  sosAlertTitle: {
    ...FamilyTypography.heading2,
    color: FamilyColors.sos.dark,
    flex: 1,
  } as TextStyle,

  sosAlertContent: {
    marginBottom: 16,
  } as ViewStyle,

  sosAlertName: {
    ...FamilyTypography.bodyLarge,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  sosAlertLocation: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
    marginBottom: 4,
  } as TextStyle,

  sosAlertTime: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.tertiary,
  } as TextStyle,

  sosAlertButtons: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  // Activity Feed
  activityFeed: {
    paddingHorizontal: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  activityCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    padding: FamilySpacing.cardPadding,
    marginBottom: FamilySpacing.activityItemGap,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,

  activityIconText: {
    fontSize: 20,
  } as TextStyle,

  activityContent: {
    flex: 1,
  } as ViewStyle,

  activityText: {
    ...FamilyTypography.bodyRegular,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  activityTime: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.tertiary,
  } as TextStyle,

  activityMeta: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
  } as TextStyle,
});

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = StyleSheet.create({
  // Primary Button
  primaryButton: {
    backgroundColor: FamilyColors.primary.purple,
    borderRadius: BorderRadius.family.lg,
    paddingVertical: FamilySpacing.buttonPaddingVertical,
    paddingHorizontal: FamilySpacing.buttonPaddingHorizontal,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  primaryButtonText: {
    ...FamilyTypography.button,
    color: FamilyColors.text.inverse,
  } as TextStyle,

  primaryButtonDisabled: {
    backgroundColor: FamilyColors.gray[200],
  } as ViewStyle,

  primaryButtonTextDisabled: {
    color: FamilyColors.gray[400],
  } as TextStyle,

  // Secondary Button
  secondaryButton: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.lg,
    borderWidth: 1,
    borderColor: FamilyColors.primary.purple,
    paddingVertical: FamilySpacing.buttonPaddingVertical,
    paddingHorizontal: FamilySpacing.buttonPaddingHorizontal,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  secondaryButtonText: {
    ...FamilyTypography.button,
    color: FamilyColors.primary.purple,
  } as TextStyle,

  // Danger Button
  dangerButton: {
    backgroundColor: FamilyColors.error.primary,
    borderRadius: BorderRadius.family.lg,
    paddingVertical: FamilySpacing.buttonPaddingVertical,
    paddingHorizontal: FamilySpacing.buttonPaddingHorizontal,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  dangerButtonText: {
    ...FamilyTypography.button,
    color: FamilyColors.text.inverse,
  } as TextStyle,

  // Text Button
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  textButtonText: {
    ...FamilyTypography.button,
    color: FamilyColors.primary.purple,
  } as TextStyle,

  // Icon Button
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
  } as ViewStyle,

  iconButtonActive: {
    backgroundColor: FamilyColors.primary.purpleBackground,
  } as ViewStyle,

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: FamilySpacing.tabBarHeight + 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FamilyColors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  fabIcon: {
    fontSize: 24,
    color: FamilyColors.text.inverse,
  } as TextStyle,

  // Small Button
  smallButton: {
    backgroundColor: FamilyColors.primary.purple,
    borderRadius: BorderRadius.family.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  smallButtonText: {
    ...FamilyTypography.buttonSmall,
    color: FamilyColors.text.inverse,
  } as TextStyle,

  // Full Width Button
  fullWidthButton: {
    width: '100%',
  } as ViewStyle,
});

// ============================================================================
// CARD STYLES
// ============================================================================

export const cardStyles = StyleSheet.create({
  // Base Card
  card: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    padding: FamilySpacing.cardPadding,
    marginBottom: FamilySpacing.cardMargin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  cardTitle: {
    ...FamilyTypography.heading3,
    color: FamilyColors.text.primary,
  } as TextStyle,

  cardSubtitle: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
    marginTop: 4,
  } as TextStyle,

  // Medication Card
  medicationCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    padding: FamilySpacing.cardPadding,
    marginBottom: FamilySpacing.listItemGap,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  medicationCardContent: {
    flex: 1,
  } as ViewStyle,

  medicationName: {
    ...FamilyTypography.heading3,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  medicationDosage: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
    marginBottom: 2,
  } as TextStyle,

  medicationSchedule: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.tertiary,
  } as TextStyle,

  medicationActions: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,

  // Appointment Card
  appointmentCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    padding: FamilySpacing.cardPadding,
    marginBottom: FamilySpacing.listItemGap,
  } as ViewStyle,

  appointmentDate: {
    ...FamilyTypography.heading3,
    color: FamilyColors.primary.purple,
    marginBottom: 8,
  } as TextStyle,

  appointmentTitle: {
    ...FamilyTypography.heading3,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  appointmentMeta: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
    marginBottom: 2,
  } as TextStyle,

  // Health Chart Card
  healthChartCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    padding: FamilySpacing.cardPadding,
    marginBottom: FamilySpacing.cardMargin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  chartTitle: {
    ...FamilyTypography.heading2,
    color: FamilyColors.text.primary,
  } as TextStyle,

  chartValue: {
    ...FamilyTypography.heading1,
    color: FamilyColors.primary.purple,
  } as TextStyle,

  chartContainer: {
    height: 200,
    marginVertical: 16,
  } as ViewStyle,

  chartTimeRange: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  } as ViewStyle,

  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.family.sm,
    backgroundColor: FamilyColors.gray[100],
  } as ViewStyle,

  timeRangeButtonActive: {
    backgroundColor: FamilyColors.primary.purple,
  } as ViewStyle,

  timeRangeText: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
  } as TextStyle,

  timeRangeTextActive: {
    color: FamilyColors.text.inverse,
  } as TextStyle,
});

// ============================================================================
// STATUS BADGE STYLES
// ============================================================================

export const badgeStyles = StyleSheet.create({
  // Base Badge
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.family.pill,
    alignSelf: 'flex-start',
  } as ViewStyle,

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  // Status Badges
  badgePending: {
    backgroundColor: FamilyColors.warning.background,
  } as ViewStyle,

  badgePendingText: {
    color: FamilyColors.warning.dark,
  } as TextStyle,

  badgeTaken: {
    backgroundColor: FamilyColors.success.background,
  } as ViewStyle,

  badgeTakenText: {
    color: FamilyColors.success.dark,
  } as TextStyle,

  badgeMissed: {
    backgroundColor: FamilyColors.error.background,
  } as ViewStyle,

  badgeMissedText: {
    color: FamilyColors.error.dark,
  } as TextStyle,

  badgeCompleted: {
    backgroundColor: FamilyColors.success.background,
  } as ViewStyle,

  badgeCompletedText: {
    color: FamilyColors.success.dark,
  } as TextStyle,

  badgeActive: {
    backgroundColor: FamilyColors.success.background,
  } as ViewStyle,

  badgeActiveText: {
    color: FamilyColors.success.dark,
  } as TextStyle,
});

// ============================================================================
// INPUT STYLES
// ============================================================================

export const inputStyles = StyleSheet.create({
  // Input Container
  inputContainer: {
    marginBottom: FamilySpacing.inputGap,
  } as ViewStyle,

  inputLabel: {
    ...FamilyTypography.label,
    color: FamilyColors.text.primary,
    marginBottom: FamilySpacing.labelMarginBottom,
  } as TextStyle,

  inputLabelRequired: {
    color: FamilyColors.error.primary,
  } as TextStyle,

  // Text Input
  input: {
    backgroundColor: FamilyColors.surface,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    borderRadius: BorderRadius.family.md,
    paddingVertical: FamilySpacing.inputPadding,
    paddingHorizontal: FamilySpacing.inputPaddingHorizontal,
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.text.primary,
    minHeight: 48,
  } as TextStyle,

  inputFocused: {
    borderWidth: 2,
    borderColor: FamilyColors.primary.purple,
  } as ViewStyle,

  inputError: {
    borderWidth: 2,
    borderColor: FamilyColors.error.primary,
  } as ViewStyle,

  inputHelper: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.tertiary,
    marginTop: 4,
  } as TextStyle,

  inputErrorText: {
    ...FamilyTypography.caption,
    color: FamilyColors.error.primary,
    marginTop: 4,
  } as TextStyle,

  // Search Input
  searchInput: {
    backgroundColor: FamilyColors.gray[100],
    borderWidth: 1,
    borderColor: FamilyColors.border.light,
    borderRadius: BorderRadius.family.pill,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.text.primary,
    height: 44,
  } as TextStyle,

  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 10,
    fontSize: 20,
    color: FamilyColors.gray[400],
  } as TextStyle,

  // Textarea
  textarea: {
    backgroundColor: FamilyColors.surface,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    borderRadius: BorderRadius.family.md,
    paddingVertical: FamilySpacing.inputPadding,
    paddingHorizontal: FamilySpacing.inputPaddingHorizontal,
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
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
    padding: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  // Modal Container
  modalContainer: {
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.lg,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  modalTitle: {
    ...FamilyTypography.heading1,
    color: FamilyColors.text.primary,
    marginBottom: 16,
  } as TextStyle,

  modalMessage: {
    ...FamilyTypography.bodyRegular,
    color: FamilyColors.text.secondary,
    marginBottom: 24,
  } as TextStyle,

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  } as ViewStyle,

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: FamilyColors.surface,
    borderTopLeftRadius: BorderRadius.family.lg,
    borderTopRightRadius: BorderRadius.family.lg,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: FamilySpacing.screenHorizontal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: FamilyColors.gray[300],
    alignSelf: 'center',
    marginBottom: 16,
  } as ViewStyle,
});

// ============================================================================
// CHAT STYLES
// ============================================================================

export const chatStyles = StyleSheet.create({
  // Chat Container
  chatContainer: {
    flex: 1,
    backgroundColor: FamilyColors.background,
  } as ViewStyle,

  chatList: {
    paddingHorizontal: FamilySpacing.screenHorizontal,
    paddingVertical: 16,
  } as ViewStyle,

  // Message Bubble
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  } as ViewStyle,

  messageSelf: {
    alignSelf: 'flex-end',
  } as ViewStyle,

  messageOther: {
    alignSelf: 'flex-start',
  } as ViewStyle,

  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.family.lg,
  } as ViewStyle,

  messageBubbleSelf: {
    backgroundColor: FamilyColors.primary.purple,
  } as ViewStyle,

  messageBubbleOther: {
    backgroundColor: FamilyColors.gray[200],
  } as ViewStyle,

  messageText: {
    ...FamilyTypography.bodyRegular,
  } as TextStyle,

  messageTextSelf: {
    color: FamilyColors.text.inverse,
  } as TextStyle,

  messageTextOther: {
    color: FamilyColors.text.primary,
  } as TextStyle,

  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  } as ViewStyle,

  messageSender: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.tertiary,
    marginRight: 8,
  } as TextStyle,

  messageTime: {
    ...FamilyTypography.caption,
    color: FamilyColors.text.tertiary,
  } as TextStyle,

  // Chat Input
  chatInputContainer: {
    flexDirection: 'row',
    padding: FamilySpacing.screenHorizontal,
    paddingBottom: FamilySpacing.screenHorizontal + 8,
    backgroundColor: FamilyColors.surface,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
    alignItems: 'center',
  } as ViewStyle,

  chatInput: {
    flex: 1,
    backgroundColor: FamilyColors.gray[100],
    borderRadius: BorderRadius.family.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  } as TextStyle,

  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FamilyColors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  chatSendButtonDisabled: {
    backgroundColor: FamilyColors.gray[300],
  } as ViewStyle,

  chatSendIcon: {
    fontSize: 20,
    color: FamilyColors.text.inverse,
  } as TextStyle,
});

// ============================================================================
// MAP/LOCATION STYLES
// ============================================================================

export const locationStyles = StyleSheet.create({
  // Map Container
  mapContainer: {
    flex: 1,
  } as ViewStyle,

  map: {
    flex: 1,
  } as ViewStyle,

  // Location Info Card (overlays map)
  locationInfoCard: {
    position: 'absolute',
    bottom: FamilySpacing.tabBarHeight + 16,
    left: 16,
    right: 16,
    backgroundColor: FamilyColors.surface,
    borderRadius: BorderRadius.family.md,
    padding: FamilySpacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  locationAddress: {
    ...FamilyTypography.bodyLarge,
    color: FamilyColors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  locationTime: {
    ...FamilyTypography.bodySmall,
    color: FamilyColors.text.secondary,
  } as TextStyle,

  locationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  } as ViewStyle,
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
    backgroundColor: FamilyColors.background,
  } as ViewStyle,

  loadingText: {
    ...FamilyTypography.bodyRegular,
    color: FamilyColors.text.secondary,
    marginTop: 12,
  } as TextStyle,

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  emptyIcon: {
    fontSize: 64,
    color: FamilyColors.gray[300],
    marginBottom: 16,
  } as TextStyle,

  emptyTitle: {
    ...FamilyTypography.heading2,
    color: FamilyColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,

  emptyMessage: {
    ...FamilyTypography.bodyRegular,
    color: FamilyColors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: FamilySpacing.screenHorizontal,
  } as ViewStyle,

  errorIcon: {
    fontSize: 64,
    color: FamilyColors.error.primary,
    marginBottom: 16,
  } as TextStyle,

  errorTitle: {
    ...FamilyTypography.heading2,
    color: FamilyColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,

  errorMessage: {
    ...FamilyTypography.bodyRegular,
    color: FamilyColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
});

// ============================================================================
// LIST STYLES
// ============================================================================

export const listStyles = StyleSheet.create({
  list: {
    paddingHorizontal: FamilySpacing.screenHorizontal,
    paddingBottom: FamilySpacing.tabBarHeight + 16,
  } as ViewStyle,

  listSeparator: {
    height: FamilySpacing.listItemGap,
  } as ViewStyle,
});

// ============================================================================
// UTILITY STYLES
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

  // Shadow
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  // Divider
  divider: {
    height: 1,
    backgroundColor: FamilyColors.border.default,
    marginVertical: 12,
  } as ViewStyle,
});

// ============================================================================
// EXPORT ALL STYLES
// ============================================================================

export default {
  layout: layoutStyles,
  navigation: navigationStyles,
  dashboard: dashboardStyles,
  button: buttonStyles,
  card: cardStyles,
  badge: badgeStyles,
  input: inputStyles,
  modal: modalStyles,
  chat: chatStyles,
  location: locationStyles,
  state: stateStyles,
  list: listStyles,
  utility: utilityStyles,
};
