import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { subscribeHealthLogs } from '../../services/healthLogs';
import { useCurrentUser } from '../../state/useCurrentUser';
import { FamilyColors, addAlpha } from '../../design/colors';
import { HealthLog, HealthLogType } from '../../types';

/**
 * Senior HealthChartsScreen
 *
 * This screen allows a senior to view historical health metrics in an easy‑to‑understand chart.
 */
const HealthChartsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();

  // Determine senior ID
  const seniorId = user?.role === 'senior' ? (user.activeSeniorId || user.uid) : null;

  useEffect(() => {
    if (!seniorId) return;

    // Calculate start date based on range
    const now = new Date();
    const startDate = new Date();
    if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
    if (timeRange === 'month') startDate.setDate(now.getDate() - 30);
    if (timeRange === 'all') startDate.setFullYear(2020); // Far back

    setLoading(true);
    const unsubscribe = subscribeHealthLogs(
      seniorId,
      undefined, // all types
      { start: startDate, end: now },
      (newLogs) => {
        setLogs(newLogs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching health logs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [seniorId, timeRange]);

  // Group logs by metric (type) and prepare chart data
  const chartData = useMemo(() => {
    const grouped: Record<string, { labels: string[]; data: number[]; suffix?: string }> = {};

    // Sort logs by date ascending for charts
    const sortedLogs = [...logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    sortedLogs.forEach((log) => {
      const dateLabel = log.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (log.type === 'blood_pressure' && typeof log.value === 'object') {
        // Handle Systolic
        if (!grouped['BP Systolic']) grouped['BP Systolic'] = { labels: [], data: [], suffix: 'mmHg' };
        grouped['BP Systolic'].labels.push(dateLabel);
        grouped['BP Systolic'].data.push(Number(log.value.systolic));

        // Handle Diastolic
        if (!grouped['BP Diastolic']) grouped['BP Diastolic'] = { labels: [], data: [], suffix: 'mmHg' };
        grouped['BP Diastolic'].labels.push(dateLabel);
        grouped['BP Diastolic'].data.push(Number(log.value.diastolic));
      } else if (typeof log.value === 'number') {
        let label = log.type.replace('_', ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        
        if (!grouped[label]) grouped[label] = { labels: [], data: [], suffix: log.unit };
        grouped[label].labels.push(dateLabel);
        grouped[label].data.push(log.value);
      }
    });

    return grouped;
  }, [logs]);

  const getMetricColor = (metricName: string, opacity = 1) => {
    const name = metricName.toLowerCase();
    if (name.includes('systolic')) return addAlpha(FamilyColors.charts.blue, opacity);
    if (name.includes('diastolic')) return addAlpha(FamilyColors.charts.purple, opacity);
    if (name.includes('heart')) return addAlpha(FamilyColors.charts.pink, opacity);
    if (name.includes('weight')) return addAlpha(FamilyColors.charts.green, opacity);
    if (name.includes('glucose') || name.includes('sugar')) return addAlpha(FamilyColors.charts.orange, opacity);
    return addAlpha(FamilyColors.primary.blue, opacity);
  };

  const renderCharts = () => {
    const metrics = Object.keys(chartData);
    if (metrics.length === 0) {
      return <Text style={styles.noData}>No health data found for this period.</Text>;
    }

    return metrics.map((metric) => {
      const { labels, data, suffix } = chartData[metric];
      // Simplify labels if too many (show every nth label)
      const visibleLabels = labels.map((l, i) => 
        (labels.length > 7 && i % Math.ceil(labels.length / 5) !== 0) ? '' : l
      );

      return (
        <View key={metric} style={styles.chartContainer}>
          <Text style={styles.metricTitle}>{metric}</Text>
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [{ data }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisSuffix={suffix ? ` ${suffix}` : ''}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => getMetricColor(metric, opacity),
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: getMetricColor(metric) },
              propsForBackgroundLines: { strokeDasharray: '' }, // solid lines
            }}
            bezier
            style={styles.chart}
          />
        </View>
      );
    });
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Health Trends</Text>
      <View style={styles.rangeSelector}>
        {(['week', 'month', 'all'] as const).map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              timeRange === range && styles.rangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={timeRange === range ? styles.rangeTextActive : styles.rangeText}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        renderCharts()
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  rangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginHorizontal: 5,
    backgroundColor: '#F9FAFB',
  },
  rangeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  rangeText: {
    color: '#374151',
    fontWeight: '500',
  },
  rangeTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 40, // Space for labels
  },
  noData: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default HealthChartsScreen;