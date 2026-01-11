/**
 * Reusable Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { buttonStyles } from '../../design/family-app-styles';
import { FamilyColors } from '../../design/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = (() => {
      switch (variant) {
        case 'secondary':
          return buttonStyles.secondaryButton;
        case 'danger':
          return buttonStyles.dangerButton;
        case 'text':
          return buttonStyles.textButton;
        default:
          return buttonStyles.primaryButton;
      }
    })();

    return {
      ...baseStyle,
      ...(fullWidth && buttonStyles.fullWidthButton),
      ...(disabled && buttonStyles.primaryButtonDisabled),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = (() => {
      switch (variant) {
        case 'secondary':
          return buttonStyles.secondaryButtonText;
        case 'danger':
          return buttonStyles.dangerButtonText;
        case 'text':
          return buttonStyles.textButtonText;
        default:
          return buttonStyles.primaryButtonText;
      }
    })();

    return {
      ...baseStyle,
      ...(disabled && buttonStyles.primaryButtonTextDisabled),
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? FamilyColors.primary.purple : FamilyColors.text.inverse}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
