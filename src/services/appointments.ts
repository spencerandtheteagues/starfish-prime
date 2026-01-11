/**
 * Appointments Service
 * CRUD operations for medical appointments
 */

import {
  appointmentsCollection,
  appointmentDoc,
  getUpcomingAppointments,
  serverTimestamp,
} from './firebase';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Appointment {
  id?: string;
  seniorId: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  location?: string;
  doctorName?: string;
  phone?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateAppointmentParams {
  seniorId: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  doctorName?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateAppointmentParams {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  doctorName?: string;
  phone?: string;
  notes?: string;
  status?: Appointment['status'];
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new appointment
 */
export const createAppointment = async (params: CreateAppointmentParams): Promise<string> => {
  try {
    const appointmentData: Appointment = {
      seniorId: params.seniorId,
      title: params.title.trim(),
      date: params.date,
      time: params.time,
      location: params.location?.trim(),
      doctorName: params.doctorName?.trim(),
      phone: params.phone?.trim(),
      notes: params.notes?.trim(),
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await appointmentsCollection().add(appointmentData);
    console.log('Appointment created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  updates: UpdateAppointmentParams
): Promise<void> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Trim string fields
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.location) updateData.location = updateData.location.trim();
    if (updateData.doctorName) updateData.doctorName = updateData.doctorName.trim();
    if (updateData.phone) updateData.phone = updateData.phone.trim();
    if (updateData.notes) updateData.notes = updateData.notes.trim();

    await appointmentDoc(appointmentId).update(updateData);
    console.log('Appointment updated:', appointmentId);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await appointmentDoc(appointmentId).delete();
    console.log('Appointment deleted:', appointmentId);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

/**
 * Cancel an appointment (soft delete - change status)
 */
export const cancelAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await appointmentDoc(appointmentId).update({
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    console.log('Appointment cancelled:', appointmentId);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

/**
 * Mark appointment as completed
 */
export const completeAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await appointmentDoc(appointmentId).update({
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
    console.log('Appointment completed:', appointmentId);
  } catch (error) {
    console.error('Error completing appointment:', error);
    throw error;
  }
};

/**
 * Get a single appointment by ID
 */
export const getAppointment = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const doc = await appointmentDoc(appointmentId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Appointment;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

/**
 * Subscribe to all appointments for a senior (real-time)
 */
export const subscribeAppointments = (
  seniorId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const unsubscribe = appointmentsCollection()
      .where('seniorId', '==', seniorId)
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .onSnapshot(
        (snapshot) => {
          const appointments: Appointment[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Appointment[];
          onUpdate(appointments);
        },
        (error) => {
          console.error('Error subscribing to appointments:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up appointments subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Subscribe to upcoming appointments only (scheduled status, future dates)
 */
export const subscribeUpcomingAppointments = (
  seniorId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const unsubscribe = getUpcomingAppointments(seniorId)
      .where('date', '>=', todayStr)
      .where('status', '==', 'scheduled')
      .orderBy('date', 'asc')
      .orderBy('time', 'asc')
      .onSnapshot(
        (snapshot) => {
          const appointments: Appointment[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Appointment[];
          onUpdate(appointments);
        },
        (error) => {
          console.error('Error subscribing to upcoming appointments:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up upcoming appointments subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Subscribe to past appointments
 */
export const subscribePastAppointments = (
  seniorId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const unsubscribe = appointmentsCollection()
      .where('seniorId', '==', seniorId)
      .where('date', '<', todayStr)
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .limit(50) // Last 50 appointments
      .onSnapshot(
        (snapshot) => {
          const appointments: Appointment[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Appointment[];
          onUpdate(appointments);
        },
        (error) => {
          console.error('Error subscribing to past appointments:', error);
          if (onError) onError(error as Error);
        }
      );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up past appointments subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};
