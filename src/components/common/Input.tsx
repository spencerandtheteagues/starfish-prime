/**
 * Reusable Input Component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { inputStyles } from '../../design/family-app-styles';
import { FamilyColors } from '../../design/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  required = false,
  containerStyle,
  inputStyle,
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
      <TextInput
        style={[
          inputStyles.input,
          isFocused && inputStyles.inputFocused,
          error && inputStyles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={FamilyColors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...textInputProps}
      />
      {error && <Text style={inputStyles.inputErrorText}>{error}</Text>}
      {helper && !error && <Text style={inputStyles.inputHelper}>{helper}</Text>}
    </View>
  );
};

export default Input;
