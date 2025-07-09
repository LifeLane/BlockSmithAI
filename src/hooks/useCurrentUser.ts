
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

  const fetchUser = useCallback(async () => {
      // Don't refetch if we already have a user
      if (user) {
          setIsLoading(false);
          return;
      }
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
  }, [user]); // Add user to dependency array

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(async () => {
    // Force a refetch by clearing the user state first
    setUser(null);
    setIsLoading(true);
    
    const userIdFromStorage = getCurrentUserId();
     try {
        const userProfile = await getOrCreateUserAction(userIdFromStorage);
        if (!userProfile || !userProfile.id) throw new Error("Received invalid user profile from server.");
        setUser(userProfile);
      } catch (e: any) {
        console.error("Failed to refetch user session:", e);
        setError("Could not re-establish user session. Please try again.");
      } finally {
        setIsLoading(false);
      }
  }, []);

  return { user, isLoading, error, refetch };
};

    