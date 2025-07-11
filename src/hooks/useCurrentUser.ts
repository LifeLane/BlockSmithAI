
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateUserAction, type UserProfile } from '@/app/actions';

type ConnectionStatus = 'online' | 'offline';

interface CurrentUserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  refetchUser: () => Promise<void>;
}

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
      const userProfile = await getOrCreateUserAction(userId);
      setUser(userProfile);
      setConnectionStatus('online');
      if (typeof window !== 'undefined' && userProfile.id !== userId) {
        localStorage.setItem('currentUserId', userProfile.id);
      }
    } catch (e) {
      console.error("Mainnet connection failed, creating guest session:", e);
      setConnectionStatus('offline');
      // Always create a guest profile if offline, ensuring a consistent state.
      const guestId = userId && userId.startsWith('guest_') ? userId : `guest_${Date.now()}`;
      setUser(createGuestProfile(guestId));
      if (typeof window !== 'undefined' && guestId !== userId) {
            localStorage.setItem('currentUserId', guestId);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      loadUser(userIdFromStorage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchUser = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('currentUserId');
      await loadUser(userIdFromStorage);
    }
  }, [loadUser]);

  return { user, setUser, isLoading, connectionStatus, refetchUser };
};
