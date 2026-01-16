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
import {
  getWeather,
  generalInformationLookup,
  getNews,
  logAndReportDailySeniorStatus,
  integrateEldercareFeatures,
  buildAndLogSeniorProfile,
  emergencyNotifyProtocol,
} from './sunny/sunnyFunctions';
import {
  verifyPurchase,
  restorePurchases,
  handleAppStoreNotification,
  checkSubscriptionStatus,
} from './payments/subscriptionVerifier';

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

// ============================================================================
// SUNNY AI FUNCTIONS - The 7 Core Functions for Real-time Voice Conversations
// ============================================================================

/**
 * sunnyGetWeather - Get weather information for senior's location
 */
export const sunnyGetWeather = functions.https.onCall(async (data, context) => {
  const { seniorId, location } = data;
  if (!seniorId) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId is required.');
  }
  try {
    const result = await getWeather({ seniorId, location });
    return result;
  } catch (error: any) {
    console.error('Weather function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get weather.');
  }
});

/**
 * sunnyLookup - General information lookup with safety filtering
 */
export const sunnyLookup = functions.https.onCall(async (data, context) => {
  const { seniorId, query } = data;
  if (!seniorId || !query) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId and query are required.');
  }
  try {
    const result = await generalInformationLookup({ seniorId, query });
    return result;
  } catch (error: any) {
    console.error('Lookup function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to perform lookup.');
  }
});

/**
 * sunnyGetNews - Get filtered, senior-appropriate news
 */
export const sunnyGetNews = functions.https.onCall(async (data, context) => {
  const { seniorId, category } = data;
  if (!seniorId) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId is required.');
  }
  try {
    const result = await getNews({ seniorId, category });
    return result;
  } catch (error: any) {
    console.error('News function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get news.');
  }
});

/**
 * sunnyLogDailyStatus - Log senior's daily status and report to caregiver
 */
export const sunnyLogDailyStatus = functions.https.onCall(async (data, context) => {
  const { seniorId, mood, activities, mealsEaten, medicationsTaken, concerns, notes } = data;
  if (!seniorId) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId is required.');
  }
  try {
    const result = await logAndReportDailySeniorStatus({
      seniorId,
      mood,
      activities,
      mealsEaten,
      medicationsTaken,
      concerns,
      notes,
    });
    return result;
  } catch (error: any) {
    console.error('Daily status function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to log daily status.');
  }
});

/**
 * sunnyEldercareFeature - Integrate with eldercare features (reminders, alerts, schedule, etc.)
 */
export const sunnyEldercareFeature = functions.https.onCall(async (data, context) => {
  const { seniorId, featureType, action, featureData } = data;
  if (!seniorId || !featureType || !action) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId, featureType, and action are required.');
  }
  try {
    const result = await integrateEldercareFeatures({
      seniorId,
      featureType,
      action,
      data: featureData,
    });
    return result;
  } catch (error: any) {
    console.error('Eldercare feature function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process eldercare feature.');
  }
});

/**
 * sunnyUpdateProfile - Build and update senior profile based on conversations
 */
export const sunnyUpdateProfile = functions.https.onCall(async (data, context) => {
  const { seniorId, dataType, profileData } = data;
  if (!seniorId || !dataType || !profileData) {
    throw new functions.https.HttpsError('invalid-argument', 'seniorId, dataType, and profileData are required.');
  }
  try {
    const result = await buildAndLogSeniorProfile({
      seniorId,
      dataType,
      profileData,
    });
    return result;
  } catch (error: any) {
    console.error('Profile update function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update profile.');
  }
});

/**
 * sunnyEmergency - Handle emergency situations and notify caregivers
 */
export const sunnyEmergency = functions.https.onCall(async (data, context) => {
  const { seniorId, emergencyType, seniorStatement, severity, additionalContext } = data;
  if (!seniorId || !emergencyType || !seniorStatement || severity === undefined) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required emergency parameters.');
  }
  try {
    const result = await emergencyNotifyProtocol({
      seniorId,
      emergencyType,
      seniorStatement,
      severity,
      additionalContext,
    });
    return result;
  } catch (error: any) {
    console.error('Emergency function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process emergency.');
  }
});

/**
 * executeSunnyFunction - Universal function dispatcher for OpenAI Realtime API function calls
 * This is called when Sunny needs to execute one of its 7 functions during a voice conversation
 */
