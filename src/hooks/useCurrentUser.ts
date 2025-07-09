
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (userId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getOrCreateUserAction(userId);

      if (!userProfile || !userProfile.id) {
        throw new Error("Received invalid user profile from the server.");
      }

      setUser(userProfile);
      if (userProfile.id !== userId) {
        localStorage.setItem('currentUserId', userProfile.id);
      }
    } catch (e: any) {
      console.error("Failed to initialize user session:", e);
      setError("Could not establish a user session. Please try again.");
      setUser(null); // Clear user on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userIdFromStorage = getCurrentUserId();
    loadUser(userIdFromStorage);
  }, [loadUser]);

  const refetch = useCallback(() => {
    const userIdFromStorage = getCurrentUserId();
    // Just call loadUser again. It will handle loading states.
    loadUser(userIdFromStorage);
  }, [loadUser]);

  return { user, isLoading, error, refetch };
};
