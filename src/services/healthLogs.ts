/**
 * Health Logs Service
 * CRUD operations for health metrics tracking
 */

import { firebaseFirestore } from './firebase';
import { HealthLog, HealthLogType } from '../types';

// Re-export types for convenience
export { HealthLog, HealthLogType } from '../types';

// ============================================================================
// HEALTH LOG CRUD OPERATIONS
// ============================================================================

export interface CreateHealthLogParams {
  seniorId: string;
  type: HealthLogType;
  value: any; // number or object (e.g., { systolic: 120, diastolic: 80 })
  unit: string;
  notes?: string;
  timestamp?: Date;
}

/**
 * Create a new health log entry
 */
export async function createHealthLog(params: CreateHealthLogParams): Promise<string> {
  const healthLogRef = firebaseFirestore.collection('healthLogs').doc();

  const healthLog: Omit<HealthLog, 'id'> = {
    seniorId: params.seniorId,
    type: params.type,
    value: params.value,
    unit: params.unit,
    notes: params.notes,
    timestamp: params.timestamp || new Date(),
    createdAt: new Date(),
  };

  await healthLogRef.set(healthLog);
  return healthLogRef.id;
}

/**
 * Update an existing health log
 */
export async function updateHealthLog(
  logId: string,
  updates: Partial<Omit<HealthLog, 'id' | 'seniorId' | 'createdAt'>>
): Promise<void> {
  await firebaseFirestore.collection('healthLogs').doc(logId).update(updates);
}

/**
 * Delete a health log
 */
export async function deleteHealthLog(logId: string): Promise<void> {
  await firebaseFirestore.collection('healthLogs').doc(logId).delete();
}

/**
 * Get a single health log by ID
 */
export async function getHealthLog(logId: string): Promise<HealthLog | null> {
  const snapshot = await firebaseFirestore.collection('healthLogs').doc(logId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    timestamp: data?.timestamp?.toDate?.() || new Date(data?.timestamp),
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
  } as HealthLog;
}

/**
 * Subscribe to all health logs for a senior (real-time)
 */
export function subscribeHealthLogs(
  seniorId: string,
  type?: HealthLogType,
  timeRange?: { start: Date; end: Date },
  onUpdate?: (logs: HealthLog[]) => void,
  onError?: (error: Error) => void
): () => void {
  let query = firebaseFirestore
    .collection('healthLogs')
    .where('seniorId', '==', seniorId);

  // Filter by type if specified
  if (type) {
    query = query.where('type', '==', type) as any;
  }

  // Filter by time range if specified
  if (timeRange) {
    query = query
      .where('timestamp', '>=', timeRange.start)
      .where('timestamp', '<=', timeRange.end) as any;
  }

  // Order by timestamp descending
  query = query.orderBy('timestamp', 'desc') as any;

  const unsubscribe = query.onSnapshot(
    (snapshot) => {
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        };
      }) as HealthLog[];

      onUpdate?.(logs);
    },
    (error) => {
      console.error('Error subscribing to health logs:', error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to recent health logs (last 30 days)
 */
export function subscribeRecentHealthLogs(
  seniorId: string,
  onUpdate: (logs: HealthLog[]) => void,
  onError?: (error: Error) => void
): () => void {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return subscribeHealthLogs(
    seniorId,
    undefined,
    { start: thirtyDaysAgo, end: new Date() },
    onUpdate,
    onError
  );
}

/**
 * Get health log statistics for a specific type and time range
 */
export async function getHealthLogStats(
  seniorId: string,
  type: HealthLogType,
  timeRange: { start: Date; end: Date }
): Promise<{
  count: number;
  min: number | null;
  max: number | null;
  average: number | null;
  latest: HealthLog | null;
}> {
  const snapshot = await firebaseFirestore
    .collection('healthLogs')
    .where('seniorId', '==', seniorId)
    .where('type', '==', type)
    .where('timestamp', '>=', timeRange.start)
    .where('timestamp', '<=', timeRange.end)
    .orderBy('timestamp', 'desc')
    .get();

  const logs = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    };
  }) as HealthLog[];

  if (logs.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      average: null,
      latest: null,
    };
  }

  // Extract numeric values (handle blood pressure specially)
  const values: number[] = [];
  logs.forEach((log) => {
    if (type === 'blood_pressure' && typeof log.value === 'object') {
      // Use systolic value for blood pressure stats
      values.push(log.value.systolic);
    } else if (typeof log.value === 'number') {
      values.push(log.value);
    }
  });

  const min = values.length > 0 ? Math.min(...values) : null;
  const max = values.length > 0 ? Math.max(...values) : null;
  const average =
    values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;

  return {
    count: logs.length,
    min,
    max,
    average,
    latest: logs[0] || null,
  };
}
