/**
 * Reusable Input Component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { inputStyles } from '../../design/family-app-styles';
import { FamilyColors } from '../../design/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  required = false,
  containerStyle,
  inputStyle,
  leftIcon,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[inputStyles.inputContainer, containerStyle]}>
      {label && (
        <Text style={inputStyles.inputLabel}>
          {label}
          {required && <Text style={inputStyles.inputLabelRequired}> *</Text>}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={FamilyColors.text.tertiary}
            style={{ position: 'absolute', left: 12, zIndex: 1 }}
          />
        )}
        <TextInput
          style={[
            inputStyles.input,
            isFocused ? inputStyles.inputFocused : undefined,
            error ? inputStyles.inputError : undefined,
            leftIcon ? { paddingLeft: 40 } : undefined,
            inputStyle,
          ]}
          placeholderTextColor={FamilyColors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
      </View>
      {error && <Text style={inputStyles.inputErrorText}>{error}</Text>}
      {helper && !error && <Text style={inputStyles.inputHelper}>{helper}</Text>}
    </View>
  );
};

export default Input;
