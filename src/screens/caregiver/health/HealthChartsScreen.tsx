/**
 * Health Charts Screen
 * View health metric trends over time
 * TODO: Implement actual charts with react-native-chart-kit or victory-native
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, HealthLog, HealthLogType } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { healthLogsCollection } from '../../../services/firebase';
import { formatDate, formatTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type HealthChartsScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'HealthCharts'>;
  route: RouteProp<CaregiverStackParamList, 'HealthCharts'>;
};

const HealthChartsScreen: React.FC<HealthChartsScreenProps> = ({ navigation, route }) => {
  const { type } = route.params;
  const { user } = useCurrentUser();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(true);

  const metricLabels: Record<HealthLogType, string> = {
    blood_pressure: 'Blood Pressure',
    weight: 'Weight',
    heart_rate: 'Heart Rate',
    glucose: 'Blood Glucose',
    temperature: 'Temperature',
    oxygen: 'Oxygen Level',
  };

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    const unsubscribe = healthLogsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('type', '==', type)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .onSnapshot(
        (snapshot) => {
          const logsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
          })) as HealthLog[];
          setLogs(logsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading health logs:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId, type, timeRange]);

  const formatValue = (value: any): string => {
    if (type === 'blood_pressure') {
      return `${value.systolic}/${value.diastolic} mmHg`;
    }
    return `${value} ${logs[0]?.unit || ''}`;
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
        <Text style={styles.title}>{metricLabels[type]}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['week', 'month', 'all'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.timeRangeTab, timeRange === range && styles.timeRangeTabActive]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
              {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Chart Placeholder */}
        <View style={styles.chartPlaceholder}>
          <Icon name="chart-line" size={64} color={FamilyColors.gray[400]} />
          <Text style={styles.chartPlaceholderText}>
            Chart visualization will be implemented with react-native-chart-kit
          </Text>
        </View>

        {/* Statistics */}
        {logs.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Latest</Text>
              <Text style={styles.statValue}>{formatValue(logs[0].value)}</Text>
              <Text style={styles.statDate}>{formatDate(logs[0].timestamp)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Logs</Text>
              <Text style={styles.statValue}>{logs.length}</Text>
            </View>
          </View>
        )}

        {/* Logs List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No logs for this time period</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logValue}>{formatValue(log.value)}</Text>
                  <Text style={styles.logDate}>
                    {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
                  </Text>
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  timeRangeTabActive: {
    backgroundColor: FamilyColors.primary.purple,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[600],
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  chartPlaceholder: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 12,
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 4,
  },
  statDate: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[600],
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
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  logValue: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  logDate: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  logNotes: {
    fontSize: 14,
    fontWeight: '400',
    color: FamilyColors.gray[600],
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
});

export default HealthChartsScreen;
