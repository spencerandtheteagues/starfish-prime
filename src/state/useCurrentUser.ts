/**
 * Current User Hook
 * Manages authentication state and user profile
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, getUserProfile } from '../services/auth';
import { User } from '../types';

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
          setError(null);
        } catch (err: any) {
          console.error('Error loading user profile:', err);
          setError(err.message);
          setUser(null);
        }
      } else {
        setUser(null);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};
