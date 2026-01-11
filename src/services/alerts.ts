/**
 * Alerts Service
 * Operations for caregiver alerts (mostly server-created, client reads/acknowledges)
 */

import { firebaseFirestore } from './firebase';
import { Alert, AlertType, AlertSeverity } from '../types';

// ============================================================================
// ALERT OPERATIONS
// ============================================================================

/**
 * Get a single alert by ID
 */
export async function getAlert(alertId: string): Promise<Alert | null> {
  const snapshot = await firebaseFirestore.collection('alerts').doc(alertId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
    acknowledgedAt: data?.acknowledgedAt?.toDate?.() || undefined,
  } as Alert;
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string, userId: string): Promise<void> {
  await firebaseFirestore.collection('alerts').doc(alertId).update({
    acknowledged: true,
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  });
}

/**
 * Subscribe to all alerts for a senior (real-time)
 */
export function subscribeAlerts(
  seniorId: string,
  onUpdate: (alerts: Alert[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('alerts')
    .where('seniorId', '==', seniorId)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .onSnapshot(
      (snapshot) => {
        const alerts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            acknowledgedAt: data.acknowledgedAt?.toDate?.() || undefined,
          };
        }) as Alert[];

        onUpdate(alerts);
      },
      (error) => {
        console.error('Error subscribing to alerts:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}

/**
 * Subscribe to unacknowledged alerts only
 */
export function subscribeUnacknowledgedAlerts(
  seniorId: string,
  onUpdate: (alerts: Alert[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('alerts')
    .where('seniorId', '==', seniorId)
    .where('acknowledged', '==', false)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const alerts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            acknowledgedAt: data.acknowledgedAt?.toDate?.() || undefined,
          };
        }) as Alert[];

        onUpdate(alerts);
      },
      (error) => {
        console.error('Error subscribing to unacknowledged alerts:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}

/**
 * Subscribe to alerts by severity
 */
export function subscribeAlertsBySeverity(
  seniorId: string,
  severity: AlertSeverity,
  onUpdate: (alerts: Alert[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('alerts')
    .where('seniorId', '==', seniorId)
    .where('severity', '==', severity)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        const alerts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            acknowledgedAt: data.acknowledgedAt?.toDate?.() || undefined,
          };
        }) as Alert[];

        onUpdate(alerts);
      },
      (error) => {
        console.error('Error subscribing to alerts by severity:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}
