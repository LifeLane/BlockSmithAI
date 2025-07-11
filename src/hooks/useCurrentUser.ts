
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

type ConnectionStatus = 'online' | 'offline';

interface CurrentUserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  refetchUser: () => Promise<void>;
}

// A more robust offline fallback user profile
const createGuestProfile = (id: string): UserProfile => ({
  id,
  shadowId: 'SHDW-GUEST',
  username: 'Guest Analyst',
  status: 'Guest',
  weeklyPoints: 0,
  airdropPoints: 0,
  claimedMissions: [],
  badges: [],
  email: null,
  phone: null,
  wallet_address: null,
  wallet_type: null,
  x_handle: null,
  telegram_handle: null,
  youtube_handle: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');

  const loadUser = useCallback(async (userId: string | null) => {
    setIsLoading(true);
    try {
      // Attempt to get or create a user from the backend
      const userProfile = await getOrCreateUserAction(userId);
      setUser(userProfile);
      setConnectionStatus('online');
      // Ensure localStorage has the correct (potentially new) ID
      if (typeof window !== 'undefined' && userProfile.id !== userId) {
        localStorage.setItem('currentUserId', userProfile.id);
      }
    } catch (e) {
      console.error("Failed to connect to Mainnet, creating offline guest session:", e);
      setConnectionStatus('offline');
      // If there's an error, check if we already have a user object in state.
      // If not, create a temporary guest profile to keep the app functional.
      if (!user) {
        const guestId = userId && userId.startsWith('guest_') ? userId : `guest_${Date.now()}`;
        setUser(createGuestProfile(guestId));
        if (typeof window !== 'undefined' && guestId !== userId) {
             localStorage.setItem('currentUserId', guestId);
        }
      }
      // If we *do* have a user object, we keep it, but set status to offline.
      // This prevents a logged-in user from being reverted to a guest on a temporary network blip.
    } finally {
      setIsLoading(false);
    }
  }, [user]); // depend on `user` to avoid creating a new guest profile if one already exists.

  // Initial load on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      loadUser(userIdFromStorage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Expose a refetch function to be called manually
  const refetchUser = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      await loadUser(userIdFromStorage);
    }
  }, [loadUser]);

  return { user, setUser, isLoading, connectionStatus, refetchUser };
};
