
'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  fetchPendingAndOpenPositionsAction,
  closePositionAction,
  fetchTradeHistoryAction,
  fetchPortfolioStatsAction,
  openPendingPositionAction,
  archivePositionAction,
  type Position,
  type LiveMarketData,
  type PortfolioStats,
} from '@/app/actions';
import { fetchMarketDataAction } from '@/services/market-data-service';
import { Sparkles } from 'lucide-react';

export const usePortfolioManager = (userId?: string) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, LiveMarketData>>({});
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [realtimePnl, setRealtimePnl] = useState(0);

  const { toast } = useToast();
  const isFetchingRef = useRef(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showCloseToast = useCallback((closedPosition: Position, airdropPoints: number, reason: string) => {
    const pnl = closedPosition.pnl || 0;
    toast({
        title: React.createElement('span', { className: 'text-accent' }, reason),
        description: React.createElement('div', { className: 'text-foreground' }, 
            React.createElement('div', null, 
                'Your position resulted in a PnL of ',
                React.createElement('strong', { className: pnl >= 0 ? 'text-stat-green' : 'text-red-400' }, `$${pnl.toFixed(2)}`),
                '.'
            ),
            airdropPoints > 0 && React.createElement('div', { className: 'flex items-center mt-1' },
                React.createElement(Sparkles, { className: 'h-4 w-4 mr-2 text-stat-orange' }),
                "You've earned ",
                React.createElement('strong', { className: 'text-stat-orange' }, `${airdropPoints} $BSAI`),
                ' airdrop points!'
            )
        )
    });
  }, [toast]);
    
  const showFilledToast = useCallback((filledPosition: Position) => {
    toast({
        title: React.createElement('span', { className: 'text-primary' }, 'Order Filled!'),
        description: `Your ${filledPosition.signalType} order for ${filledPosition.symbol} at $${filledPosition.entryPrice} has been executed.`
    });
  }, [toast]);

  const showExpiredToast = useCallback((expiredPosition: Position) => {
    toast({
        title: React.createElement('span', { className: 'text-muted-foreground' }, 'Order Expired'),
        description: `Your pending ${expiredPosition.signalType} order for ${expiredPosition.symbol} at $${expiredPosition.entryPrice} has expired.`
    });
  }, [toast]);

  const runSimulationCycle = useCallback(async (currentUserId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    const initialLoad = positions.length === 0 && tradeHistory.length === 0;
    if (initialLoad) {
        setIsLoadingData(true);
    }

    try {
        const [currentPositions, history, statsResult] = await Promise.all([
            fetchPendingAndOpenPositionsAction(currentUserId),
            fetchTradeHistoryAction(currentUserId),
            fetchPortfolioStatsAction(currentUserId),
        ]);
        
        setTradeHistory(history);
        if (!('error' in statsResult)) setPortfolioStats(statsResult);

        if (currentPositions.length === 0) {
             setPositions([]);
             isFetchingRef.current = false;
             if (initialLoad) setIsLoadingData(false);
             return;
        }

        const symbols = [...new Set(currentPositions.map(p => p.symbol))];
        const pricePromises = symbols.map(symbol => fetchMarketDataAction({ symbol }));
        const priceResults = await Promise.all(pricePromises);

        const updatedLivePrices: Record<string, LiveMarketData> = {};
        priceResults.forEach((result, index) => {
            if (!('error' in result)) {
                updatedLivePrices[symbols[index]] = result;
            }
        });
        setLivePrices(current => ({ ...current, ...updatedLivePrices }));

        let needsReFetch = false;
        for (const pos of currentPositions) {
            const livePriceData = updatedLivePrices[pos.symbol];
            if (!livePriceData) continue;
            
            const currentPrice = parseFloat(livePriceData.lastPrice);
            
            if (pos.status === 'PENDING') {
                if (pos.expirationTimestamp && new Date(pos.expirationTimestamp) < new Date()) {
                    await archivePositionAction(pos.id);
                    showExpiredToast(pos);
                    needsReFetch = true;
                    continue;
                }

                let triggered = false;
                if (pos.signalType === 'BUY' && currentPrice <= pos.entryPrice) triggered = true;
                else if (pos.signalType === 'SELL' && currentPrice >= pos.entryPrice) triggered = true;

                if (triggered) {
                    const result = await openPendingPositionAction(pos.id);
                    if (result.position) {
                        showFilledToast(result.position);
                        needsReFetch = true;
                    }
                }

            } else if (pos.status === 'OPEN') {
                let closeReason: string | null = null;
                let closePrice = 0;
                
                if (pos.takeProfit != null && pos.stopLoss != null) {
                    if (pos.signalType === 'BUY') {
                        if (currentPrice >= pos.takeProfit) { closeReason = 'Take Profit Hit'; closePrice = pos.takeProfit; } 
                        else if (currentPrice <= pos.stopLoss) { closeReason = 'Stop Loss Hit'; closePrice = pos.stopLoss; }
                    } else { // SELL
                        if (currentPrice <= pos.takeProfit) { closeReason = 'Take Profit Hit'; closePrice = pos.takeProfit; }
                        else if (currentPrice >= pos.stopLoss) { closeReason = 'Stop Loss Hit'; closePrice = pos.stopLoss; }
                    }
                }
                
                if (!closeReason && pos.expirationTimestamp && new Date(pos.expirationTimestamp) < new Date()) {
                    closeReason = 'Position Expired';
                    closePrice = currentPrice;
                }

                if (closeReason) {
                    const result = await closePositionAction(pos.id, closePrice);
                    if (result.position) {
                        showCloseToast(result.position, result.airdropPointsEarned || 0, closeReason);
                        needsReFetch = true;
                    }
                }
            }
        }
        
        if (needsReFetch) {
             const [finalPositions, finalHistory, finalStats] = await Promise.all([
                fetchPendingAndOpenPositionsAction(currentUserId),
                fetchTradeHistoryAction(currentUserId),
                fetchPortfolioStatsAction(currentUserId),
            ]);
            setPositions(finalPositions);
            setTradeHistory(finalHistory);
            if (!('error' in finalStats)) setPortfolioStats(finalStats);
        } else {
            setPositions(currentPositions);
        }

    } catch (e: any) {
         console.error("Error in simulation cycle:", e);
    } finally {
        if (initialLoad) setIsLoadingData(false);
        isFetchingRef.current = false;
    }
  }, [showCloseToast, showFilledToast, showExpiredToast, positions.length, tradeHistory.length]);
  
  const handleManualClose = useCallback(async (positionId: string, closePrice: number) => {
    if (!userId) return;
    setClosingPositionId(positionId);
    const positionToClose = positions.find(p => p.id === positionId);
    if (positionToClose?.status === 'PENDING') {
        await archivePositionAction(positionId);
        showExpiredToast(positionToClose);
    } else {
        const result = await closePositionAction(positionId, closePrice);
        if (result.position) {
            showCloseToast(result.position, result.airdropPointsEarned || 0, 'Position Closed Manually');
        } else {
            toast({ title: "Error Closing Position", description: result.error, variant: "destructive" });
        }
    }
    await runSimulationCycle(userId);
    setClosingPositionId(null);
  }, [positions, showCloseToast, showExpiredToast, toast, userId, runSimulationCycle]);

  useEffect(() => {
    if (userId) {
        const run = async () => {
            await runSimulationCycle(userId);
            if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = setTimeout(run, 15000);
        };
        run();
    }
    return () => { if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); }
  }, [userId, runSimulationCycle]); 

  useEffect(() => {
    const openPositions = positions.filter(p => p.status === 'OPEN');
    if (openPositions.length === 0) {
        setRealtimePnl(0);
        return;
    }

    const totalPnl = openPositions.reduce((acc, pos) => {
        const livePriceData = livePrices[pos.symbol];
        if (!livePriceData) return acc;

        const currentPrice = parseFloat(livePriceData.lastPrice);
        const positionSize = pos.size || 1;
        const priceDiff = pos.signalType === 'BUY'
            ? (currentPrice - pos.entryPrice)
            : (pos.entryPrice - currentPrice);
        
        return acc + (priceDiff * positionSize);
    }, 0);

    setRealtimePnl(totalPnl);
  }, [positions, livePrices]);

  return {
    positions,
    tradeHistory,
    portfolioStats,
    livePrices,
    closingPositionId,
    isLoadingData,
    realtimePnl,
    handleManualClose
  };
};