export const executeSunnyFunction = functions.https.onCall(async (data, context) => {
  const { functionName, arguments: args, seniorId } = data;

  if (!functionName || !seniorId) {
    throw new functions.https.HttpsError('invalid-argument', 'functionName and seniorId are required.');
  }

  console.log(`Executing Sunny function: ${functionName} for senior: ${seniorId}`);

  try {
    switch (functionName) {
      case 'get_weather':
        return await getWeather({ seniorId, ...args });

      case 'general_information_lookup':
        return await generalInformationLookup({ seniorId, ...args });

      case 'get_news':
        return await getNews({ seniorId, ...args });

      case 'log_and_report_daily_senior_status':
        return await logAndReportDailySeniorStatus({ seniorId, ...args });

      case 'integrate_eldercare_features':
        return await integrateEldercareFeatures({ seniorId, ...args });

      case 'build_and_log_senior_profile':
        return await buildAndLogSeniorProfile({ seniorId, ...args });

      case 'emergency_notify_protocol':
        return await emergencyNotifyProtocol({ seniorId, ...args });

      default:
        throw new functions.https.HttpsError('invalid-argument', `Unknown function: ${functionName}`);
    }
  } catch (error: any) {
    console.error(`Sunny function ${functionName} error:`, error);
    throw new functions.https.HttpsError('internal', `Function ${functionName} failed: ${error.message}`);
  }
});

// ============================================================================
// PAYMENT & SUBSCRIPTION FUNCTIONS
// ============================================================================

/**
 * verifyApplePurchase - Verify an Apple App Store purchase receipt
 */
export const verifyApplePurchase = functions.https.onCall(async (data, context) => {
  const { transactionId, productId, receiptData } = data;

  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;

  if (!transactionId || !productId || !receiptData) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required purchase data.');
  }

  try {
    const result = await verifyPurchase(userId, receiptData, productId, transactionId);
    return result;
  } catch (error: any) {
    console.error('Purchase verification error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify purchase.');
  }
});

/**
 * restoreApplePurchases - Restore previous Apple purchases
 */
export const restoreApplePurchases = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  const { purchases } = data;

  if (!purchases || !Array.isArray(purchases)) {
    throw new functions.https.HttpsError('invalid-argument', 'Purchases array is required.');
  }

  try {
    const result = await restorePurchases(userId, purchases);
    return result;
  } catch (error: any) {
    console.error('Restore purchases error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to restore purchases.');
  }
});

/**
 * getSubscriptionStatus - Check user's current subscription status
 */
export const getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;

  try {
    const status = await checkSubscriptionStatus(userId);
    return status;
  } catch (error: any) {
    console.error('Subscription status error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get subscription status.');
  }
});

/**
 * appStoreServerNotification - Webhook for Apple App Store Server Notifications
 * This endpoint receives subscription lifecycle events from Apple
 */
export const appStoreServerNotification = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const notification = req.body;

    // Log the notification type
    console.log('App Store notification received:', notification.notification_type);

    // Process the notification
    await handleAppStoreNotification(notification);

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('App Store notification error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * startFreeTrial - Start a 3-day free trial for a new user
 */
export const startFreeTrial = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;

  try {
    // Check if user is eligible for trial (no previous subscriptions)
    const existingSubscription = await admin.firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      return { success: false, error: 'User already has a subscription history' };
    }

    // Create trial subscription
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const trialData = {
      userId,
      tier: 'premium',
      status: 'trial',
      provider: 'system',
      productId: 'trial',
      startDate: admin.firestore.Timestamp.fromDate(now),
      endDate: admin.firestore.Timestamp.fromDate(trialEndDate),
      trialEndDate: admin.firestore.Timestamp.fromDate(trialEndDate),
      priceUsd: 0,
      currency: 'USD',
      autoRenew: false,
      isTrialPeriod: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('subscriptions').add(trialData);

    // Update user record
    await admin.firestore().collection('users').doc(userId).update({
      activeSubscriptionId: docRef.id,
      subscriptionTier: 'premium',
      subscriptionStatus: 'trial',
      trialStartDate: admin.firestore.Timestamp.fromDate(now),
      trialEndDate: admin.firestore.Timestamp.fromDate(trialEndDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Started 3-day trial for user: ${userId}`);

    return {
      success: true,
      subscriptionId: docRef.id,
      trialEndDate: trialEndDate.toISOString(),
    };
  } catch (error: any) {
    console.error('Start trial error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to start trial.');
  }
});

/**
 * checkTrialEligibility - Check if a user is eligible for free trial
 */
export const checkTrialEligibility = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;

  try {
    // Check if user has any subscription history
    const existingSubscription = await admin.firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    return {
      eligible: existingSubscription.empty,
      reason: existingSubscription.empty
        ? 'User is eligible for free trial'
        : 'User has previous subscription history',
    };
  } catch (error: any) {
    console.error('Check eligibility error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check eligibility.');
  }
});