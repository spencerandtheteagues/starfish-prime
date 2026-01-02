# SilverGuard Design System - Quick Reference

Fast lookup guide for common design values and patterns.

---

## Color Quick Reference

### Senior App Colors
```typescript
import { SeniorColors } from './colors';

// Most commonly used
SeniorColors.background          // #FFFFFF (white)
SeniorColors.primary.blue        // #1E3A8A (dark blue)
SeniorColors.text.primary        // #111827 (near black)
SeniorColors.text.secondary      // #374151 (dark gray)
SeniorColors.border.default      // #D1D5DB (gray)

// Status colors
SeniorColors.success.primary     // #065F46 (dark green)
SeniorColors.warning.primary     // #92400E (dark orange)
SeniorColors.error.primary       // #991B1B (dark red)
SeniorColors.sos.primary         // #DC2626 (bright red)
```

### Family App Colors
```typescript
import { FamilyColors } from './colors';

// Most commonly used
FamilyColors.background          // #F9FAFB (light gray)
FamilyColors.surface             // #FFFFFF (white)
FamilyColors.primary.purple      // #7C3AED (purple)
FamilyColors.text.primary        // #111827 (near black)
FamilyColors.text.secondary      // #6B7280 (medium gray)
FamilyColors.border.default      // #E5E7EB (light gray)

// Status colors
FamilyColors.success.primary     // #10B981 (green)
FamilyColors.warning.primary     // #F59E0B (amber)
FamilyColors.error.primary       // #EF4444 (red)
FamilyColors.sos.primary         // #DC2626 (bright red)
```

---

## Typography Quick Reference

### Senior App Typography
```typescript
import { SeniorTypography } from './typography';

// Most commonly used
SeniorTypography.displayLarge    // 48pt Bold
SeniorTypography.displayMedium   // 40pt Bold
SeniorTypography.heading1        // 32pt Bold
SeniorTypography.heading2        // 28pt Semibold
SeniorTypography.bodyMedium      // 24pt Regular (MINIMUM)
SeniorTypography.bodyLarge       // 26pt Regular
SeniorTypography.button          // 28pt Bold
```

### Family App Typography
```typescript
import { FamilyTypography } from './typography';

// Most commonly used
SeniorTypography.displayLarge    // 32pt Bold
FamilyTypography.heading1        // 24pt Bold
FamilyTypography.heading2        // 20pt Semibold
FamilyTypography.heading3        // 18pt Semibold
FamilyTypography.bodyRegular     // 16pt Regular (BASE)
FamilyTypography.bodySmall       // 14pt Regular
FamilyTypography.button          // 16pt Semibold
FamilyTypography.caption         // 12pt Regular
```

---

## Spacing Quick Reference

### Senior App Spacing
```typescript
import { SeniorSpacing } from './spacing';

// Most commonly used
SeniorSpacing.screenHorizontal   // 24pt
SeniorSpacing.screenVertical     // 24pt
SeniorSpacing.cardPadding        // 24pt
SeniorSpacing.elementGap         // 24pt
SeniorSpacing.sectionGap         // 32pt
SeniorSpacing.buttonGap          // 16pt
SeniorSpacing.listItemGap        // 20pt
```

### Family App Spacing
```typescript
import { FamilySpacing } from './spacing';

// Most commonly used
FamilySpacing.screenHorizontal   // 16pt
FamilySpacing.screenVertical     // 16pt
FamilySpacing.cardPadding        // 16pt
FamilySpacing.elementGap         // 16pt
FamilySpacing.sectionGap         // 24pt
FamilySpacing.listItemGap        // 12pt
FamilySpacing.tabBarHeight       // 64pt
```

---

## Common Patterns

### Senior App Button
```typescript
<TouchableOpacity style={SeniorStyles.button.primaryButton}>
  <Text style={SeniorStyles.button.primaryButtonText}>
    Take Medication
  </Text>
</TouchableOpacity>
```

### Family App Button
```typescript
<TouchableOpacity style={FamilyStyles.button.primaryButton}>
  <Text style={FamilyStyles.button.primaryButtonText}>
    Save
  </Text>
</TouchableOpacity>
```

### Senior App Card
```typescript
<View style={SeniorStyles.card.medicationCard}>
  <Text style={SeniorStyles.card.medicationName}>
    Blood Pressure Medication
  </Text>
  <Text style={SeniorStyles.card.medicationDosage}>
    10mg tablet
  </Text>
</View>
```

### Family App Card
```typescript
<View style={FamilyStyles.card.card}>
  <Text style={FamilyStyles.card.cardTitle}>
    Medication Name
  </Text>
  <Text style={FamilyStyles.card.cardSubtitle}>
    Details here
  </Text>
</View>
```

