/*
 * contextAssembler.ts
 *
 * The context assembler collects relevant information for the AI to
 * generate responses. It fetches the senior's medications, reminders,
 * appointments, avoidance rules, memory summaries, and any other
 * environment state from Firestore or other services. This is a
 * simplified implementation: adapt it to your Firestore schema. Use
 * dependency injection or function parameters for testability.
 */
import * as admin from 'firebase-admin';

interface SeniorContext {
  seniorId: string;
  medications: any[];
  appointments: any[];
  reminders: any[];
  avoidanceRules: any[];
  memory: any[];
}

/**
 * assembleContext
 *
 * Fetch senior-specific data from Firestore. This example expects
 * collections `medications`, `appointments`, `reminders`, `avoidanceRules`,
 * and `memory` nested under the senior document. Adjust to your schema.
 */
export async function assembleContext(seniorId: string): Promise<SeniorContext> {
  const db = admin.firestore();
  const baseRef = db.collection('seniors').doc(seniorId);
  const [medsSnap, appsSnap, remsSnap, avoidSnap, memorySnap] = await Promise.all([
    baseRef.collection('medications').get(),
    baseRef.collection('appointments').get(),
    baseRef.collection('reminders').get(),
    baseRef.collection('avoidanceRules').get(),
    baseRef.collection('memory').get(),
  ]);
  return {
    seniorId,
    medications: medsSnap.docs.map(d => d.data()),
    appointments: appsSnap.docs.map(d => d.data()),
    reminders: remsSnap.docs.map(d => d.data()),
    avoidanceRules: avoidSnap.docs.map(d => d.data()),
    memory: memorySnap.docs.map(d => d.data()),
  };
}