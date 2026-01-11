/**
 * Medications Service
 * CRUD operations for medications and medication events
 */

import {
  medsCollection,
  medDoc,
  medEventsCollection,
  medEventDoc,
  getMedsForSenior,
  getTodayMedEvents,
  serverTimestamp,
} from './firebase';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Medication {
  id?: string;
  seniorId: string;
  name: string;
  dosage: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'as_needed';
    times: string[]; // Array of time strings like "09:00"
    daysOfWeek?: number[]; // For weekly: 0-6 (Sunday-Saturday)
  };
  instructions?: string;
  requiresFood?: boolean;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  deactivatedAt?: any;
}

export interface MedicationEvent {
  id?: string;
  seniorId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // HH:mm format
  scheduledDate: string; // YYYY-MM-DD format
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  takenAt?: any;
  skippedAt?: any;
  notes?: string;
  createdAt?: any;
}

export interface CreateMedicationParams {
  seniorId: string;
  name: string;
  dosage: string;
  schedule: Medication['schedule'];
  instructions?: string;
  requiresFood?: boolean;
}

export interface UpdateMedicationParams {
  name?: string;
  dosage?: string;
  schedule?: Medication['schedule'];
  instructions?: string;
  requiresFood?: boolean;
}

export interface CreateMedicationEventParams {
  seniorId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  scheduledDate: string;
}

// ============================================================================
// MEDICATIONS CRUD
// ============================================================================

/**
 * Create a new medication
 */
export const createMedication = async (params: CreateMedicationParams): Promise<string> => {
  try {
    const medicationData: Medication = {
      seniorId: params.seniorId,
      name: params.name.trim(),
      dosage: params.dosage.trim(),
      schedule: params.schedule,
      instructions: params.instructions?.trim(),
      requiresFood: params.requiresFood || false,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await medsCollection().add(medicationData);
    console.log('Medication created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating medication:', error);
    throw error;
  }
};

/**
 * Update an existing medication
 */
export const updateMedication = async (
  medId: string,
  updates: UpdateMedicationParams
): Promise<void> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.dosage) updateData.dosage = updateData.dosage.trim();
    if (updateData.instructions) updateData.instructions = updateData.instructions.trim();

    await medDoc(medId).update(updateData);
    console.log('Medication updated:', medId);
  } catch (error) {
    console.error('Error updating medication:', error);
    throw error;
  }
};

/**
 * Delete (deactivate) a medication
 */
export const deleteMedication = async (medId: string): Promise<void> => {
  try {
    await medDoc(medId).update({
      isActive: false,
      deactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Medication deactivated:', medId);
  } catch (error) {
    console.error('Error deleting medication:', error);
    throw error;
  }
};

/**
 * Get a single medication by ID
 */
export const getMedication = async (medId: string): Promise<Medication | null> => {
  try {
    const doc = await medDoc(medId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Medication;
  } catch (error) {
    console.error('Error getting medication:', error);
    throw error;
  }
};

/**
 * Subscribe to medications for a senior (real-time)
 */
export const subscribeMedications = (
  seniorId: string,
  onUpdate: (medications: Medication[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const unsubscribe = getMedsForSenior(seniorId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const medications: Medication[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Medication[];
          onUpdate(medications);
        },
        (error) => {
          console.error('Error subscribing to medications:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up medication subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

// ============================================================================
// MEDICATION EVENTS CRUD
// ============================================================================

/**
 * Create a medication event (scheduled dose)
 */
export const createMedicationEvent = async (
  params: CreateMedicationEventParams
): Promise<string> => {
  try {
    const eventData: MedicationEvent = {
      seniorId: params.seniorId,
      medicationId: params.medicationId,
      medicationName: params.medicationName,
      dosage: params.dosage,
      scheduledTime: params.scheduledTime,
      scheduledDate: params.scheduledDate,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await medEventsCollection().add(eventData);
    console.log('Medication event created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating medication event:', error);
    throw error;
  }
};

/**
 * Update a medication event status (mark as taken, skipped, or missed)
 */
export const updateMedicationEvent = async (
  eventId: string,
  status: 'taken' | 'skipped' | 'missed',
  notes?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      notes: notes?.trim(),
    };

    if (status === 'taken') {
      updateData.takenAt = serverTimestamp();
    } else if (status === 'skipped') {
      updateData.skippedAt = serverTimestamp();
    }

    await medEventDoc(eventId).update(updateData);
    console.log('Medication event updated:', eventId, status);
  } catch (error) {
    console.error('Error updating medication event:', error);
    throw error;
  }
};

/**
 * Get a single medication event by ID
 */
export const getMedicationEvent = async (eventId: string): Promise<MedicationEvent | null> => {
  try {
    const doc = await medEventDoc(eventId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as MedicationEvent;
  } catch (error) {
    console.error('Error getting medication event:', error);
    throw error;
  }
};

/**
 * Subscribe to today's medication events for a senior (real-time)
 */
export const subscribeTodayMedEvents = (
  seniorId: string,
  onUpdate: (events: MedicationEvent[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const unsubscribe = getTodayMedEvents(seniorId)
      .orderBy('scheduledTime', 'asc')
      .onSnapshot(
        (snapshot) => {
          const events: MedicationEvent[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicationEvent[];
          onUpdate(events);
        },
        (error) => {
          console.error('Error subscribing to today med events:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up today med events subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Subscribe to upcoming medication events (next 7 days)
 */
export const subscribeUpcomingMedEvents = (
  seniorId: string,
  onUpdate: (events: MedicationEvent[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const unsubscribe = medEventsCollection()
      .where('seniorId', '==', seniorId)
      .where('scheduledDate', '>=', todayStr)
      .where('scheduledDate', '<', nextWeekStr)
      .orderBy('scheduledDate', 'asc')
      .orderBy('scheduledTime', 'asc')
      .onSnapshot(
        (snapshot) => {
          const events: MedicationEvent[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicationEvent[];
          onUpdate(events);
        },
        (error) => {
          console.error('Error subscribing to upcoming med events:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up upcoming med events subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Subscribe to medication event history (last 30 days)
 */
export const subscribeMedicationHistory = (
  seniorId: string,
  onUpdate: (events: MedicationEvent[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const unsubscribe = medEventsCollection()
      .where('seniorId', '==', seniorId)
      .where('scheduledDate', '>=', startDateStr)
      .orderBy('scheduledDate', 'desc')
      .orderBy('scheduledTime', 'desc')
      .onSnapshot(
        (snapshot) => {
          const events: MedicationEvent[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicationEvent[];
          onUpdate(events);
        },
        (error) => {
          console.error('Error subscribing to medication history:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up medication history subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};
