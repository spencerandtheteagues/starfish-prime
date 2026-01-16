/**
 * BuddyChatScreen (Senior)
 *
 * Premium voice conversation interface with Sunny AI companion
 * featuring a stunning 3D animated orb and modern UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import { chatWithBuddy } from '../../services/buddy';
import { speakBuddyMessage, stop as stopSpeaking } from '../../services/tts';
import { realtimeService } from '../../services/realtime';
import { useCurrentUser } from '../../state/useCurrentUser';
import { SeniorColors } from '../../design/colors';
import { HapticFeedback } from '../../design/accessibility';
import SunnyOrb from '../../components/SunnyOrb';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

const BuddyChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');

  // Realtime Voice Mode state
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isRealtimeConnecting, setIsRealtimeConnecting] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  // Function call feedback state
  const [activeFunctionCall, setActiveFunctionCall] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useCurrentUser();
  const seniorId = user?.role === 'senior' ? (user.activeSeniorId || user.uid) : null;

  // Initial animation
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
  }, [fadeAnim, slideAnim]);

  // Initialize realtime session
  useEffect(() => {
    if (seniorId) {
      initRealtimeSession();
    }

    return () => {
      realtimeService.stopSession();
    };
  }, [seniorId]);

  // Update orb state based on app state
  useEffect(() => {
    if (isRealtimeConnecting || activeFunctionCall) {
      setOrbState('thinking');
    } else if (isListening) {
      setOrbState('listening');
    } else if (isSpeaking) {
      setOrbState('speaking');
    } else {
      setOrbState('idle');
    }
  }, [isRealtimeConnecting, isListening, isSpeaking, activeFunctionCall]);

  const initRealtimeSession = async () => {
    if (!seniorId) return;

    try {
      setIsRealtimeConnecting(true);

      await realtimeService.startSession(seniorId, {
        onConnected: () => {
          console.log('Realtime connected!');
          setIsRealtimeConnected(true);
          setIsRealtimeConnecting(false);
          HapticFeedback.success();
        },
        onDisconnected: () => {
          console.log('Realtime disconnected');
          setIsRealtimeConnected(false);
          setIsListening(false);
        },
        onTranscript: (text, isFinal) => {
          if (isFinal) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            setCurrentTranscript('');
          } else {
            setCurrentTranscript(prev => prev + text);
          }
        },
        onAudioDelta: () => {
          setIsSpeaking(true);
        },
        onResponseDone: () => {
          setIsSpeaking(false);
          if (currentTranscript) {
            setMessages(prev => [...prev, { role: 'assistant', content: currentTranscript }]);
            setCurrentTranscript('');
          }
        },
        onError: (error) => {
          console.error('Realtime error:', error);
          setIsRealtimeConnecting(false);
          setIsRealtimeConnected(false);
          HapticFeedback.error();
        },
        onFunctionCall: (functionName: string, args: any) => {
          const friendlyNames: Record<string, string> = {
            'get_weather': 'Checking weather...',
            'general_information_lookup': 'Looking that up...',
            'get_news': 'Getting news...',
            'log_and_report_daily_senior_status': 'Noting that...',
            'integrate_eldercare_features': 'Checking schedule...',
            'build_and_log_senior_profile': 'Remembering...',
            'emergency_notify_protocol': 'Alerting caregiver...',
          };
          setActiveFunctionCall(friendlyNames[functionName] || 'Working...');
        },
        onFunctionResult: (functionName: string, result: any) => {
          setActiveFunctionCall(null);
          if (functionName === 'emergency_notify_protocol') {
            HapticFeedback.warning();
          }
        },
      });
    } catch (error) {
      console.error('Failed to start realtime session:', error);
      setIsRealtimeConnecting(false);
    }
  };

  const handleStartRecording = async () => {
    if (!isRealtimeConnected) {
      initRealtimeSession();
      return;
    }

    try {
      HapticFeedback.medium();
      setIsListening(true);
      await realtimeService.startRecording();
    } catch (e) {
      console.error('Failed to start recording:', e);
      setIsListening(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await realtimeService.stopRecording();
      setIsListening(false);
      HapticFeedback.light();
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    handleStartRecording();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 5,
    }).start();
    if (isListening) {
      handleStopRecording();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, currentTranscript]);

  const getStatusText = () => {
    if (isRealtimeConnecting) return 'Connecting to Sunny...';
    if (!isRealtimeConnected) return 'Tap to connect';
    if (isListening) return 'Listening...';
    if (activeFunctionCall) return activeFunctionCall;
    if (isSpeaking) return 'Sunny is speaking';
    return 'Hold to talk to Sunny';
  };

  const getStatusColor = () => {
    if (isRealtimeConnecting) return '#F59E0B';
    if (!isRealtimeConnected) return '#6B7280';
    if (isListening) return '#3B82F6';
    if (activeFunctionCall) return '#F59E0B';
    if (isSpeaking) return '#10B981';
    return '#A78BFA';
  };

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#16213E']}
        style={styles.backgroundGradient}
      />

      {/* Ambient Background Glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: getStatusColor(),
            opacity: Animated.multiply(fadeAnim, new Animated.Value(0.1)),
          },
        ]}
      />

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
          <Text style={styles.headerTitle}>Sunny</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>
      </Animated.View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Orb Section */}
        <View style={styles.orbSection}>
          <SunnyOrb state={orbState} size={180} />

          {/* Status Text */}
          <Animated.View
            style={[
              styles.statusContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </Animated.View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatSection}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => (
              <Animated.View
                key={idx}
                style={[
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  { opacity: fadeAnim },
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.bubbleIcon}>
                    <Icon name="robot" size={20} color="#A78BFA" />
                  </View>
                )}
                <Text style={msg.role === 'user' ? styles.userText : styles.assistantText}>
                  {msg.content}
                </Text>
              </Animated.View>
            ))}

            {/* Streaming transcript */}
            {currentTranscript && (
              <View style={styles.assistantBubble}>
                <View style={styles.bubbleIcon}>
                  <Icon name="robot" size={20} color="#A78BFA" />
                </View>
                <Text style={styles.assistantText}>{currentTranscript}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Talk Button */}
      <View style={styles.buttonSection}>
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.talkButton,
              isListening && styles.talkButtonActive,
              !isRealtimeConnected && styles.talkButtonDisconnected,
            ]}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            disabled={isRealtimeConnecting}
            activeOpacity={1}
          >
            <LinearGradient
              colors={
                isListening
                  ? ['#3B82F6', '#2563EB']
                  : !isRealtimeConnected
                  ? ['#6B7280', '#4B5563']
                  : ['#7C3AED', '#5B21B6']
              }
              style={styles.buttonGradient}
            >
              {isRealtimeConnecting ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <>
                  <Icon
                    name={isListening ? 'microphone' : 'microphone-outline'}
                    size={40}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isListening ? 'Release to Send' : 'Hold to Talk'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              HapticFeedback.light();
              // Quick weather check
            }}
          >
            <Icon name="weather-sunny" size={24} color="#FBBF24" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              HapticFeedback.light();
              // Quick medication reminder
            }}
          >
            <Icon name="pill" size={24} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              HapticFeedback.light();
              // Quick news check
            }}
          >
            <Icon name="newspaper" size={24} color="#60A5FA" />
          </TouchableOpacity>
        </View>
      </View>
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
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: SCREEN_WIDTH,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  orbSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chatSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.5)',
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    marginBottom: 12,
    maxWidth: '80%',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginBottom: 12,
    maxWidth: '80%',
    flexDirection: 'row',
  },
  bubbleIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  userText: {
    color: '#E9D5FF',
    fontSize: 18,
    lineHeight: 26,
  },
  assistantText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
    flex: 1,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  talkButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  talkButtonActive: {
    shadowColor: '#3B82F6',
  },
  talkButtonDisconnected: {
    shadowColor: '#6B7280',
    shadowOpacity: 0.2,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  quickAction: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default BuddyChatScreen;
