
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

interface CurrentUserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

// Store context in a higher scope to persist across renders
let userState: UserProfile | null = null;
let listeners: ((user: UserProfile | null) => void)[] = [];

const setUserState = (user: UserProfile | null) => {
  userState = user;
  listeners.forEach((listener) => listener(user));
};

export const useCurrentUser = (): CurrentUserContextType => {
  const [user, setUser] = useState<UserProfile | null>(userState);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async (currentUserId: string | null) => {
    setIsLoading(true);
    try {
      const userProfile = await getOrCreateUserAction(currentUserId);
      localStorage.setItem('currentUserId', userProfile.id);
      setUserState(userProfile);
    } catch (e) {
      console.error("Failed to refetch user:", e);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Subscribe to the shared state
    listeners.push(setUser);
    
    const loadUser = async () => {
      // If user is already in shared state, don't refetch unless necessary.
      if (userState) {
        setUser(userState);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const storedUserId = localStorage.getItem('currentUserId');
        const userProfile = await getOrCreateUserAction(storedUserId);

        // If the returned ID is different, it means a new user was created.
        if (storedUserId !== userProfile.id) {
          localStorage.setItem('currentUserId', userProfile.id);
        }
        setUserState(userProfile);
      } catch (e) {
        console.error("Failed to fetch or create user:", e);
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Cleanup listener on unmount
    return () => {
      listeners = listeners.filter(l => l !== setUser);
    };
  }, []);

  const externalRefetch = useCallback(async () => {
      const currentUserId = localStorage.getItem('currentUserId');
      await refetchUser(currentUserId);
  }, [refetchUser]);

  return { user, setUser: setUserState, isLoading, refetchUser: externalRefetch };
};
