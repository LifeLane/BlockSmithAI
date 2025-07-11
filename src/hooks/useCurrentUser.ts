
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

interface CurrentUserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (userId: string | null) => {
    setIsLoading(true);
    try {
      const userProfile = await getOrCreateUserAction(userId);
      setUser(userProfile);
      if (typeof window !== 'undefined' && userProfile.id !== userId) {
        localStorage.setItem('currentUserId', userProfile.id);
      }
    } catch (e) {
      console.error("Failed to fetch or create user:", e);
      // In case of a catastrophic server error, we might still want a fallback
      // but for now, we assume the server action is robust.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser: UserProfile | null) => {
    setUser(updatedUser);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      loadUser(userIdFromStorage);
    }
  }, [loadUser]);

  const refetchUser = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      await loadUser(userIdFromStorage);
    }
  }, [loadUser]);

  return { user, setUser: updateUser, isLoading, refetchUser };
};
