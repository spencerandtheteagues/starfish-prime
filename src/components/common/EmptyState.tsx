/**
 * Empty State Component
 */

import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stateStyles } from '../../../design/family-app-styles';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={stateStyles.emptyContainer}>
      <Icon name={icon} style={stateStyles.emptyIcon} />
      <Text style={stateStyles.emptyTitle}>{title}</Text>
      {message && <Text style={stateStyles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </View>
  );
};

export default EmptyState;
