/**
 * Senior Health Screen
 * High-visibility health logging and tracking for seniors
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList, HealthLog, HealthLogType } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { healthLogsCollection } from '../../services/firebase';
import { formatDate } from '../../utils/date';
import AddHealthLogModal from '../../components/health/AddHealthLogModal';
import HealthCharts from '../../components/health/HealthCharts';

type SeniorHealthScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorHealth'>;
};

const SeniorHealthScreen: React.FC<SeniorHealthScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [recentLogs, setRecentLogs] = useState<HealthLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<HealthLogType>('blood_pressure');

  const fontScale = senior?.preferences?.fontScale || 1.2;

  const healthMetrics = [
    { type: 'blood_pressure', label: 'Blood Pressure', icon: 'heart-pulse', color: '#DC2626', backgroundColor: '#FEE2E2' },
    { type: 'weight', label: 'Weight', icon: 'weight', color: '#7C3AED', backgroundColor: '#EDE9FE' },
    { type: 'heart_rate', label: 'Heart Rate', icon: 'heart', color: '#EF4444', backgroundColor: '#FEE2E2' },
    { type: 'glucose', label: 'Glucose', icon: 'water', color: '#F59E0B', backgroundColor: '#FEF3C7' },
  ] as const;

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const unsubscribe = healthLogsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
          })) as HealthLog[];
          setRecentLogs(logs);
        },
        (error) => {
          console.error('Error loading health logs:', error);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleAddLog = (type: HealthLogType) => {
    setSelectedType(type);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          Health Tracking
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { fontSize: 24 * fontScale }]}>
          Log New Measurement:
        </Text>

        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => (
            <TouchableOpacity
              key={metric.type}
              style={[styles.metricButton, { backgroundColor: metric.backgroundColor }]}
              onPress={() => handleAddLog(metric.type)}
            >
              <Icon name={metric.icon} size={48} color={metric.color} />
              <Text style={[styles.metricLabel, { color: metric.color, fontSize: 20 * fontScale }]}>
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { fontSize: 24 * fontScale, marginTop: 32 }]}>
          Trends:
        </Text>

        {healthMetrics.map((metric) => (
          <HealthCharts
            key={metric.type}
            type={metric.type}
            title={metric.label}
            color={metric.color}
            logs={recentLogs.filter(log => log.type === metric.type)}
          />
        ))}
      </ScrollView>

      {user?.activeSeniorId && (
        <AddHealthLogModal
          visible={modalVisible}
          type={selectedType}
          seniorId={user.activeSeniorId}
          onClose={() => setModalVisible(false)}
        />
      )}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricButton: {
    width: '47%',
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SeniorHealthScreen;
