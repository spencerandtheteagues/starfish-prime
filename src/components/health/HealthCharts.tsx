import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FamilyColors } from '../../design/colors';
import { HealthLog, HealthLogType } from '../../services/healthLogs';
import { format } from 'date-fns';

interface HealthChartsProps {
  logs: HealthLog[];
  type: HealthLogType;
  title: string;
  color: string;
}

/**
 * HealthCharts - Visualizes health data using react-native-chart-kit
 */
const HealthCharts: React.FC<HealthChartsProps> = ({ logs, type, title, color }) => {
  const screenWidth = Dimensions.get('window').width;

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    // Sort logs by date (oldest first for the chart)
    const sortedLogs = [...logs].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    ).slice(-7); // Show last 7 readings

    if (sortedLogs.length === 0) return null;

    if (type === 'blood_pressure') {
      // Blood pressure has two values: systolic and diastolic
      const systolicData: number[] = [];
      const diastolicData: number[] = [];
      const labels: string[] = [];

      sortedLogs.forEach(log => {
        if (typeof log.value === 'string' && log.value.includes('/')) {
          const [s, d] = log.value.split('/').map(v => parseInt(v, 10));
          systolicData.push(s);
          diastolicData.push(d);
          labels.push(format(log.timestamp, 'MM/dd'));
        }
      });

      return {
        labels,
        datasets: [
          {
            data: systolicData,
            color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, // Systolic Red
            strokeWidth: 2
          },
          {
            data: diastolicData,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Diastolic Blue
            strokeWidth: 2
          }
        ],
        legend: ['Systolic', 'Diastolic']
      };
    } else {
      // Single value metrics
      const data: number[] = [];
      const labels: string[] = [];

      sortedLogs.forEach(log => {
        if (typeof log.value === 'number') {
          data.push(log.value);
          labels.push(format(log.timestamp, 'MM/dd'));
        }
      });

      return {
        labels,
        datasets: [
          {
            data,
            color: (opacity = 1) => color,
            strokeWidth: 2
          }
        ]
      };
    }
  }, [logs, type, color]);

  if (!chartData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data for {title} chart yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>{title} Trends</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: type === 'temperature' ? 1 : 0,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: color
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FamilyColors.gray[50],
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: FamilyColors.gray[300],
  },
  emptyText: {
    color: FamilyColors.gray[500],
    fontWeight: '500',
  }
});

export default HealthCharts;
