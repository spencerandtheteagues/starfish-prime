/**
 * Senior Today Screen
 * Shows today's schedule with next appointment highlighted
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList, Appointment } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { appointmentsCollection } from '../../services/firebase';
import { formatTime, formatDate } from '../../utils/date';

type SeniorTodayScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorToday'>;
};

const SeniorTodayScreen: React.FC<SeniorTodayScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fontScale = senior?.preferences?.fontScale || 1.2;

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const unsubscribe = appointmentsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('dateTime', '>=', today)
      .where('dateTime', '<', tomorrow)
      .orderBy('dateTime', 'asc')
      .onSnapshot(
        (snapshot) => {
          const appts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dateTime: doc.data().dateTime?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Appointment[];
          setAppointments(appts);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading appointments:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'No phone number available for this appointment');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleDirections = (address?: string) => {
    if (!address) {
      Alert.alert('No Address', 'No address available for this appointment');
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://maps.apple.com/?address=${encodedAddress}`;
    Linking.openURL(mapsUrl);
  };

  const nextAppointment = appointments[0];
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          Today
        </Text>
        <Text style={[styles.dateText, { fontSize: 20 * fontScale }]}>
          {currentDate}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-check" size={80} color="#10B981" />
            <Text style={[styles.emptyText, { fontSize: 28 * fontScale }]}>
              No Appointments Today
            </Text>
            <Text style={[styles.emptySubtext, { fontSize: 20 * fontScale }]}>
              Enjoy your day!
            </Text>
          </View>
        ) : (
          <>
            {/* Next Appointment (Highlighted) */}
            {nextAppointment && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 28 * fontScale }]}>
                  Next Up:
                </Text>
                <View style={styles.nextAppointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <Icon name="calendar-clock" size={48} color="#2563EB" />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={[styles.appointmentTitle, { fontSize: 32 * fontScale }]}>
                        {nextAppointment.title}
                      </Text>
                      <Text style={[styles.appointmentTime, { fontSize: 28 * fontScale }]}>
                        {formatTime(nextAppointment.dateTime)}
                      </Text>
                    </View>
                  </View>

                  {nextAppointment.location && (
                    <View style={styles.locationRow}>
                      <Icon name="map-marker" size={24} color="#1F2937" />
                      <Text style={[styles.locationText, { fontSize: 20 * fontScale }]}>
                        {nextAppointment.location}
                      </Text>
                    </View>
                  )}

                  {nextAppointment.notes && (
                    <Text style={[styles.notesText, { fontSize: 20 * fontScale }]}>
                      {nextAppointment.notes}
                    </Text>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {nextAppointment.phone && (
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(nextAppointment.phone)}
                      >
                        <Icon name="phone" size={32} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontSize: 24 * fontScale }]}>
                          Call Office
                        </Text>
                      </TouchableOpacity>
                    )}

                    {nextAppointment.location && (
                      <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(nextAppointment.location)}
                      >
                        <Icon name="directions" size={32} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontSize: 24 * fontScale }]}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* Other Appointments Today */}
            {appointments.length > 1 && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 28 * fontScale, marginTop: 32 }]}>
                  Later Today:
                </Text>
                {appointments.slice(1).map((appt) => (
                  <View key={appt.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentRow}>
                      <Icon name="clock-outline" size={32} color="#6B7280" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.appointmentSmallTitle, { fontSize: 24 * fontScale }]}>
                          {appt.title}
                        </Text>
                        <Text style={[styles.appointmentSmallTime, { fontSize: 20 * fontScale }]}>
                          {formatTime(appt.dateTime)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  dateText: {
    fontWeight: '500',
    color: '#6B7280',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  nextAppointmentCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentTitle: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  appointmentTime: {
    fontWeight: '700',
    color: '#1E3A8A',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  notesText: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
    lineHeight: 28,
  },
  actionButtons: {
    gap: 12,
  },
  callButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  appointmentCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentSmallTitle: {
    fontWeight: '600',
    color: '#1F2937',
  },
  appointmentSmallTime: {
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
  },
  emptySubtext: {
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SeniorTodayScreen;
