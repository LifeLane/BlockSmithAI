
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Position, GeneratedSignal } from '@/app/actions';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [isLoading, setIsLoading] = useState(true);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    } finally {
        setIsLoading(false);
    }
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
}

export const useClientState = () => {
    const [positions, setPositions, isPositionsLoading] = useLocalStorage<Position[]>('blockshadow_positions', []);
    const [generatedSignals, setGeneratedSignals, isSignalsLoading] = useLocalStorage<GeneratedSignal[]>('blockshadow_signals', []);

    const addPosition = useCallback((newPosition: Position) => {
        setPositions(prev => [...prev, newPosition]);
    }, [setPositions]);

    const updatePosition = useCallback((id: string, updates: Partial<Position>) => {
        setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, [setPositions]);

    const activatePosition = useCallback((id: string) => {
        updatePosition(id, { status: 'OPEN', openTimestamp: new Date().toISOString() });
    }, [updatePosition]);

    const addGeneratedSignal = useCallback((newSignal: GeneratedSignal) => {
        setGeneratedSignals(prev => [newSignal, ...prev]);
    }, [setGeneratedSignals]);

    const updateGeneratedSignal = useCallback((id: string, updates: Partial<GeneratedSignal>) => {
        setGeneratedSignals(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, [setGeneratedSignals]);
    
    return {
        positions,
        addPosition,
        updatePosition,
        activatePosition,
        generatedSignals,
        addGeneratedSignal,
        updateGeneratedSignal,
        isLoading: isPositionsLoading || isSignalsLoading
    }
}
