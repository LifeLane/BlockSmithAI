'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, fetchCurrentUserJson, type UserProfile } from '@/app/actions';

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

  const fetchUser = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      const userIdFromStorage = getCurrentUserId();
      try {
        const userProfile = await getOrCreateUserAction(userIdFromStorage);
        
        if (!userProfile || !userProfile.id) {
          throw new Error("Received invalid user profile from the server.");
        }
        
        setUser(userProfile);
        if (userProfile.id !== userIdFromStorage) {
          localStorage.setItem('currentUserId', userProfile.id);
        }
      } catch (e: any) {
        console.error("Failed to initialize user session:", e);
        setError("Could not establish a user session. Please try again.");
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(async () => {
    const userId = getCurrentUserId();
    if (userId) {
        setIsLoading(true);
        const userProfile = await fetchCurrentUserJson(userId);
        if (userProfile) {
            setUser(userProfile);
        }
        setIsLoading(false);
    } else {
        await fetchUser();
    }
  }, [fetchUser]);

  return { user, isLoading, error, refetch };
};
