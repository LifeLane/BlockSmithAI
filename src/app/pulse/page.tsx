
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Briefcase, Bot, AlertTriangle, LogOut, ShieldX, Target, LogIn, Sparkles, History, DollarSign, Percent, ArrowUp, ArrowDown, CheckCircle, XCircle, Gift, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Import actions and types
import {
  fetchActivePositionsAction,
  closePositionAction,
  fetchMarketDataAction,
  fetchTradeHistoryAction,
  fetchPortfolioStatsAction,
  type Position,
  type LiveMarketData,
  type PortfolioStats,
} from '@/app/actions';

const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

const TimeLeft = ({ expiration, className }: { expiration: string, className?: string }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date(expiration);
            const distance = end.getTime() - now.getTime();

            if (distance < 0) {
                setTimeLeft('Expired');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            let timeLeftString = '';
            if (days > 0) timeLeftString += `${days}d `;
            if (hours > 0) timeLeftString += `${hours}h `;
            if (minutes > 0 && days === 0) timeLeftString += `${minutes}m`;
            
            setTimeLeft(timeLeftString.trim() || '< 1m');
        };

        calculateTimeLeft(); // Initial calculation
        const intervalId = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [expiration]);

    if (!timeLeft) return null;

    return (
        <span className={className}>
            <Clock size={12} className="inline mr-1"/>
            {timeLeft}
        </span>
    );
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
                 <div className="flex flex-col items-end">
                    <Button size="sm" variant="destructive" onClick={() => currentPrice && onClose(position.id, currentPrice)} disabled={isClosing || !currentPrice}>
                        {isClosing ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4 mr-1"/>}
                        Close
                    </Button>
                    {position.expirationTimestamp && (
                        <TimeLeft expiration={position.expirationTimestamp} className="text-xs text-muted-foreground mt-2"/>
                    )}
                </div>
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

const HistoryCard = ({ position }: { position: Position }) => {
    const isWin = position.pnl && position.pnl > 0;
    return (
        <Card className="bg-card/80 backdrop-blur-sm">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    {isWin ? <CheckCircle className="h-6 w-6 text-green-400"/> : <XCircle className="h-6 w-6 text-red-400"/>}
                    <div>
                        <CardTitle className="text-base">{position.signalType} {position.symbol}</CardTitle>
                        <CardDescription className="text-xs">
                            Closed {position.closeTimestamp ? formatDistanceToNow(new Date(position.closeTimestamp)) : ''} ago
                        </CardDescription>
                    </div>
                </div>
                <div className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    PnL: ${position.pnl?.toFixed(2)}
                </div>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex justify-between p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="font-mono">${position.entryPrice.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground">Exit:</span>
                    <span className="font-mono">${position.closePrice?.toFixed(2)}</span>
                </div>
             </CardContent>
        </Card>
    )
}

const StatCard = ({ title, value, icon, valueClassName }: { title: string; value: React.ReactNode; icon: React.ReactNode; valueClassName?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg border border-border/50 text-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {title}</span>
        <span className={`text-xl font-bold font-mono mt-1 ${valueClassName || 'text-primary'}`}>{value}</span>
    </div>
);

const PortfolioStatsDisplay = ({ stats }: { stats: PortfolioStats }) => {
    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 shrink-0">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-accent"><Briefcase /> Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard title="Total Trades" value={stats.totalTrades} icon={<History size={14} />} />
                <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<Percent size={14} />} valueClassName={stats.winRate > 50 ? 'text-green-400' : 'text-red-400'} />
                <StatCard title="Total PnL" value={`$${stats.totalPnl.toFixed(2)}`} icon={<DollarSign size={14} />} valueClassName={stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
                <StatCard title="Best Trade" value={`$${stats.bestTradePnl.toFixed(2)}`} icon={<ArrowUp size={14} />} valueClassName="text-green-400" />
                <StatCard title="Worst Trade" value={`$${stats.worstTradePnl.toFixed(2)}`} icon={<ArrowDown size={14} />} valueClassName="text-red-400" />
                <StatCard title="Lifetime Rewards" value={stats.lifetimeRewards.toLocaleString()} icon={<Gift size={14}/>} valueClassName="text-orange-400" />
            </CardContent>
        </Card>
    );
};


export default function PortfolioPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
    const [displayStats, setDisplayStats] = useState<PortfolioStats | null>(null);
    const [livePrices, setLivePrices] = useState<Record<string, LiveMarketData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
    const { toast } = useToast();
    const userId = getCurrentUserId();
    const isFetching = useRef(false);

    const handleClosePosition = async (positionId: string, closePrice: number, reason: 'manual' | 'expired' | 'auto-sl' | 'auto-tp' = 'manual') => {
        setClosingPositionId(positionId);
        const result = await closePositionAction(positionId, closePrice);
        
        if (result.success) {
            const pnl = result.pnl || 0;
            const points = result.airdropPointsEarned || 0;
            
            let toastTitle = "Position Closed";
            let toastDesc = "Simulated position closed successfully.";

            if (reason === 'expired') {
                toastTitle = "Position Expired";
                toastDesc = "Position was automatically closed due to expiration.";
            } else if (reason === 'auto-sl') {
                toastTitle = "Stop Loss Hit";
                toastDesc = "Position was automatically closed after hitting the stop loss.";
            } else if (reason === 'auto-tp') {
                toastTitle = "Take Profit Hit";
                toastDesc = "Position was automatically closed after hitting the take profit target.";
            }


            toast({
                title: <span className="text-accent">{toastTitle}</span>,
                description: (
                    <div className="text-foreground">
                        {toastDesc}
                        <div>Your position resulted in a PnL of <strong className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${pnl.toFixed(2)}</strong>.</div>
                        {points > 0 && (
                            <div className="flex items-center mt-1">
                                <Sparkles className="h-4 w-4 mr-2 text-orange-400"/>
                                You've earned <strong className="text-orange-400">{points} $BSAI</strong> airdrop points!
                            </div>
                        )}
                    </div>
                ),
            });
            await fetchPortfolioData(true); // Force a full refresh
        } else {
            toast({
                title: "Error Closing Position",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
        setClosingPositionId(null);
    };

    const fetchPortfolioData = useCallback(async (forceRerun = false) => {
        if (!userId || (isFetching.current && !forceRerun)) return;

        isFetching.current = true;
        if (!portfolioStats) setIsLoading(true);

        try {
            const [userPositions, history, statsResult] = await Promise.all([
                fetchActivePositionsAction(userId),
                fetchTradeHistoryAction(userId),
                fetchPortfolioStatsAction(userId),
            ]);

            let currentLivePrices = { ...livePrices };
            if (userPositions.length > 0) {
                const symbols = [...new Set(userPositions.map(p => p.symbol))];
                const pricePromises = symbols.map(symbol => fetchMarketDataAction({ symbol }));
                const results = await Promise.allSettled(pricePromises);

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && !('error' in result.value)) {
                        currentLivePrices[symbols[index]] = result.value as LiveMarketData;
                    } else {
                        console.error(`Failed to fetch price for ${symbols[index]}`);
                    }
                });
                setLivePrices(currentLivePrices);
            }
            
            // --- Auto-close logic ---
            for (const pos of userPositions) {
                if (pos.status !== 'OPEN') continue;

                const livePriceData = currentLivePrices[pos.symbol];
                if (!livePriceData) continue;
                
                const currentPrice = parseFloat(livePriceData.lastPrice);
                let closeReason: 'auto-sl' | 'auto-tp' | 'expired' | null = null;
                let closePrice = 0;

                // Check for SL/TP hits
                if (pos.signalType === 'BUY') {
                    if (pos.takeProfit && currentPrice >= pos.takeProfit) {
                        closeReason = 'auto-tp';
                        closePrice = pos.takeProfit;
                    } else if (pos.stopLoss && currentPrice <= pos.stopLoss) {
                        closeReason = 'auto-sl';
                        closePrice = pos.stopLoss;
                    }
                } else { // SELL
                    if (pos.takeProfit && currentPrice <= pos.takeProfit) {
                        closeReason = 'auto-tp';
                        closePrice = pos.takeProfit;
                    } else if (pos.stopLoss && currentPrice >= pos.stopLoss) {
                        closeReason = 'auto-sl';
                        closePrice = pos.stopLoss;
                    }
                }

                // Check for expiration
                if (!closeReason && pos.expirationTimestamp && new Date(pos.expirationTimestamp) < new Date()) {
                    closeReason = 'expired';
                    closePrice = currentPrice;
                }

                // If a reason to close is found, close the position and stop this cycle
                if (closeReason) {
                    await handleClosePosition(pos.id, closePrice, closeReason);
                    isFetching.current = false;
                    return; // Exit after dispatching close, it will trigger a full refetch.
                }
            }
            
            setPositions(userPositions);
            setTradeHistory(history);
            if (!('error' in statsResult)) {
                setPortfolioStats(statsResult);
            } else {
                setError(statsResult.error);
                setPortfolioStats(null);
            }

        } catch (e: any) {
             setError(e.message || "Failed to fetch portfolio data.");
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [userId, portfolioStats, closingPositionId]); // eslint-disable-line react-hooks/exhaustive-deps
    

    useEffect(() => {
        if (!userId) {
            setError("User not identified. Please visit the Core Console to initialize a session.");
            setIsLoading(false);
            return;
        }
        fetchPortfolioData();
        const interval = setInterval(() => fetchPortfolioData(), 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Effect to calculate and update the displayed stats including unrealized PnL
    useEffect(() => {
        if (!portfolioStats) {
            setDisplayStats(null);
            return;
        }

        const unrealizedPnl = positions.reduce((acc, pos) => {
            const livePriceData = livePrices[pos.symbol];
            if (livePriceData) {
                const currentPrice = parseFloat(livePriceData.lastPrice);
                if (pos.signalType === 'BUY') {
                    return acc + (currentPrice - pos.entryPrice) * pos.size;
                } else { // SELL
                    return acc + (pos.entryPrice - currentPrice) * pos.size;
                }
            }
            return acc;
        }, 0);

        setDisplayStats({
            ...portfolioStats,
            totalPnl: portfolioStats.totalPnl + unrealizedPnl,
        });

    }, [portfolioStats, positions, livePrices]);

    const renderOpenPositions = () => {
        if (positions.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Active Positions</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Open a position from the Core Console to begin.
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
                        onClose={(positionId, closePrice) => handleClosePosition(positionId, closePrice, 'manual')}
                        isClosing={closingPositionId === pos.id}
                    />
                ))}
            </div>
        )
    };
    
    const renderTradeHistory = () => {
        if (tradeHistory.length === 0) {
            return <p className="text-center text-muted-foreground mt-8">No closed trades yet.</p>
        }
        return (
            <div className="space-y-3">
                {tradeHistory.map(pos => <HistoryCard key={pos.id} position={pos} />)}
            </div>
        )
    };

    return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
        {isLoading && !displayStats ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        ) : error ? (
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
                        <Link href="/core">Return to Core</Link>
                    </Button>
                </CardContent>
            </Card>
        ) : (
             <>
                {displayStats && <PortfolioStatsDisplay stats={displayStats} />}
                 <Tabs defaultValue="open" className="flex-grow flex flex-col mt-2 min-h-0">
                    <TabsList className="grid w-full grid-cols-2 shrink-0">
                        <TabsTrigger value="open">Open Positions</TabsTrigger>
                        <TabsTrigger value="history">Trade History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="open" className="flex-grow mt-4 overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                            {renderOpenPositions()}
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="history" className="flex-grow mt-4 overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                            {renderTradeHistory()}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </>
        )}
      </div>
    </>
  );
}

    
