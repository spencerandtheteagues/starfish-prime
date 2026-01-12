/*
 * index.ts
 *
 * Firebase Cloud Functions entry point for the SilverGuard AI Buddy backend.
 * Exposes callable and HTTP functions that proxy requests to the AI pipeline,
 * schedule reports, and perform safe lookups. All models and sensitive keys
 * are managed server-side and never exposed to clients.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { callModel } from './ai/modelRouter';
import { buildPrompt } from './ai/promptEngine';
import { assembleContext } from './ai/contextAssembler';
import { addMemory } from './ai/memoryManager';
import { detectEmergency } from './ai/safetyGate';
import { logEvent } from './ai/loggingEngine';
import { generateReport } from './ai/reportingEngine';
import { lookup } from './ai/lookupService';
import { generateSpeech } from './tts/generateSpeech';
import { createRealtimeSession } from './realtime/createRealtimeSession';

admin.initializeApp();

// Export TTS function
export { generateSpeech };

// Export Realtime API function
export { createRealtimeSession };

/**
 * chat
 *
 * Handles a senior's chat message and returns the AI buddy's response.
 * The request must contain { seniorId, message, wakeReason, subscriptionMode }.
 */
export const chat = functions.https.onCall(async (data, context) => {
  try {
    const { seniorId, message } = data;
    if (!seniorId || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
    }
    // Assemble context for this senior
    const contextData = await assembleContext(seniorId);
    // Build a system prompt describing the current context
    const systemPrompt = JSON.stringify({
      seniorId,
      medications: contextData.medications,
      appointments: contextData.appointments,
      reminders: contextData.reminders,
      avoidanceRules: contextData.avoidanceRules,
    });
    // Construct conversation messages for the model
    const messages = buildPrompt(systemPrompt, [
      { role: 'user', content: message },
    ]);
    // Call the model via the router
    const reply = await callModel({ messages });
    // Detect emergency phrases in the user's message
    const emergency = detectEmergency(message);
    if (emergency) {
      // Log high severity event and notify caregiver via Firestore
      await logEvent({
        seniorId,
        type: 'emergency',
        severity: 5,
        data: { message },
        timestamp: admin.firestore.Timestamp.now(),
      });
      // Optionally send a push notification or create a caregiver alert here
    }
    // Store summary memory (simple example: store user and assistant messages)
    await addMemory(seniorId, {
      content: `USER: ${message}\nASSISTANT: ${reply}`,
      timestamp: admin.firestore.Timestamp.now(),
    });
    // Log chat event
    await logEvent({
      seniorId,
      type: 'chat',
      severity: 1,
      data: { message },
      timestamp: admin.firestore.Timestamp.now(),
    });
    return { reply };
  } catch (error: any) {
    console.error('Chat function error:', error);
    throw new functions.https.HttpsError('internal', 'Chat processing failed.');
  }
});

/**
 * lookup
 *
 * Performs a safe information lookup. Expects { query }.
 */
export const lookupFn = functions.https.onCall(async (data, context) => {
  const { query } = data;
  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Query is required.');
  }
  try {
    const result = await lookup(query);
    return { result };
  } catch (error: any) {
    console.warn('Lookup error for query:', query, error);
    throw new functions.https.HttpsError('not-found', 'No safe information found for query.');
  }
});

/**
 * generateReport
 *
 * Callable function to generate a report on demand. Expects { seniorId, timeframe }.
 */
export const generateReportFn = functions.https.onCall(async (data, context) => {
  const { seniorId, timeframe } = data;
  if (!seniorId || !timeframe) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId and timeframe are required.');
  }
  try {
    const report = await generateReport(seniorId, timeframe);
    return { report };
  } catch (error: any) {
    console.error('Report generation error:', error);
    throw new functions.https.HttpsError('internal', 'Report generation failed.');
  }
});