/**
 * Firebase Service - Client SDK Setup
 * Using React Native Firebase for native modules (FCM, etc.)
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// ============================================================================
// FIREBASE INSTANCES
// ============================================================================

export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseMessaging = messaging();

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

// Users
export const usersCollection = () => firebaseFirestore.collection('users');
export const userDoc = (userId: string) => usersCollection().doc(userId);

// Seniors
export const seniorsCollection = () => firebaseFirestore.collection('seniors');
export const seniorDoc = (seniorId: string) => seniorsCollection().doc(seniorId);

// Care Team Links (deterministic IDs)
export const linksCollection = () => firebaseFirestore.collection('links');
export const linkDoc = (caregiverId: string, seniorId: string) =>
  linksCollection().doc(`${caregiverId}_${seniorId}`);

// Threads (messaging)
export const threadsCollection = () => firebaseFirestore.collection('threads');
export const threadDoc = (threadId: string) => threadsCollection().doc(threadId);
export const threadIdForSenior = (seniorId: string) => `senior_${seniorId}`;

// Messages
export const messagesCollection = (threadId: string) =>
  threadDoc(threadId).collection('messages');
export const messageDoc = (threadId: string, messageId: string) =>
  messagesCollection(threadId).doc(messageId);

// Medications
export const medsCollection = () => firebaseFirestore.collection('meds');
export const medDoc = (medId: string) => medsCollection().doc(medId);

// Medication Events
export const medEventsCollection = () => firebaseFirestore.collection('medEvents');
export const medEventDoc = (eventId: string) => medEventsCollection().doc(eventId);

// Appointments
export const appointmentsCollection = () => firebaseFirestore.collection('appointments');
export const appointmentDoc = (appointmentId: string) =>
  appointmentsCollection().doc(appointmentId);

// Contacts
export const contactsCollection = () => firebaseFirestore.collection('contacts');
export const contactDoc = (contactId: string) => contactsCollection().doc(contactId);

// Safe Zones
export const safeZonesCollection = () => firebaseFirestore.collection('safeZones');
export const safeZoneDoc = (zoneId: string) => safeZonesCollection().doc(zoneId);

// Alerts
export const alertsCollection = () => firebaseFirestore.collection('alerts');
export const alertDoc = (alertId: string) => alertsCollection().doc(alertId);

// Health Logs
export const healthLogsCollection = () => firebaseFirestore.collection('healthLogs');
export const healthLogDoc = (logId: string) => healthLogsCollection().doc(logId);

// Notes
export const notesCollection = () => firebaseFirestore.collection('notes');
export const noteDoc = (noteId: string) => notesCollection().doc(noteId);

// Device Tokens (FCM)
export const userDevicesCollection = (userId: string) =>
  firebaseFirestore.collection('userDevices').doc(userId).collection('tokens');

// ============================================================================
// TIMESTAMP HELPERS
// ============================================================================

export const serverTimestamp = () => firestore.FieldValue.serverTimestamp();
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

export const dateToTimestamp = (date: Date) => firestore.Timestamp.fromDate(date);

// ============================================================================
// ARRAY HELPERS
// ============================================================================

export const arrayUnion = (...elements: any[]) => firestore.FieldValue.arrayUnion(...elements);
export const arrayRemove = (...elements: any[]) => firestore.FieldValue.arrayRemove(...elements);

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const batch = () => firebaseFirestore.batch();

// ============================================================================
// QUERIES (Helpers for common patterns)
// ============================================================================

// Get all meds for a senior
export const getMedsForSenior = (seniorId: string) =>
  medsCollection().where('seniorId', '==', seniorId).where('active', '==', true);

// Get today's med events for a senior
export const getTodayMedEvents = (seniorId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return medEventsCollection()
    .where('seniorId', '==', seniorId)
    .where('scheduledTime', '>=', today)
    .where('scheduledTime', '<', tomorrow)
    .orderBy('scheduledTime', 'asc');
};

// Get upcoming appointments for a senior
export const getUpcomingAppointments = (seniorId: string) =>
  appointmentsCollection()
    .where('seniorId', '==', seniorId)
    .where('status', '==', 'upcoming')
    .where('dateTime', '>=', new Date())
    .orderBy('dateTime', 'asc');

// Get unacknowledged alerts for a senior
export const getUnacknowledgedAlerts = (seniorId: string) =>
  alertsCollection()
    .where('seniorId', '==', seniorId)
    .where('acknowledged', '==', false)
    .orderBy('createdAt', 'desc');

// Get contacts for a senior
export const getContactsForSenior = (seniorId: string) =>
  contactsCollection().where('seniorId', '==', seniorId).orderBy('isPrimary', 'desc');

export default {
  auth: firebaseAuth,
  firestore: firebaseFirestore,
  messaging: firebaseMessaging,
};
