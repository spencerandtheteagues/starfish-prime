/**
 * AccessibleButton - Senior-friendly button with WCAG AAA compliance
 *
 * Features:
 * - 60pt minimum touch target
 * - High contrast colors
 * - Haptic feedback
 * - Screen reader support
 * - Visual press feedback
 */

import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorColors } from '../../design/colors';
import {
  TouchTargets,
  HapticFeedback,
  createAccessibilityProps,
  scaledFontSize,
} from '../../design/accessibility';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large' | 'extraLarge';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  fontScale?: number;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  fontScale = 1.0,
  accessibilityHint,
  testID,
  style,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Get colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: SeniorColors.primary.blue,
          text: SeniorColors.text.inverse,
          pressedBackground: SeniorColors.primary.blueDark,
        };
      case 'secondary':
        return {
          background: SeniorColors.gray[200],
          text: SeniorColors.text.primary,
          pressedBackground: SeniorColors.gray[300],
        };
      case 'danger':
        return {
          background: SeniorColors.error.primary,
          text: SeniorColors.text.inverse,
          pressedBackground: '#7F1D1D',
        };
      case 'success':
        return {
          background: SeniorColors.success.primary,
          text: SeniorColors.text.inverse,
          pressedBackground: '#047857',
        };
      default:
        return {
          background: SeniorColors.primary.blue,
          text: SeniorColors.text.inverse,
          pressedBackground: SeniorColors.primary.blueDark,
        };
    }
  };

  // Get dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: TouchTargets.small,
          paddingHorizontal: 16,
          fontSize: scaledFontSize(18, fontScale),
          iconSize: 24,
        };
      case 'medium':
        return {
          height: TouchTargets.medium,
          paddingHorizontal: 24,
          fontSize: scaledFontSize(20, fontScale),
          iconSize: 28,
        };
      case 'large':
        return {
          height: TouchTargets.large,
          paddingHorizontal: 32,
          fontSize: scaledFontSize(24, fontScale),
          iconSize: 32,
        };
      case 'extraLarge':
        return {
          height: TouchTargets.extraLarge,
          paddingHorizontal: 40,
          fontSize: scaledFontSize(28, fontScale),
          iconSize: 40,
        };
      default:
        return {
          height: TouchTargets.medium,
          paddingHorizontal: 24,
          fontSize: scaledFontSize(20, fontScale),
          iconSize: 28,
        };
    }
  };

  const colors = getColors();
  const dimensions = getDimensions();

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    HapticFeedback.light();
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      HapticFeedback.medium();
      onPress();
    }
  }, [disabled, loading, onPress]);

  const accessibilityProps = createAccessibilityProps(title, 'button', {
    hint: accessibilityHint,
    disabled: disabled || loading,
    busy: loading,
  });

  const containerStyle: ViewStyle = {
    ...styles.container,
    height: dimensions.height,
    paddingHorizontal: dimensions.paddingHorizontal,
    backgroundColor: isPressed ? colors.pressedBackground : colors.background,
    opacity: disabled ? 0.5 : 1,
    flexDirection: iconPosition === 'top' ? 'column' : 'row',
    width: fullWidth ? '100%' : 'auto',
    ...(style as ViewStyle),
  };

  const iconElement = icon && !loading && (
    <Icon
      name={icon}
      size={dimensions.iconSize}
      color={colors.text}
      style={iconPosition === 'right' ? styles.iconRight : iconPosition === 'top' ? styles.iconTop : styles.iconLeft}
    />
  );

  return (
    <TouchableOpacity
      {...accessibilityProps}
      style={containerStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          {iconPosition === 'top' && iconElement}
          <Text
            style={[
              styles.text,
              {
                fontSize: dimensions.fontSize,
                color: colors.text,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  iconTop: {
    marginBottom: 8,
  },
});

export default AccessibleButton;
