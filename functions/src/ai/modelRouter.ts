import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize API clients
const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.key || process.env.ANTHROPIC_API_KEY,
});

const genAI = new GoogleGenerativeAI(
  functions.config().google?.ai_key || process.env.GOOGLE_AI_KEY || ''
);

const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY || '',
});

// Budget tracking configuration (from integration package)
const BUDDY_PLUS_DAILY_TOKEN_BUDGET = 20000;
// const BUDDY_PLUS_DAILY_VOICE_MINUTES = 20; // Reserved for future voice minute tracking

export interface CallModelOptions {
  provider?: 'anthropic' | 'openai' | 'google' | 'gemini';
  model?: string;
  messages: any[];
  system?: string;
  jsonOnly?: boolean;
  timeoutMs?: number;
  budget?: {
    daily_token_budget: number;
  };
  seniorId: string;
}

/**
 * Check and update budget for a senior
 * Returns true if within budget, false if exceeded
 */
async function checkAndUpdateBudget(seniorId: string, estimatedTokens: number): Promise<boolean> {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const budgetRef = db.collection('seniors').doc(seniorId).collection('budgets').doc(today);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const budgetDoc = await transaction.get(budgetRef);

      if (!budgetDoc.exists) {
        // Create new budget for today
        transaction.set(budgetRef, {
          date: today,
          tokensUsed: estimatedTokens,
          voiceMinutesUsed: 0,
          limit: BUDDY_PLUS_DAILY_TOKEN_BUDGET,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return true;
      }

      const data = budgetDoc.data()!;
      const newTokensUsed = (data.tokensUsed || 0) + estimatedTokens;

      if (newTokensUsed > BUDDY_PLUS_DAILY_TOKEN_BUDGET) {
        console.warn(`Budget exceeded for senior ${seniorId}: ${newTokensUsed}/${BUDDY_PLUS_DAILY_TOKEN_BUDGET}`);
        return false;
      }

      transaction.update(budgetRef, {
        tokensUsed: newTokensUsed,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      return true;
    });

    return result;
  } catch (error) {
    console.error('Budget check failed:', error);
    // Allow the request on budget check failure to avoid blocking users
    return true;
  }
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(messages: any[], system?: string): number {
  const allText = messages.map(m => m.content).join(' ') + (system || '');
  // Rough estimate: ~4 characters per token
  return Math.ceil(allText.length / 4);
}

export async function callModel(options: CallModelOptions) {
  const { provider = 'anthropic', messages, system, jsonOnly = true, seniorId } = options;

  // Check budget before making API call
  const estimatedTokens = estimateTokens(messages, system);
  const withinBudget = await checkAndUpdateBudget(seniorId, estimatedTokens);

  if (!withinBudget) {
    // Return budget-exceeded response
    return JSON.stringify({
      assistant_text: "I've reached my daily conversation limit. We can chat again tomorrow!",
      tone: "calm",
      actions: [],
      log_payload: {
        conversation_quality: "budget_exceeded",
        mood_detected: "neutral",
        topics: []
      },
      caregiver_note: "Daily token budget exceeded"
    });
  }

  if (provider === 'anthropic') {
    try {
      const response = await anthropic.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: system,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      });

      const textBlock = response.content.find(block => block.type === 'text');
      let text = (textBlock as any)?.text || '';

      if (jsonOnly) {
        // Extract JSON from response
        try {
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
            // Validate it's valid JSON
            JSON.parse(text);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (e) {
          console.error('Failed to extract valid JSON from response:', text);
          // Return fallback JSON
          return JSON.stringify({
            assistant_text: "I'm having trouble thinking clearly right now. Could you repeat that?",
            tone: "calm",
            actions: [],
            log_payload: {},
            caregiver_note: "JSON parsing error in model response"
          });
        }
      }

      return text;

    } catch (error: any) {
      console.error('Anthropic API error:', error);

      // Return fallback response on API error
      return JSON.stringify({
        assistant_text: "I'm having a little trouble right now. Let me try again in a moment.",
        tone: "calm",
        actions: [],
        log_payload: {},
        caregiver_note: `API error: ${error.message}`
      });
    }
  }

  if (provider === 'google' || provider === 'gemini') {
    try {
      // Use Gemini 2.0 Flash for native voice-to-voice support
      const model = genAI.getGenerativeModel({
        model: options.model || 'gemini-2.0-flash-exp',
        systemInstruction: system
      });

      // Convert messages to Gemini format
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Generate content with JSON mode
      const result = await model.generateContent({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: jsonOnly ? 'application/json' : 'text/plain'
        }
      });

      const response = result.response;
      let text = response.text();

      if (jsonOnly) {
        try {
          // Validate JSON
          JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse Gemini response as JSON:', text);
          // Return fallback JSON
          return JSON.stringify({
            assistant_text: "I'm having trouble thinking clearly right now. Could you repeat that?",
            tone: "calm",
            actions: [],
            log_payload: {},
            caregiver_note: "JSON parsing error in Gemini response"
          });
        }
      }

      return text;

    } catch (error: any) {
      console.error('Gemini API error:', error);

      // Return fallback response on API error
      return JSON.stringify({
        assistant_text: "I'm having a little trouble right now. Let me try again in a moment.",
        tone: "calm",
        actions: [],
        log_payload: {},
        caregiver_note: `Gemini API error: ${error.message}`
      });
    }
  }

  if (provider === 'openai') {
    try {
      // Build messages array with system message
      const openaiMessages: any[] = [];

      if (system) {
        openaiMessages.push({ role: 'system', content: system });
      }

      openaiMessages.push(...messages.map(m => ({
        role: m.role,
        content: m.content
      })));

      // Call OpenAI Chat Completions API
      const completion = await openai.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1024,
        response_format: jsonOnly ? { type: 'json_object' } : undefined
      });

      const text = completion.choices[0]?.message?.content || '';

      if (jsonOnly) {
        try {
          // Validate JSON
          JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse OpenAI response as JSON:', text);
          // Return fallback JSON
          return JSON.stringify({
            assistant_text: "I'm having trouble thinking clearly right now. Could you repeat that?",
            tone: "calm",
            actions: [],
            log_payload: {},
            caregiver_note: "JSON parsing error in OpenAI response"
          });
        }
      }

      return text;

    } catch (error: any) {
      console.error('OpenAI API error:', error);

      // Return fallback response on API error
      return JSON.stringify({
        assistant_text: "I'm having a little trouble right now. Let me try again in a moment.",
        tone: "calm",
        actions: [],
        log_payload: {},
        caregiver_note: `OpenAI API error: ${error.message}`
      });
    }
  }

  throw new Error(`Unknown provider: ${provider}`);
}
