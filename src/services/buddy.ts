/**
 * AI Buddy Service
 * Server-side Claude API integration via Firebase Cloud Functions
 * Includes guardrails, risk detection, and caregiver notifications
 */

import { firebaseFunctions } from './firebase';
import { SeniorProfile } from '../types';

/**
 * Risk flag interface (from server)
 */
export interface RiskFlag {
  type: 'self_harm' | 'depression' | 'missed_meds' | 'pain' | 'confusion' | 'dementia_signs' | 'other';
  severity: 'low' | 'med' | 'high';
  excerpt: string;
  confidence: number;
}

/**
 * Buddy action interface (from server)
 */
export interface BuddyAction {
  type: 'OPEN_SCREEN';
  screen: string;
}

/**
 * Chat with Buddy (calls server-side Cloud Function)
 * Server handles: LLM call, guardrails, risk detection, notifications
 */
export async function chatWithBuddy(params: {
  seniorId: string;
  caregiverId: string;
  seniorProfile: SeniorProfile;
  userName: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{
  response: string;
  tone?: string;
  flags?: RiskFlag[];
  actions?: BuddyAction[];
}> {
  const { seniorId, caregiverId, seniorProfile, userName, message, conversationHistory = [] } = params;

  try {
    // Call server-side Cloud Function
    const buddyChatFunction = firebaseFunctions.httpsCallable('buddyChat');

    const result = await buddyChatFunction({
      seniorId,
      caregiverId,
      message,
      seniorProfile: {
        name: userName,
        cognitive: seniorProfile.cognitive,
      },
      conversationHistory,
    });

    const data = result.data as {
      reply: string;
      tone?: string;
      flags: RiskFlag[];
      actions: BuddyAction[];
    };

    return {
      response: data.reply,
      tone: data.tone,
      flags: data.flags.length > 0 ? data.flags : undefined,
      actions: data.actions.length > 0 ? data.actions : undefined,
    };
  } catch (error) {
    console.error('Error in chatWithBuddy:', error);
    throw error;
  }
}

/**
 * Convert conversation messages to Anthropic API format
 * Ensures role types are strictly 'user' or 'assistant'
 */
export function convertToAnthropicMessages(
  messages: Array<{ role: string; content: string }>
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}
