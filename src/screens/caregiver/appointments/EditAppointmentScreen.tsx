/**
 * Edit Appointment Screen
 * Modify existing appointment
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CaregiverStackParamList, Appointment } from '../../../types';
import { appointmentDoc } from '../../../services/firebase';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FamilyColors } from '../../../design/colors';
import { formatTime, formatDate } from '../../../utils/date';

type EditAppointmentScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'EditAppointment'>;
  route: RouteProp<CaregiverStackParamList, 'EditAppointment'>;
};

const EditAppointmentScreen: React.FC<EditAppointmentScreenProps> = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = appointmentDoc(appointmentId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          const dateTimeValue = data?.dateTime?.toDate?.() || new Date();
          const appt: Appointment = {
            id: doc.id,
            seniorId: data?.seniorId || '',
            doctorName: data?.doctorName || '',
            title: data?.title || '',
            location: data?.location || '',
            phone: data?.phone,
            dateTime: dateTimeValue,
            duration: data?.duration || 60,
            notes: data?.notes,
            reminderEnabled: data?.reminderEnabled ?? true,
            reminderTimes: data?.reminderTimes || [],
            status: data?.status || 'upcoming',
            createdAt: data?.createdAt?.toDate?.() || new Date(),
            updatedAt: data?.updatedAt?.toDate?.() || new Date(),
          };
          setAppointment(appt);
          setTitle(appt.title || '');
          setLocation(appt.location || '');
          setPhone(appt.phone || '');
          setNotes(appt.notes || '');
          setDateTime(dateTimeValue);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading appointment:', error);
        Alert.alert('Error', 'Could not load appointment');
        navigation.goBack();
      }
    );

    return () => unsubscribe();
  }, [appointmentId]);

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

    setSaving(true);

    try {
      await appointmentDoc(appointmentId).update({
        title: title.trim(),
        location: location.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        dateTime,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Appointment updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Could not update appointment. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentDoc(appointmentId).delete();
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Error', 'Could not delete appointment');
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Edit Appointment</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="delete-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
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
          title="Save Changes"
          onPress={handleSave}
          disabled={saving}
          loading={saving}
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

export default EditAppointmentScreen;
