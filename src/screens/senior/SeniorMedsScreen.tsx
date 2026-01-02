/**
 * Senior Meds Screen
 * Simple view of today's medications with large "I took it" buttons
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList, MedicationEvent } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { getTodayMedEvents, medEventDoc, serverTimestamp } from '../../services/firebase';
import { formatTime } from '../../utils/date';

type SeniorMedsScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorMeds'>;
};

const SeniorMedsScreen: React.FC<SeniorMedsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [medEvents, setMedEvents] = useState<MedicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fontScale = senior?.preferences?.fontScale || 1.2;

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const unsubscribe = getTodayMedEvents(user.activeSeniorId).onSnapshot(
      (snapshot) => {
        const events = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate(),
          takenAt: doc.data().takenAt?.toDate(),
        })) as MedicationEvent[];
        setMedEvents(events);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading med events:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleTakeMed = async (event: MedicationEvent) => {
    try {
      await medEventDoc(event.id).update({
        status: 'taken',
        takenAt: serverTimestamp(),
      });
      Alert.alert('Great!', `You took your ${event.medicationName}`);
    } catch (error) {
      console.error('Error marking med as taken:', error);
      Alert.alert('Error', 'Could not mark medication as taken');
    }
  };

  const handleSkipMed = async (event: MedicationEvent) => {
    Alert.alert(
      'Skip Medication?',
      `Are you sure you want to skip ${event.medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            try {
              await medEventDoc(event.id).update({
                status: 'skipped',
              });
            } catch (error) {
              console.error('Error skipping med:', error);
            }
          },
        },
      ]
    );
  };

  const pendingMeds = medEvents.filter((e) => e.status === 'pending');
  const takenMeds = medEvents.filter((e) => e.status === 'taken');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          My Medications
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pending Medications */}
        {pendingMeds.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { fontSize: 28 * fontScale }]}>
              Time to Take:
            </Text>
            {pendingMeds.map((event) => (
              <View key={event.id} style={styles.medCard}>
                <View style={styles.medInfo}>
                  <Text style={[styles.medName, { fontSize: 32 * fontScale }]}>
                    {event.medicationName}
                  </Text>
                  <Text style={[styles.medTime, { fontSize: 24 * fontScale }]}>
                    {formatTime(event.scheduledTime)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.takeButton}
                  onPress={() => handleTakeMed(event)}
                >
                  <Text style={[styles.takeButtonText, { fontSize: 28 * fontScale }]}>
                    I Took It
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSkipMed(event)}
                >
                  <Text style={[styles.skipButtonText, { fontSize: 20 * fontScale }]}>
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={80} color="#10B981" />
            <Text style={[styles.emptyText, { fontSize: 28 * fontScale }]}>
              All Done!
            </Text>
            <Text style={[styles.emptySubtext, { fontSize: 20 * fontScale }]}>
              You've taken all your medications for today
            </Text>
          </View>
        )}

        {/* Taken Medications */}
        {takenMeds.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: 28 * fontScale, marginTop: 32 }]}>
              Already Taken:
            </Text>
            {takenMeds.map((event) => (
              <View key={event.id} style={styles.takenCard}>
                <Icon name="check-circle" size={32} color="#10B981" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.takenName, { fontSize: 24 * fontScale }]}>
                    {event.medicationName}
                  </Text>
                  <Text style={[styles.takenTime, { fontSize: 18 * fontScale }]}>
                    Taken at {event.takenAt ? formatTime(event.takenAt) : 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
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
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  medCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  medInfo: {
    marginBottom: 20,
  },
  medName: {
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  medTime: {
    fontWeight: '600',
    color: '#78350F',
  },
  takeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  takeButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  takenCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  takenName: {
    fontWeight: '600',
    color: '#065F46',
  },
  takenTime: {
    fontWeight: '500',
    color: '#047857',
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

export default SeniorMedsScreen;
