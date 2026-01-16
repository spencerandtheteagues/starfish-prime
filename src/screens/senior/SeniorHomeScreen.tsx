/**
 * Senior Home Screen
 *
 * Stunning, hi-tech home screen with 6 glowing tiles
 * Features animated gradients, glow effects, and premium visuals
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  AccessibilityInfo,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { signOut } from '../../services/auth';
import { GlowingTile } from '../../components/senior';
import { SeniorColors } from '../../design/colors';
import { HapticFeedback, announceForAccessibility } from '../../design/accessibility';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SeniorHomeScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorHome'>;
};

interface TileConfig {
  title: string;
  icon: string;
  gradientColors: string[];
  iconColor: string;
  screen: keyof SeniorStackParamList;
  accessibilityHint: string;
  isPulsing?: boolean;
}

const tiles: TileConfig[] = [
  {
    title: 'Talk to Sunny',
    icon: 'chat-processing',
    gradientColors: ['#EDE9FE', '#DDD6FE', '#C4B5FD'],
    iconColor: '#7C3AED',
    screen: 'BuddyChat',
    accessibilityHint: 'Opens voice conversation with your AI companion Sunny',
    isPulsing: true,
  },
  {
    title: 'Take My Meds',
    icon: 'pill',
    gradientColors: ['#FEE2E2', '#FECACA', '#FCA5A5'],
    iconColor: '#DC2626',
    screen: 'SeniorMeds',
    accessibilityHint: 'View and manage your medication schedule',
  },
  {
    title: 'Today',
    icon: 'calendar-star',
    gradientColors: ['#DBEAFE', '#BFDBFE', '#93C5FD'],
    iconColor: '#2563EB',
    screen: 'SeniorToday',
    accessibilityHint: 'View your schedule and appointments for today',
  },
  {
    title: 'Messages',
    icon: 'message-text-outline',
    gradientColors: ['#D1FAE5', '#A7F3D0', '#6EE7B7'],
    iconColor: '#059669',
    screen: 'SeniorMessages',
    accessibilityHint: 'Read messages from your caregiver',
  },
  {
    title: 'Call Someone',
    icon: 'phone-ring',
    gradientColors: ['#FEF3C7', '#FDE68A', '#FCD34D'],
    iconColor: '#D97706',
    screen: 'SeniorContacts',
    accessibilityHint: 'Call your contacts or caregiver',
  },
  {
    title: 'SOS',
    icon: 'alarm-light',
    gradientColors: ['#FEE2E2', '#FCA5A5', '#F87171'],
    iconColor: '#DC2626',
    screen: 'SeniorSOS',
    accessibilityHint: 'Emergency button to alert your care team',
  },
];

const SeniorHomeScreen: React.FC<SeniorHomeScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerGlowAnim = useRef(new Animated.Value(0)).current;

  const fontScale = senior?.preferences?.fontScale || 1.2;
  const userName = user?.name || senior?.profile?.name || 'Friend';
  const firstName = userName.split(' ')[0];

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Header glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(headerGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();

    return () => glow.stop();
  }, [fadeAnim, slideAnim, headerGlowAnim]);

  // Check for screen reader
  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(enabled);
    };
    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => setScreenReaderEnabled(enabled)
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Announce screen on focus for screen readers
  useEffect(() => {
    if (screenReaderEnabled) {
      setTimeout(() => {
        announceForAccessibility(
          `Welcome home ${firstName}. ${tiles.length} options available. Swipe to navigate.`
        );
      }, 500);
    }
  }, [screenReaderEnabled, firstName]);

  const handleTilePress = (screen: keyof SeniorStackParamList, tileName: string) => {
    HapticFeedback.medium();
    if (screenReaderEnabled) {
      announceForAccessibility(`Opening ${tileName}`);
    }
    navigation.navigate(screen);
  };

  const handleLogoPress = () => {
    HapticFeedback.light();
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);

    if (newCount >= 5) {
      setLogoTapCount(0);
      Alert.prompt(
        'Caregiver Access',
        'Enter caregiver PIN to sign out',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async (pin) => {
              const correctPin = senior?.security?.caregiverPin || '1234';
              if (pin !== correctPin) {
                Alert.alert('Incorrect PIN', 'Access denied');
                return;
              }
              try {
                await signOut();
              } catch (error) {
                console.error('Sign out error:', error);
                Alert.alert('Error', 'Could not sign out');
              }
            },
          },
        ],
        'secure-text'
      );
    }

    setTimeout(() => setLogoTapCount(0), 3000);
  };

  const getBadge = (screen: keyof SeniorStackParamList): number | undefined => {
    if (screen === 'SeniorMessages' && unreadMessages > 0) {
      return unreadMessages;
    }
    return undefined;
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const headerGlowOpacity = headerGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        style={styles.backgroundGradient}
      />

      {/* Decorative Background Elements */}
      <View style={styles.decorativeContainer}>
        <Animated.View
          style={[
            styles.decorativeCircle,
            styles.decorativeCircle1,
            { opacity: headerGlowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.decorativeCircle,
            styles.decorativeCircle2,
            { opacity: headerGlowOpacity },
          ]}
        />
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
            <Text style={[styles.greeting, { fontSize: 36 * fontScale }]}>
              {getTimeGreeting()},
            </Text>
            <Text style={[styles.userName, { fontSize: 40 * fontScale }]}>
              {firstName}
            </Text>
            <Text style={[styles.dateText, { fontSize: 18 * fontScale }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Hidden sign out */}
          <TouchableOpacity
            onPress={handleLogoPress}
            style={styles.logoButton}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          >
            <LinearGradient
              colors={['#E2E8F0', '#CBD5E1']}
              style={styles.logoGradient}
            >
              <Icon name="shield-account" size={28} color="#64748B" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Tiles Grid */}
        <ScrollView
          contentContainerStyle={styles.tilesContainer}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel="Main navigation options"
        >
          {tiles.map((tile, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30 + index * 10],
                    }),
                  },
                ],
              }}
            >
              <GlowingTile
                title={tile.title}
                icon={tile.icon}
                gradientColors={tile.gradientColors}
                iconColor={tile.iconColor}
                onPress={() => handleTilePress(tile.screen, tile.title)}
                badge={getBadge(tile.screen)}
                isPulsing={tile.isPulsing}
                fontScale={fontScale}
                accessibilityHint={tile.accessibilityHint}
                testID={`tile-${tile.screen}`}
              />
            </Animated.View>
          ))}

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
  },
  decorativeCircle1: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: '#7C3AED',
    top: -SCREEN_WIDTH * 0.3,
    right: -SCREEN_WIDTH * 0.3,
    opacity: 0.05,
  },
  decorativeCircle2: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#3B82F6',
    bottom: -SCREEN_WIDTH * 0.2,
    left: -SCREEN_WIDTH * 0.2,
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateText: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  logoButton: {
    marginTop: 8,
  },
  logoGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tilesContainer: {
    padding: 16,
    paddingTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default SeniorHomeScreen;
