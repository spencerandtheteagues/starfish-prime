/**
 * Authentication Service
 * Email/password auth with role management
 */

import { firebaseAuth, userDoc, serverTimestamp } from './firebase';
import { User, UserRole } from '../types';

// ============================================================================
// AUTH STATE
// ============================================================================

export const getCurrentUser = () => firebaseAuth.currentUser;

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return firebaseAuth.onAuthStateChanged(callback);
};

// ============================================================================
// SIGN UP
// ============================================================================

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<User> => {
  try {
    console.log('Starting signup process...');

    // Create auth user
    console.log('Creating Firebase Auth user...');
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const { uid } = userCredential.user;
    console.log('Auth user created with UID:', uid);

    // Update display name
    console.log('Updating profile...');
    await userCredential.user.updateProfile({ displayName: name });
    console.log('Profile updated');

    // Create user document
    const userData: Omit<User, 'uid'> = {
      role,
      email,
      name,
      createdAt: new Date(),
    };

    console.log('Creating Firestore user document...');
    console.log('User data:', userData);

    await userDoc(uid).set({
      ...userData,
      createdAt: serverTimestamp(),
    });

    console.log('User document created successfully!');

    return {
      uid,
      ...userData,
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(error.message || 'Failed to create account');
  }
};

// ============================================================================
// SIGN IN
// ============================================================================

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    const { uid } = userCredential.user;

    // Fetch user document
    const userSnapshot = await userDoc(uid).get();

    if (!userSnapshot.exists) {
      throw new Error('User profile not found');
    }

    const userData = userSnapshot.data() as any;

    return {
      uid,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      name: userData.name,
      createdAt: userData.createdAt?.toDate() || new Date(),
      activeSeniorId: userData.activeSeniorId,
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// ============================================================================
// SIGN OUT
// ============================================================================

export const signOut = async (): Promise<void> => {
  try {
    await firebaseAuth.signOut();
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// ============================================================================
// PASSWORD RESET
// ============================================================================

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

// ============================================================================
// GET USER PROFILE
// ============================================================================

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userSnapshot = await userDoc(uid).get();

    if (!userSnapshot.exists) {
      return null;
    }

    const userData = userSnapshot.data() as any;

    return {
      uid,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      name: userData.name,
      createdAt: userData.createdAt?.toDate() || new Date(),
      activeSeniorId: userData.activeSeniorId,
    };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return null;
  }
};

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<User, 'uid' | 'role' | 'createdAt'>>
): Promise<void> => {
  try {
    await userDoc(uid).update(updates);

    // Update auth profile if name changed
    if (updates.name && firebaseAuth.currentUser) {
      await firebaseAuth.currentUser.updateProfile({
        displayName: updates.name,
      });
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

// ============================================================================
// SENIOR PAIRING
// ============================================================================

export const linkSeniorToUser = async (uid: string, seniorId: string): Promise<void> => {
  try {
    await userDoc(uid).update({
      activeSeniorId: seniorId,
    });
  } catch (error: any) {
    console.error('Link senior error:', error);
    throw new Error(error.message || 'Failed to link senior');
  }
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  sendPasswordResetEmail,
  getCurrentUser,
  onAuthStateChanged,
  getUserProfile,
  updateUserProfile,
  linkSeniorToUser,
};