### Input Field (Senior)
```typescript
<View style={SeniorStyles.input.inputContainer}>
  <Text style={SeniorStyles.input.inputLabel}>
    Email
  </Text>
  <TextInput
    style={SeniorStyles.input.input}
    value={email}
    onChangeText={setEmail}
  />
</View>
```

### Input Field (Family)
```typescript
<View style={FamilyStyles.input.inputContainer}>
  <Text style={FamilyStyles.input.inputLabel}>
    Medication Name
  </Text>
  <TextInput
    style={FamilyStyles.input.input}
    value={name}
    onChangeText={setName}
  />
</View>
```

---

## Size Standards

### Senior App
- **Minimum text**: 24pt
- **Minimum touch target**: 80pt
- **Primary button height**: 90pt
- **Emergency button height**: 120pt
- **Nav bar height**: 80pt
- **Card padding**: 24pt
- **Screen padding**: 24pt

### Family App
- **Base text**: 16pt
- **Minimum touch target**: 44pt
- **Primary button height**: 48pt
- **Nav bar height**: 56pt
- **Tab bar height**: 64pt
- **Card padding**: 16pt
- **Screen padding**: 16pt

---

## Contrast Ratios

### Senior App (WCAG AAA)
- Primary text on white: 9.42:1
- Success text: 8.35:1
- Warning text: 7.82:1
- Error text: 8.59:1
- Info text: 9.12:1
- **All ratios exceed 7:1 minimum**

### Family App (WCAG AA)
- Primary text on white: 9.42:1
- Secondary text: 4.9:1
- All meet 4.5:1 minimum

---

## Border Radius

### Senior App
```typescript
BorderRadius.senior.sm    // 12pt
BorderRadius.senior.md    // 16pt
BorderRadius.senior.lg    // 24pt
BorderRadius.senior.xl    // 32pt
BorderRadius.senior.pill  // 999pt
```

### Family App
```typescript
BorderRadius.family.sm    // 8pt
BorderRadius.family.md    // 12pt
BorderRadius.family.lg    // 16pt
BorderRadius.family.xl    // 20pt
BorderRadius.family.pill  // 999pt
```

---

## Screen Templates

### Senior App Screen Template
```typescript
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import SeniorStyles from '../design/senior-app-styles';

export const ExampleScreen = () => {
  return (
    <SafeAreaView style={SeniorStyles.layout.screen}>
      <ScrollView
        contentContainerStyle={SeniorStyles.layout.scrollContainer}
      >
        {/* Content here */}
      </ScrollView>
    </SafeAreaView>
  );
};
```

### Family App Screen Template
```typescript
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import FamilyStyles from '../design/family-app-styles';

export const ExampleScreen = () => {
  return (
    <SafeAreaView style={FamilyStyles.layout.screen}>
      <ScrollView
        contentContainerStyle={FamilyStyles.layout.scrollContainer}
      >
        {/* Content here */}
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

## Status Badges

### Senior App
```typescript
// Pending (Orange)
<View style={[
  SeniorStyles.badge.badge,
  SeniorStyles.badge.badgePending
]}>
  <Text style={SeniorStyles.badge.badgePendingText}>
    PENDING
  </Text>
</View>

// Taken (Green)
<View style={[
  SeniorStyles.badge.badge,
  SeniorStyles.badge.badgeTaken
]}>
  <Text style={SeniorStyles.badge.badgeTakenText}>
    TAKEN
  </Text>
</View>

// Missed (Red)
<View style={[
  SeniorStyles.badge.badge,
  SeniorStyles.badge.badgeMissed
]}>
  <Text style={SeniorStyles.badge.badgeMissedText}>
    MISSED
  </Text>
</View>
```

### Family App
```typescript
// Same pattern as Senior app but with FamilyStyles
<View style={[
  FamilyStyles.badge.badge,
  FamilyStyles.badge.badgeTaken
]}>
  <Text style={FamilyStyles.badge.badgeTakenText}>
    TAKEN
  </Text>
