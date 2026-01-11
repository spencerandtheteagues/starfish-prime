/**
 * Contacts Service
 * CRUD operations for senior contacts
 */

import { firebaseFirestore } from './firebase';
import { Contact, ContactType } from '../types';

// ============================================================================
// CONTACT CRUD OPERATIONS
// ============================================================================

export interface CreateContactParams {
  seniorId: string;
  name: string;
  type: ContactType;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  callScript?: string;
  isPrimary?: boolean;
}

/**
 * Create a new contact
 */
export async function createContact(params: CreateContactParams): Promise<string> {
  const contactRef = firebaseFirestore.collection('contacts').doc();

  const contact: Omit<Contact, 'id'> = {
    seniorId: params.seniorId,
    name: params.name,
    type: params.type,
    phone: params.phone,
    email: params.email,
    address: params.address,
    notes: params.notes,
    callScript: params.callScript,
    isPrimary: params.isPrimary || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await contactRef.set(contact);
  return contactRef.id;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  contactId: string,
  updates: Partial<Omit<Contact, 'id' | 'seniorId' | 'createdAt'>>
): Promise<void> {
  await firebaseFirestore
    .collection('contacts')
    .doc(contactId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<void> {
  await firebaseFirestore.collection('contacts').doc(contactId).delete();
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<Contact | null> {
  const snapshot = await firebaseFirestore.collection('contacts').doc(contactId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
    updatedAt: data?.updatedAt?.toDate?.() || new Date(data?.updatedAt),
  } as Contact;
}

/**
 * Subscribe to all contacts for a senior (real-time)
 */
export function subscribeContacts(
  seniorId: string,
  onUpdate: (contacts: Contact[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('contacts')
    .where('seniorId', '==', seniorId)
    .orderBy('name', 'asc')
    .onSnapshot(
      (snapshot) => {
        const contacts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        }) as Contact[];

        onUpdate(contacts);
      },
      (error) => {
        console.error('Error subscribing to contacts:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}

/**
 * Subscribe to contacts by type
 */
export function subscribeContactsByType(
  seniorId: string,
  type: ContactType,
  onUpdate: (contacts: Contact[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('contacts')
    .where('seniorId', '==', seniorId)
    .where('type', '==', type)
    .orderBy('name', 'asc')
    .onSnapshot(
      (snapshot) => {
        const contacts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        }) as Contact[];

        onUpdate(contacts);
      },
      (error) => {
        console.error('Error subscribing to contacts by type:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}
