/**
 * Add Appointment Screen
 * Create new appointment
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { appointmentsCollection, serverTimestamp } from '../../../services/firebase';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FamilyColors } from '../../../design/colors';
import { formatTime, formatDate } from '../../../utils/date';

type AddAppointmentScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'AddAppointment'>;
};

const AddAppointmentScreen: React.FC<AddAppointmentScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDateTime = new Date(dateTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setDateTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter appointment title');
      return;
    }

    if (!user?.activeSeniorId) {
      Alert.alert('Error', 'No senior profile selected');
      return;
    }

    setLoading(true);

    try {
      await appointmentsCollection().add({
        seniorId: user.activeSeniorId,
        title: title.trim(),
        location: location.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        dateTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Appointment added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding appointment:', error);
      Alert.alert('Error', 'Could not add appointment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>

          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Doctor's Appointment"
            leftIcon="calendar-text"
          />

          <Input
            label="Location (Optional)"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Medical Center"
            leftIcon="map-marker"
          />

          <Input
            label="Phone Number (Optional)"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g., (555) 123-4567"
            keyboardType="phone-pad"
            leftIcon="phone"
          />

          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information"
            multiline
            numberOfLines={3}
            leftIcon="text"
          />
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.dateTimeText}>{formatDate(dateTime)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock-outline" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.dateTimeText}>{formatTime(dateTime)}</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <Button
          title="Add Appointment"
          onPress={handleSave}
          disabled={loading}
          loading={loading}
        />
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    marginBottom: 12,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
    marginLeft: 12,
  },
});

export default AddAppointmentScreen;
