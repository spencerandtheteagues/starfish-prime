import * as admin from 'firebase-admin';

export async function saveMemory(seniorId: string, memoryItem: { type: string, summary: string }) {
  const db = admin.firestore();
  
  await db.collection('seniors').doc(seniorId).collection('memory').add({
    ...memoryItem,
    createdAt: new Date().toISOString(),
    expiresAt: null // Optional: set expiration based on type
  });
}
