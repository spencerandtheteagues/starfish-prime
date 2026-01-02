# SilverGuard Component Styles

This directory contains React Native StyleSheet definitions for reusable components used across both Senior and Family apps.

## Component Files

### Common Components (Both Apps)
- `button-components.ts` - All button variants with props
- `card-components.ts` - Card layouts and variants
- `input-components.ts` - Form inputs and controls
- `badge-components.ts` - Status badges and pills
- `modal-components.ts` - Modals, dialogs, bottom sheets

### Senior App Specific
- `senior-medication-components.ts` - Medication-related components
- `senior-appointment-components.ts` - Appointment components
- `senior-health-components.ts` - Health tracking components

### Family App Specific
- `family-dashboard-components.ts` - Dashboard-specific components
- `family-activity-components.ts` - Activity feed components
- `family-chart-components.ts` - Health data visualization

## Usage Example

```typescript
import { SeniorButtonStyles } from './components/button-components';
import { StyleSheet } from 'react-native';

// Use pre-defined styles
<TouchableOpacity style={SeniorButtonStyles.primaryButton}>
  <Text style={SeniorButtonStyles.primaryButtonText}>
    Take Medication
  </Text>
</TouchableOpacity>

// Combine with custom styles
const styles = StyleSheet.create({
  customButton: {
    ...SeniorButtonStyles.primaryButton,
    marginTop: 24,
  },
});
```

## Component Structure

Each component file exports:
1. **Base styles** - Default styling
2. **Variant styles** - Different states (active, disabled, etc.)
3. **Props interface** - TypeScript types for component props
4. **Usage examples** - Code snippets showing implementation

## Design Tokens

All component styles reference the core design tokens:
- Colors from `../colors.ts`
- Typography from `../typography.ts`
- Spacing from `../spacing.ts`

## Best Practices

1. **Always use StyleSheet.create()** for performance
2. **Reference design tokens** instead of hard-coding values
3. **Include accessibility props** (accessibilityLabel, accessibilityHint)
4. **Provide multiple variants** (size, color, state)
5. **Document component props** with TypeScript interfaces
6. **Include usage examples** in component file comments

## Testing

Test all components on:
- Multiple screen sizes (small, medium, large phones)
- Both iOS and Android
- Light and dark modes (if supported)
- Accessibility features enabled (VoiceOver, TalkBack)
- Different font size settings

## Maintenance

When updating components:
1. Update the component file
2. Update usage examples
3. Test on real devices
4. Document breaking changes
5. Version bump if needed
