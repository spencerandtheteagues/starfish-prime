import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import { chatWithBuddy } from '../../services/buddy';
import { speakBuddyMessage, stop as stopSpeaking } from '../../services/tts';
import { useCurrentUser } from '../../state/useCurrentUser';
import { SeniorColors } from '../../design/colors';
import BuddyAvatar from '../../components/BuddyAvatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Emotion = 'NEUTRAL' | 'HAPPY' | 'THINKING';

/**
 * BuddyChatScreen (Senior)
 *
 * This screen provides a conversational interface between the senior and their AI buddy.
 */
const BuddyChatScreen: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your buddy. How are you feeling today?' },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wakeListening, setWakeListening] = useState(true);
  const [emotion, setEmotion] = useState('NEUTRAL');

  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useCurrentUser();
  const seniorId = user?.role === 'senior' ? (user.activeSeniorId || user.uid) : null;

  // Speak initial greeting on mount
  useEffect(() => {
    const speakIntro = async () => {
      setIsSpeaking(true);
      setEmotion('HAPPY');
      await speakBuddyMessage('Hello! I am your buddy. How are you feeling today?');
      setIsSpeaking(false);
      setEmotion('NEUTRAL');
    };
    // Small delay to ensure engine is ready
    const timer = setTimeout(() => {
        speakIntro();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sends a message to the buddy and handles the response.
  const handleSend = async (text: string) => {
    if (!seniorId) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsSpeaking(true);
    setEmotion('THINKING');

    try {
      // Call updated service
      const response = await chatWithBuddy(seniorId, text, 'manual');
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      setEmotion('HAPPY');
      await speakBuddyMessage(response);
    } catch (e) {
      console.warn('Chat error', e);
      setMessages(prev => [...prev, { role: 'assistant', content: "I am having trouble connecting right now. Please try again later." }]);
      await speakBuddyMessage("I am having trouble connecting right now. Please try again later.");
    } finally {
      setIsSpeaking(false);
      setEmotion('NEUTRAL');
    }
  };

  // Start speech recognition
  const handleStartListening = async () => {
    try {
      await stopSpeaking(); // Stop TTS if talking
      setIsSpeaking(false);
      setIsListening(true);
      setWakeListening(false);
      await Voice.start('en-US');
    } catch (e) {
      console.warn('Failed to start voice recognition', e);
      setIsListening(false);
    }
  };

  // Send the captured speech text
  const handleSendVoiceMessage = async (text: string) => {
    if (!text) {
      setIsListening(false);
      return;
    }
    try {
      setIsListening(false);
      await handleSend(text);
    } catch (e) {
      console.warn('Error sending voice message', e);
    }
  };

  useEffect(() => {
    const onSpeechResults = (event: any) => {
      const results = event.value || [];
      const transcript = results.join(' ').toLowerCase().trim();
      if (!transcript) return;

      // Hands‑free wake listening
      if (wakeListening && !isSpeaking) {
        if (transcript.includes('buddy')) {
          const parts = transcript.split('buddy');
          const message = parts[parts.length - 1].trim();
          setWakeListening(false);
          setIsListening(true);
          handleSendVoiceMessage(message);
        }
        return;
      }

      // Manual listening
      if (isListening && !isSpeaking) {
        handleSendVoiceMessage(transcript);
      }
    };

    const onSpeechEnd = () => {
      setIsListening(false);
      if (!isSpeaking) {
        setWakeListening(true);
      }
    };

    const onSpeechError = (event: any) => {
      // console.warn('Speech error', event.error); // Suppress noise
      setIsListening(false);
      setWakeListening(true);
    };

    const onSpeechVolumeChanged = (event: any) => {
      // Suppress warning by handling event
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, [isSpeaking, wakeListening, isListening, seniorId]);

  // Start wake listener
  useEffect(() => {
    const startWakeListening = async () => {
      try {
        await Voice.start('en-US');
      } catch (e) {
        // ignore
      }
    };
    if (wakeListening && !isListening && !isSpeaking) {
      startWakeListening();
    }
  }, [wakeListening, isListening, isSpeaking]);

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch { }
    setIsListening(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (!user) {
     return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <BuddyAvatar
            emotion={emotion}
            isSpeaking={isSpeaking}
            isProcessing={emotion === 'THINKING'}
            size={200}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={msg.role === 'user' ? styles.userBubble : styles.buddyBubble}
          >
            <Text style={msg.role === 'user' ? styles.userText : styles.buddyText}>
              {msg.content}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        <TouchableOpacity
          style={isListening ? styles.listeningButton : styles.microphoneButton}
          onPress={isListening ? stopListening : handleStartListening}
        >
          <Text style={styles.buttonText}>{isListening ? 'Stop Listening' : 'Talk to Buddy'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFF9C4', // Match avatar bg slightly
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: SeniorColors.primary.blue,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  buddyBubble: {
    alignSelf: 'flex-start',
    backgroundColor: SeniorColors.gray[200],
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userText: {
    color: '#fff',
    fontSize: 18,
  },
  buddyText: {
    color: '#1a202c',
    fontSize: 18,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#edf2f7',
    paddingBottom: 30,
  },
  microphoneButton: {
    backgroundColor: SeniorColors.primary.blue,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  listeningButton: {
    backgroundColor: SeniorColors.error.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default BuddyChatScreen;
