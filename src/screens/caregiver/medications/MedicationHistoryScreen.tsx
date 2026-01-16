/**
 * Medication History Screen
 * View past medication events (taken, missed, skipped)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, MedicationEvent } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { medEventsCollection } from '../../../services/firebase';
import { formatTime, formatDate } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

type MedicationHistoryScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'MedicationHistory'>;
};

const MedicationHistoryScreen: React.FC<MedicationHistoryScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [events, setEvents] = useState<MedicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed' | 'skipped'>('all');

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    // Get last 30 days of medication events
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const unsubscribe = medEventsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('scheduledTime', '>=', thirtyDaysAgo)
      .orderBy('scheduledTime', 'desc')
      .limit(100)
      .onSnapshot(
        (snapshot) => {
          const eventsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              seniorId: data.seniorId || user?.activeSeniorId || '',
              medicationId: data.medicationId || '',
              medicationName: data.medicationName || '',
              scheduledTime: data.scheduledTime?.toDate?.() || new Date(),
              takenAt: data.takenAt?.toDate?.(),
              status: data.status || 'pending',
              notes: data.notes,
            } as MedicationEvent;
          });
          setEvents(eventsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading medication history:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'taken':
        return '#10B981';
      case 'missed':
        return '#EF4444';
      case 'skipped':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'taken':
        return 'check-circle';
      case 'missed':
        return 'alert-circle';
      case 'skipped':
        return 'minus-circle';
      default:
        return 'clock-outline';
    }
  };

  const renderEvent = ({ item }: { item: MedicationEvent }) => {
    const color = getStatusColor(item.status);
    const icon = getStatusIcon(item.status);

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Icon name={icon} size={24} color={color} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.medicationName}>{item.medicationName}</Text>
            <Text style={styles.scheduledTime}>
              Scheduled: {formatDate(item.scheduledTime)} at {formatTime(item.scheduledTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.statusText, { color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {item.takenAt && item.status === 'taken' && (
          <View style={styles.takenInfo}>
            <Icon name="clock-check-outline" size={16} color={FamilyColors.gray[600]} />
            <Text style={styles.takenText}>
              Taken at {formatTime(item.takenAt)}
            </Text>
          </View>
        )}
      </View>
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
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>Medication History</Text>
          <Text style={styles.subtitle}>{seniorName} - Last 30 days</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'taken', 'missed', 'skipped'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="history"
          title="No History"
          message={filter === 'all' ? 'No medication history found' : `No ${filter} medications`}
        />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
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
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: FamilyColors.primary.purple,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[600],
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  scheduledTime: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  takenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
  takenText: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginLeft: 6,
  },
});

export default MedicationHistoryScreen;
