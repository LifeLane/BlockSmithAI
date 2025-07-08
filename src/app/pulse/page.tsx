'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Briefcase, AlertTriangle, LogOut, Sparkles, History, DollarSign, Percent, ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PlayCircle, Wallet, Activity, BrainCircuit, ShieldAlert, Bot, Hourglass, Trash2, Cpu, Zap } from 'lucide-react';
import {
  fetchPortfolioStatsAction,
  generatePerformanceReviewAction,
  killSwitchAction,
  fetchPendingAndOpenPositionsAction,
  fetchTradeHistoryAction,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

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
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Nodes Trained" value={stats.nodesTrained} icon={<Cpu size={14} />} valueClassName="text-tertiary" />
                <StatCard title="Total XP Gained" value={stats.xpGained.toLocaleString()} icon={<Zap size={14} />} valueClassName="text-tertiary" />
                <StatCard title="Capital Deployed" value={`$${stats.totalCapitalDeployed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<Wallet size={14} />} />
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

const PositionCard = ({ position }: { position: Position }) => {
    const isBuy = position.signalType === 'BUY';
    const pnl = position.pnl ?? 0;
    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
    const dateToFormat = position.status === 'CLOSED' ? position.closeTimestamp : position.openTimestamp;
    
    return (
        <Card className="bg-card/90 interactive-card">
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <span className={isBuy ? 'text-green-400' : 'text-red-400'}>{isBuy ? 'LONG' : 'SHORT'}</span>
                        <span className="text-foreground">{position.symbol}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {dateToFormat ? formatDistanceToNow(new Date(dateToFormat), { addSuffix: true }) : 'Date not available'}
                    </CardDescription>
                </div>
                <Badge variant="outline" className={position.status === 'OPEN' ? 'border-primary text-primary' : 'border-muted'}>{position.status}</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-xs">
                 <div className="flex flex-col p-2 bg-background rounded-md">
                    <span className="text-muted-foreground">Entry</span>
                    <span className="font-mono font-semibold">${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-md">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-mono font-semibold">{position.size}</span>
                </div>
                 <div className="flex flex-col p-2 bg-background rounded-md">
                    <span className="text-muted-foreground">Close Price</span>
                    <span className="font-mono font-semibold">{position.closePrice ? `$${position.closePrice.toFixed(2)}` : 'N/A'}</span>
                </div>
            </CardContent>
            {position.status === 'CLOSED' && (
                 <CardFooter>
                    <p className="text-sm font-semibold">
                        PnL: <span className={pnlColor}>${pnl.toFixed(2)}</span>
                    </p>
                </CardFooter>
            )}
        </Card>
    )
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
            if (Array.isArray(openPositionsResult)) setOpenPositions(openPositionsResult);
            if (Array.isArray(historyResult)) setTradeHistory(historyResult);

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
                    openPositions.map(pos => <PositionCard key={pos.id} position={pos} />)
                ) : (
                    renderEmptyState("No Active Positions", "Simulated positions appear here after execution from the Core Console.")
                )}
            </TabsContent>
            <TabsContent value="history" className="mt-4 space-y-3">
                 {isLoadingData && tradeHistory.length === 0 ? (
                     <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                 ) : tradeHistory.length > 0 ? (
                    tradeHistory.map(pos => <PositionCard key={pos.id} position={pos} />)
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
