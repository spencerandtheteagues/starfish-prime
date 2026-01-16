/**
 * Edit Medication Screen
 * Modify existing medication schedule
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CaregiverStackParamList, Medication } from '../../../types';
import { medicationDoc } from '../../../services/firebase';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FamilyColors } from '../../../design/colors';

type EditMedicationScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'EditMedication'>;
  route: RouteProp<CaregiverStackParamList, 'EditMedication'>;
};

const EditMedicationScreen: React.FC<EditMedicationScreenProps> = ({ navigation, route }) => {
  const { medicationId } = route.params;
  const [medication, setMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requiresFood, setRequiresFood] = useState(false);
  const [times, setTimes] = useState<Date[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = medicationDoc(medicationId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          const med: Medication = {
            id: doc.id,
            seniorId: data?.seniorId || '',
            name: data?.name || '',
            dosage: data?.dosage || '',
            schedule: data?.schedule || { frequency: 'daily', times: [] },
            instructions: data?.instructions,
            requiresFood: data?.requiresFood,
            isActive: data?.isActive ?? true,
            createdAt: data?.createdAt?.toDate?.() || new Date(),
            updatedAt: data?.updatedAt?.toDate?.() || new Date(),
          };
          setMedication(med);
          setName(med.name);
          setDosage(med.dosage);
          setInstructions(med.instructions || '');
          setRequiresFood(med.requiresFood || false);

          // Convert schedule times to Date objects
          const scheduleTimes = (med.schedule?.times || []).map((t) => {
            const date = new Date(0, 0, 0, t.hour, t.minute);
            return date;
          });
          setTimes(scheduleTimes.length > 0 ? scheduleTimes : [new Date(0, 0, 0, 8, 0)]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading medication:', error);
        Alert.alert('Error', 'Could not load medication');
        navigation.goBack();
      }
    );

    return () => unsubscribe();
  }, [medicationId]);

  const handleAddTime = () => {
    setTimes([...times, new Date(0, 0, 0, 12, 0)]);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length === 1) {
      Alert.alert('Cannot Remove', 'Medication must have at least one scheduled time');
      return;
    }
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && editingTimeIndex !== null) {
      const newTimes = [...times];
      newTimes[editingTimeIndex] = selectedTime;
      setTimes(newTimes);
    }
    setEditingTimeIndex(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter medication name');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Missing Information', 'Please enter dosage');
      return;
    }

    setSaving(true);

    try {
      await medicationDoc(medicationId).update({
        name: name.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim() || null,
        requiresFood,
        schedule: {
          frequency: 'daily',
          times: times.map((t) => ({
            hour: t.getHours(),
            minute: t.getMinutes(),
          })),
        },
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Medication updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Could not update medication. Please try again.');
      setSaving(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Medication</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication Details</Text>

          <Input
            label="Medication Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Aspirin"
            leftIcon="pill"
          />

          <Input
            label="Dosage"
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 81mg"
            leftIcon="alpha-d-circle-outline"
          />

          <Input
            label="Instructions (Optional)"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g., Take with water"
            multiline
            numberOfLines={3}
            leftIcon="text"
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Requires Food</Text>
              <Text style={styles.switchSubtext}>Take with or after meals</Text>
            </View>
            <Switch
              value={requiresFood}
              onValueChange={setRequiresFood}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
              <Icon name="plus" size={20} color={FamilyColors.primary.purple} />
              <Text style={styles.addTimeText}>Add Time</Text>
            </TouchableOpacity>
          </View>

          {times.map((time, index) => (
            <View key={index} style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setEditingTimeIndex(index);
                  setShowTimePicker(true);
                }}
              >
                <Icon name="clock-outline" size={24} color={FamilyColors.gray[700]} />
                <Text style={styles.timeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
              {times.length > 1 && (
                <TouchableOpacity
                  style={styles.removeTimeButton}
                  onPress={() => handleRemoveTime(index)}
                >
                  <Icon name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          disabled={saving}
          loading={saving}
        />
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && editingTimeIndex !== null && (
        <DateTimePicker
          value={times[editingTimeIndex]}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FamilyColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
  },
  switchSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: FamilyColors.gray[600],
    marginTop: 2,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
    marginLeft: 12,
  },
  removeTimeButton: {
    marginLeft: 12,
    padding: 8,
  },
});

export default EditMedicationScreen;
