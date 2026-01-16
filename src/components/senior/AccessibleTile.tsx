/**
 * AccessibleTile - Senior-friendly navigation tile with WCAG AAA compliance
 *
 * Features:
 * - Large touch target (160pt height)
 * - High contrast colors
 * - Haptic feedback
 * - Screen reader support
 * - Badge support for notifications
 */

import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorColors } from '../../design/colors';
import {
  TouchTargets,
  HapticFeedback,
  createAccessibilityProps,
  scaledFontSize,
} from '../../design/accessibility';

interface AccessibleTileProps {
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
  fontScale?: number;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
}

const AccessibleTile: React.FC<AccessibleTileProps> = ({
  title,
  icon,
  color,
  backgroundColor,
  onPress,
  badge,
  disabled = false,
  fontScale = 1.2,
  accessibilityHint,
  testID,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    HapticFeedback.light();
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled) {
      HapticFeedback.medium();
      onPress();
    }
  }, [disabled, onPress]);

  // Create accessibility label with badge info
  const accessibilityLabel = badge
    ? `${title}. ${badge} new notification${badge > 1 ? 's' : ''}.`
    : title;

  const accessibilityProps = createAccessibilityProps(accessibilityLabel, 'button', {
    hint: accessibilityHint || `Opens ${title} screen`,
    disabled,
  });

  return (
    <TouchableOpacity
      {...accessibilityProps}
      style={[
        styles.tile,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      testID={testID}
    >
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        </View>
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={color} />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color,
            fontSize: scaledFontSize(28, fontScale),
          },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {title}
      </Text>

      {/* Press indicator */}
      {isPressed && <View style={[styles.pressIndicator, { borderColor: color }]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    height: TouchTargets.tile,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  badge: {
    backgroundColor: SeniorColors.error.primary,
    borderRadius: 16,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 4,
    opacity: 0.5,
  },
});

export default AccessibleTile;
