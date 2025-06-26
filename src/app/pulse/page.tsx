
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Briefcase, Bot, AlertTriangle, LogOut, ShieldX, Target, LogIn, Sparkles, History, DollarSign, Percent, ArrowUp, ArrowDown, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
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

const PortfolioStatsDisplay = ({ stats }: { stats: PortfolioStats }) => {
    return (
        <Card className="mb-6 bg-card/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground">Total Trades</span>
                    <span className="text-lg font-bold font-mono text-primary">{stats.totalTrades}</span>
                </div>
                 <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Percent size={12}/>Win Rate</span>
                    <span className="text-lg font-bold font-mono text-green-400">{stats.winRate.toFixed(1)}%</span>
                </div>
                 <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12}/>Total PnL</span>
                    <span className={`text-lg font-bold font-mono ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${stats.totalPnl.toFixed(2)}
                    </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUp size={12}/>Best Trade</span>
                    <span className="text-lg font-bold font-mono text-green-400">
                        ${stats.bestTradePnl.toFixed(2)}
                    </span>
                </div>
                 <div className="flex flex-col items-center p-3 bg-background/50 rounded-md">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDown size={12}/>Worst Trade</span>
                    <span className="text-lg font-bold font-mono text-red-400">
                        ${stats.worstTradePnl.toFixed(2)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};


export default function PortfolioPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
    const [livePrices, setLivePrices] = useState<Record<string, LiveMarketData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
    const { toast } = useToast();
    const userId = getCurrentUserId();
    const isFetching = useRef(false);

    const fetchPortfolioData = useCallback(async () => {
        if (!userId || isFetching.current) return;

        isFetching.current = true;
        setIsLoading(true);

        try {
            const [userPositions, history, statsResult] = await Promise.all([
                fetchActivePositionsAction(userId),
                fetchTradeHistoryAction(userId),
                fetchPortfolioStatsAction(userId),
            ]);

            setPositions(userPositions);
            setTradeHistory(history);
            if (!('error' in statsResult)) {
                setPortfolioStats(statsResult);
            }

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
        } catch (e: any) {
             setError(e.message || "Failed to fetch portfolio data.");
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setError("User not identified. Please visit the Core Console to initialize a session.");
            setIsLoading(false);
            return;
        }
        fetchPortfolioData();
        const interval = setInterval(fetchPortfolioData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchPortfolioData, userId]);

    const handleClosePosition = async (positionId: string, closePrice: number) => {
        setClosingPositionId(positionId);
        const result = await closePositionAction(positionId, closePrice);
        if (result.success) {
            const pnl = result.pnl || 0;
            const points = result.airdropPointsEarned || 0;
            
            toast({
                title: <span className="text-accent">Position Closed Successfully!</span>,
                description: (
                    <div className="text-foreground">
                        Your position resulted in a PnL of <strong className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${pnl.toFixed(2)}</strong>.
                        {points > 0 && (
                            <div className="flex items-center mt-1">
                                <Sparkles className="h-4 w-4 mr-2 text-orange-400"/>
                                You've earned <strong className="text-orange-400">{points} $BSAI</strong> airdrop points!
                            </div>
                        )}
                    </div>
                ),
            });
            fetchPortfolioData(); // Refresh all data
        } else {
            toast({
                title: "Error Closing Position",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
        setClosingPositionId(null);
    }

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
             <ScrollArea className="h-[calc(100vh-450px)] pr-4 mt-4">
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
             </ScrollArea>
        )
    };
    
    const renderTradeHistory = () => {
        if (tradeHistory.length === 0) {
            return <p className="text-center text-muted-foreground mt-8">No closed trades yet.</p>
        }
        return (
            <ScrollArea className="h-[calc(100vh-450px)] pr-4 mt-4">
                <div className="space-y-3">
                    {tradeHistory.map(pos => <HistoryCard key={pos.id} position={pos} />)}
                </div>
            </ScrollArea>
        )
    };

    const renderContent = () => {
        if (isLoading && !portfolioStats) {
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
                            <Link href="/core">Return to Core</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <>
                {portfolioStats && <PortfolioStatsDisplay stats={portfolioStats} />}
                 <Tabs defaultValue="open">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="open">Open Positions</TabsTrigger>
                        <TabsTrigger value="history">Trade History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="open">
                        {renderOpenPositions()}
                    </TabsContent>
                    <TabsContent value="history">
                        {renderTradeHistory()}
                    </TabsContent>
                </Tabs>
            </>
        )
    }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center">
                 <Briefcase className="h-8 w-8 text-primary mb-1" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Monitor your positions and performance.</p>
        </div>
        
        {renderContent()}
      </div>
    </>
  );
}
