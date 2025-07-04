
'use client';
import { useState, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Briefcase, AlertTriangle, LogOut, History, DollarSign, Percent, ArrowUp, ArrowDown, Gift, LogIn, Target, ShieldX, Clock, PlayCircle, Wallet, Activity, BrainCircuit, ShieldAlert, CheckCircle2, XCircle, Bot, Hourglass } from 'lucide-react';
import { usePortfolioManager } from '@/hooks/usePortfolioManager';
import {
  generatePerformanceReviewAction,
  killSwitchAction,
  type Position,
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
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import DisclaimerFooter from '@/components/blocksmith-ai/DisclaimerFooter';

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

const DataItem = ({ label, value, icon, valueClassName }: { label: string, value: React.ReactNode, icon?: React.ReactNode, valueClassName?: string }) => (
    <div className="flex flex-col p-2 bg-background/50 rounded-md">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">{icon}{label}</span>
        <span className={cn("font-mono text-sm font-semibold mt-1", valueClassName)}>{value}</span>
    </div>
);

const OpenPositionCard = ({ position, currentPrice, onClose, isClosing }: { position: Position, currentPrice?: number, onClose: (positionId: string, closePrice: number) => void, isClosing: boolean }) => {
    const isPending = position.status === 'PENDING';
    let pnl = 0;
    let pnlPercent = 0;
    const positionSize = position.size || 1;

    if (currentPrice && !isPending) {
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
    const openTimestampText = isValidOpenDate ? `${formatDistanceToNow(openDate)} ago` : 'N/A';
    
    const pnlColor = pnl >= 0 ? 'text-stat-green' : 'text-destructive';
    const isBuy = position.signalType === 'BUY';
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 interactive-card overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div>
                    <CardTitle className="text-xl flex items-center font-headline">
                        <span className={`mr-2 font-bold ${isBuy ? 'text-stat-green' : 'text-destructive'}`}>{isBuy ? 'LONG' : 'SHORT'}</span>
                        {position.symbol}
                    </CardTitle>
                     <CardDescription className="text-xs">
                        {isPending ? 'Order Placed' : 'Opened'}: {openTimestampText}
                    </CardDescription>
                </div>
                 <div className="flex flex-col items-end">
                    {isPending ? (
                        <Badge className={'border-yellow-500/50 bg-yellow-900/60 text-tertiary'}><Hourglass className="h-4 w-4 mr-1 text-tertiary"/>PENDING</Badge>
                    ) : (
                        <Badge className={'border-blue-500/50 bg-blue-900/60 text-primary'}><PlayCircle className="h-4 w-4 mr-1 text-primary"/>OPEN</Badge>
                    )}
                    {position.expirationTimestamp && (
                        <TimeLeft expiration={new Date(position.expirationTimestamp)} className="text-xs text-muted-foreground mt-2"/>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <DataItem
                    label="Current Price"
                    value={currentPrice ? `$${currentPrice.toFixed(2)}` : <Loader2 className="h-4 w-4 animate-spin"/>}
                    valueClassName="text-primary"
                />
                 <DataItem
                    label={isPending ? "Limit Price" : "Entry Price"}
                    icon={<LogIn size={12}/>}
                    value={`$${position.entryPrice.toFixed(2)}`}
                />
                <DataItem
                    label="Unrealized PnL"
                    icon={<DollarSign size={12}/>}
                    value={isPending ? 'N/A' : (currentPrice ? `$${pnl.toFixed(2)}` : '...')}
                    valueClassName={pnlColor}
                />
                <DataItem
                    label="Unrealized PnL %"
                    icon={<Percent size={12}/>}
                    value={isPending ? 'N/A' : (currentPrice ? `${pnlPercent.toFixed(2)}%` : '...')}
                    valueClassName={pnlColor}
                />
                 <DataItem
                    label="Stop Loss"
                    icon={<ShieldX size={12}/>}
                    value={position.stopLoss ? `$${position.stopLoss.toFixed(2)}` : 'N/A'}
                    valueClassName="text-destructive"
                />
                <DataItem
                    label="Take Profit"
                    icon={<Target size={12}/>}
                    value={position.takeProfit ? `$${position.takeProfit.toFixed(2)}` : 'N/A'}
                    valueClassName="text-stat-green"
                />
            </CardContent>
            <CardFooter className="pt-6">
                <Button className="w-full" variant="destructive" onClick={() => currentPrice && onClose(position.id, currentPrice)} disabled={isClosing || !currentPrice || isPending}>
                    {isClosing ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4 mr-1"/>}
                    {isPending ? "Cancel Order" : "Close Manually"}
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

    const icon = isWin ? <CheckCircle2 className="h-6 w-6 text-stat-green"/> : <XCircle className="h-6 w-6 text-destructive"/>;
    const pnlColor = isWin ? 'text-stat-green' : 'text-destructive';

    const closeDate = position.closeTimestamp ? new Date(position.closeTimestamp) : null;
    const isValidDate = closeDate && !isNaN(closeDate.getTime());
    const closeTimestampText = isValidDate ? formatDistanceToNow(closeDate) : 'an unknown time';

    return (
        <Card className={cn(
            "bg-card/80 backdrop-blur-sm interactive-card",
            isWin ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
        )}>
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
             <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
                <DataItem
                    label="Entry"
                    icon={<LogIn size={12}/>}
                    value={`$${entryPrice.toFixed(2)}`}
                />
                 <DataItem
                    label="Exit"
                    icon={<LogOut size={12}/>}
                    value={`$${closePrice.toFixed(2)}`}
                />
                 <DataItem
                    label="PnL"
                    icon={<DollarSign size={12}/>}
                    value={`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                    valueClassName={cn("text-base", pnlColor)}
                />
                 <DataItem
                    label="PnL %"
                    icon={<Percent size={12}/>}
                    value={`${pnlPercent.toFixed(2)}%`}
                    valueClassName={cn("text-base", pnlColor)}
                />
             </CardContent>
        </Card>
    )
}

const StatItem = ({
  title,
  value,
  icon,
  valueClassName,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="bg-secondary p-3 rounded-lg flex flex-col justify-center items-center glow-border-box">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      <span className="truncate">{title}</span>
    </div>
    <div className="mt-1">
      <span className={cn("text-lg sm:text-xl font-bold font-mono", valueClassName)}>
        {value}
      </span>
    </div>
  </div>
);


const PortfolioStatsDisplay = ({ stats, isLoading, realtimePnl, onGenerateReview, isGeneratingReview, onKillSwitch, isKilling }: { stats: any, isLoading: boolean, realtimePnl: number, onGenerateReview: () => void, isGeneratingReview: boolean, onKillSwitch: () => void, isKilling: boolean }) => {
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

    const pnlColor = realtimePnl >= 0 ? 'text-stat-green' : 'text-destructive';
    const closedPnlColor = stats.totalPnl >= 0 ? 'text-stat-green' : 'text-destructive';

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-accent/30 interactive-card">
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent font-headline"><Briefcase /> <GlyphScramble text="Performance Matrix" /></CardTitle>
                    <CardDescription>An overview of your <strong className="text-accent">closed trade</strong> performance.</CardDescription>
                </div>
                <Button size="sm" onClick={onGenerateReview} disabled={isGeneratingReview} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground w-full sm:w-auto">
                    {isGeneratingReview ? <Loader2 className="h-4 w-4 animate-spin"/> : <BrainCircuit className="h-4 w-4 mr-2"/>}
                    Get SHADOW's Review
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                 <StatItem
                    title="Invested"
                    value={`$${stats.totalCapitalInvested.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    icon={<Wallet size={14} />}
                    valueClassName="text-tertiary"
                />
                <StatItem
                    title="Live PnL"
                    icon={<Activity size={14} />}
                    value={`$${realtimePnl.toFixed(2)}`}
                    valueClassName={pnlColor}
                />
                <StatItem
                    title="Trades"
                    value={stats.totalTrades.toLocaleString()}
                    icon={<History size={14} />}
                    valueClassName="text-stat-blue"
                />
                <StatItem
                    title="Winning Trades"
                    icon={<CheckCircle2 size={14} />}
                    value={stats.winningTrades.toLocaleString()}
                    valueClassName="text-stat-green"
                />
                <StatItem
                    title="Total PnL"
                    icon={<DollarSign size={14} />}
                    value={`$${stats.totalPnl.toFixed(2)}`}
                    valueClassName={closedPnlColor}
                />
                <StatItem
                    title="Best Trade"
                    value={`$${stats.bestTradePnl.toFixed(2)}`}
                    icon={<ArrowUp size={14} />}
                    valueClassName="text-stat-green"
                />
                <StatItem
                    title="Worst Trade"
                    value={`$${stats.worstTradePnl.toFixed(2)}`}
                    icon={<ArrowDown size={14} />}
                    valueClassName="text-destructive"
                />
                <StatItem
                    title="Rewards"
                    value={stats.lifetimeRewards.toLocaleString()}
                    icon={<Gift size={14}/>}
                    valueClassName="text-tertiary"
                />
            </CardContent>
             <CardFooter className="pt-6 flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/20 mt-4">
                <div className="text-center sm:text-left">
                    <h4 className="font-semibold text-destructive font-headline">Emergency Protocol</h4>
                    <p className="text-xs text-muted-foreground">Instantly close all <strong className="text-destructive">active positions</strong>.</p>
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
    const {
        positions,
        tradeHistory,
        portfolioStats,
        livePrices,
        closingPositionId,
        isLoadingData,
        realtimePnl,
        handleManualClose
    } = usePortfolioManager(currentUser?.id);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [reviewData, setReviewData] = useState<PerformanceReviewOutput | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [isKilling, setIsKilling] = useState(false);

    const { toast } = useToast();
    
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
        } else {
            toast({
                title: "Kill Switch Failed",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsKilling(false);
    }, [currentUser, toast]);
    
    
    const renderActivePositions = () => {
        const activePositions = positions.filter(p => p.status === 'OPEN' || p.status === 'PENDING');

        if (isLoadingData && activePositions.length === 0) {
            return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
        }
        if (activePositions.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4 font-headline">No Active Positions</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Generate a signal from the <strong className="text-primary">Core Console</strong> to begin.
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
                {activePositions.map(pos => (
                    <OpenPositionCard
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
            return <p className="text-center text-muted-foreground mt-8">No closed trades yet. Your <strong className="text-tertiary">trade history</strong> will appear here.</p>
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
                            <CardTitle className="mt-4 text-destructive font-headline">Access Denied</CardTitle>
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
             <div className="flex justify-center">
                 <TabsList className="profile-tabs-list">
                    <TabsTrigger value="open" className="profile-tabs-trigger">Active ({positions.filter(p => p.status !== 'CLOSED').length})</TabsTrigger>
                    <TabsTrigger value="history" className="profile-tabs-trigger">History ({tradeHistory.length})</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="open" className="mt-4">
                {renderActivePositions()}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
                 {renderTradeHistory()}
            </TabsContent>
        </Tabs>
        <DisclaimerFooter />
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
