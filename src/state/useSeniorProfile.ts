/**
 * Senior Profile Hook
 * Real-time senior profile data
 */

import { useState, useEffect } from 'react';
import { seniorDoc } from '../services/firebase';
import { SeniorProfile } from '../types';

export const useSeniorProfile = (seniorId?: string) => {
  const [senior, setSenior] = useState<SeniorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seniorId) {
      setSenior(null);
      setLoading(false);
      return;
    }

    const unsubscribe = seniorDoc(seniorId).onSnapshot(
      (snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data() as any;

          const profile: SeniorProfile = {
            id: snapshot.id,
            primaryCaregiverUserId: data.primaryCaregiverUserId,
            profile: data.profile,
            cognitive: data.cognitive,
            autonomyFlags: data.autonomyFlags,
            preferences: data.preferences,
            deviceStatus: {
              lastSeenAt: data.deviceStatus?.lastSeenAt?.toDate(),
              lastLocation: data.deviceStatus?.lastLocation
                ? {
                    ...data.deviceStatus.lastLocation,
                    ts: data.deviceStatus.lastLocation.ts?.toDate(),
                  }
                : undefined,
              batteryPct: data.deviceStatus?.batteryPct,
            },
          };

          setSenior(profile);
          setError(null);
        } else {
          setSenior(null);
          setError('Senior profile not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading senior profile:', err);
        setError(err.message);
        setSenior(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [seniorId]);

  return { senior, loading, error };
};
