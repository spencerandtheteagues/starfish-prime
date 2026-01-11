/**
 * SafeZones Service
 * CRUD operations for geofencing safe zones
 */

import { firebaseFirestore } from './firebase';
import { SafeZone } from '../types';

// ============================================================================
// SAFE ZONE CRUD OPERATIONS
// ============================================================================

export interface CreateSafeZoneParams {
  seniorId: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // meters
  notifyOnExit?: boolean;
  notifyOnEnter?: boolean;
}

/**
 * Create a new safe zone
 */
export async function createSafeZone(params: CreateSafeZoneParams): Promise<string> {
  const safeZoneRef = firebaseFirestore.collection('safeZones').doc();

  const safeZone: Omit<SafeZone, 'id'> = {
    seniorId: params.seniorId,
    name: params.name,
    center: params.center,
    radius: params.radius,
    notifyOnExit: params.notifyOnExit ?? true,
    notifyOnEnter: params.notifyOnEnter ?? false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await safeZoneRef.set(safeZone);
  return safeZoneRef.id;
}

/**
 * Update an existing safe zone
 */
export async function updateSafeZone(
  zoneId: string,
  updates: Partial<Omit<SafeZone, 'id' | 'seniorId' | 'createdAt'>>
): Promise<void> {
  await firebaseFirestore
    .collection('safeZones')
    .doc(zoneId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

/**
 * Delete a safe zone
 */
export async function deleteSafeZone(zoneId: string): Promise<void> {
  await firebaseFirestore.collection('safeZones').doc(zoneId).delete();
}

/**
 * Deactivate a safe zone (soft delete)
 */
export async function deactivateSafeZone(zoneId: string): Promise<void> {
  await firebaseFirestore.collection('safeZones').doc(zoneId).update({
    active: false,
    updatedAt: new Date(),
  });
}

/**
 * Get a single safe zone by ID
 */
export async function getSafeZone(zoneId: string): Promise<SafeZone | null> {
  const snapshot = await firebaseFirestore.collection('safeZones').doc(zoneId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
    updatedAt: data?.updatedAt?.toDate?.() || new Date(data?.updatedAt),
  } as SafeZone;
}

/**
 * Subscribe to all safe zones for a senior (real-time)
 */
export function subscribeSafeZones(
  seniorId: string,
  onUpdate: (zones: SafeZone[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('safeZones')
    .where('seniorId', '==', seniorId)
    .where('active', '==', true)
    .orderBy('name', 'asc')
    .onSnapshot(
      (snapshot) => {
        const zones = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        }) as SafeZone[];

        onUpdate(zones);
      },
      (error) => {
        console.error('Error subscribing to safe zones:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}
