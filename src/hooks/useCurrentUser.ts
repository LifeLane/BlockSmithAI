
'use client';

import { useState, useEffect } from 'react';
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

  const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      const userIdFromStorage = getCurrentUserId();
      try {
        const userProfile = await getOrCreateUserAction(userIdFromStorage);
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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    const userId = getCurrentUserId();
    if (userId) {
        setIsLoading(true);
        const userProfile = await fetchCurrentUserJson(userId);
        if (userProfile) {
            setUser(userProfile);
        }
        setIsLoading(false);
    }
  };

  return { user, isLoading, error, refetch };
};
