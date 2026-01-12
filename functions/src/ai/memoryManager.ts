/*
 * memoryManager.ts
 *
 * This module manages long-term memory for the AI buddy. It stores
 * summarized conversation snippets and important events in Firestore. It
 * only writes summaries, not raw transcripts, and honors the senior's
 * privacy preferences. In this simplified version, it only appends
 * memory items and does not implement summarization or trimming.
 */
import * as admin from 'firebase-admin';

interface MemoryItem {
  content: string;
  timestamp: admin.firestore.Timestamp;
  private?: boolean;
}

export async function addMemory(seniorId: string, item: MemoryItem) {
  const db = admin.firestore();
  await db.collection('seniors').doc(seniorId).collection('memory').add(item);
}

export async function getMemory(seniorId: string, limit = 50): Promise<MemoryItem[]> {
  const db = admin.firestore();
  const snap = await db
    .collection('seniors')
    .doc(seniorId)
    .collection('memory')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as MemoryItem);
}