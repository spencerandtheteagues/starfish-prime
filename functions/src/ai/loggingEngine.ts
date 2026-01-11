import * as admin from 'firebase-admin';

export async function logEvent(seniorId: string, logPayload: any, level: number) {
  if (level === 0) return; // Level 0 is minimal, maybe no logging
  
  const db = admin.firestore();
  await db.collection('seniors').doc(seniorId).collection('logs').add({
    timestamp: new Date().toISOString(),
    category: logPayload.category || 'GENERAL',
    severity: logPayload.severity || 1,
    summary: logPayload.summary || 'No summary',
    structured: logPayload.structured || {},
    loggingLevel: level
  });
}
