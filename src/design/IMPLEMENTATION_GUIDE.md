# SilverGuard Design Implementation Guide

Complete guide for developers to implement the SilverGuard design system in React Native.

---

## Quick Start

### 1. Install Dependencies

```bash
cd apps/senior  # or apps/family
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install @react-native-community/geolocation
```

### 2. Import Design System

```typescript
// In your component file
import Colors from '../../../design/colors';
import Typography from '../../../design/typography';
import Spacing from '../../../design/spacing';
import SeniorStyles from '../../../design/senior-app-styles';
// or
import FamilyStyles from '../../../design/family-app-styles';
```

### 3. Use Styles

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SeniorStyles from '../../../design/senior-app-styles';
import { SeniorColors } from '../../../design/colors';

export const MedicationCard = ({ medication }) => {
  return (
    <View style={SeniorStyles.card.medicationCard}>
      <Text style={SeniorStyles.card.medicationName}>
        {medication.name}
      </Text>
      <Text style={SeniorStyles.card.medicationDosage}>
        {medication.dosage}
      </Text>
      <TouchableOpacity style={SeniorStyles.button.primaryButton}>
        <Text style={SeniorStyles.button.primaryButtonText}>
          Mark as Taken
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## Core Concepts

### 1. Design Tokens

Design tokens are the foundation of the design system. They ensure consistency across all components.

**Color Tokens**
```typescript
import { SeniorColors, FamilyColors } from '../design/colors';

// Usage
backgroundColor: SeniorColors.background
color: FamilyColors.primary.purple
borderColor: SeniorColors.border.default
```

**Typography Tokens**
```typescript
import { SeniorTypography, FamilyTypography } from '../design/typography';

// Usage
style={SeniorTypography.heading1}
style={FamilyTypography.bodyRegular}
```

**Spacing Tokens**
```typescript
import { SeniorSpacing, FamilySpacing } from '../design/spacing';

// Usage
padding: SeniorSpacing.cardPadding
marginBottom: FamilySpacing.elementGap
```

### 2. Component Composition

Build complex components by composing simpler ones:

```typescript
// Senior App - Home Screen
import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import SeniorStyles from '../design/senior-app-styles';
import HomeButton from '../components/HomeButton';
import Header from '../components/Header';

export const HomeScreen = () => {
  return (
    <SafeAreaView style={SeniorStyles.layout.screen}>
      <Header
        welcome="Hello, Margaret!"
        date="Tuesday, January 1"
      />
      <View style={SeniorStyles.home.buttonGrid}>
        <View style={SeniorStyles.home.buttonRow}>
          <HomeButton
            icon="💊"
            label="Medications"
            onPress={() => navigate('Medications')}
          />
          <HomeButton
            icon="📅"
            label="Appointments"
            onPress={() => navigate('Appointments')}
          />
        </View>
        <View style={SeniorStyles.home.buttonRow}>
          <HomeButton
            icon="❤️"
            label="Health"
            onPress={() => navigate('Health')}
          />
          <EmergencyButton
            onPress={() => triggerSOS()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
```

### 3. Responsive Design

Use Dimensions API for responsive layouts:

```typescript
import { Dimensions, Platform } from 'react-native';
import { responsiveSpacing } from '../design/spacing';

const { width, height } = Dimensions.get('window');

// Responsive spacing
const horizontalPadding = responsiveSpacing(
  SeniorSpacing.screenHorizontal,
  width
);

// Platform-specific styles
const buttonStyles = StyleSheet.create({
  button: {
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
  },
});
```

---

## Implementation Patterns

### Pattern 1: Screen Layout (Senior App)

```typescript
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import SeniorStyles from '../design/senior-app-styles';
import { SeniorColors } from '../design/colors';

export const MedicationsScreen = () => {
  return (
    <SafeAreaView style={SeniorStyles.layout.screen}>
      {/* Navigation Bar */}
      <View style={SeniorStyles.navigation.navBar}>
        <TouchableOpacity
          style={SeniorStyles.navigation.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={SeniorStyles.navigation.backButtonText}>
            {'<'}
          </Text>
        </TouchableOpacity>
        <Text style={SeniorStyles.navigation.navTitle}>
          Medications
        </Text>
        <View style={{ width: 80 }} /> {/* Spacer for center alignment */}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={SeniorStyles.layout.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={SeniorStyles.list.listHeader}>
          Today's Medications
        </Text>

        {medications.map((med) => (
          <MedicationCard key={med.id} medication={med} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
```

### Pattern 2: Screen Layout (Family App)

```typescript
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import FamilyStyles from '../design/family-app-styles';
import { FamilyColors } from '../design/colors';

export const DashboardScreen = () => {
  return (
    <SafeAreaView style={FamilyStyles.layout.screen}>
      <ScrollView
        contentContainerStyle={FamilyStyles.dashboard.dashboardScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Senior Info Card */}
        <View style={FamilyStyles.dashboard.seniorInfoCard}>
          <View style={FamilyStyles.dashboard.seniorAvatar}>
            <Text style={FamilyStyles.dashboard.seniorAvatarText}>M</Text>
          </View>
          <View style={FamilyStyles.dashboard.seniorInfo}>
            <Text style={FamilyStyles.dashboard.seniorName}>
              Margaret Smith
            </Text>
            <View style={FamilyStyles.dashboard.seniorStatus}>
              <View style={[
                FamilyStyles.dashboard.statusDot,
                FamilyStyles.dashboard.statusOnline
              ]} />
              <Text>Active 5 minutes ago</Text>
            </View>
          </View>
          <TouchableOpacity style={FamilyStyles.dashboard.notificationBell}>
            <Text>🔔</Text>
            <View style={FamilyStyles.dashboard.notificationBadge}>
              <Text style={FamilyStyles.dashboard.notificationBadgeText}>
                3
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SOS Alert (if active) */}
        {sosActive && (
          <View style={FamilyStyles.dashboard.sosAlertBanner}>
            <View style={FamilyStyles.dashboard.sosAlertHeader}>
              <Text style={FamilyStyles.dashboard.sosAlertIcon}>⚠️</Text>
              <Text style={FamilyStyles.dashboard.sosAlertTitle}>
                EMERGENCY ALERT
              </Text>
            </View>
            <View style={FamilyStyles.dashboard.sosAlertContent}>
              <Text style={FamilyStyles.dashboard.sosAlertName}>
                Margaret Smith
              </Text>
              <Text style={FamilyStyles.dashboard.sosAlertLocation}>
                123 Main Street, Springfield
              </Text>
              <Text style={FamilyStyles.dashboard.sosAlertTime}>
                2 minutes ago
              </Text>
            </View>
            <View style={FamilyStyles.dashboard.sosAlertButtons}>
              <TouchableOpacity style={FamilyStyles.button.primaryButton}>
                <Text style={FamilyStyles.button.primaryButtonText}>
                  View Location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={FamilyStyles.button.secondaryButton}>
                <Text style={FamilyStyles.button.secondaryButtonText}>
                  Acknowledge
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={FamilyStyles.dashboard.quickStats}>
          <View style={FamilyStyles.layout.sectionHeader}>
            <Text style={FamilyStyles.layout.sectionTitle}>
              Quick Stats
            </Text>
            <TouchableOpacity>
              <Text style={FamilyStyles.layout.sectionAction}>More →</Text>
            </TouchableOpacity>
          </View>
          <View style={FamilyStyles.dashboard.statsRow}>
            <StatCard label="Meds Today" value="3/4" subtext="Taken" />
            <StatCard label="Next Appt" value="Jan 8" subtext="10:00 AM" />
            <StatCard label="Location" value="Home" subtext="●" />
          </View>
        </View>

        {/* Activity Feed */}
        <View style={FamilyStyles.dashboard.activityFeed}>
          <View style={FamilyStyles.layout.sectionHeader}>
            <Text style={FamilyStyles.layout.sectionTitle}>
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text style={FamilyStyles.layout.sectionAction}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={FamilyStyles.button.fab}>
        <Text style={FamilyStyles.button.fabIcon}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
```

### Pattern 3: Modal Implementation

```typescript
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import SeniorStyles from '../design/senior-app-styles';

export const ConfirmationModal = ({ visible, onConfirm, onCancel, title, message }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={SeniorStyles.modal.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={SeniorStyles.modal.modalContainer}>
              <Text style={SeniorStyles.modal.dialogIcon}>⚠️</Text>
              <Text style={SeniorStyles.modal.dialogTitle}>{title}</Text>
              <Text style={SeniorStyles.modal.dialogMessage}>{message}</Text>
              <View style={SeniorStyles.modal.dialogButtons}>
                <TouchableOpacity
                  style={[
                    SeniorStyles.button.primaryButton,
                    SeniorStyles.button.fullWidthButton,
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={SeniorStyles.button.primaryButtonText}>
                    Yes, Continue
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    SeniorStyles.button.secondaryButton,
                    SeniorStyles.button.fullWidthButton,
                  ]}
                  onPress={onCancel}
                >
                  <Text style={SeniorStyles.button.secondaryButtonText}>
                    No, Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
```

### Pattern 4: Loading States

```typescript
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import SeniorStyles from '../design/senior-app-styles';
import { SeniorColors } from '../design/colors';

export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <View style={SeniorStyles.state.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={SeniorColors.primary.blue}
      />
      <Text style={SeniorStyles.state.loadingText}>{message}</Text>
    </View>
  );
};

export const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <View style={SeniorStyles.state.emptyContainer}>
      <Text style={SeniorStyles.state.emptyIcon}>{icon}</Text>
      <Text style={SeniorStyles.state.emptyTitle}>{title}</Text>
      <Text style={SeniorStyles.state.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={SeniorStyles.button.primaryButton}
          onPress={onAction}
        >
          <Text style={SeniorStyles.button.primaryButtonText}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Pattern 5: Input Forms

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import FamilyStyles from '../design/family-app-styles';
import { FamilyColors } from '../design/colors';

export const MedicationForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [focused, setFocused] = useState(null);

  return (
    <View style={FamilyStyles.layout.screenWithPadding}>
      {/* Name Input */}
      <View style={FamilyStyles.input.inputContainer}>
        <Text style={FamilyStyles.input.inputLabel}>
          Medication Name <Text style={FamilyStyles.input.inputLabelRequired}>*</Text>
        </Text>
        <TextInput
          style={[
            FamilyStyles.input.input,
            focused === 'name' && FamilyStyles.input.inputFocused,
          ]}
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          placeholder="Enter medication name"
          placeholderTextColor={FamilyColors.text.tertiary}
        />
      </View>

      {/* Dosage Input */}
      <View style={FamilyStyles.input.inputContainer}>
        <Text style={FamilyStyles.input.inputLabel}>
          Dosage <Text style={FamilyStyles.input.inputLabelRequired}>*</Text>
        </Text>
        <TextInput
          style={[
            FamilyStyles.input.input,
            focused === 'dosage' && FamilyStyles.input.inputFocused,
          ]}
          value={dosage}
          onChangeText={setDosage}
          onFocus={() => setFocused('dosage')}
          onBlur={() => setFocused(null)}
          placeholder="e.g., 10mg tablet"
          placeholderTextColor={FamilyColors.text.tertiary}
        />
        <Text style={FamilyStyles.input.inputHelper}>
          Include the strength and form (tablet, capsule, etc.)
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          FamilyStyles.button.primaryButton,
          FamilyStyles.button.fullWidthButton,
        ]}
        onPress={onSubmit}
      >
        <Text style={FamilyStyles.button.primaryButtonText}>
          Save Medication
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## Accessibility Implementation

### 1. Screen Reader Support

```typescript
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export const AccessibleButton = ({ onPress, label, hint }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      style={SeniorStyles.button.primaryButton}
    >
      <Text style={SeniorStyles.button.primaryButtonText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Usage
<AccessibleButton
  onPress={handleTakeMedication}
  label="Mark medication as taken"
  hint="Marks your cholesterol medication as taken for today at 2 PM"
/>
```

### 2. Dynamic Text Sizing

```typescript
import { useWindowDimensions, PixelRatio } from 'react-native';

export const useAccessibleFontSize = (baseSize: number) => {
  const { fontScale } = useWindowDimensions();

  // Limit font scaling for Senior app (already extra large)
  const maxScale = 1.3;
  const limitedScale = Math.min(fontScale, maxScale);

  return baseSize * limitedScale;
};

// Usage
const fontSize = useAccessibleFontSize(24); // Senior app base
```

### 3. Haptic Feedback

```typescript
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
// or use react-native-haptic-feedback

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
  if (Platform.OS === 'ios') {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }
};

// Usage - on button press
<TouchableOpacity
  onPress={() => {
    triggerHaptic('medium');
    handleTakeMedication();
  }}
>
  <Text>Mark as Taken</Text>
</TouchableOpacity>
```

---

## Animation Guidelines

### 1. Button Press Animation

```typescript
import { Animated, TouchableWithoutFeedback } from 'react-native';

export const AnimatedButton = ({ onPress, children, style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
```

### 2. Emergency Button Pulsing Animation

```typescript
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const PulsingButton = ({ children, style }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
```

### 3. Success Banner Slide-In

```typescript
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const SuccessBanner = ({ visible, message }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        SeniorStyles.notification.banner,
        SeniorStyles.notification.bannerSuccess,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={SeniorStyles.notification.bannerSuccessIcon}>✅</Text>
      <View style={SeniorStyles.notification.bannerContent}>
        <Text style={SeniorStyles.notification.bannerSuccessTitle}>
          Success!
        </Text>
        <Text style={SeniorStyles.notification.bannerSuccessMessage}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};
```

---

## Performance Optimization

### 1. Optimize FlatList

```typescript
import React, { memo } from 'react';
import { FlatList } from 'react-native';

const MedicationItem = memo(({ item }) => (
  <View style={SeniorStyles.card.medicationCard}>
    <Text style={SeniorStyles.card.medicationName}>{item.name}</Text>
    {/* Rest of component */}
  </View>
));

export const MedicationList = ({ medications }) => {
  return (
    <FlatList
      data={medications}
      renderItem={({ item }) => <MedicationItem item={item} />}
      keyExtractor={(item) => item.id}
      getItemLayout={(data, index) => ({
        length: 200, // Fixed height
        offset: 220 * index, // height + gap
        index,
      })}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={5}
    />
  );
};
```

### 2. Memoization

```typescript
import React, { useMemo, useCallback } from 'react';

export const MedicationScreen = ({ medications }) => {
  const todayMeds = useMemo(() => {
    return medications.filter(med => {
      // Expensive filtering logic
      return isMedicationForToday(med);
    });
  }, [medications]);

  const handleTakeMedication = useCallback((medId) => {
    // Handler logic
  }, []);

  return (
    <View>
      {todayMeds.map(med => (
        <MedicationCard
          key={med.id}
          medication={med}
          onTake={handleTakeMedication}
        />
      ))}
    </View>
  );
};
```

---

## Testing Checklist

### Visual Testing
- [ ] Test on iPhone 13 Mini (small screen)
- [ ] Test on iPhone 13 Pro Max (large screen)
- [ ] Test on Android small device
- [ ] Test on Android large device
- [ ] Test in landscape orientation
- [ ] Test with system font size at minimum
- [ ] Test with system font size at maximum
- [ ] Test with system dark mode (if supported)
- [ ] Test with VoiceOver/TalkBack enabled
- [ ] Test with color blindness simulators

### Interaction Testing
- [ ] All buttons have minimum 44pt (Family) / 80pt (Senior) touch targets
- [ ] All buttons provide visual feedback on press
- [ ] All forms validate input
- [ ] All forms show clear error messages
- [ ] All modals can be dismissed
- [ ] All navigation flows work correctly
- [ ] Pull-to-refresh works on lists
- [ ] Swipe gestures work as expected

### Performance Testing
- [ ] App starts in < 3 seconds
- [ ] Screen transitions are smooth (60 FPS)
- [ ] Lists scroll smoothly with 1000+ items
- [ ] Images load without blocking UI
- [ ] No memory leaks after 30 min use
- [ ] Battery drain is acceptable

### Accessibility Testing
- [ ] All interactive elements have labels
- [ ] Screen reader can navigate entire app
- [ ] Focus order is logical
- [ ] Color contrast meets WCAG standards
- [ ] Haptic feedback works on key actions
- [ ] Voice commands work (Senior app)

---

## Common Pitfalls & Solutions

### Pitfall 1: Inconsistent Spacing
**Problem**: Hard-coded spacing values throughout code
**Solution**: Always use spacing tokens

```typescript
// Bad
<View style={{ marginBottom: 20 }}>

// Good
<View style={{ marginBottom: SeniorSpacing.elementGap }}>
```

### Pitfall 2: Missing Platform-Specific Code
**Problem**: Shadows not showing on Android
**Solution**: Use elevation for Android

```typescript
// Bad
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 4,

// Good
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

### Pitfall 3: Poor Performance on Long Lists
**Problem**: Rendering 500+ items at once
**Solution**: Use FlatList with proper optimization

```typescript
// Bad
{medications.map(med => <MedicationCard med={med} />)}

// Good
<FlatList
  data={medications}
  renderItem={({ item }) => <MedicationCard med={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Pitfall 4: Accessibility Labels Missing
**Problem**: Screen reader says "Button" with no context
**Solution**: Add descriptive labels

```typescript
// Bad
<TouchableOpacity onPress={handlePress}>
  <Text>Take</Text>
</TouchableOpacity>

// Good
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Mark medication as taken"
  accessibilityHint="Marks your cholesterol medication as taken for today"
  accessibilityRole="button"
>
  <Text>Take</Text>
</TouchableOpacity>
```

---

## Resources

### Design Files
- `/design/design-system.md` - Complete design system documentation
- `/design/colors.ts` - Color palette
- `/design/typography.ts` - Typography scale
- `/design/spacing.ts` - Spacing system
- `/design/senior-app-styles.ts` - Senior app styles
- `/design/family-app-styles.ts` - Family app styles
- `/design/screen-mockups.md` - All screen mockups

### External Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

### Tools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

---

## Getting Help

For design-related questions:
1. Check the design system documentation first
2. Review screen mockups for reference
3. Look at similar implemented components
4. Ask in team chat with specific questions

Common questions:
- "What color should I use?" → Check colors.ts
- "What font size?" → Check typography.ts
- "What spacing?" → Check spacing.ts
- "What does this screen look like?" → Check screen-mockups.md

---

**Version**: 1.0
**Last Updated**: January 1, 2026
**Maintainer**: SilverGuard Design Team
