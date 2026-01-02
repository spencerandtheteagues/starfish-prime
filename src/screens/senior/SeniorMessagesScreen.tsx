/**
 * Senior Messages Screen
 * View messages from Care Team with voice read-aloud
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList, Message } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { subscribeToMessages, threadIdForSenior, markThreadAsRead } from '../../services/messaging';
import { readCaregiverMessage, stop as stopTTS } from '../../services/tts';
import { formatTime, formatDate } from '../../utils/date';

type SeniorMessagesScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorMessages'>;
};

const SeniorMessagesScreen: React.FC<SeniorMessagesScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReading, setIsReading] = useState(false);

  const fontScale = senior?.preferences?.fontScale || 1.2;
  const voiceRate = senior?.preferences?.voiceRate || 0.9;

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const threadId = threadIdForSenior(user.activeSeniorId);
    const unsubscribe = subscribeToMessages(
      threadId,
      (msgs) => setMessages(msgs),
      (error) => console.error('Messages error:', error)
    );

    // Mark as read
    markThreadAsRead(threadId, user.activeSeniorId);

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleReadMessage = async (message: Message) => {
    setSelectedMessage(message);
    setIsReading(true);

    try {
      await readCaregiverMessage(
        'Care Team', // You could fetch actual sender name
        message.text,
        voiceRate,
        () => {
          setIsReading(false);
        }
      );
    } catch (error) {
      console.error('Error reading message:', error);
      setIsReading(false);
    }
  };

  const handleStopReading = async () => {
    await stopTTS();
    setIsReading(false);
    setSelectedMessage(null);
  };

  const caregiverMessages = messages.filter((m) => m.senderRole === 'caregiver');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          Messages
        </Text>
      </View>

      {caregiverMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="message-text-outline" size={80} color="#9CA3AF" />
          <Text style={[styles.emptyText, { fontSize: 28 * fontScale }]}>
            No Messages
          </Text>
          <Text style={[styles.emptySubtext, { fontSize: 20 * fontScale }]}>
            Messages from your care team will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={caregiverMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.messageCard}
              onPress={() => handleReadMessage(item)}
            >
              <View style={styles.messageHeader}>
                <Icon name="account-circle" size={48} color="#7C3AED" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.messageSender, { fontSize: 24 * fontScale }]}>
                    Care Team
                  </Text>
                  <Text style={[styles.messageTime, { fontSize: 18 * fontScale }]}>
                    {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
                  </Text>
                </View>
                <Icon name="volume-high" size={32} color="#7C3AED" />
              </View>
              <Text style={[styles.messageText, { fontSize: 24 * fontScale }]} numberOfLines={3}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Read Aloud Modal */}
      <Modal
        visible={!!selectedMessage && isReading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="volume-high" size={80} color="#7C3AED" />
            <Text style={[styles.modalTitle, { fontSize: 32 * fontScale }]}>
              Reading Message...
            </Text>
            <Text style={[styles.modalMessage, { fontSize: 24 * fontScale }]}>
              {selectedMessage?.text}
            </Text>
            <TouchableOpacity style={styles.stopButton} onPress={handleStopReading}>
              <Text style={[styles.stopButtonText, { fontSize: 28 * fontScale }]}>
                Stop
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  messageList: {
    padding: 24,
  },
  messageCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageSender: {
    fontWeight: '700',
    color: '#5B21B6',
  },
  messageTime: {
    fontWeight: '500',
    color: '#6B21A8',
    marginTop: 4,
  },
  messageText: {
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 16,
    marginBottom: 16,
  },
  modalMessage: {
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 60,
  },
  stopButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SeniorMessagesScreen;
