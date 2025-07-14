
'use client';

import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

interface CurrentUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const idToFetch = localStorage.getItem('currentUserId');
      const userProfile = await getOrCreateUserAction(idToFetch);
      
      // If the returned user is a guest, we only set their ID in localStorage.
      // If they are a registered user, we persist their real ID.
      if (userProfile.id) {
          localStorage.setItem('currentUserId', userProfile.id);
      }
      
      setUser(userProfile);
    } catch (e) {
      console.error("Failed to refetch user:", e);
      // On failure, clear stored ID and user state
      localStorage.removeItem('currentUserId');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const contextValue = {
    user,
    isLoading,
    refetchUser,
    setUser,
  };

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserState = (): CurrentUserContextType => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error('useCurrentUserState must be used within a CurrentUserProvider');
  }
  return context;
};

    