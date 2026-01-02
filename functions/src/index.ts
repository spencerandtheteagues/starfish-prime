/**
 * Firebase Cloud Functions for SilverGuard ElderCare
 * Server-side LLM calls, guardrails, risk detection, and reporting
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { buddyChat } from './buddy/buddyChat';
export { generateDailyReport } from './buddy/dailyReport';
export { sendRiskNotification } from './buddy/notifications';
