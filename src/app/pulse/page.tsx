
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
    Loader2, Briefcase, AlertTriangle, LogOut, History, DollarSign, Percent, 
    ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PlayCircle,
    Activity, BrainCircuit, ShieldAlert, Bot, Hourglass, Trash2, Cpu, Zap, Power,
    PowerOff, CheckCircle, XCircle, Layers, Bitcoin, Type, BarChart2, Shield, Info, BarChartHorizontal, RefreshCw
} from 'lucide-react';
import {
    generatePerformanceReviewAction,
    killSwitchAction,
    closePositionAction,
    activatePendingPositionAction,
    fetchPositionsAction,
    type Position,
    type PortfolioStats,
    type PerformanceReviewOutput,
} from '@/app/actions';
import { fetchMarketDataAction } from '@/services/market-data-service';
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isBefore } from 'date-fns';

const StatCard = ({ title, value, subValue, icon, valueClassName }: { title: string; value: React.ReactNode; subValue?: React.ReactNode; icon: React.ReactNode; valueClassName?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-secondary rounded-lg text-center border border-border/30 h-full">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">{icon} {title}</span>
        <div>
            <p className={cn("text-lg sm:text-xl font-bold font-mono", valueClassName || 'text-primary')}>{value}</p>
            {subValue && <p className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">{subValue}</p>}
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
                    <div className="flex justify-center items-center h-24"> <Loader2 className="h-8 w-8 animate-spin text-primary"/> </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats) return null;

    const closedPnlColor = stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400';
    const winRateColor = stats.winRate >= 50 ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 interactive-card">
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> <GlyphScramble text="Performance Matrix" /></CardTitle>
                    <CardDescription>A summary of your <strong className="text-accent">lifetime activity</strong>.</CardDescription>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button size="sm" onClick={onGenerateReview} disabled={isGeneratingReview || stats.totalTrades < 3} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground w-full sm:w-auto">
                                {isGeneratingReview ? <Loader2 className="h-4 w-4 animate-spin"/> : <BrainCircuit className="h-4 w-4 mr-2"/>} Get SHADOW's Review
                            </Button>
                        </TooltipTrigger>
                        {stats.totalTrades < 3 && <TooltipContent><p>Complete at least 3 trades for a review.</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Total Trades" value={stats.totalTrades} icon={<History size={14} />} />
                <StatCard title="Win Rate" icon={<Percent size={14} />} value={`${stats.winRate.toFixed(1)}%`} subValue={stats.totalTrades > 0 ? `(${stats.winningTrades} Wins)` : undefined} valueClassName={winRateColor} />
                <StatCard title="Total Closed PnL" icon={<DollarSign size={14} />} value={`$${stats.totalPnl.toFixed(2)}`} valueClassName={closedPnlColor} />
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
                        <Button variant="destructive" className="w-full sm:w-auto" disabled={isKilling}> <ShieldAlert className="mr-2 h-4 w-4"/> Kill Switch </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Activate Kill Switch?</AlertDialogTitle>
                            <AlertDialogDescription> This will immediately close ALL of your currently open positions at the current market price. This action cannot be undone. </AlertDialogDescription>
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

const RewardInfo = ({ label, value, icon, valueClassName }: { label: string, value: React.ReactNode, icon: React.ReactNode, valueClassName?: string }) => (
    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
        <div className={cn("text-primary", valueClassName)}> {icon} </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold font-mono">{value}</p>
        </div>
    </div>
);

const PositionCard = ({ position, updateLocalPosition }: { position: Position, updateLocalPosition: (position: Position) => void }) => {
    const { user, refetch: refetchUser } = useCurrentUser();
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const isBuy = position.signalType === 'BUY';

    useEffect(() => {
        if (position.status !== 'OPEN') return;
        const fetchPrice = async () => {
            const result = await fetchMarketDataAction({ symbol: position.symbol });
            if (!('error' in result) && result.lastPrice) setLivePrice(parseFloat(result.lastPrice));
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 15000);
        return () => clearInterval(interval);
    }, [position.status, position.symbol]);

    const pnl = position.status === 'CLOSED' ? (position.pnl ?? 0)
        : position.status === 'OPEN' && livePrice ? (isBuy ? livePrice - position.entryPrice : position.entryPrice - livePrice) * position.size
        : 0;
    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-destructive';

    const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : `$${value.toFixed(2)}`;
    
    const handleClose = async () => {
        if (!livePrice || !user) {
            toast({ title: 'Error', description: 'Could not fetch live price or user session.', variant: 'destructive' });
            return;
        }
        setIsProcessing(true);
        const result = await closePositionAction(user.id, position.id, livePrice);
        if (result.error) {
            toast({ title: 'Action Failed', description: result.error, variant: 'destructive' });
        } else {
            updateLocalPosition(result.updatedPosition);
            toast({ title: 'Position Closed', description: `PnL: ${formatCurrency(result.updatedPosition.pnl)}` });
            refetchUser();
        }
        setIsProcessing(false);
    };

    const handleActivate = async () => {
        if (!user) return;
        setIsProcessing(true);
        const result = await activatePendingPositionAction(position.id, user.id);
        if (result.success) {
            updateLocalPosition({ ...position, status: 'OPEN', openTimestamp: new Date().toISOString() });
            toast({ title: 'Position Activated', description: 'Your pending order is now open.' });
        } else {
            toast({ title: 'Activation Failed', description: result.error, variant: 'destructive' });
        }
        setIsProcessing(false);
    }
    
    const statusConfig = {
        PENDING: { icon: <Hourglass className="h-4 w-4" />, label: 'PENDING', className: 'border-yellow-500/50 text-yellow-400' },
        OPEN: { icon: <Activity className="h-4 w-4" />, label: 'OPEN', className: 'border-primary/50 text-primary animate-pulse' },
        CLOSED: { icon: <CheckCircle className="h-4 w-4" />, label: 'CLOSED', className: 'border-muted text-muted-foreground' },
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
                        {currentStatus.label === 'CLOSED' ? `Closed ${format(new Date(position.closeTimestamp!), 'PPp')}` : `Created ${format(new Date(position.createdAt), 'PPp')}`}
                    </CardDescription>
                </div>
                <Badge variant="outline" className={cn("text-xs font-bold", currentStatus.className)}>{currentStatus.icon} {currentStatus.label}</Badge>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="details" className="text-xs"><Info className="mr-1.5" /> Details</TabsTrigger>
                        <TabsTrigger value="strategy" className="text-xs"><BarChartHorizontal className="mr-1.5" /> Strategy</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-secondary rounded-lg">
                            <PositionInfo label="Entry" value={formatCurrency(position.entryPrice)} icon={<LogIn size={14} />} />
                            <PositionInfo label="Take Profit" value={formatCurrency(position.takeProfit)} icon={<Target size={14} />} valueClassName="text-green-400" />
                            <PositionInfo label="Stop Loss" value={formatCurrency(position.stopLoss)} icon={<ShieldX size={14} />} valueClassName="text-red-400" />
                            {position.status === 'OPEN' && <PositionInfo label="Current PnL" value={formatCurrency(pnl)} icon={<DollarSign size={14} />} valueClassName={pnlColor} />}
                            {position.status === 'CLOSED' && <PositionInfo label="Final PnL" value={formatCurrency(pnl)} icon={<DollarSign size={14} />} valueClassName={pnlColor} />}
                            {position.status === 'CLOSED' && <PositionInfo label="Close Price" value={formatCurrency(position.closePrice)} icon={<LogOut size={14} />} />}
                        </div>
                        {position.status === 'CLOSED' && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Rewards & Analytics</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <RewardInfo label="$BSAI Gained" value={position.gainedAirdropPoints?.toLocaleString() ?? 'N/A'} icon={<Gift size={16} />} valueClassName="text-orange-400" />
                                <RewardInfo label="XP Gained" value={position.gainedXp?.toLocaleString() ?? 'N/A'} icon={<Zap size={16} />} valueClassName="text-tertiary" />
                                <RewardInfo label="Blocks Trained" value={position.blocksTrained?.toLocaleString() ?? 'N/A'} icon={<Layers size={16} />} />
                                <RewardInfo label="Gas Paid (Mock)" value={formatCurrency(position.gasPaid) ?? 'N/A'} icon={<Bitcoin size={16} />} />
                            </div>
                        </div>
                        )}
                    </TabsContent>
                     <TabsContent value="strategy" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs p-3 bg-secondary rounded-lg">
                             <PositionInfo label="Signal Type" value={position.type || 'N/A'} icon={<Type size={14}/>} />
                             <PositionInfo label="Trading Mode" value={position.tradingMode || 'N/A'} icon={<BarChart2 size={14}/>} />
                             <PositionInfo label="Risk Profile" value={position.riskProfile || 'N/A'} icon={<Shield size={14}/>} />
                        </div>
                         <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-secondary rounded-lg">
                            <PositionInfo label="Sentiment" value={position.sentiment || 'N/A'} icon={<BrainCircuit size={14} />} />
                            <PositionInfo label="SHADOW Score" value={`${position.gpt_confidence_score || '0'}%`} icon={<Percent size={14} />} />
                         </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            {position.status !== 'CLOSED' && (
                <CardFooter className="flex gap-2">
                    {position.status === 'PENDING' && (
                        <Button size="sm" className="w-full glow-button" onClick={handleActivate} disabled={isProcessing}> <Power className="mr-2"/> Activate </Button>
                    )}
                    {position.status === 'OPEN' && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full" disabled={isProcessing || !livePrice}> <PowerOff className="mr-2"/> Manual Close </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Manual Close</AlertDialogTitle>
                                    <AlertDialogDescription> Close this position at market price of ~{formatCurrency(livePrice)}? This is irreversible. </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClose} className="bg-destructive hover:bg-destructive/90">
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
    const { user: currentUser, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useCurrentUser();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoadingPositions, setIsLoadingPositions] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [reviewData, setReviewData] = useState<PerformanceReviewOutput | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [isKilling, setIsKilling] = useState(false);
    const { toast } = useToast();

    const fetchPositions = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingPositions(true);
        const result = await fetchPositionsAction(currentUser.id);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            setPositions(result.positions);
        }
        setIsLoadingPositions(false);
    }, [currentUser, toast]);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const updateLocalPosition = (updatedPosition: Position) => {
        setPositions(prev => prev.map(p => p.id === updatedPosition.id ? updatedPosition : p));
    };
    
    const { openPositions, tradeHistory } = useMemo(() => {
        return {
            openPositions: positions.filter(p => p.status === 'OPEN' || p.status === 'PENDING'),
            tradeHistory: positions.filter(p => p.status === 'CLOSED'),
        }
    }, [positions]);

    const portfolioStats: PortfolioStats | null = useMemo(() => {
        const totalTrades = tradeHistory.length;
        if (totalTrades === 0) return { totalTrades: 0, winRate: 0, winningTrades: 0, totalPnl: 0, bestTradePnl: 0, worstTradePnl: 0 };
        const winningTrades = tradeHistory.filter(t => t.pnl && t.pnl > 0).length;
        const totalPnl = tradeHistory.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return {
            totalTrades,
            winRate: (winningTrades / totalTrades) * 100,
            winningTrades,
            totalPnl,
            bestTradePnl: Math.max(...tradeHistory.map(t => t.pnl || 0), 0),
            worstTradePnl: Math.min(...tradeHistory.map(t => t.pnl || 0), 0),
        };
    }, [tradeHistory]);
    
    const handleGenerateReview = useCallback(async () => {
        if (!currentUser) return;
        setIsGeneratingReview(true);
        setReviewData(null);
        setReviewError(null);
        setIsReviewModalOpen(true);
        
        const result = await generatePerformanceReviewAction(currentUser.id, {
            stats: portfolioStats!,
            tradeHistory: tradeHistory.map(t => ({...t, closePrice: t.closePrice || 0}))
        });
        
        if ('error' in result) setReviewError(result.error);
        else setReviewData(result);
        
        setIsGeneratingReview(false);
    }, [currentUser, tradeHistory, portfolioStats]);

    const handleKillSwitch = useCallback(async () => {
        if (!currentUser) return;
        setIsKilling(true);
        const result = await killSwitchAction(currentUser.id);
        if (result.error) {
            toast({ title: 'Kill Switch Failed', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: "Kill Switch Activated", description: `Successfully closed ${result.closedCount} open positions.` });
            fetchPositions(); // Refetch all positions data
            refetchUser(); // Refetch user points
        }
        setIsKilling(false);
    }, [currentUser, toast, fetchPositions, refetchUser]);
    
    const renderEmptyState = (title: string, message: string) => (
        <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit"><Bot className="h-10 w-10 text-primary" /></div>
                <CardTitle className="mt-4">{title}</CardTitle>
                <CardDescription className="mt-2 text-base">{message}</CardDescription>
            </CardHeader>
            <CardContent> <Button asChild className="glow-button"> <Link href="/core">Go to Core Console</Link> </Button> </CardContent>
        </Card>
    );

    if (isUserLoading) {
        return ( <> <AppHeader /> <div className="flex justify-center items-center h-[calc(100vh-8rem)]"> <Loader2 className="h-8 w-8 animate-spin text-primary"/> </div> </> );
    }

    if (userError) {
        return (
             <>
                <AppHeader />
                <div className="container mx-auto px-4 py-8">
                    <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive interactive-card">
                        <CardHeader>
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit"><AlertTriangle className="h-10 w-10 text-destructive" /></div>
                            <CardTitle className="mt-4 text-destructive">Access Denied</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-destructive-foreground">{userError}</p>
                            <Button asChild className="glow-button mt-4"> <Link href="/core">Return to Core</Link> </Button>
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
        <PortfolioStatsDisplay stats={portfolioStats} isLoading={isUserLoading || isLoadingPositions} onGenerateReview={handleGenerateReview} isGeneratingReview={isGeneratingReview} onKillSwitch={handleKillSwitch} isKilling={isKilling} />
         <Tabs defaultValue="open" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open" className="data-[state=active]:shadow-active-tab-glow">Active Positions ({openPositions.length})</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:shadow-active-tab-glow">Trade History ({tradeHistory.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4 space-y-3">
                {isLoadingPositions ? <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                : openPositions.length > 0 ? openPositions.map(pos => <PositionCard key={pos.id} position={pos} updateLocalPosition={updateLocalPosition} />)
                : renderEmptyState("No Active Positions", "Simulated positions appear here after execution from the Core Console.")}
            </TabsContent>
            <TabsContent value="history" className="mt-4 space-y-3">
                 {isLoadingPositions ? <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                 : tradeHistory.length > 0 ? tradeHistory.map(pos => <PositionCard key={pos.id} position={pos} updateLocalPosition={updateLocalPosition} />)
                : renderEmptyState("No Trade History", "Your closed trades will appear here.")}
            </TabsContent>
        </Tabs>
      </div>
       <PerformanceReviewModal isOpen={isReviewModalOpen} onOpenChange={setIsReviewModalOpen} reviewData={reviewData} isLoading={isGeneratingReview} error={reviewError} />
    </>
  );
}
