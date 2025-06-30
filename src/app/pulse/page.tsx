
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
import { Loader2, Briefcase, AlertTriangle, LogOut, Sparkles, History, DollarSign, Percent, ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PlayCircle, Wallet, Activity, BrainCircuit, ShieldAlert, CheckCircle2, XCircle, Bot } from 'lucide-react';
import {
  fetchPendingAndOpenPositionsAction,
  closePositionAction,
  fetchMarketDataAction,
  fetchTradeHistoryAction,
  fetchPortfolioStatsAction,
  generatePerformanceReviewAction,
  killSwitchAction,
  type Position,
  type LiveMarketData,
  type PortfolioStats,
  type PerformanceReviewOutput,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import PerformanceReviewModal from '@/components/blocksmith-ai/PerformanceReviewModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

const TimeLeft = ({ expiration, className }: { expiration?: Date | null, className?: string }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!expiration || isNaN(expiration.getTime())) {
            setTimeLeft('Expired');
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const end = expiration;
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
    const positionSize = position.size || 1;

    if (currentPrice) {
        const priceDiff = position.signalType === 'BUY' 
            ? (currentPrice - position.entryPrice) 
            : (position.entryPrice - currentPrice);
            
        pnl = priceDiff * positionSize;
        
        if (position.entryPrice > 0) {
            pnlPercent = (pnl / (position.entryPrice * positionSize)) * 100;
        }
    }

    const openDate = position.openTimestamp ? new Date(position.openTimestamp) : null;
    const isValidOpenDate = openDate && !isNaN(openDate.getTime());
    const openTimestampText = isValidOpenDate ? `Opened: ${formatDistanceToNow(openDate)} ago` : 'N/A';
    
    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
    const isBuy = position.signalType === 'BUY';
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 interactive-card overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div>
                    <CardTitle className="text-lg flex items-center font-headline">
                        <span className={`mr-2 font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>{isBuy ? 'LONG' : 'SHORT'}</span>
                        {position.symbol}
                    </CardTitle>
                     <CardDescription className="text-xs">
                        {openTimestampText}
                    </CardDescription>
                </div>
                 <div className="flex flex-col items-end">
                     <Badge className={'border-blue-500/50 bg-blue-900/60 text-blue-300'}><PlayCircle className="h-4 w-4 mr-1 text-blue-400"/>OPEN</Badge>
                    {position.expirationTimestamp && (
                        <TimeLeft expiration={new Date(position.expirationTimestamp)} className="text-xs text-muted-foreground mt-2"/>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Current Price</span>
                    <div className="font-mono font-semibold text-primary">{currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`: <Loader2 className="h-4 w-4 animate-spin"/>}</div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><LogIn size={12}/>Entry Price</span>
                    <div className="font-mono font-semibold text-primary">${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <div className="font-mono font-semibold text-red-400">{position.stopLoss ? `$${position.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : 'N/A'}</div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <div className="font-mono font-semibold text-green-400">{position.takeProfit ? `$${position.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : 'N/A'}</div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Unrealized PnL</span>
                    <div className={`font-mono font-semibold ${pnlColor}`}>{currentPrice ? `$${pnl.toFixed(2)}` : '...'}</div>
                </div>

                 <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Unrealized PnL %</span>
                    <div className={`font-mono font-semibold ${pnlColor}`}>{currentPrice ? `${pnlPercent.toFixed(2)}%` : '...'}</div>
                </div>
            </CardContent>
            <CardFooter className="pt-4">
                <Button size="sm" variant="destructive" onClick={() => currentPrice && onClose(position.id, currentPrice)} disabled={isClosing || !currentPrice}>
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
    const isBuy = position.signalType === 'BUY';
    const entryPrice = position.entryPrice;
    const closePrice = position.closePrice ?? 0;
    let pnlPercent = 0;
    if (entryPrice > 0) {
        pnlPercent = (pnl / (entryPrice * (position.size || 1))) * 100;
    }

    const icon = isWin ? <CheckCircle2 className="h-6 w-6 text-green-400"/> : <XCircle className="h-6 w-6 text-red-400"/>;
    const titleColor = isWin ? 'text-green-400' : 'text-red-400';
    const pnlColor = isWin ? 'text-green-400' : 'text-red-400';

    const closeDate = position.closeTimestamp ? new Date(position.closeTimestamp) : null;
    const isValidDate = closeDate && !isNaN(closeDate.getTime());
    const closeTimestampText = isValidDate ? formatDistanceToNow(closeDate) : 'an unknown time';

    return (
        <Card className="bg-card/80 backdrop-blur-sm interactive-card">
             <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <CardTitle className="text-base font-headline flex items-center gap-2">
                           <span className={`font-bold ${isBuy ? 'text-tertiary' : 'text-orange-500'}`}>{isBuy ? 'LONG' : 'SHORT'}</span>
                           {position.symbol}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Closed {closeTimestampText} ago
                        </CardDescription>
                    </div>
                </div>
                <Badge variant="outline">CLOSED</Badge>
             </CardHeader>
             <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground flex items-center gap-1"><LogIn size={12}/> Entry</span>
                    <span className="font-mono text-sm font-semibold mt-1">${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground flex items-center gap-1"><LogOut size={12}/> Exit</span>
                    <span className="font-mono text-sm font-semibold mt-1">${closePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground flex items-center gap-1"><DollarSign size={12}/> PnL</span>
                    <span className={`font-mono text-sm font-semibold mt-1 ${pnlColor}`}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground flex items-center gap-1"><Percent size={12}/> PnL %</span>
                    <span className={`font-mono text-sm font-semibold mt-1 ${pnlColor}`}>{pnlPercent.toFixed(2)}%</span>
                </div>
             </CardContent>
        </Card>
    )
}

const StatCard = ({ title, value, subValue, icon, valueClassName }: { title: string; value: React.ReactNode; subValue?: React.ReactNode; icon: React.ReactNode; valueClassName?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-secondary rounded-lg text-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {title}</span>
        <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-bold font-mono ${valueClassName || 'text-primary'}`}>{value}</span>
            {subValue && <span className="text-xs text-muted-foreground font-mono">{subValue}</span>}
        </div>
    </div>
);

const PortfolioStatsDisplay = ({ stats, isLoading, realtimePnl, onGenerateReview, isGeneratingReview, onKillSwitch, isKilling }: { stats: PortfolioStats | null, isLoading: boolean, realtimePnl: number, onGenerateReview: () => void, isGeneratingReview: boolean, onKillSwitch: () => void, isKilling: boolean }) => {
    if (isLoading && !stats) {
        return (
             <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> Performance Matrix</CardTitle>
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

    const pnlColor = realtimePnl >= 0 ? 'text-green-400' : 'text-red-400';
    const closedPnlColor = stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400';
    const winRateColor = stats.winRate >= 50 ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 interactive-card">
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> Performance Matrix</CardTitle>
                    <CardDescription>An overview of your closed trade performance.</CardDescription>
                </div>
                <Button size="sm" onClick={onGenerateReview} disabled={isGeneratingReview} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground w-full sm:w-auto">
                    {isGeneratingReview ? <Loader2 className="h-4 w-4 animate-spin"/> : <BrainCircuit className="h-4 w-4 mr-2"/>}
                    Get SHADOW's Review
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard title="Capital Invested" value={`$${stats.totalCapitalInvested.toFixed(2)}`} icon={<Wallet size={14} />} valueClassName="text-tertiary" />
                <StatCard title="Real-time PnL" value={`$${realtimePnl.toFixed(2)}`} icon={<Activity size={14} />} valueClassName={pnlColor} />
                <StatCard title="Total Trades" value={stats.totalTrades} icon={<History size={14} />} />
                <StatCard 
                    title="Win Rate" 
                    icon={<Percent size={14} />} 
                    value={`${stats.winRate.toFixed(1)}%`}
                    subValue={stats.totalTrades > 0 ? `(${stats.winningTrades} Wins)` : undefined}
                    valueClassName={winRateColor} 
                />
                <StatCard 
                    title="Total Closed PnL" 
                    icon={<DollarSign size={14} />} 
                    value={`$${stats.totalPnl.toFixed(2)}`}
                    subValue={stats.totalTrades > 0 ? `(${stats.totalPnlPercentage.toFixed(2)}%)` : undefined}
                    valueClassName={closedPnlColor} 
                />
                <StatCard title="Best Trade" value={`$${stats.bestTradePnl.toFixed(2)}`} icon={<ArrowUp size={14} />} valueClassName="text-green-400" />
                <StatCard title="Worst Trade" value={`$${stats.worstTradePnl.toFixed(2)}`} icon={<ArrowDown size={14} />} valueClassName="text-red-400" />
                <StatCard title="Lifetime Rewards" value={stats.lifetimeRewards.toLocaleString()} icon={<Gift size={14}/>} valueClassName="text-orange-400" />
            </CardContent>
             <CardFooter className="pt-6 flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/20 mt-4">
                <div className="text-center sm:text-left">
                    <h4 className="font-semibold text-destructive font-headline">Emergency Protocol</h4>
                    <p className="text-xs text-muted-foreground">Instantly close all active positions.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto" disabled={isKilling || stats.totalCapitalInvested === 0}>
                            <ShieldAlert className="mr-2 h-4 w-4"/> Kill Switch
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Activate Kill Switch?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will immediately close ALL of your currently open positions at the current market price. This action cannot be undone. Are you sure you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onKillSwitch} className="bg-destructive hover:bg-destructive/90">
                                {isKilling ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm & Close All"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
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
    const [realtimePnl, setRealtimePnl] = useState(0);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [reviewData, setReviewData] = useState<PerformanceReviewOutput | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [isKilling, setIsKilling] = useState(false);

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
    
    const runSimulationCycle = useCallback(async (userId: string) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        
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
                 setPositions([]);
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
                
                if (pos.status === 'OPEN') {
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

    const handleManualClose = useCallback(async (positionId: string, closePrice: number) => {
        if (!currentUser) return;
        setClosingPositionId(positionId);
        const result = await closePositionAction(positionId, closePrice);
        if (result.position) {
            showCloseToast(result.position, result.airdropPointsEarned || 0, 'Position Closed Manually');
            await runSimulationCycle(currentUser.id);
        } else {
            toast({ title: "Error Closing Position", description: result.error, variant: "destructive" });
        }
        setClosingPositionId(null);
    }, [showCloseToast, toast, currentUser, runSimulationCycle]);

    const handleGenerateReview = useCallback(async () => {
        if (!currentUser) return;
        setIsGeneratingReview(true);
        setReviewData(null);
        setReviewError(null);
        setIsReviewModalOpen(true);

        const result = await generatePerformanceReviewAction(currentUser.id);
        
        if ('error' in result) {
            setReviewError(result.error);
        } else {
            setReviewData(result);
        }
        setIsGeneratingReview(false);
    }, [currentUser]);

    const handleKillSwitch = useCallback(async () => {
        if (!currentUser) return;
        setIsKilling(true);
        const result = await killSwitchAction(currentUser.id);
        if (result.success) {
            toast({
                title: "Kill Switch Activated",
                description: result.message,
                variant: "default",
            });
            if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
            await runSimulationCycle(currentUser.id);
        } else {
            toast({
                title: "Kill Switch Failed",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsKilling(false);
    }, [currentUser, toast, runSimulationCycle]);
    
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
    
    const renderActivePositions = () => {
        const openPositions = positions.filter(p => p.status === 'OPEN');
        if (isLoadingData && openPositions.length === 0) {
            return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
        }
        if (openPositions.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
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
                {openPositions.map(pos => (
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
                    <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive interactive-card">
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
        <PortfolioStatsDisplay 
            stats={portfolioStats} 
            isLoading={isLoadingData && !portfolioStats} 
            realtimePnl={realtimePnl}
            onGenerateReview={handleGenerateReview}
            isGeneratingReview={isGeneratingReview}
            onKillSwitch={handleKillSwitch}
            isKilling={isKilling}
        />
         <Tabs defaultValue="open" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open" className="data-[state=active]:shadow-active-tab-glow">Active Positions ({positions.filter(p => p.status === 'OPEN').length})</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:shadow-active-tab-glow">Trade History ({tradeHistory.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
                {renderActivePositions()}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
                 {renderTradeHistory()}
            </TabsContent>
        </Tabs>
      </div>
       <PerformanceReviewModal 
            isOpen={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            reviewData={reviewData}
            isLoading={isGeneratingReview}
            error={reviewError}
        />
    </>
  );
}
