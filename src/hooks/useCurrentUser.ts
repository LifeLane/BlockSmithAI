
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

interface CurrentUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

let userState: UserProfile | null = null;
let listeners: ((user: UserProfile | null) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener(userState));
};

const setUserState = (user: UserProfile | null) => {
  userState = user;
  notifyListeners();
};

export const useCurrentUser = (): CurrentUserContextType & { setUser: (user: UserProfile | null) => void } => {
  const [user, _setUser] = useState<UserProfile | null>(userState);
  const [isLoading, setIsLoading] = useState(!userState);

  const refetchUser = useCallback(async (currentUserId: string | null = null) => {
    setIsLoading(true);
    try {
      const idToFetch = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('currentUserId') : null);
      const userProfile = await getOrCreateUserAction(idToFetch);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUserId', userProfile.id);
      }
      setUserState(userProfile);
    } catch (e) {
      console.error("Failed to refetch user:", e);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStateChange = (newUserState: UserProfile | null) => {
      _setUser(newUserState);
    };
    
    listeners.push(handleStateChange);
    
    // Initial load if state is not already set
    if (!userState) {
      refetchUser();
    }

    return () => {
      listeners = listeners.filter(l => l !== handleStateChange);
    };
  }, [refetchUser]);

  return { 
    user, 
    setUser: setUserState, // Expose the global setter
    isLoading, 
    refetchUser
  };
};
