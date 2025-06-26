
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Briefcase, X, Bot, AlertTriangle, LogOut, ShieldX, Target, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Import actions and types
import {
  fetchActivePositionsAction,
  closePositionAction,
  fetchMarketDataAction,
  type Position,
  type LiveMarketData,
} from '@/app/actions';

const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

const PositionCard = ({ position, currentPrice, onClose, isClosing }: { position: Position, currentPrice?: number, onClose: (positionId: string, closePrice: number) => void, isClosing: boolean }) => {
    let pnl = 0;
    let pnlPercent = 0;

    if (currentPrice) {
        if (position.signalType === 'BUY') {
            pnl = (currentPrice - position.entryPrice) * position.size;
        } else {
            pnl = (position.entryPrice - currentPrice) * position.size;
        }
        if (position.entryPrice > 0) {
            pnlPercent = (pnl / (position.entryPrice * position.size)) * 100;
        }
    }

    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                    <CardTitle className="text-lg flex items-center">
                        <span className={`mr-2 font-bold ${position.signalType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{position.signalType === 'BUY' ? 'LONG' : 'SHORT'}</span>
                        {position.symbol}
                    </CardTitle>
                    <CardDescription className="text-xs">Opened: {formatDistanceToNow(new Date(position.openTimestamp))} ago</CardDescription>
                </div>
                <Button size="sm" variant="destructive" onClick={() => currentPrice && onClose(position.id, currentPrice)} disabled={isClosing || !currentPrice}>
                    {isClosing ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4 mr-1"/>}
                    Close
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><LogIn size={12}/>Entry Price</span>
                    <span className="font-mono font-semibold text-primary">${position.entryPrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Current Price</span>
                    <span className="font-mono font-semibold text-primary">{currentPrice ? `$${currentPrice.toLocaleString()}`: <Loader2 className="h-4 w-4 animate-spin"/>}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">{position.stopLoss ? `$${position.stopLoss.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">{position.takeProfit ? `$${position.takeProfit.toLocaleString()}`: 'N/A'}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Unrealized PnL</span>
                    <span className={`font-mono font-semibold ${pnlColor}`}>{currentPrice ? `$${pnl.toFixed(2)}` : '...'}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Unrealized PnL %</span>
                    <span className={`font-mono font-semibold ${pnlColor}`}>{currentPrice ? `${pnlPercent.toFixed(2)}%` : '...'}</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function PortfolioPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, LiveMarketData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
    const { toast } = useToast();
    const userId = getCurrentUserId();

    const fetchPortfolioData = useCallback(async () => {
        if (!userId) {
            setError("User not identified. Please sign up or log in to view your portfolio.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const userPositions = await fetchActivePositionsAction(userId);
        setPositions(userPositions);

        if (userPositions.length > 0) {
            const symbols = [...new Set(userPositions.map(p => p.symbol))];
            const pricePromises = symbols.map(symbol => fetchMarketDataAction({ symbol }));
            const results = await Promise.allSettled(pricePromises);

            const newLivePrices: Record<string, LiveMarketData> = {};
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && !('error' in result.value)) {
                    newLivePrices[symbols[index]] = result.value as LiveMarketData;
                } else {
                    console.error(`Failed to fetch price for ${symbols[index]}`);
                }
            });
            setLivePrices(prev => ({...prev, ...newLivePrices}));
        }
        setIsLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchPortfolioData();
        const interval = setInterval(fetchPortfolioData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchPortfolioData]);

    const handleClosePosition = async (positionId: string, closePrice: number) => {
        setClosingPositionId(positionId);
        const result = await closePositionAction(positionId, closePrice);
        if (result.success) {
            toast({
                title: "Position Closed",
                description: `Your position has been successfully closed with a PnL of $${result.pnl?.toFixed(2)}.`,
            });
            // Refresh portfolio data
            fetchPortfolioData();
        } else {
            toast({
                title: "Error Closing Position",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
        setClosingPositionId(null);
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (error) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="mt-4 text-destructive">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-destructive-foreground">{error}</p>
                        <Button asChild className="glow-button mt-4">
                            <Link href="/missions">Register Here</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (positions.length === 0) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Open Positions</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            Your portfolio is empty. Go to the <strong className="text-accent">Core Console</strong> to open a simulated position based on SHADOW's analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild className="glow-button">
                             <Link href="/core">
                                Go to Core Console
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {positions.map(pos => (
                    <PositionCard
                        key={pos.id}
                        position={pos}
                        currentPrice={livePrices[pos.symbol] ? parseFloat(livePrices[pos.symbol].lastPrice) : undefined}
                        onClose={handleClosePosition}
                        isClosing={closingPositionId === pos.id}
                    />
                ))}
            </div>
        );
    }


  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center">
                 <Briefcase className="h-8 w-8 text-primary mb-1" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Portfolio <span className="text-primary">Monitor</span></h1>
            <p className="text-muted-foreground">Real-time overview of your open simulated positions.</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            {renderContent()}
        </ScrollArea>
      </div>
    </>
  );
}

    