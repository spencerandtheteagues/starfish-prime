/**
 * AI Buddy Service
 * Client-side integration with Firebase Cloud Functions for AI chat
 */

import { firebaseFunctions } from './firebase';

// ============================================================================
// TEXT-BASED CHAT FUNCTIONS (via Firebase Cloud Functions)
// ============================================================================

/**
 * Send a text message to Buddy and get a text reply (calls server-side Cloud Function)
 */
export async function sendBuddyTextMessage(
  seniorId: string,
  message: string,
  wakeReason: string = 'manual'
): Promise<string> {
  try {
    const chatFunction = firebaseFunctions.httpsCallable('chat');
    
    // Call new backend function signature
    const result = await chatFunction({
      seniorId,
      message,
      wakeReason,
      subscriptionMode: 'basic', // Default, should ideally come from profile
    });

    const data = result.data as { reply: string };
    return data.reply;
  } catch (error) {
    console.error('Error in sendBuddyTextMessage:', error);
    throw error; // Let the UI handle the error (e.g. show "Buddy is sleeping")
  }
}

// ============================================================================
// ALIAS FOR COMPATIBILITY
// ============================================================================

/**
 * Alias for sendBuddyTextMessage to maintain compatibility
 */
export const chatWithBuddy = sendBuddyTextMessage;

// ============================================================================
// REALTIME VOICE FUNCTIONS
// ============================================================================

export { realtimeService } from './realtime';