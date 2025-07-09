
'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchMarketDataAction } from '@/services/market-data-service';

// --- Type Definitions for Client-Side State ---

export type PositionStatus = 'PENDING' | 'OPEN' | 'CLOSED';
export type SignalType = 'BUY' | 'SELL';
export type PositionType = 'INSTANT' | 'CUSTOM';

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  signalType: SignalType;
  status: PositionStatus;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  size: number;
  tradingMode: string;
  riskProfile: string;
  type: PositionType;
  sentiment: string;
  gpt_confidence_score: string;
  createdAt: string;
  openTimestamp: string | null;
  closeTimestamp: string | null;
  closePrice: number | null;
  pnl: number | null;
  gainedXp?: number | null;
  gainedAirdropPoints?: number | null;
  gasPaid?: number | null;
  blocksTrained?: number | null;
  strategyId?: string | null;
}

export type GeneratedSignalStatus = 'PENDING_EXECUTION' | 'EXECUTED' | 'DISMISSED';

export interface GeneratedSignal {
  id: string;
  userId: string;
  symbol: string;
  signal: SignalType;
  entry_zone: string;
  stop_loss: string;
  take_profit: string;
  confidence: string;
  gpt_confidence_score: string;
  risk_rating: string;
  sentiment: string;
  currentThought: string;
  shortTermPrediction: string;
  chosenTradingMode: string;
  chosenRiskProfile: string;
  strategyReasoning: string;
  analysisSummary: string;
  newsAnalysis?: string | null;
  status: GeneratedSignalStatus;
  createdAt: string;
}

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};

// --- Main Client State Hook ---

