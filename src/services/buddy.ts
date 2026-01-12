/**
 * AI Buddy Service
 * Client-side integration with Firebase Cloud Functions
 */

import { firebaseFunctions } from './firebase';

/**
 * Chat with Buddy (calls server-side Cloud Function)
 */
export async function chatWithBuddy(
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
    console.error('Error in chatWithBuddy:', error);
    throw error; // Let the UI handle the error (e.g. show "Buddy is sleeping")
  }
}