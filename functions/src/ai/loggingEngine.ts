/*
 * loggingEngine.ts
 *
 * Writes log events according to the configured logging level. Logging
 * levels (0–3) define what kinds of events are persisted. This module
 * abstracts writes to Firestore so that other modules can call
 * logEvent() with an event object. Real implementation would filter
 * events based on severity and category.
 */
import * as admin from 'firebase-admin';

export type LogEvent = {
  seniorId: string;
  type: string;
  severity: number;
  data: any;
  timestamp: admin.firestore.Timestamp;
};

export async function logEvent(event: LogEvent) {
  const db = admin.firestore();
  await db.collection('logEvents').add(event);
}