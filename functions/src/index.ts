/**
 * Firebase Cloud Functions for SilverGuard ElderCare
 * Server-side LLM calls, guardrails, risk detection, and reporting
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin with Service Account
// const serviceAccount = require('../service-account.json');

try {
  const serviceAccount = require('../service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized with service account.');
} catch (error) {
  console.warn('Failed to load service-account.json, falling back to default credentials:', error);
  admin.initializeApp();
}

// Export all functions
export { buddyChat } from './buddy/buddyChat';
export { generateDailyReport } from './buddy/dailyReport';
export { sendRiskNotification } from './buddy/notifications';
