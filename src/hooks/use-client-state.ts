
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LiveMarketData } from '@/app/actions';
import { fetchMarketDataAction } from '@/services/market-data-service';
import type { Position as DbPosition, GeneratedSignal as DbGeneratedSignal } from '@prisma/client'

// Redefine types for client-side usage to avoid direct Prisma dependency on the client
export type PositionStatus = 'PENDING' | 'OPEN' | 'CLOSED';
export type SignalType = 'BUY' | 'SELL';
export type PositionType = 'INSTANT' | 'CUSTOM';

export type Position = Omit<DbPosition, 'signalType' | 'status' | 'type' | 'createdAt' | 'openTimestamp' | 'closeTimestamp'> & {
    signalType: SignalType;
    status: PositionStatus;
    type: PositionType;
    createdAt: string;
    openTimestamp: string | null;
    closeTimestamp: string | null;
    analysisSummary: string | null;
    newsAnalysis: string | null;
    strategyReasoning: string | null;
};

export type GeneratedSignalStatus = 'PENDING_EXECUTION' | 'EXECUTED' | 'DISMISSED';

export type GeneratedSignal = Omit<DbGeneratedSignal, 'signal' | 'status' | 'createdAt' | 'position'> & {
    signal: SignalType;
    status: GeneratedSignalStatus;
    createdAt: string;
    position: Position | null;
};


const parsePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
};

// Store state in a higher scope to persist across hook instances
let clientPositions: Position[] = [];
let clientSignals: GeneratedSignal[] = [];
let isInitialized = false;

let listeners: (() => void)[] = [];

const notifyListeners = () => {
    listeners.forEach(l => l());
};

const useClientState = () => {
    const [_, setTick] = useState(0); // Dummy state to trigger re-renders

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.push(listener);
        
        if (!isInitialized && typeof window !== 'undefined') {
            try {
                const storedPositions = localStorage.getItem('clientPositions');
                const storedSignals = localStorage.getItem('clientSignals');
                if (storedPositions) clientPositions = JSON.parse(storedPositions);
                if (storedSignals) clientSignals = JSON.parse(storedSignals);
            } catch (e) {
                console.error("Failed to parse client state from localStorage", e);
                localStorage.removeItem('clientPositions');
                localStorage.removeItem('clientSignals');
            } finally {
                isInitialized = true;
                notifyListeners();
            }
        }

        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }, []);

    const persistPositions = (newPositions: Position[]) => {
        clientPositions = newPositions;
        localStorage.setItem('clientPositions', JSON.stringify(clientPositions));
        notifyListeners();
    };

    const persistSignals = (newSignals: GeneratedSignal[]) => {
        clientSignals = newSignals;
        localStorage.setItem('clientSignals', JSON.stringify(clientSignals));
        notifyListeners();
    };

    const addPosition = useCallback((position: Position) => {
        persistPositions([position, ...clientPositions]);
    }, []);
    
    const addSignal = useCallback((signal: GeneratedSignal) => {
        persistSignals([signal, ...clientSignals]);
    }, []);

    const updatePosition = useCallback((updatedPosition: Position) => {
        persistPositions(clientPositions.map(p => p.id === updatedPosition.id ? updatedPosition : p));
    }, []);
    
    const updateSignal = useCallback((updatedSignal: GeneratedSignal) => {
        persistSignals(clientSignals.map(s => s.id === updatedSignal.id ? updatedSignal : s));
    }, []);

    const closePosition = useCallback((positionId: string, closePrice: number) => {
        const position = clientPositions.find(p => p.id === positionId);
        if (!position || position.status !== 'OPEN') return null;
        
        const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
        
        const updatedPosition: Position = {
            ...position,
            status: 'CLOSED',
            closePrice,
            pnl,
            closeTimestamp: new Date().toISOString(),
        };
        updatePosition(updatedPosition);
        return updatedPosition;
    }, [updatePosition]);
    
    const activatePosition = useCallback((positionId: string) => {
        const position = clientPositions.find(p => p.id === positionId);
        if (!position || position.status !== 'PENDING') return;

        const updatedPosition: Position = {
            ...position,
            status: 'OPEN',
            openTimestamp: new Date().toISOString(),
        };
        updatePosition(updatedPosition);
    }, [updatePosition]);

    const closeAllPositions = useCallback(async () => {
        const openPositions = clientPositions.filter(p => p.status === 'OPEN');
        if (openPositions.length === 0) return 0;
        
        const symbolsToFetch = [...new Set(openPositions.map(p => p.symbol))];
        const pricePromises = symbolsToFetch.map(symbol => fetchMarketDataAction({ symbol }));
        const priceResults = await Promise.all(pricePromises);
        
        const prices: Record<string, number> = {};
        for(const result of priceResults) {
            if(!('error' in result)) {
                prices[result.symbol] = parseFloat(result.lastPrice);
            }
        }

        let closedCount = 0;
        const updatedPositions = clientPositions.map(position => {
            if (position.status !== 'OPEN') return position;
            const closePrice = prices[position.symbol];
            if (!closePrice) return position;

            closedCount++;
            const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
            return {
                ...position,
                status: 'CLOSED',
                closePrice,
                pnl,
                closeTimestamp: new Date().toISOString(),
            };
        });

        persistPositions(updatedPositions);
        return closedCount;
    }, []);

    const dismissSignal = useCallback((signalId: string) => {
        const signal = clientSignals.find(s => s.id === signalId);
        if (!signal) return;
        updateSignal({ ...signal, status: 'DISMISSED' });
    }, [updateSignal]);

    const executeSignal = useCallback((signalId: string) => {
        const signal = clientSignals.find(s => s.id === signalId);
        if (!signal || signal.status !== 'PENDING_EXECUTION') return;

        const newPosition: Position = {
            id: `pos_${signal.id}`,
            userId: signal.userId,
            symbol: signal.symbol,
            signalType: signal.signal,
            status: 'PENDING',
            entryPrice: parsePrice(signal.entry_zone),
            stopLoss: parsePrice(signal.stop_loss),
            takeProfit: parsePrice(signal.take_profit),
            tradingMode: signal.chosenTradingMode,
            riskProfile: signal.chosenRiskProfile,
            type: 'CUSTOM',
            sentiment: signal.sentiment,
            gpt_confidence_score: signal.gpt_confidence_score,
            openTimestamp: null,
            closeTimestamp: null,
            closePrice: null,
            pnl: null,
            size: 1,
            strategyId: signal.id,
            createdAt: new Date().toISOString(),
            analysisSummary: signal.analysisSummary,
            newsAnalysis: signal.newsAnalysis,
            strategyReasoning: signal.strategyReasoning,
            gainedXp: 0,
            gainedAirdropPoints: 0,
        };

        const updatedSignal: GeneratedSignal = {
            ...signal,
            status: 'EXECUTED',
            position: newPosition
        };
        
        updateSignal(updatedSignal);
        addPosition(newPosition);
    }, [updateSignal, addPosition]);

    return {
        positions: clientPositions,
        addPosition,
        updatePosition,
        closePosition,
        activatePosition,
        closeAllPositions,
        signals: clientSignals,
        addSignal,
        updateSignal,
        dismissSignal,
        executeSignal,
        isInitialized,
    };
};

export { useClientState };

    