/**
 * Messaging Service
 * Thread management and message sending/receiving
 */

import {
  threadsCollection,
  threadDoc,
  messagesCollection,
  threadIdForSenior,
  serverTimestamp,
  arrayUnion,
} from './firebase';
import { Thread, Message, MessageSenderRole, MessageUrgency } from '../types';

// ============================================================================
// CREATE OR GET THREAD
// ============================================================================

export const createOrGetThread = async (
  seniorId: string,
  caregiverUserId: string
): Promise<string> => {
  const threadId = threadIdForSenior(seniorId);
  const threadRef = threadDoc(threadId);

  try {
    const threadSnap = await threadRef.get();

    if (!threadSnap.exists) {
      // Create new thread
      await threadRef.set({
        seniorId,
        participants: [seniorId, caregiverUserId],
        participantRoles: {
          [seniorId]: 'senior',
          [caregiverUserId]: 'caregiver',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCounts: {},
      });
    } else {
      // Add caregiver to participants if not already there
      const threadData = threadSnap.data() as any;
      if (!threadData.participants.includes(caregiverUserId)) {
        await threadRef.update({
          participants: arrayUnion(caregiverUserId),
          [`participantRoles.${caregiverUserId}`]: 'caregiver',
        });
      }
    }

    return threadId;
  } catch (error) {
    console.error('Create or get thread error:', error);
    throw error;
  }
};

// ============================================================================
// SEND MESSAGE
// ============================================================================

export interface SendMessageParams {
  seniorId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  text: string;
  requiresVoiceRead?: boolean; // Caregiver → Senior (TTS)
  awaitingVoiceReply?: boolean; // Caregiver wants a response
  urgency?: MessageUrgency;
}

export const sendMessage = async (params: SendMessageParams): Promise<void> => {
  const threadId = threadIdForSenior(params.seniorId);

  try {
    // Ensure thread exists
    if (params.senderRole === 'caregiver') {
      await createOrGetThread(params.seniorId, params.senderUserId);
    }

    // Create message
    const messageRef = messagesCollection(threadId).doc();

    await messageRef.set({
      seniorId: params.seniorId,
      threadId,
      senderUserId: params.senderUserId,
      senderRole: params.senderRole,
      type: 'text',
      text: params.text.trim(),
      createdAt: serverTimestamp(),
      requiresVoiceRead: params.requiresVoiceRead || false,
      awaitingVoiceReply: params.awaitingVoiceReply || false,
      urgency: params.urgency || 'normal',
    });

    console.log('Message sent successfully');
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// ============================================================================
// MARK MESSAGES AS READ
// ============================================================================

export const markThreadAsRead = async (
  threadId: string,
  userId: string
): Promise<void> => {
  try {
    const threadRef = threadDoc(threadId);

    await threadRef.update({
      [`unreadCounts.${userId}`]: 0,
    });

    console.log('Thread marked as read');
  } catch (error) {
    console.error('Mark thread as read error:', error);
    throw error;
  }
};

// ============================================================================
// LISTEN TO THREAD
// ============================================================================

export const subscribeToThread = (
  threadId: string,
  onUpdate: (thread: Thread) => void,
  onError?: (error: Error) => void
) => {
  return threadDoc(threadId).onSnapshot(
    (snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data() as any;
        const thread: Thread = {
          id: snapshot.id,
          seniorId: data.seniorId,
          participants: data.participants || [],
          participantRoles: data.participantRoles || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessageAt: data.lastMessageAt?.toDate(),
          lastMessagePreview: data.lastMessagePreview,
          lastSenderUserId: data.lastSenderUserId,
          lastSenderRole: data.lastSenderRole,
          unreadCounts: data.unreadCounts || {},
        };
        onUpdate(thread);
      }
    },
    (error) => {
      console.error('Thread subscription error:', error);
      if (onError) onError(error);
    }
  );
};

// ============================================================================
// LISTEN TO MESSAGES
// ============================================================================

export const subscribeToMessages = (
  threadId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (error: Error) => void,
  limit: number = 50
) => {
  return messagesCollection(threadId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .onSnapshot(
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            seniorId: data.seniorId,
            threadId: data.threadId,
            senderUserId: data.senderUserId,
            senderRole: data.senderRole,
            type: data.type,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            requiresVoiceRead: data.requiresVoiceRead || false,
            awaitingVoiceReply: data.awaitingVoiceReply || false,
            urgency: data.urgency || 'normal',
          };
        });

        // Reverse to show oldest first
        onUpdate(messages.reverse());
      },
      (error) => {
        console.error('Messages subscription error:', error);
        if (onError) onError(error);
      }
    );
};

// ============================================================================
// GET THREAD FOR SENIOR
// ============================================================================

export const getThreadForSenior = async (seniorId: string): Promise<Thread | null> => {
  const threadId = threadIdForSenior(seniorId);

  try {
    const threadSnap = await threadDoc(threadId).get();

    if (!threadSnap.exists) {
      return null;
    }

    const data = threadSnap.data() as any;

    return {
      id: threadSnap.id,
      seniorId: data.seniorId,
      participants: data.participants || [],
      participantRoles: data.participantRoles || {},
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastMessageAt: data.lastMessageAt?.toDate(),
      lastMessagePreview: data.lastMessagePreview,
      lastSenderUserId: data.lastSenderUserId,
      lastSenderRole: data.lastSenderRole,
      unreadCounts: data.unreadCounts || {},
    };
  } catch (error) {
    console.error('Get thread for senior error:', error);
    return null;
  }
};

export default {
  createOrGetThread,
  sendMessage,
  markThreadAsRead,
  subscribeToThread,
  subscribeToMessages,
  getThreadForSenior,
  threadIdForSenior,
};
