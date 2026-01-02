/**
 * Caregiver Dashboard Screen
 * Alert feed, quick stats, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverTabParamList, CaregiverStackParamList, Alert as AlertType, MedicationEvent } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { alertsCollection, getTodayMedEvents } from '../../../services/firebase';
import { formatTime, formatRelativeTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CaregiverTabParamList, 'Dashboard'>,
  StackNavigationProp<CaregiverStackParamList>
>;

type CaregiverDashboardScreenProps = {
  navigation: DashboardScreenNavigationProp;
};

const CaregiverDashboardScreen: React.FC<CaregiverDashboardScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [medStats, setMedStats] = useState({ taken: 0, pending: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    // Subscribe to active alerts
    const alertsUnsubscribe = alertsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot((snapshot) => {
        const alertsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          resolvedAt: doc.data().resolvedAt?.toDate(),
          acknowledgedAt: doc.data().acknowledgedAt?.toDate(),
        })) as AlertType[];
        setAlerts(alertsList);
      });

    // Get today's med stats
    const medsUnsubscribe = getTodayMedEvents(user.activeSeniorId).onSnapshot((snapshot) => {
      const events = snapshot.docs.map((doc) => doc.data()) as MedicationEvent[];
      const taken = events.filter((e) => e.status === 'taken').length;
      const pending = events.filter((e) => e.status === 'pending').length;
      setMedStats({ taken, pending });
    });

    return () => {
      alertsUnsubscribe();
      medsUnsubscribe();
    };
  }, [user?.activeSeniorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Firestore real-time listeners will automatically refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'sos':
        return 'alert-circle';
      case 'medication_missed':
        return 'pill-off';
      case 'geofence_exit':
        return 'map-marker-alert';
      case 'fall_detected':
        return 'human-handsdown';
      case 'unusual_activity':
        return 'account-alert';
      default:
        return 'alert';
    }
  };

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.seniorName}>{seniorName}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="account-circle" size={40} color={FamilyColors.primary.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="pill" size={32} color={medStats.pending > 0 ? '#F59E0B' : '#10B981'} />
            <Text style={styles.statValue}>{medStats.taken}/{medStats.taken + medStats.pending}</Text>
            <Text style={styles.statLabel}>Meds Today</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="alert-circle" size={32} color={alerts.length > 0 ? '#DC2626' : '#10B981'} />
            <Text style={styles.statValue}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="calendar-check" size={32} color={FamilyColors.primary.purple} />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Next Appt</Text>
          </View>
        </View>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts.map((alert) => {
              const color = getAlertColor(alert.severity);
              const icon = getAlertIcon(alert.type);

              return (
                <TouchableOpacity key={alert.id} style={[styles.alertCard, { borderLeftColor: color }]}>
                  <View style={styles.alertHeader}>
                    <Icon name={icon} size={24} color={color} />
                    <Text style={[styles.alertType, { color }]}>
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.alertTime}>
                      {formatRelativeTime(alert.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Messages')}
            >
              <Icon name="message-text" size={32} color={FamilyColors.primary.purple} />
              <Text style={styles.actionText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Medications')}
            >
              <Icon name="pill" size={32} color={FamilyColors.primary.purple} />
              <Text style={styles.actionText}>Medications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Icon name="calendar-plus" size={32} color={FamilyColors.primary.purple} />
              <Text style={styles.actionText}>Add Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Health')}
            >
              <Icon name="heart-pulse" size={32} color={FamilyColors.primary.purple} />
              <Text style={styles.actionText}>Log Health</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          {medStats.pending > 0 && (
            <View style={styles.overviewCard}>
              <Icon name="pill" size={24} color="#F59E0B" />
              <Text style={styles.overviewText}>
                {medStats.pending} medication{medStats.pending > 1 ? 's' : ''} pending
              </Text>
            </View>
          )}
          {alerts.length === 0 && medStats.pending === 0 && (
            <View style={styles.overviewCard}>
              <Icon name="check-circle" size={24} color="#10B981" />
              <Text style={styles.overviewText}>All good! No pending tasks.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
  seniorName: {
    fontSize: 24,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[700],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[900],
    marginTop: 8,
    textAlign: 'center',
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  overviewText: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[700],
    marginLeft: 12,
  },
});

export default CaregiverDashboardScreen;
