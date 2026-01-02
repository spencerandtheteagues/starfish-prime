/**
 * Appointment Detail Screen
 * View full appointment details
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, Appointment } from '../../../types';
import { appointmentDoc } from '../../../services/firebase';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FamilyColors } from '../../../design/colors';
import { formatTime, formatDate, formatRelativeTime } from '../../../utils/date';

type AppointmentDetailScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'AppointmentDetail'>;
  route: RouteProp<CaregiverStackParamList, 'AppointmentDetail'>;
};

const AppointmentDetailScreen: React.FC<AppointmentDetailScreenProps> = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = appointmentDoc(appointmentId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data() as Appointment;
          setAppointment({
            id: doc.id,
            ...data,
            dateTime: data.dateTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
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

  const handleCall = () => {
    if (!appointment?.phone) return;
    const cleanPhone = appointment.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleDirections = () => {
    if (!appointment?.location) return;
    const encodedAddress = encodeURIComponent(appointment.location);
    const mapsUrl = `https://maps.apple.com/?address=${encodedAddress}`;
    Linking.openURL(mapsUrl);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!appointment) {
    return null;
  }

  const isToday = new Date().toDateString() === appointment.dateTime.toDateString();
  const isPast = appointment.dateTime < new Date();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditAppointment', { appointmentId: appointment.id })}
        >
          <Icon name="pencil" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <Icon name="calendar-clock" size={48} color={FamilyColors.primary.purple} />
          <Text style={styles.title}>{appointment.title}</Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
          {isPast && !isToday && (
            <Text style={styles.pastText}>Past</Text>
          )}
        </View>

        {/* Date & Time */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={24} color={FamilyColors.gray[700]} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(appointment.dateTime)}</Text>
              <Text style={styles.relativeTime}>{formatRelativeTime(appointment.dateTime)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={24} color={FamilyColors.gray[700]} />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(appointment.dateTime)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {appointment.location && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={24} color={FamilyColors.gray[700]} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{appointment.location}</Text>
              </View>
              <TouchableOpacity style={styles.actionIcon} onPress={handleDirections}>
                <Icon name="directions" size={24} color={FamilyColors.primary.purple} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Phone */}
        {appointment.phone && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="phone" size={24} color={FamilyColors.gray[700]} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{appointment.phone}</Text>
              </View>
              <TouchableOpacity style={styles.actionIcon} onPress={handleCall}>
                <Icon name="phone-in-talk" size={24} color={FamilyColors.primary.purple} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.infoCard}>
            <View style={styles.notesHeader}>
              <Icon name="text" size={24} color={FamilyColors.gray[700]} />
              <Text style={[styles.infoLabel, { marginLeft: 16 }]}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  content: {
    padding: 20,
  },
  titleCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginTop: 16,
    textAlign: 'center',
  },
  todayBadge: {
    backgroundColor: FamilyColors.primary.purple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  todayBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pastText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[500],
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
  },
  relativeTime: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.primary.purple,
    marginTop: 2,
  },
  actionIcon: {
    padding: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.gray[700],
    lineHeight: 24,
  },
});

export default AppointmentDetailScreen;
