/**
 * Add Health Log Modal
 * Modal for adding health measurements
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FamilyColors } from '../../design/colors';
import Input from '../common/Input';
import Button from '../common/Button';
import { HealthLogType, createHealthLog } from '../../services/healthLogs';

interface AddHealthLogModalProps {
  visible: boolean;
  type: HealthLogType;
  seniorId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const healthLogConfig: Record<HealthLogType, {
  title: string;
  unit: string;
  placeholder: string;
  icon: string;
  color: string;
  requiresTwoInputs?: boolean;
}> = {
  blood_pressure: {
    title: 'Blood Pressure',
    unit: 'mmHg',
    placeholder: '120',
    icon: 'heart-pulse',
    color: '#DC2626',
    requiresTwoInputs: true,
  },
  weight: {
    title: 'Weight',
    unit: 'lbs',
    placeholder: '150',
    icon: 'weight',
    color: '#7C3AED',
  },
  heart_rate: {
    title: 'Heart Rate',
    unit: 'bpm',
    placeholder: '72',
    icon: 'heart',
    color: '#EF4444',
  },
  glucose: {
    title: 'Blood Glucose',
    unit: 'mg/dL',
    placeholder: '100',
    icon: 'water',
    color: '#F59E0B',
  },
  temperature: {
    title: 'Temperature',
    unit: '°F',
    placeholder: '98.6',
    icon: 'thermometer',
    color: '#EF4444',
  },
  oxygen: {
    title: 'Blood Oxygen',
    unit: '%',
    placeholder: '98',
    icon: 'lungs',
    color: '#3B82F6',
  },
};

const AddHealthLogModal: React.FC<AddHealthLogModalProps> = ({
  visible,
  type,
  seniorId,
  onClose,
  onSuccess,
}) => {
  const config = healthLogConfig[type];

  // For blood pressure
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  // For other measurements
  const [value, setValue] = useState('');

  // Common fields
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setSystolic('');
    setDiastolic('');
    setValue('');
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSave = async () => {
    try {
      // Validation
      if (type === 'blood_pressure') {
        if (!systolic.trim() || !diastolic.trim()) {
          Alert.alert('Missing Values', 'Please enter both systolic and diastolic values');
          return;
        }
        const sys = parseInt(systolic, 10);
        const dia = parseInt(diastolic, 10);
        if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
          Alert.alert('Invalid Values', 'Please enter valid numbers');
          return;
        }
        if (sys <= dia) {
          Alert.alert('Invalid Values', 'Systolic should be greater than diastolic');
          return;
        }
      } else {
        if (!value.trim()) {
          Alert.alert('Missing Value', 'Please enter a value');
          return;
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          Alert.alert('Invalid Value', 'Please enter a valid number');
          return;
        }
      }

      setLoading(true);

      // Prepare log data
      const logValue = type === 'blood_pressure'
        ? `${systolic}/${diastolic}`
        : parseFloat(value);

      await createHealthLog({
        seniorId,
        type,
        value: logValue,
        unit: config.unit,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Health log added successfully');
      handleReset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving health log:', error);
      Alert.alert('Error', 'Could not save health log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={FamilyColors.gray[900]} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
              <Icon name={config.icon} size={32} color={config.color} />
            </View>
            <Text style={styles.title}>{config.title}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {type === 'blood_pressure' ? (
            <>
              <Input
                label="Systolic (Top Number)"
                placeholder={config.placeholder}
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                required
              />
              <Input
                label="Diastolic (Bottom Number)"
                placeholder="80"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                required
                containerStyle={{ marginTop: 16 }}
              />
            </>
          ) : (
            <Input
              label={`${config.title} (${config.unit})`}
              placeholder={config.placeholder}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              required
            />
          )}

          <Input
            label="Notes (Optional)"
            placeholder="Add any notes about this reading..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            containerStyle={{ marginTop: 16 }}
            inputStyle={{ height: 100, textAlignVertical: 'top' }}
          />

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="information" size={20} color={FamilyColors.primary.purple} />
            <Text style={styles.infoText}>
              The measurement will be recorded with the current date and time.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="secondary"
            fullWidth
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Save"
            onPress={handleSave}
            variant="primary"
            fullWidth
            loading={loading}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FamilyColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.primary.purple + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[700],
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
});

export default AddHealthLogModal;
