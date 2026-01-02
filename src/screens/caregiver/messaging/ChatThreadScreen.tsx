/**
 * Chat Thread Screen
 * Send and receive messages with senior
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, Message } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { subscribeToMessages, sendMessage, markThreadAsRead } from '../../../services/messaging';
import { formatTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';

type ChatThreadScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'ChatThread'>;
  route: RouteProp<CaregiverStackParamList, 'ChatThread'>;
};

const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({ navigation, route }) => {
  const { threadId } = route.params;
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [requiresVoiceRead, setRequiresVoiceRead] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      threadId,
      (msgs) => {
        setMessages(msgs);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      },
      (error) => console.error('Messages error:', error)
    );

    // Mark as read
    if (user?.uid) {
      markThreadAsRead(threadId, user.uid);
    }

    return () => unsubscribe();
  }, [threadId, user?.uid]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.activeSeniorId || !user?.uid) return;

    setSending(true);

    try {
      await sendMessage({
        seniorId: user.activeSeniorId,
        senderUserId: user.uid,
        senderRole: 'caregiver',
        text: inputText.trim(),
        requiresVoiceRead,
        urgency: 'normal',
      });

      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderRole === 'caregiver';

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe ? styles.myTimeText : styles.theirTimeText]}>
              {formatTime(item.createdAt)}
            </Text>
            {item.requiresVoiceRead && isMe && (
              <Icon name="volume-high" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.headerTitle}>{seniorName}</Text>
          <Text style={styles.headerSubtitle}>Messages</Text>
        </View>
        <Icon name="account-circle" size={40} color={FamilyColors.primary.purple} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.voiceToggle, requiresVoiceRead && styles.voiceToggleActive]}
            onPress={() => setRequiresVoiceRead(!requiresVoiceRead)}
          >
            <Icon
              name="volume-high"
              size={20}
              color={requiresVoiceRead ? '#FFFFFF' : FamilyColors.gray[600]}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${seniorName}...`}
            placeholderTextColor={FamilyColors.gray[400]}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Icon
              name="send"
              size={20}
              color={inputText.trim() ? '#FFFFFF' : FamilyColors.gray[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Voice Read Indicator */}
        {requiresVoiceRead && (
          <View style={styles.voiceReadIndicator}>
            <Icon name="information" size={14} color={FamilyColors.primary.purple} />
            <Text style={styles.voiceReadText}>
              Message will be read aloud to {seniorName}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
  messagesList: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  myBubble: {
    backgroundColor: FamilyColors.primary.purple,
  },
  theirBubble: {
    backgroundColor: FamilyColors.surface,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: FamilyColors.gray[900],
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  myTimeText: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  theirTimeText: {
    color: FamilyColors.gray[600],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: FamilyColors.surface,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
  voiceToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FamilyColors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceToggleActive: {
    backgroundColor: FamilyColors.primary.purple,
  },
  input: {
    flex: 1,
    backgroundColor: FamilyColors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.gray[900],
    maxHeight: 100,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FamilyColors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: FamilyColors.gray[200],
  },
  voiceReadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: FamilyColors.primary.purple + '10',
  },
  voiceReadText: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.primary.purple,
    marginLeft: 6,
  },
});

export default ChatThreadScreen;
