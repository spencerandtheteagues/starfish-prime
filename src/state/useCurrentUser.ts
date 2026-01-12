/**
 * Current User Hook
 * Manages authentication state and user profile
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from '../services/auth';
import { userDoc } from '../services/firebase';
import { User } from '../types';

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated, now listen for their Firestore profile
        // This handles race conditions during signup (when doc is being created)
        unsubscribeFirestore = userDoc(firebaseUser.uid).onSnapshot(
          (snapshot) => {
            if (snapshot.exists) {
              const data = snapshot.data();
              setUser({
                uid: firebaseUser.uid,
                role: data?.role,
                email: data?.email,
                phone: data?.phone,
                name: data?.name,
                createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                activeSeniorId: data?.activeSeniorId,
              } as User);
            } else {
              // Document doesn't exist yet (or was deleted). 
              // During signup, this might happen briefly before the doc is written.
              // We set user to null, but since we are listening, it will update 
              // automatically once the document is created.
              setUser(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error listening to user profile:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } else {
        // User is signed out
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = undefined;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  return { user, loading, error };
};
