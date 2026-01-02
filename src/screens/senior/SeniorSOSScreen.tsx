/**
 * Senior SOS Screen
 * Emergency button with hold-to-activate and location sharing
 */

import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { alertsCollection, serverTimestamp } from '../../services/firebase';

type SeniorSOSScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorSOS'>;
};

const HOLD_DURATION = 3000; // 3 seconds to activate

const SeniorSOSScreen: React.FC<SeniorSOSScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [isHolding, setIsHolding] = useState(false);
  const [activated, setActivated] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fontScale = senior?.preferences?.fontScale || 1.2;

  const startHold = () => {
    setIsHolding(true);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Set timer to activate SOS
    holdTimerRef.current = setTimeout(() => {
      activateSOS();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    setIsHolding(false);

    // Cancel timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Reset animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const activateSOS = async () => {
    setIsHolding(false);
    setActivated(true);

    if (!user?.activeSeniorId) return;

    try {
      // Create SOS alert in Firestore
      await alertsCollection().add({
        seniorId: user.activeSeniorId,
        type: 'sos',
        severity: 'critical',
        message: 'SOS button activated by senior',
        status: 'active',
        acknowledgedBy: null,
        location: null, // Will be added by Cloud Function with geolocation
        createdAt: serverTimestamp(),
        resolvedAt: null,
      });

      // Show confirmation
      Alert.alert(
        'Help is On The Way',
        'Your emergency contacts have been notified and help is coming.',
        [
          {
            text: 'OK',
            onPress: () => {
              setActivated(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error activating SOS:', error);
      Alert.alert('Error', 'Could not send emergency alert. Please try again.');
      setActivated(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          Emergency
        </Text>
      </View>

      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Icon name="information" size={48} color="#2563EB" />
          <Text style={[styles.instructionsText, { fontSize: 24 * fontScale }]}>
            Press and hold the button below for 3 seconds to send an emergency alert to your care team
          </Text>
        </View>

        {/* SOS Button */}
        <View style={styles.sosButtonContainer}>
          <TouchableOpacity
            style={[
              styles.sosButton,
              isHolding && styles.sosButtonHolding,
              activated && styles.sosButtonActivated,
            ]}
            onPressIn={startHold}
            onPressOut={cancelHold}
            activeOpacity={0.8}
            disabled={activated}
          >
            <Icon
              name={activated ? 'check-circle' : 'alert-circle'}
              size={120}
              color="#FFFFFF"
            />
            <Text style={[styles.sosButtonText, { fontSize: 48 * fontScale }]}>
              {activated ? 'SENT!' : 'SOS'}
            </Text>
            {isHolding && (
              <Text style={[styles.holdText, { fontSize: 20 * fontScale }]}>
                Keep Holding...
              </Text>
            )}
          </TouchableOpacity>

          {/* Progress Bar */}
          {isHolding && (
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: progressWidth },
                ]}
              />
            </View>
          )}
        </View>

        {/* What Happens */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoTitle, { fontSize: 24 * fontScale }]}>
            What Happens:
          </Text>
          <View style={styles.infoItem}>
            <Icon name="account-alert" size={24} color="#DC2626" />
            <Text style={[styles.infoText, { fontSize: 20 * fontScale }]}>
              All emergency contacts are notified
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker-alert" size={24} color="#DC2626" />
            <Text style={[styles.infoText, { fontSize: 20 * fontScale }]}>
              Your location is shared with care team
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="phone-alert" size={24} color="#DC2626" />
            <Text style={[styles.infoText, { fontSize: 20 * fontScale }]}>
              Primary caregiver may call you
            </Text>
          </View>
        </View>

        {/* Cancel Instructions */}
        {isHolding && (
          <View style={styles.cancelContainer}>
            <Text style={[styles.cancelText, { fontSize: 20 * fontScale }]}>
              Release to cancel
            </Text>
          </View>
        )}
      </View>
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
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  instructionsText: {
    flex: 1,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 16,
    lineHeight: 32,
  },
  sosButtonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sosButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonHolding: {
    backgroundColor: '#991B1B',
    transform: [{ scale: 1.05 }],
  },
  sosButtonActivated: {
    backgroundColor: '#10B981',
  },
  sosButtonText: {
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: 4,
  },
  holdText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  progressBarContainer: {
    width: 280,
    height: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#DC2626',
  },
  infoContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  infoTitle: {
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontWeight: '500',
    color: '#7F1D1D',
    marginLeft: 12,
    flex: 1,
  },
  cancelContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontWeight: '700',
    color: '#6B7280',
  },
});

export default SeniorSOSScreen;
