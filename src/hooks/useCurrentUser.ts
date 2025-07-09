
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
      console.error("Failed to initialize user session, creating offline fallback:", e);
      setError("Offline Mode: Could not connect to the server. Progress will not be saved.");
      
      const guestId = userId || `guest_${Date.now()}`;
      
      const fallbackUser: UserProfile = {
        id: guestId,
        shadowId: `SHDW-${guestId.substring(guestId.length - 7).toUpperCase()}`,
        username: `Analyst_${guestId.substring(guestId.length - 6)}`,
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
      };
      
      setUser(fallbackUser);

      if (!userId) {
        localStorage.setItem('currentUserId', guestId);
      }
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
    loadUser(userIdFromStorage);
  }, [loadUser]);

  return { user, isLoading, error, refetch };
};
