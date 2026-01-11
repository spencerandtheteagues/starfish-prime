/**
 * Loading Spinner Component
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { stateStyles } from '../../design/family-app-styles';
import { FamilyColors } from '../../design/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large'
}) => {
  return (
    <View style={stateStyles.loadingContainer}>
      <ActivityIndicator size={size} color={FamilyColors.primary.purple} />
      {message && <Text style={stateStyles.loadingText}>{message}</Text>}
    </View>
  );
};

export default LoadingSpinner;
