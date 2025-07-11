
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

interface CurrentUserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

export const useCurrentUser = (): CurrentUserContextType => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentUserId');
    }
    return null;
  });

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const userProfile = await getOrCreateUserAction(userId);
      setUser(userProfile);

      if (userId !== userProfile.id) {
        localStorage.setItem('currentUserId', userProfile.id);
        setUserId(userProfile.id);
      }
    } catch (e) {
      console.error("Failed to refetch user:", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const userProfile = await getOrCreateUserAction(userId);
        setUser(userProfile);

        if (userId !== userProfile.id) {
          localStorage.setItem('currentUserId', userProfile.id);
          setUserId(userProfile.id);
        }
      } catch (e) {
        console.error("Failed to fetch or create user:", e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  return { user, setUser, isLoading, refetchUser };
};
