/**
 * Reports Service
 * Access AI-generated daily, weekly, and monthly reports
 */

import { firebaseFirestore } from './firebase';

// ============================================================================
// TYPES
// ============================================================================

export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface ReportSection {
  title: string;
  content: string;
  metrics?: {
    [key: string]: any;
  };
}

export interface AIReport {
  id: string;
  seniorId: string;
  type: ReportType;
  periodStart: Date;
  periodEnd: Date;
  sections: ReportSection[];
  highlights: string[];
  concerns: string[];
  createdAt: Date;
}

// ============================================================================
// REPORTS READ OPERATIONS (Server creates, client reads)
// ============================================================================

/**
 * Subscribe to reports for a senior (real-time)
 */
export function subscribeReports(
  seniorId: string,
  type?: ReportType,
  onUpdate?: (reports: AIReport[]) => void,
  onError?: (error: Error) => void
): () => void {
  let query = firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('reports');

  // Filter by type if specified
  if (type) {
    query = query.where('type', '==', type) as any;
  }

  // Order by period start descending (most recent first)
  query = query.orderBy('periodStart', 'desc').limit(50) as any;

  const unsubscribe = query.onSnapshot(
    (snapshot) => {
      const reports = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          periodStart: data.periodStart?.toDate?.() || new Date(data.periodStart),
          periodEnd: data.periodEnd?.toDate?.() || new Date(data.periodEnd),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        };
      }) as AIReport[];

      onUpdate?.(reports);
    },
    (error) => {
      console.error('Error subscribing to reports:', error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Get a single report by ID
 */
export async function getReport(seniorId: string, reportId: string): Promise<AIReport | null> {
  const snapshot = await firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('reports')
    .doc(reportId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    periodStart: data?.periodStart?.toDate?.() || new Date(data?.periodStart),
    periodEnd: data?.periodEnd?.toDate?.() || new Date(data?.periodEnd),
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
  } as AIReport;
}

/**
 * Get the latest report of a specific type
 */
export async function getLatestReport(
  seniorId: string,
  type: ReportType
): Promise<AIReport | null> {
  const snapshot = await firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('reports')
    .where('type', '==', type)
    .orderBy('periodStart', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    periodStart: data.periodStart?.toDate?.() || new Date(data.periodStart),
    periodEnd: data.periodEnd?.toDate?.() || new Date(data.periodEnd),
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as AIReport;
}

/**
 * Subscribe to recent daily reports (last 7 days)
 */
export function subscribeRecentDailyReports(
  seniorId: string,
  onUpdate: (reports: AIReport[]) => void,
  onError?: (error: Error) => void
): () => void {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const unsubscribe = firebaseFirestore
    .collection('seniors')
    .doc(seniorId)
    .collection('reports')
    .where('type', '==', 'daily')
    .where('periodStart', '>=', sevenDaysAgo)
    .orderBy('periodStart', 'desc')
    .onSnapshot(
      (snapshot) => {
        const reports = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            periodStart: data.periodStart?.toDate?.() || new Date(data.periodStart),
            periodEnd: data.periodEnd?.toDate?.() || new Date(data.periodEnd),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          };
        }) as AIReport[];

        onUpdate(reports);
      },
      (error) => {
        console.error('Error subscribing to recent daily reports:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}
