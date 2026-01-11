/**
 * Senior Profile Service
 * CRUD operations for senior profiles
 */

import { firebaseFirestore, serverTimestamp, userDoc } from './firebase';
import { SeniorProfile } from '../types';

const seniorsCollection = firebaseFirestore.collection('seniors');

/**
 * Create a new senior profile
 */
export const createSeniorProfile = async (
  caregiverUid: string,
  data: Partial<SeniorProfile['profile']>
): Promise<string> => {
  try {
    const seniorRef = seniorsCollection.doc();
    const seniorId = seniorRef.id;

    // Default senior profile structure
    const newSeniorProfile: Omit<SeniorProfile, 'id'> = {
      primaryCaregiverUserId: caregiverUid,
      profile: {
        name: data.name || 'My Senior',
        dob: data.dob || '',
        address: data.address || '',
      },
      cognitive: {
        level: 1, // Default to level 1 (Minimal Support)
        tone: 'friendly',
      },
      autonomyFlags: {
        canEditContacts: false,
        canEditReminders: false,
        canEditSchedule: false,
      },
      preferences: {
        fontScale: 1.2,
        highContrast: false,
        voiceRate: 1.0,
        quietHours: { start: '21:00', end: '07:00' },
      },
      deviceStatus: {
        batteryPct: 100,
      },
    };

    // Create senior doc
    await seniorRef.set({
      ...newSeniorProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Link to caregiver
    await userDoc(caregiverUid).update({
      activeSeniorId: seniorId,
    });

    return seniorId;
  } catch (error: any) {
    console.error('Error creating senior profile:', error);
    throw new Error(error.message || 'Failed to create senior profile');
  }
};

/**
 * Update existing senior profile
 */
export const updateSeniorProfile = async (
  seniorId: string,
  data: Partial<SeniorProfile>
): Promise<void> => {
  try {
    await seniorsCollection.doc(seniorId).update({
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating senior profile:', error);
    throw new Error(error.message || 'Failed to update senior profile');
  }
};

/**
 * Get senior profile
 */
export const getSeniorProfile = async (seniorId: string): Promise<SeniorProfile | null> => {
  try {
    const doc = await seniorsCollection.doc(seniorId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as SeniorProfile;
  } catch (error: any) {
    console.error('Error fetching senior profile:', error);
    throw new Error(error.message || 'Failed to fetch senior profile');
  }
};