export const useClientState = () => {
  const [positions, setPositions] = useLocalStorage<Position[]>('bsai_positions', []);
  const [signals, setSignals] = useLocalStorage<GeneratedSignal[]>('bsai_signals', []);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect ensures that we only read from localStorage on the client,
    // preventing hydration mismatches.
    const positionsItem = window.localStorage.getItem('bsai_positions');
    if (positionsItem) setPositions(JSON.parse(positionsItem));

    const signalsItem = window.localStorage.getItem('bsai_signals');
    if (signalsItem) setSignals(JSON.parse(signalsItem));
    
    setIsInitialized(true);
  }, []);

  // --- Positions Management ---

  const addPosition = useCallback((position: Position) => {
    setPositions(prev => [position, ...prev]);
  }, [setPositions]);

  const updatePosition = useCallback((updatedPosition: Position) => {
    setPositions(prev => prev.map(p => (p.id === updatedPosition.id ? updatedPosition : p)));
  }, [setPositions]);

  const closePosition = useCallback((positionId: string, closePrice: number): Position | null => {
    let closedPosition: Position | null = null;
    setPositions(prev => {
      const newPositions = prev.map(p => {
        if (p.id === positionId && p.status === 'OPEN') {
          const pnl = (p.signalType === 'BUY' ? closePrice - p.entryPrice : p.entryPrice - closePrice) * p.size;
          
          const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
          const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };
          const modeMultiplier = modeMultipliers[p.tradingMode] || 1.0;
          const riskMultiplier = riskMultipliers[p.riskProfile] || 1.0;
          
          const BASE_WIN_XP = 50, BASE_LOSS_XP = 10;
          const BASE_WIN_AIRDROP_BONUS = 25, BASE_LOSS_AIRDROP_BONUS = 5;

          const gainedXp = pnl > 0 ? BASE_WIN_XP * modeMultiplier * riskMultiplier : BASE_LOSS_XP * modeMultiplier;
          const gainedAirdropPoints = pnl > 0 ? pnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier) : pnl + BASE_LOSS_AIRDROP_BONUS;
          const gasPaid = 1.25 + (riskMultiplier - 1) + (modeMultiplier - 1);
          const blocksTrained = 100 + Math.floor(Math.abs(pnl) * 2);

          closedPosition = {
            ...p,
            status: 'CLOSED',
            closePrice,
            pnl,
            closeTimestamp: new Date().toISOString(),
            gainedXp: Math.round(gainedXp),
            gainedAirdropPoints: Math.round(gainedAirdropPoints),
            gasPaid: parseFloat(gasPaid.toFixed(2)),
            blocksTrained
          };
          return closedPosition;
        }
        return p;
      });
      return newPositions;
    });
    return closedPosition;
  }, [setPositions]);

  const activatePosition = useCallback((positionId: string) => {
    setPositions(prev => prev.map(p => (p.id === positionId && p.status === 'PENDING' ? { ...p, status: 'OPEN', openTimestamp: new Date().toISOString() } : p)));
  }, [setPositions]);

  const closeAllPositions = useCallback(async (): Promise<number> => {
    const openPositions = positions.filter(p => p.status === 'OPEN');
    if (openPositions.length === 0) return 0;

    const pricePromises = openPositions.map(p => fetchMarketDataAction({ symbol: p.symbol }));
    const prices = await Promise.all(pricePromises);

    let closedCount = 0;
    setPositions(prev => {
        return prev.map(p => {
            if (p.status !== 'OPEN') return p;
            
            const marketData = prices.find(price => !('error' in price) && price.symbol === p.symbol);
            if (marketData && !('error' in marketData)) {
                closedCount++;
                const closePrice = parseFloat(marketData.lastPrice);
                const pnl = (p.signalType === 'BUY' ? closePrice - p.entryPrice : p.entryPrice - closePrice) * p.size;
                return { ...p, status: 'CLOSED', closePrice, pnl, closeTimestamp: new Date().toISOString() };
            }
            // If price fetch fails, leave it open
            return p;
        });
    });
    return closedCount;
  }, [positions, setPositions]);

  // --- Signals Management ---

  const addSignal = useCallback((signal: GeneratedSignal) => {
    setSignals(prev => [signal, ...prev]);
  }, [setSignals]);

  const updateSignal = useCallback((updatedSignal: GeneratedSignal) => {
    setSignals(prev => prev.map(s => (s.id === updatedSignal.id ? updatedSignal : s)));
  }, [setSignals]);

  const dismissSignal = useCallback((signalId: string) => {
    setSignals(prev => prev.map(s => (s.id === signalId ? { ...s, status: 'DISMISSED' } : s)));
  }, [setSignals]);

  const executeSignal = useCallback((signalId: string) => {
    const signal = signals.find(s => s.id === signalId);
    if (!signal) return;

    const parsePrice = (priceStr: string): number => {
        const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
        const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
        if (parts.length === 0) return NaN;
        if (parts.length === 1) return parseFloat(parts[0]);
        const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
        return sum / parts.length;
    };

    const newPosition: Position = {
      id: `pos_${new Date().getTime()}`,
      userId: signal.userId,
      symbol: signal.symbol,
      signalType: signal.signal,
      status: 'PENDING',
      entryPrice: parsePrice(signal.entry_zone),
      stopLoss: parsePrice(signal.stop_loss),
      takeProfit: parsePrice(signal.take_profit),
      size: 1, // Default size
      tradingMode: signal.chosenTradingMode || 'Custom',
      riskProfile: signal.chosenRiskProfile || 'Medium',
      type: 'CUSTOM',
      sentiment: signal.sentiment,
      gpt_confidence_score: signal.gpt_confidence_score,
      createdAt: new Date().toISOString(),
      openTimestamp: null,
      closeTimestamp: null,
      closePrice: null,
      pnl: null,
      strategyId: signal.id,
    };

    addPosition(newPosition);
    updateSignal({ ...signal, status: 'EXECUTED' });
  }, [signals, addPosition, updateSignal]);


  return {
    positions,
    addPosition,
    updatePosition,
    closePosition,
    activatePosition,
    closeAllPositions,
    signals,
    addSignal,
    updateSignal,
    dismissSignal,
    executeSignal,
    isInitialized,
  };
};

    