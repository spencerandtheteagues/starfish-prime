/**
 * Appointments List Screen
 * View and manage senior's appointments
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, Appointment } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { appointmentsCollection, appointmentDoc } from '../../../services/firebase';
import { formatTime, formatDate } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type AppointmentsListScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'AppointmentsList'>;
};

const AppointmentsListScreen: React.FC<AppointmentsListScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    // Get upcoming appointments (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unsubscribe = appointmentsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('dateTime', '>=', today)
      .orderBy('dateTime', 'asc')
      .limit(50)
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

  const handleDelete = (appointment: Appointment) => {
    Alert.alert(
      'Delete Appointment',
      `Are you sure you want to delete "${appointment.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentDoc(appointment.id).delete();
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Error', 'Could not delete appointment');
            }
          },
        },
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const isToday = new Date().toDateString() === item.dateTime.toDateString();

    return (
      <TouchableOpacity
        style={[styles.appointmentCard, isToday && styles.todayCard]}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
      >
        <View style={styles.appointmentHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Icon name="calendar-clock" size={20} color={FamilyColors.primary.purple} />
              <Text style={styles.appointmentTitle}>{item.title}</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateText}>{formatDate(item.dateTime)}</Text>
              <Text style={styles.timeText}>{formatTime(item.dateTime)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => navigation.navigate('EditAppointment', { appointmentId: item.id })}
          >
            <Icon name="pencil" size={20} color={FamilyColors.gray[600]} />
          </TouchableOpacity>
        </View>

        {item.location && (
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color={FamilyColors.gray[600]} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>Today</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAppointment')}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <EmptyState
          icon="calendar-blank"
          title="No Appointments"
          message="Schedule appointments for your loved one"
          actionLabel="Add Appointment"
          onAction={() => navigation.navigate('AddAppointment')}
        />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointment}
          contentContainerStyle={styles.list}
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
    fontSize: 24,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  addButton: {
    backgroundColor: FamilyColors.primary.purple,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  todayCard: {
    borderColor: FamilyColors.primary.purple,
    borderWidth: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginLeft: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[700],
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
    marginLeft: 12,
  },
  moreButton: {
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginLeft: 6,
  },
  notesText: {
    fontSize: 14,
    fontWeight: '400',
    color: FamilyColors.gray[600],
  },
  todayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: FamilyColors.primary.purple,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AppointmentsListScreen;
