/**
 * Health Dashboard Screen
 * View and log health metrics
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, HealthLog, HealthLogType } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { healthLogsCollection } from '../../../services/firebase';
import { formatDate } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type HealthDashboardScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'HealthDashboard'>;
};

interface HealthMetric {
  type: HealthLogType;
  label: string;
  icon: string;
  unit: string;
  color: string;
  latestValue?: any;
  latestTimestamp?: Date;
}

const HealthDashboardScreen: React.FC<HealthDashboardScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [recentLogs, setRecentLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  const seniorName = senior?.profile?.name || 'Senior';

  const healthMetrics: HealthMetric[] = [
    { type: 'blood_pressure', label: 'Blood Pressure', icon: 'heart-pulse', unit: 'mmHg', color: '#DC2626' },
    { type: 'weight', label: 'Weight', icon: 'scale-bathroom', unit: 'lbs', color: '#7C3AED' },
    { type: 'heart_rate', label: 'Heart Rate', icon: 'heart', unit: 'bpm', color: '#EF4444' },
    { type: 'glucose', label: 'Blood Glucose', icon: 'water', unit: 'mg/dL', color: '#F59E0B' },
    { type: 'temperature', label: 'Temperature', icon: 'thermometer', unit: '°F', color: '#3B82F6' },
    { type: 'oxygen', label: 'Oxygen Level', icon: 'lungs', unit: '%', color: '#10B981' },
  ];

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    // Get recent health logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unsubscribe = healthLogsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('timestamp', '>=', sevenDaysAgo)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          const logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
          })) as HealthLog[];
          setRecentLogs(logs);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading health logs:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const getLatestValue = (type: HealthLogType): any => {
    const latestLog = recentLogs.find((log) => log.type === type);
    return latestLog?.value;
  };

  const getLatestTimestamp = (type: HealthLogType): Date | undefined => {
    const latestLog = recentLogs.find((log) => log.type === type);
    return latestLog?.timestamp;
  };

  const formatValue = (type: HealthLogType, value: any): string => {
    if (!value) return '--';
    if (type === 'blood_pressure') {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value.toString();
  };

  const handleAddLog = (type: HealthLogType) => {
    // TODO: Show modal or navigate to add health log screen
    Alert.alert('Add Health Log', `Add ${type} will be implemented`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Health</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Health Metrics Grid */}
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => {
            const latestValue = getLatestValue(metric.type);
            const latestTimestamp = getLatestTimestamp(metric.type);

            return (
              <TouchableOpacity
                key={metric.type}
                style={styles.metricCard}
                onPress={() => navigation.navigate('HealthCharts', { type: metric.type })}
              >
                <View style={styles.metricHeader}>
                  <Icon name={metric.icon} size={32} color={metric.color} />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddLog(metric.type)}
                  >
                    <Icon name="plus-circle" size={20} color={metric.color} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {formatValue(metric.type, latestValue)}
                </Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
                {latestTimestamp && (
                  <Text style={styles.metricTime}>{formatDate(latestTimestamp)}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Logs */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {recentLogs.slice(0, 5).map((log) => {
              const metric = healthMetrics.find((m) => m.type === log.type);
              if (!metric) return null;

              return (
                <View key={log.id} style={styles.logCard}>
                  <Icon name={metric.icon} size={24} color={metric.color} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.logType}>{metric.label}</Text>
                    <Text style={styles.logValue}>
                      {formatValue(log.type, log.value)} {metric.unit}
                    </Text>
                  </View>
                  <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
                </View>
              );
            })}
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
  content: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[700],
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginBottom: 8,
  },
  metricTime: {
    fontSize: 11,
    fontWeight: '500',
    color: FamilyColors.gray[500],
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
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  logType: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
  },
  logValue: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
});

export default HealthDashboardScreen;
