/**
 * Caregiver Dashboard Screen
 *
 * Premium dashboard with real-time analytics, animated stats,
 * and stunning visual design for caregivers
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import {
  CaregiverTabParamList,
  CaregiverStackParamList,
  Alert as AlertType,
  MedicationEvent,
} from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { alertsCollection, getTodayMedEvents } from '../../../services/firebase';
import { formatRelativeTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CaregiverTabParamList, 'Dashboard'>,
  StackNavigationProp<CaregiverStackParamList>
>;

type CaregiverDashboardScreenProps = {
  navigation: DashboardScreenNavigationProp;
};

// Animated Progress Ring Component
const AnimatedProgressRing: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor?: string;
}> = ({ progress, size, strokeWidth, color, bgColor = '#E5E7EB' }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="100%" stopColor={FamilyColors.primary.purpleLight} />
        </SvgGradient>
      </Defs>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
};

const CaregiverDashboardScreen: React.FC<CaregiverDashboardScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [medStats, setMedStats] = useState({ taken: 0, pending: 0, total: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [moodScore, setMoodScore] = useState(85);
  const [activityLevel, setActivityLevel] = useState(72);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const seniorName = senior?.profile?.name || 'Senior';
  const firstName = seniorName.split(' ')[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const alertsUnsubscribe = alertsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot((snapshot) => {
        const alertsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            seniorId: data.seniorId || user.activeSeniorId,
            type: data.type || 'info',
            severity: data.severity || 'info',
            message: data.message || '',
            acknowledged: data.acknowledged ?? false,
            acknowledgedBy: data.acknowledgedBy,
            acknowledgedAt: data.acknowledgedAt?.toDate?.(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            data: data.data,
          } as AlertType;
        });
        setAlerts(alertsList);
      });

    const medsUnsubscribe = getTodayMedEvents(user.activeSeniorId).onSnapshot((snapshot) => {
      const events = snapshot.docs.map((doc) => doc.data()) as MedicationEvent[];
      const taken = events.filter((e) => e.status === 'taken').length;
      const pending = events.filter((e) => e.status === 'pending').length;
      setMedStats({ taken, pending, total: taken + pending });
    });

    return () => {
      alertsUnsubscribe();
      medsUnsubscribe();
    };
  }, [user?.activeSeniorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'sos': return 'alarm-light';
      case 'medication_missed': return 'pill-off';
      case 'geofence_exit': return 'map-marker-alert';
      case 'fall_detected': return 'human-handsdown';
      case 'unusual_activity': return 'account-alert';
      case 'emergency': return 'alert-octagon';
      case 'health_concern': return 'heart-pulse';
      default: return 'alert';
    }
  };

  const getAlertGradient = (severity: string): string[] => {
    switch (severity) {
      case 'critical': return ['#FEE2E2', '#FECACA'];
      case 'high': return ['#FEF3C7', '#FDE68A'];
      case 'medium': return ['#DBEAFE', '#BFDBFE'];
      default: return ['#F3F4F6', '#E5E7EB'];
    }
  };

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const medProgress = medStats.total > 0 ? medStats.taken / medStats.total : 0;

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#F5F3FF', '#EDE9FE', '#DDD6FE']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.title}>Caring for {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <LinearGradient
              colors={['#FFFFFF', '#F3F4F6']}
              style={styles.notificationGradient}
            >
              <Icon name="bell-outline" size={24} color={FamilyColors.primary.purple} />
              {alerts.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{alerts.length}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Senior Status Card */}
          <Animated.View
            style={[
              styles.statusCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FAFAFA']}
              style={styles.statusCardGradient}
            >
              {/* Online Status */}
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>

              {/* Avatar Placeholder */}
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[FamilyColors.primary.purple, FamilyColors.primary.purpleDark]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.statusName}>{seniorName}</Text>
              <Text style={styles.statusSubtext}>Last activity: 5 minutes ago</Text>

              {/* Quick Stats Row */}
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStat}>
                  <View style={styles.quickStatIcon}>
                    <Icon name="emoticon-happy-outline" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.quickStatLabel}>Mood</Text>
                  <Text style={styles.quickStatValue}>{moodScore}%</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <View style={styles.quickStatIcon}>
                    <Icon name="run" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.quickStatLabel}>Activity</Text>
                  <Text style={styles.quickStatValue}>{activityLevel}%</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <View style={styles.quickStatIcon}>
                    <Icon name="chat-processing-outline" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.quickStatLabel}>Chats</Text>
                  <Text style={styles.quickStatValue}>3</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Analytics Cards */}
          <View style={styles.analyticsRow}>
            {/* Medication Progress */}
            <Animated.View
              style={[
                styles.analyticsCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAFAFA']}
                style={styles.analyticsCardGradient}
              >
                <View style={styles.ringContainer}>
                  <AnimatedProgressRing
                    progress={medProgress}
                    size={80}
                    strokeWidth={8}
                    color={FamilyColors.primary.purple}
                  />
                  <View style={styles.ringCenterText}>
                    <Text style={styles.ringValue}>{medStats.taken}</Text>
                    <Text style={styles.ringLabel}>/{medStats.total}</Text>
                  </View>
                </View>
                <Text style={styles.analyticsTitle}>Medications</Text>
                <Text style={styles.analyticsSubtitle}>
                  {medStats.pending > 0 ? `${medStats.pending} pending` : 'All taken'}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Alerts Card */}
            <Animated.View
              style={[
                styles.analyticsCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={alerts.length > 0 ? ['#FEF2F2', '#FEE2E2'] : ['#ECFDF5', '#D1FAE5']}
                style={styles.analyticsCardGradient}
              >
                <View style={styles.alertsIconContainer}>
                  <Icon
                    name={alerts.length > 0 ? 'alert-circle' : 'check-circle'}
                    size={44}
                    color={alerts.length > 0 ? '#DC2626' : '#10B981'}
                  />
                </View>
                <Text style={styles.analyticsTitle}>Alerts</Text>
                <Text style={[styles.analyticsSubtitle, { color: alerts.length > 0 ? '#DC2626' : '#10B981' }]}>
                  {alerts.length > 0 ? `${alerts.length} active` : 'All clear'}
                </Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Alerts</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {alerts.slice(0, 3).map((alert, index) => {
                const color = getAlertColor(alert.severity);
                const gradientColors = getAlertGradient(alert.severity);
                const icon = getAlertIcon(alert.type);

                return (
                  <TouchableOpacity key={alert.id} style={styles.alertCard}>
                    <LinearGradient
                      colors={gradientColors}
                      style={styles.alertCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={[styles.alertIconContainer, { backgroundColor: color }]}>
                        <Icon name={icon} size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.alertContent}>
                        <Text style={[styles.alertType, { color }]}>
                          {alert.type.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        <Text style={styles.alertMessage} numberOfLines={1}>
                          {alert.message}
                        </Text>
                      </View>
                      <Text style={styles.alertTime}>{formatRelativeTime(alert.createdAt)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'message-text-outline', label: 'Message', color: '#8B5CF6', screen: 'Messages' },
                { icon: 'pill', label: 'Medications', color: '#EF4444', screen: 'Medications' },
                { icon: 'calendar-plus', label: 'Appointments', color: '#3B82F6', screen: 'Appointments' },
                { icon: 'heart-pulse', label: 'Health Log', color: '#10B981', screen: 'Health' },
              ].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(action.screen as any)}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#FAFAFA']}
                    style={styles.actionCardGradient}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
                      <Icon name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={styles.actionText}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Sunny AI Insights */}
          <Animated.View
            style={[
              styles.insightsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#7C3AED', '#5B21B6']}
              style={styles.insightsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.insightsHeader}>
                <View style={styles.sunnyIcon}>
                  <Icon name="robot" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.insightsTitle}>Sunny AI Insights</Text>
              </View>
              <Text style={styles.insightsText}>
                "{firstName} had a positive day with 3 conversations. Mood appears stable. No concerns to report."
              </Text>
              <TouchableOpacity style={styles.insightsButton}>
                <Text style={styles.insightsButtonText}>View Full Report</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  decorativeCircle1: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#A78BFA',
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
  },
  decorativeCircle2: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    backgroundColor: '#C4B5FD',
    bottom: SCREEN_WIDTH * 0.3,
    left: -SCREEN_WIDTH * 0.15,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  onlineStatus: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: FamilyColors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  analyticsCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  ringCenterText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ringValue: {
    fontSize: 22,
    fontWeight: '700',
    color: FamilyColors.primary.purple,
  },
  ringLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  alertsIconContainer: {
    marginBottom: 12,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  analyticsSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  insightsGradient: {
    padding: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sunnyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insightsText: {
    fontSize: 15,
    color: '#E9D5FF',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  insightsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default CaregiverDashboardScreen;
