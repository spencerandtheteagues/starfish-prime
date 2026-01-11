/**
 * Notes Service
 * CRUD operations for caregiver notes about seniors
 */

import { firebaseFirestore } from './firebase';
import { Note } from '../types';

// ============================================================================
// NOTE CRUD OPERATIONS
// ============================================================================

export interface CreateNoteParams {
  seniorId: string;
  authorUserId: string;
  authorName: string;
  text: string;
}

/**
 * Create a new note
 */
export async function createNote(params: CreateNoteParams): Promise<string> {
  const noteRef = firebaseFirestore.collection('notes').doc();

  const note: Omit<Note, 'id'> = {
    seniorId: params.seniorId,
    authorUserId: params.authorUserId,
    authorName: params.authorName,
    text: params.text,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await noteRef.set(note);
  return noteRef.id;
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'seniorId' | 'authorUserId' | 'authorName' | 'createdAt'>>
): Promise<void> {
  await firebaseFirestore
    .collection('notes')
    .doc(noteId)
    .update({
      ...updates,
      updatedAt: new Date(),
    });
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  await firebaseFirestore.collection('notes').doc(noteId).delete();
}

/**
 * Get a single note by ID
 */
export async function getNote(noteId: string): Promise<Note | null> {
  const snapshot = await firebaseFirestore.collection('notes').doc(noteId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.() || new Date(data?.createdAt),
    updatedAt: data?.updatedAt?.toDate?.() || new Date(data?.updatedAt),
  } as Note;
}

/**
 * Subscribe to all notes for a senior (real-time)
 */
export function subscribeNotes(
  seniorId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = firebaseFirestore
    .collection('notes')
    .where('seniorId', '==', seniorId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        }) as Note[];

        onUpdate(notes);
      },
      (error) => {
        console.error('Error subscribing to notes:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}

/**
 * Subscribe to recent notes (last 30 days)
 */
export function subscribeRecentNotes(
  seniorId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (error: Error) => void
): () => void {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const unsubscribe = firebaseFirestore
    .collection('notes')
    .where('seniorId', '==', seniorId)
    .where('createdAt', '>=', thirtyDaysAgo)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        }) as Note[];

        onUpdate(notes);
      },
      (error) => {
        console.error('Error subscribing to recent notes:', error);
        onError?.(error);
      }
    );

  return unsubscribe;
}