</View>
```

---

## Modal Template

### Senior App Modal
```typescript
<Modal visible={visible} transparent={true} animationType="fade">
  <View style={SeniorStyles.modal.modalOverlay}>
    <View style={SeniorStyles.modal.modalContainer}>
      <Text style={SeniorStyles.modal.dialogIcon}>⚠️</Text>
      <Text style={SeniorStyles.modal.dialogTitle}>
        Are you sure?
      </Text>
      <Text style={SeniorStyles.modal.dialogMessage}>
        This action cannot be undone.
      </Text>
      <View style={SeniorStyles.modal.dialogButtons}>
        <TouchableOpacity
          style={[
            SeniorStyles.button.primaryButton,
            SeniorStyles.button.fullWidthButton
          ]}
        >
          <Text style={SeniorStyles.button.primaryButtonText}>
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            SeniorStyles.button.secondaryButton,
            SeniorStyles.button.fullWidthButton
          ]}
        >
          <Text style={SeniorStyles.button.secondaryButtonText}>
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### Family App Modal
```typescript
<Modal visible={visible} transparent={true} animationType="fade">
  <View style={FamilyStyles.modal.modalOverlay}>
    <View style={FamilyStyles.modal.modalContainer}>
      <Text style={FamilyStyles.modal.modalTitle}>
        Confirm Action
      </Text>
      <Text style={FamilyStyles.modal.modalMessage}>
        Are you sure you want to proceed?
      </Text>
      <View style={FamilyStyles.modal.modalButtons}>
        <TouchableOpacity style={FamilyStyles.button.textButton}>
          <Text style={FamilyStyles.button.textButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={FamilyStyles.button.primaryButton}>
          <Text style={FamilyStyles.button.primaryButtonText}>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

---

## Loading States

### Senior App
```typescript
<View style={SeniorStyles.state.loadingContainer}>
  <ActivityIndicator
    size="large"
    color={SeniorColors.primary.blue}
  />
  <Text style={SeniorStyles.state.loadingText}>
    Loading...
  </Text>
</View>
```

### Family App
```typescript
<View style={FamilyStyles.state.loadingContainer}>
  <ActivityIndicator
    size="large"
    color={FamilyColors.primary.purple}
  />
  <Text style={FamilyStyles.state.loadingText}>
    Loading...
  </Text>
</View>
```

---

## Empty States

### Senior App
```typescript
<View style={SeniorStyles.state.emptyContainer}>
  <Text style={SeniorStyles.state.emptyIcon}>💊</Text>
  <Text style={SeniorStyles.state.emptyTitle}>
    No medications yet
  </Text>
  <Text style={SeniorStyles.state.emptyMessage}>
    Your medications will appear here
  </Text>
</View>
```

### Family App
```typescript
<View style={FamilyStyles.state.emptyContainer}>
  <Text style={FamilyStyles.state.emptyIcon}>💊</Text>
  <Text style={FamilyStyles.state.emptyTitle}>
    No medications
  </Text>
  <Text style={FamilyStyles.state.emptyMessage}>
    Add medications to get started
  </Text>
  <TouchableOpacity style={FamilyStyles.button.primaryButton}>
    <Text style={FamilyStyles.button.primaryButtonText}>
      Add Medication
    </Text>
  </TouchableOpacity>
</View>
```

---

## Accessibility Props

### Essential Props
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Mark medication as taken"
  accessibilityHint="Marks your cholesterol medication as taken for today"
>
  <Text>Take</Text>
</TouchableOpacity>
```

### Text Accessibility
```typescript
<Text
  accessible={true}
  accessibilityRole="header"
>
  Medications
</Text>
```

---

## Platform-Specific Styles

### Shadow (iOS) / Elevation (Android)
```typescript
...Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  android: {
    elevation: 2,
  },
}),
```

---

## Common Mistakes to Avoid

1. Don't hard-code colors: Use `SeniorColors.primary.blue`
2. Don't hard-code spacing: Use `SeniorSpacing.elementGap`
3. Don't hard-code fonts: Use `SeniorTypography.heading1`
4. Don't skip accessibility props
5. Don't use text smaller than 24pt in Senior app
6. Don't use touch targets smaller than 80pt in Senior app
7. Don't forget platform-specific styles (shadows/elevation)

---

## File Imports Cheat Sheet

```typescript
// Colors
import { SeniorColors, FamilyColors } from '../design/colors';

// Typography
import { SeniorTypography, FamilyTypography } from '../design/typography';

// Spacing
import { SeniorSpacing, FamilySpacing } from '../design/spacing';

// Styles
import SeniorStyles from '../design/senior-app-styles';
import FamilyStyles from '../design/family-app-styles';

// All together
import { SeniorColors } from '../design/colors';
import { SeniorTypography } from '../design/typography';
import { SeniorSpacing } from '../design/spacing';
import SeniorStyles from '../design/senior-app-styles';
```

---

## Testing Checklist

### Visual
- [ ] Test on small phone (iPhone 13 Mini)
- [ ] Test on large phone (iPhone 13 Pro Max)
- [ ] Test in landscape orientation
- [ ] Test with max system font size
- [ ] Test with min system font size

### Accessibility
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Test contrast ratios
- [ ] Test touch target sizes
- [ ] Test with color-blind simulator

### Interaction
- [ ] All buttons provide visual feedback
- [ ] All inputs show focus state
- [ ] All modals can be dismissed
- [ ] Pull-to-refresh works
- [ ] Navigation flows correctly

---

**Quick Reference Version**: 1.0
**Last Updated**: January 1, 2026
**For**: SilverGuard Phase 1 Implementation
