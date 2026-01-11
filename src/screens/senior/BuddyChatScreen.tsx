/**
 * Buddy Chat Screen
 * Voice-first AI companion conversation interface
 * Uses Claude API for empathetic, cognitive-tuned responses
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { speakBuddyMessage, stop as stopTTS } from '../../services/tts';
import { chatWithBuddy, convertToAnthropicMessages } from '../../services/buddy';
import BuddyAvatar, { BuddyEmotion } from '../../components/BuddyAvatar';

type BuddyChatScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'BuddyChat'>;
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tone?: string;
}

const BuddyChatScreen: React.FC<BuddyChatScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<BuddyEmotion>('NEUTRAL');
  const scrollViewRef = useRef<ScrollView>(null);

  const fontScale = senior?.preferences?.fontScale || 1.2;
  const voiceRate = senior?.preferences?.voiceRate || 0.9;
  const userName = user?.name || senior?.profile?.name || 'Friend';
  const firstName = userName.split(' ')[0];

  useEffect(() => {
    // Initial greeting from Buddy
    if (messages.length === 0) {
      const greeting = getGreeting();
      addBuddyMessage(greeting, 'cheerful');
      speakBuddyMessage(greeting, voiceRate);
    }
  }, []);

  const mapToneToEmotion = (tone?: string): BuddyEmotion => {
    switch (tone?.toLowerCase()) {
      case 'cheerful':
      case 'happy':
        return 'HAPPY';
      case 'sad':
      case 'empathetic':
        return 'SAD';
      case 'stern':
      case 'angry':
        return 'ANGRY';
      case 'smug':
      case 'confident':
        return 'SMUG';
      case 'surprised':
        return 'SURPRISED';
      case 'thinking':
        return 'THINKING';
      default:
        return 'NEUTRAL';
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const greetings = [
      `${timeGreeting}, ${firstName}! How are you doing today?`,
      `Hi ${firstName}! It's great to hear from you. How can I help?`,
      `${timeGreeting}! What's on your mind today?`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const addBuddyMessage = (content: string, tone: string = 'neutral') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      tone,
    };
    setMessages((prev) => [...prev, message]);
    setCurrentEmotion(mapToneToEmotion(tone));
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    setCurrentEmotion('NEUTRAL');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleStartListening = async () => {
    setIsListening(true);
    setCurrentEmotion('NEUTRAL');

    Alert.alert(
      'Voice Input',
      'Voice recording will be implemented with expo-av. For now, tap the message button to type.',
      [
        {
          text: 'OK',
          onPress: () => setIsListening(false),
        },
      ]
    );
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleQuickMessage = async (message: string) => {
    if (!senior || !user?.activeSeniorId) {
      Alert.alert('Error', 'Could not connect to Buddy');
      return;
    }

    addUserMessage(message);
    setIsProcessing(true);
    setCurrentEmotion('THINKING');

    try {
      const conversationHistory = convertToAnthropicMessages(
        messages.map((m) => ({ role: m.role, content: m.content }))
      );

      const result = await chatWithBuddy({
        seniorId: user.activeSeniorId,
        caregiverId: senior?.primaryCaregiverUserId || user?.uid || '',
        seniorProfile: senior,
        userName: firstName,
        message,
        conversationHistory,
      });

      setIsProcessing(false);
      addBuddyMessage(result.response, result.tone || 'neutral');

      // Speak the response
      setIsSpeaking(true);
      await speakBuddyMessage(result.response, voiceRate, () => {
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error('Error getting Buddy response:', error);
      setIsProcessing(false);
      setCurrentEmotion('SAD');
      Alert.alert('Error', 'Could not reach your Buddy. Please try again.');
    }
  };

  const handleStopSpeaking = async () => {
    await stopTTS();
    setIsSpeaking(false);
  };

  const quickMessages = [
    { text: 'Hello Buddy', icon: 'hand-wave' },
    { text: 'How are you?', icon: 'emoticon-happy' },
    { text: 'Tell me about my day', icon: 'calendar-today' },
    { text: 'Check my medications', icon: 'pill' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <BuddyAvatar 
            emotion={currentEmotion} 
            isSpeaking={isSpeaking} 
            isProcessing={isProcessing}
            size={80}
          />
          <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
            Buddy
          </Text>
        </View>
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Icon name="volume-high" size={24} color="#7C3AED" />
          </View>
        )}
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userMessageRow : styles.buddyMessageRow,
            ]}
          >
            {message.role === 'assistant' && (
              <BuddyAvatar 
                emotion={mapToneToEmotion(message.tone)} 
                isSpeaking={false} 
                size={50}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.buddyBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { fontSize: 24 * fontScale },
                  message.role === 'user' ? styles.userMessageText : styles.buddyMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
            {message.role === 'user' && (
              <Icon name="account-circle" size={40} color="#2563EB" style={styles.avatar} />
            )}
          </View>
        ))}

        {isProcessing && (
          <View style={styles.processingRow}>
            <BuddyAvatar emotion="THINKING" isSpeaking={false} isProcessing={true} size={50} />
            <View style={styles.processingBubble}>
              <Text style={[styles.processingText, { fontSize: 24 * fontScale }]}>
                Thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hero Avatar (When not much chat is happening) */}
      {messages.length < 3 && !isProcessing && (
        <View style={styles.heroAvatarContainer}>
          <BuddyAvatar 
            emotion={currentEmotion} 
            isSpeaking={isSpeaking} 
            isProcessing={isProcessing}
            size={300}
          />
        </View>
      )}

      {/* Quick Messages */}
      {!isListening && !isSpeaking && messages.length <= 2 && (
        <View style={styles.quickMessagesContainer}>
          <Text style={[styles.quickMessagesTitle, { fontSize: 20 * fontScale }]}>
            Try saying:
          </Text>
          <View style={styles.quickMessagesGrid}>
            {quickMessages.map((quick, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickMessageButton}
                onPress={() => handleQuickMessage(quick.text)}
              >
                <Icon name={quick.icon} size={24} color="#7C3AED" />
                <Text style={[styles.quickMessageText, { fontSize: 18 * fontScale }]}>
                  {quick.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Voice Input Controls */}
      <View style={styles.inputContainer}>
        {isSpeaking ? (
          <TouchableOpacity style={styles.stopSpeakingButton} onPress={handleStopSpeaking}>
            <Icon name="stop-circle" size={48} color="#FFFFFF" />
            <Text style={[styles.stopSpeakingText, { fontSize: 24 * fontScale }]}>
              Stop
            </Text>
          </TouchableOpacity>
        ) : isListening ? (
          <TouchableOpacity
            style={styles.listeningButton}
            onPress={handleStopListening}
          >
            <Icon name="microphone" size={64} color="#FFFFFF" />
            <Text style={[styles.listeningText, { fontSize: 24 * fontScale }]}>
              Listening...
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleStartListening}
            disabled={isProcessing}
          >
            <Icon name="microphone" size={64} color="#FFFFFF" />
            <Text style={[styles.micButtonText, { fontSize: 24 * fontScale }]}>
              Tap to Talk
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  speakingIndicator: {
    padding: 8,
  },
  messagesContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  buddyMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    padding: 16,
  },
  userBubble: {
    backgroundColor: '#2563EB',
  },
  buddyBubble: {
    backgroundColor: '#EDE9FE',
  },
  messageText: {
    fontWeight: '500',
    lineHeight: 32,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  buddyMessageText: {
    color: '#5B21B6',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  processingBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
  },
  processingText: {
    fontWeight: '500',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  quickMessagesContainer: {
    padding: 24,
    paddingTop: 0,
  },
  quickMessagesTitle: {
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  quickMessagesGrid: {
    gap: 12,
  },
  quickMessageButton: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickMessageText: {
    fontWeight: '600',
    color: '#7C3AED',
    marginLeft: 12,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  micButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 80,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  listeningButton: {
    backgroundColor: '#DC2626',
    borderRadius: 80,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  listeningText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  stopSpeakingButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  stopSpeakingText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  heroAvatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200,
  },
});

export default BuddyChatScreen;
