/**
 * Logs Service
 * Access AI Buddy conversation logs (privacy-respecting)
 */

import { firebaseFirestore } from './firebase';

// ============================================================================
// TYPES
// ============================================================================

export interface AILog {
  id: string;
  seniorId: string;
  timestamp: Date;
  category: string;
  severity: 1 | 2 | 3 | 4 | 5;
  summary: string;
  structured: {
    mood?: string;
    topics?: string[];
    concerns?: string[];
    [key: string]: any;
  };
}

// ============================================================================
// LOGS READ OPERATIONS (Server creates, client reads)
// ============================================================================

/**
 * Subscribe to logs for a senior (real-time)
 */
export function subscribeLogs(
  seniorId: string,
  category?: string,
  severity?: number,
  onUpdate?: (logs: AILog[]) => void,
  onError?: (error: Error) => void
): () => void {
  let query = firebaseFirestore.collection('seniors').doc(seniorId).collection('logs');

  // Filter by category if specified
  if (category) {
    query = query.where('category', '==', category) as any;
  }

  // Filter by minimum severity if specified
  if (severity) {
    query = query.where('severity', '>=', severity) as any;
  }

  // Order by timestamp descending (most recent first)
  query = query.orderBy('timestamp', 'desc').limit(100) as any;

  const unsubscribe = query.onSnapshot(
    (snapshot) => {
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        };
      }) as AILog[];

      onUpdate?.(logs);
    },
    (error) => {
      console.error('Error subscribing to logs:', error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Get a single log by ID
 */
export async function getLog(seniorId: string, logId: string): Promise<AILog | null> {
  const snapshot = await firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('logs')
    .doc(logId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    timestamp: data?.timestamp?.toDate?.() || new Date(data?.timestamp),
  } as AILog;
}

/**
 * Get recent logs (last N entries)
 */
export async function getRecentLogs(seniorId: string, limit: number = 50): Promise<AILog[]> {
  const snapshot = await firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('logs')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
    };
  }) as AILog[];
}

/**
 * Subscribe to high-severity logs only (severity >= 4)
 */
export function subscribeHighSeverityLogs(
  seniorId: string,
  onUpdate: (logs: AILog[]) => void,
  onError?: (error: Error) => void
): () => void {
  return subscribeLogs(seniorId, undefined, 4, onUpdate, onError);
}

/**
 * Subscribe to logs by category (e.g., 'medication', 'mood', 'activity')
 */
export function subscribeLogsByCategory(
  seniorId: string,
  category: string,
  onUpdate: (logs: AILog[]) => void,
  onError?: (error: Error) => void
): () => void {
  return subscribeLogs(seniorId, category, undefined, onUpdate, onError);
}
