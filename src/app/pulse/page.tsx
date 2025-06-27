
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Briefcase, AlertTriangle, LogOut, Sparkles, History, DollarSign, Percent, ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PauseCircle, CheckCircle2, XCircle, Bot, PlayCircle, Hourglass } from 'lucide-react';
import {
  fetchPendingAndOpenPositionsAction,
  activatePendingPositionAction,
  closePositionAction,
  fetchMarketDataAction,
  fetchTradeHistoryAction,
  fetchPortfolioStatsAction,
  type Position,
  type LiveMarketData,
  type PortfolioStats,
} from '@/app/actions';
import { Button } from '@/components/ui/button';

const TimeLeft = ({ expiration, className }: { expiration?: Date | null, className?: string }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!expiration) return;

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

        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 60000);

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
    const isPending = position.status === 'PENDING';

    if (currentPrice && !isPending) {
        if (position.signalType === 'BUY') {
            pnl = (currentPrice - position.entryPrice);
        } else {
            pnl = (position.entryPrice - currentPrice);
        }
        if (position.entryPrice > 0) {
            pnlPercent = (pnl / position.entryPrice) * 100;
        }
    }

    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
    const statusText = isPending ? 'PENDING' : 'OPEN';
    const statusIcon = isPending ? <Hourglass className="h-4 w-4 mr-2 text-yellow-400"/> : <PlayCircle className="h-4 w-4 mr-2 text-blue-400"/>;
    const statusBadgeColor = isPending ? 'border-yellow-500/50 bg-yellow-900/60 text-yellow-300' : 'border-blue-500/50 bg-blue-900/60 text-blue-300';
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                    <CardTitle className="text-lg flex items-center">
                        <span className={`mr-2 font-bold ${position.signalType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{position.signalType === 'BUY' ? 'LONG' : 'SHORT'}</span>
                        {position.symbol}
                    </CardTitle>
                     <CardDescription className="text-xs">
                        {isPending ? 'Awaiting execution...' : `Opened: ${position.openTimestamp ? formatDistanceToNow(new Date(position.openTimestamp)) : 'N/A'} ago`}
                    </CardDescription>
                </div>
                 <div className="flex flex-col items-end">
                     <Badge className={statusBadgeColor}>{statusIcon}{statusText}</Badge>
                    {position.expirationTimestamp && !isPending && (
                        <TimeLeft expiration={new Date(position.expirationTimestamp)} className="text-xs text-muted-foreground mt-2"/>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Current Price</span>
                    <span className="font-mono font-semibold text-primary">{currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`: <Loader2 className="h-4 w-4 animate-spin"/>}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><LogIn size={12}/>Entry Price</span>
                    <span className="font-mono font-semibold text-primary">${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">${position.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">${position.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Unrealized PnL</span>
                    <span className={`font-mono font-semibold ${pnlColor}`}>{!isPending && currentPrice ? `$${pnl.toFixed(2)}` : '...'}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Unrealized PnL %</span>
                    <span className={`font-mono font-semibold ${pnlColor}`}>{!isPending && currentPrice ? `${pnlPercent.toFixed(2)}%` : '...'}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-4">
                <Button size="sm" variant="destructive" onClick={() => currentPrice && onClose(position.id, currentPrice)} disabled={isClosing || !currentPrice || isPending}>
                    {isClosing ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4 mr-1"/>}
                    Close Manually
                </Button>
            </CardFooter>
        </Card>
    )
}

const HistoryCard = ({ position }: { position: Position }) => {
    const isWin = position.pnl != null && position.pnl >= 0;
    const pnl = position.pnl ?? 0;

    const icon = isWin ? <CheckCircle2 className="h-6 w-6 text-green-400"/> : <XCircle className="h-6 w-6 text-red-400"/>;
    const titleColor = isWin ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="bg-card/80 backdrop-blur-sm">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    {icon}
                    <div>
                        <CardTitle className="text-base">{position.signalType} {position.symbol}</CardTitle>
                        <CardDescription className="text-xs">
                            Closed {position.closeTimestamp ? formatDistanceToNow(new Date(position.closeTimestamp)) : ''} ago
                        </CardDescription>
                    </div>
                </div>
                <div className={`font-bold ${titleColor}`}>
                    {`PnL: $${pnl.toFixed(2)}`}
                </div>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex justify-between p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="font-mono">${position.entryPrice.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground">Exit:</span>
                    <span className="font-mono">${position.closePrice?.toFixed(2) ?? 'N/A'}</span>
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

const PortfolioStatsDisplay = ({ stats, isLoading }: { stats: PortfolioStats | null, isLoading: boolean }) => {
    if (isLoading && !stats) {
        return (
             <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent"><Briefcase /> Performance Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!stats) return null;

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30">
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
    const { user: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();
    const [positions, setPositions] = useState<Position[]>([]);
    const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
    const [livePrices, setLivePrices] = useState<Record<string, LiveMarketData>>({});
    const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { toast } = useToast();
    const isFetchingRef = useRef(false);
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showCloseToast = useCallback((closedPosition: Position, airdropPoints: number, reason: string) => {
        const pnl = closedPosition.pnl || 0;
        toast({
            title: <span className="text-accent">{reason}</span>,
            description: (
                <div className="text-foreground">
                    <div>Your position resulted in a PnL of <strong className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${pnl.toFixed(2)}</strong>.</div>
                    {airdropPoints > 0 && (
                        <div className="flex items-center mt-1">
                            <Sparkles className="h-4 w-4 mr-2 text-orange-400"/>
                            You've earned <strong className="text-orange-400">{airdropPoints} $BSAI</strong> airdrop points!
                        </div>
                    )}
                </div>
            ),
        });
    }, [toast]);
    
    const handleManualClose = useCallback(async (positionId: string, closePrice: number) => {
        setClosingPositionId(positionId);
        const result = await closePositionAction(positionId, closePrice);
        if (result.position) {
            showCloseToast(result.position, result.airdropPointsEarned || 0, 'Position Closed Manually');
        } else {
            toast({ title: "Error Closing Position", description: result.error, variant: "destructive" });
        }
        setClosingPositionId(null);
    }, [showCloseToast, toast]);

    const runSimulationCycle = useCallback(async (userId: string) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        
        // Initial load should show spinner, subsequent loads can be background updates.
        if (positions.length === 0 && tradeHistory.length === 0) {
            setIsLoadingData(true);
        }

        try {
            const [currentPositions, history, statsResult] = await Promise.all([
                fetchPendingAndOpenPositionsAction(userId),
                fetchTradeHistoryAction(userId),
                fetchPortfolioStatsAction(userId),
            ]);
            
            setTradeHistory(history);
            if (!('error' in statsResult)) setPortfolioStats(statsResult);

            if (currentPositions.length === 0) {
                 isFetchingRef.current = false;
                 setIsLoadingData(false);
                 setPositions([]); // Clear positions if none are active
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
                
                // PENDING to OPEN logic
                if (pos.status === 'PENDING') {
                    const shouldActivate = (pos.signalType === 'BUY' && currentPrice <= pos.entryPrice) || (pos.signalType === 'SELL' && currentPrice >= pos.entryPrice);
                    if (shouldActivate) {
                        const activationResult = await activatePendingPositionAction(pos.id);
                        if (!activationResult.error) needsReFetch = true;
                    }
                }
                // OPEN to CLOSED logic
                else if (pos.status === 'OPEN') {
                    let closeReason: string | null = null;
                    let closePrice = 0;

                    if (pos.signalType === 'BUY') {
                        if (currentPrice >= pos.takeProfit) { closeReason = 'Take Profit Hit'; closePrice = pos.takeProfit; } 
                        else if (currentPrice <= pos.stopLoss) { closeReason = 'Stop Loss Hit'; closePrice = pos.stopLoss; }
                    } else { // SELL
                        if (currentPrice <= pos.takeProfit) { closeReason = 'Take Profit Hit'; closePrice = pos.takeProfit; }
                        else if (currentPrice >= pos.stopLoss) { closeReason = 'Stop Loss Hit'; closePrice = pos.stopLoss; }
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
                    fetchPendingAndOpenPositionsAction(userId),
                    fetchTradeHistoryAction(userId),
                    fetchPortfolioStatsAction(userId),
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
            setIsLoadingData(false);
            isFetchingRef.current = false;
        }
    }, [showCloseToast, positions.length, tradeHistory.length]);
    
    useEffect(() => {
        if (currentUser?.id) {
            const run = async () => {
                await runSimulationCycle(currentUser.id);
                if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = setTimeout(run, 15000);
            };
            run();
        }
        return () => { if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); }
    }, [currentUser?.id, runSimulationCycle]); 

    const renderActivePositions = () => {
        if (isLoadingData && positions.length === 0) {
            return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
        }
        if (positions.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Active Positions</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Generate a signal from the Core Console to begin.
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
                        onClose={handleManualClose}
                        isClosing={closingPositionId === pos.id}
                    />
                ))}
            </div>
        )
    };
    
    const renderTradeHistory = () => {
        if (isLoadingData && tradeHistory.length === 0) {
            return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
        }
        if (tradeHistory.length === 0) {
            return <p className="text-center text-muted-foreground mt-8">No closed trades yet.</p>
        }
        return (
            <div className="space-y-3">
                {tradeHistory.map(pos => <HistoryCard key={pos.id} position={pos} />)}
            </div>
        )
    };
    
    if (isUserLoading) {
        return (
            <>
                <AppHeader />
                <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            </>
        )
    }

    if (userError || !currentUser) {
        return (
             <>
                <AppHeader />
                <div className="container mx-auto px-4 py-8">
                    <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive">
                        <CardHeader>
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>
                            <CardTitle className="mt-4 text-destructive">Access Denied</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-destructive-foreground">{userError || "Please visit the Core Console to initialize a user session."}</p>
                            <Button asChild className="glow-button mt-4">
                                <Link href="/core">Return to Core</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        )
    }

    return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 pb-20">
        <PortfolioStatsDisplay stats={portfolioStats} isLoading={isLoadingData && !portfolioStats} />
         <Tabs defaultValue="open" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open">Active Positions ({positions.length})</TabsTrigger>
                <TabsTrigger value="history">Trade History ({tradeHistory.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
                {renderActivePositions()}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
                 {renderTradeHistory()}
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
