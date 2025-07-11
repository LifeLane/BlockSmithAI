
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
      const guestId = userId && userId.startsWith('guest_') ? userId : `guest_${Date.now()}`;
      if (typeof window !== 'undefined') {
        const storedGuest = localStorage.getItem('guestUser');
        if (storedGuest) {
            setUser(JSON.parse(storedGuest));
        } else {
            const newGuestProfile = createGuestProfile(guestId);
            setUser(newGuestProfile);
            localStorage.setItem('guestUser', JSON.stringify(newGuestProfile));
        }
        localStorage.setItem('currentUserId', guestId);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser && updatedUser.status === 'Guest') {
        localStorage.setItem('guestUser', JSON.stringify(updatedUser));
    }
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

  return { user, setUser: updateUser, isLoading, connectionStatus, refetchUser };
};
