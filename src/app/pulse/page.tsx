
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
    Loader2, Briefcase, AlertTriangle, LogOut, Sparkles, History, DollarSign, Percent, 
    ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PlayCircle, Wallet, 
    Activity, BrainCircuit, ShieldAlert, Bot, Hourglass, Trash2, Cpu, Zap, Power,
    PowerOff, CheckCircle, XCircle
} from 'lucide-react';
import {
  fetchPortfolioStatsAction,
  generatePerformanceReviewAction,
  killSwitchAction,
  fetchPendingAndOpenPositionsAction,
  fetchTradeHistoryAction,
  closePositionAction,
  activatePendingPositionAction,
  cancelPendingPositionAction,
  fetchMarketDataAction,
  type Position,
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
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isBefore } from 'date-fns';

const StatCard = ({ title, value, subValue, icon, valueClassName }: { title: string; value: React.ReactNode; subValue?: React.ReactNode; icon: React.ReactNode; valueClassName?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-secondary rounded-lg text-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {title}</span>
        <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-bold font-mono ${valueClassName || 'text-primary'}`}>{value}</span>
            {subValue && <span className="text-xs text-muted-foreground font-mono">{subValue}</span>}
        </div>
    </div>
);

const PortfolioStatsDisplay = ({ stats, isLoading, onGenerateReview, isGeneratingReview, onKillSwitch, isKilling }: { stats: PortfolioStats | null, isLoading: boolean, onGenerateReview: () => void, isGeneratingReview: boolean, onKillSwitch: () => void, isKilling: boolean }) => {
    if (isLoading && !stats) {
        return (
             <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 interactive-card">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> <GlyphScramble text="Performance Matrix" /></CardTitle>
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

    const closedPnlColor = stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400';
    const winRateColor = stats.winRate >= 50 ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 interactive-card">
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> <GlyphScramble text="Performance Matrix" /></CardTitle>
                    <CardDescription>A summary of your <strong className="text-accent">lifetime activity</strong> and rewards.</CardDescription>
                </div>
                <Button size="sm" onClick={onGenerateReview} disabled={isGeneratingReview || stats.totalTrades < 3} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground w-full sm:w-auto">
                    {isGeneratingReview ? <Loader2 className="h-4 w-4 animate-spin"/> : <BrainCircuit className="h-4 w-4 mr-2"/>}
                    Get SHADOW's Review
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <StatCard title="Nodes Trained" value={stats.nodesTrained} icon={<Cpu size={14} />} valueClassName="text-tertiary" />
                <StatCard title="Total XP Gained" value={stats.xpGained.toLocaleString()} icon={<Zap size={14} />} valueClassName="text-tertiary" />
                <StatCard title="Lifetime Rewards" value={stats.lifetimeRewards.toLocaleString()} icon={<Gift size={14}/>} valueClassName="text-orange-400" />
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
                <StatCard title="Worst Trade" value={`$${stats.worstTradePnl.toFixed(2)}`} icon={<ArrowDown size={14} />} valueClassName="text-destructive" />
            </CardContent>
             <CardFooter className="pt-6 flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/20 mt-4">
                <div className="text-center sm:text-left">
                    <h4 className="font-semibold text-destructive font-headline">Emergency Protocol</h4>
                    <p className="text-xs text-muted-foreground">Instantly close all <strong className="text-destructive">active positions</strong>.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto" disabled={isKilling}>
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

const PositionInfo = ({ label, value, icon, valueClassName }: { label: string; value: React.ReactNode; icon: React.ReactNode; valueClassName?: string }) => (
    <div className="flex flex-col">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
        <span className={cn("text-sm font-semibold font-mono", valueClassName)}>{value}</span>
    </div>
);

const PositionCard = ({ position, refetchData }: { position: Position, refetchData: () => void }) => {
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const { toast } = useToast();

    const isBuy = position.signalType === 'BUY';

    useEffect(() => {
        if (position.status !== 'OPEN') return;

        const fetchPrice = async () => {
            const result = await fetchMarketDataAction({ symbol: position.symbol });
            if (!('error' in result) && result.lastPrice) {
                setLivePrice(parseFloat(result.lastPrice));
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 15000);
        return () => clearInterval(interval);
    }, [position.status, position.symbol]);

    useEffect(() => {
        if (position.status !== 'PENDING' || !position.expirationTimestamp) return;
        const expiration = new Date(position.expirationTimestamp);

        const updateTimer = () => {
            if (isBefore(new Date(), expiration)) {
                setTimeLeft(formatDistanceToNow(expiration, { addSuffix: true }));
            } else {
                setTimeLeft('Expired');
                clearInterval(interval);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [position.status, position.expirationTimestamp]);

    const pnl = position.status === 'CLOSED' ? (position.pnl ?? 0)
        : position.status === 'OPEN' && livePrice ? (isBuy ? livePrice - position.entryPrice : position.entryPrice - livePrice) * position.size
        : 0;
    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-destructive';
    
    const handleAction = async (action: 'activate' | 'cancel' | 'close') => {
        setIsProcessing(true);
        let result: { success?: boolean; error?: string };
        try {
            switch (action) {
                case 'activate':
                    result = await activatePendingPositionAction(position.id);
                    break;
                case 'cancel':
                    result = await cancelPendingPositionAction(position.id);
                    break;
                case 'close':
                    if (!livePrice) {
                       toast({ title: 'Error', description: 'Could not fetch live price to close position.', variant: 'destructive' });
                       setIsProcessing(false);
                       return;
                    }
                    result = await closePositionAction(position.id, livePrice);
                    break;
            }

            if (result.success || !('error' in result)) {
                toast({ title: `Position ${action}d successfully.`, variant: 'default' });
                refetchData();
            } else {
                toast({ title: 'Action Failed', description: result.error, variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'An unexpected error occurred.', description: e.message, variant: 'destructive' });
        }
        setIsProcessing(false);
    };

    const statusConfig = {
        PENDING: {
            icon: <Hourglass className="h-4 w-4" />,
            label: 'PENDING',
            className: 'border-yellow-500/50 text-yellow-400',
        },
        OPEN: {
            icon: <Activity className="h-4 w-4" />,
            label: 'OPEN',
            className: 'border-primary/50 text-primary animate-pulse',
        },
        CLOSED: {
            icon: <CheckCircle className="h-4 w-4" />,
            label: 'CLOSED',
            className: 'border-muted text-muted-foreground',
        },
    };
    const currentStatus = statusConfig[position.status];

    return (
        <Card className="bg-card/90 interactive-card">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <span className={isBuy ? 'text-green-400' : 'text-red-400'}>{isBuy ? 'LONG' : 'SHORT'}</span>
                        <span className="text-foreground">{position.symbol}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Created {format(new Date(position.createdAt), 'PPp')}
                    </CardDescription>
                </div>
                <Badge variant="outline" className={cn("text-xs font-bold", currentStatus.className)}>
                    {currentStatus.icon} {currentStatus.label}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-secondary rounded-lg">
                    <PositionInfo label="Mode" value={position.tradingMode} icon={<Zap size={14} />} />
                    <PositionInfo label="Sentiment" value={position.sentiment} icon={<BrainCircuit size={14} />} />
                    <PositionInfo label="SHADOW Score" value={`${position.gpt_confidence_score}%`} icon={<Percent size={14} />} />
                    
                    {position.status === 'OPEN' && <PositionInfo label="Current PnL" value={`$${pnl.toFixed(2)}`} icon={<DollarSign size={14} />} valueClassName={pnlColor} />}
                    {position.status === 'CLOSED' && <PositionInfo label="Final PnL" value={`$${pnl.toFixed(2)}`} icon={<DollarSign size={14} />} valueClassName={pnlColor} />}
                    {position.status === 'PENDING' && <PositionInfo label="Expires" value={timeLeft} icon={<Clock size={14} />} />}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-background rounded-lg">
                    <PositionInfo label="Entry" value={`$${position.entryPrice.toFixed(4)}`} icon={<LogIn size={14} />} />
                    <PositionInfo label="Take Profit" value={`$${position.takeProfit?.toFixed(4)}`} icon={<Target size={14} />} valueClassName="text-green-400" />
                    <PositionInfo label="Stop Loss" value={`$${position.stopLoss?.toFixed(4)}`} icon={<ShieldX size={14} />} valueClassName="text-red-400" />
                    {position.status === 'CLOSED' && <PositionInfo label="Close Price" value={`$${position.closePrice?.toFixed(4)}`} icon={<LogOut size={14} />} />}
                </div>
            </CardContent>
            {position.status !== 'CLOSED' && (
                <CardFooter className="flex gap-2">
                    {position.status === 'PENDING' && (
                        <>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleAction('cancel')} disabled={isProcessing}>
                                <XCircle className="mr-2" /> Cancel
                            </Button>
                            <Button size="sm" className="w-full glow-button" onClick={() => handleAction('activate')} disabled={isProcessing}>
                                <Power className="mr-2"/> Activate
                            </Button>
                        </>
                    )}
                    {position.status === 'OPEN' && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full" disabled={isProcessing || !livePrice}>
                                    <PowerOff className="mr-2"/> Manual Close
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Manual Close</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to close this position at the current market price of approximately ${livePrice?.toFixed(2)}? This action is irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAction('close')} className="bg-destructive hover:bg-destructive/90">
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : "Yes, Close Position"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}


export default function PortfolioPage() {
    const { user: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
    const [openPositions, setOpenPositions] = useState<Position[]>([]);
    const [tradeHistory, setTradeHistory] = useState<Position[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [reviewData, setReviewData] = useState<PerformanceReviewOutput | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [isKilling, setIsKilling] = useState(false);

    const { toast } = useToast();
    
    const fetchData = useCallback(async (userId: string) => {
        setIsLoadingData(true);
        try {
            const [statsResult, openPositionsResult, historyResult] = await Promise.all([
                fetchPortfolioStatsAction(userId),
                fetchPendingAndOpenPositionsAction(userId),
                fetchTradeHistoryAction(userId),
            ]);
            
            if (!('error' in statsResult)) setPortfolioStats(statsResult);
            if (Array.isArray(openPositionsResult)) setOpenPositions(openPositionsResult.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            if (Array.isArray(historyResult)) setTradeHistory(historyResult.sort((a,b) => new Date(b.closeTimestamp!).getTime() - new Date(a.closeTimestamp!).getTime()));

        } catch (e: any) {
             console.error("Error in fetching portfolio data:", e);
             toast({ title: "Data Error", description: "Failed to fetch portfolio data.", variant: "destructive" });
        } finally {
            setIsLoadingData(false);
        }
    }, [toast]);
    
    useEffect(() => {
        if (currentUser?.id) {
            fetchData(currentUser.id);
        }
    }, [currentUser?.id, fetchData]); 

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
        toast({
            title: result.success ? "Kill Switch Activated" : "Kill Switch Failed",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if(result.success) {
            fetchData(currentUser.id); // Refresh data on success
        }
        setIsKilling(false);
    }, [currentUser, toast, fetchData]);
    
    const renderEmptyState = (title: string, message: string) => (
        <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Bot className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">{title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                    {message}
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
            isLoading={isLoadingData}
            onGenerateReview={handleGenerateReview}
            isGeneratingReview={isGeneratingReview}
            onKillSwitch={handleKillSwitch}
            isKilling={isKilling}
        />
         <Tabs defaultValue="open" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open" className="data-[state=active]:shadow-active-tab-glow">Active Positions ({openPositions.length})</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:shadow-active-tab-glow">Trade History ({tradeHistory.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4 space-y-3">
                {isLoadingData && openPositions.length === 0 ? (
                     <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                ) : openPositions.length > 0 ? (
                    openPositions.map(pos => <PositionCard key={pos.id} position={pos} refetchData={() => fetchData(currentUser.id)} />)
                ) : (
                    renderEmptyState("No Active Positions", "Simulated positions appear here after execution from the Core Console.")
                )}
            </TabsContent>
            <TabsContent value="history" className="mt-4 space-y-3">
                 {isLoadingData && tradeHistory.length === 0 ? (
                     <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                 ) : tradeHistory.length > 0 ? (
                    tradeHistory.map(pos => <PositionCard key={pos.id} position={pos} refetchData={() => fetchData(currentUser.id)} />)
                ) : (
                    renderEmptyState("No Trade History", "Your closed trades will appear here.")
                )}
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
