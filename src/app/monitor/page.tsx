
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass, TrendingUp, TrendingDown, Clock, Bot, Info, LogIn, Target, ShieldX, Zap, ShieldQuestion, PauseCircle, BrainCircuit, Percent, ShieldCheck, Loader2, AlertTriangle, PlayCircle, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Position } from '@/app/actions';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { fetchTradeHistoryAction, fetchPendingAndOpenPositionsAction } from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const formatPrice = (price?: number | null) => {
    if (price === null || typeof price === 'undefined') return 'N/A';
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const SignalCard = ({ position }: { position: Position }) => {
    const { signalType, status, symbol } = position;
    
    let statusIcon, statusColor, statusText;
    switch (status) {
        case 'PENDING':
            statusIcon = <Hourglass className="h-4 w-4 mr-1.5"/>;
            statusColor = "border-yellow-500/50 bg-yellow-900/60 text-yellow-300";
            statusText = "Pending";
            break;
        case 'OPEN':
            statusIcon = <PlayCircle className="h-4 w-4 mr-1.5"/>;
            statusColor = "border-blue-500/50 bg-blue-900/60 text-blue-300";
            statusText = "Open";
            break;
        case 'CLOSED':
            statusIcon = position.pnl! >= 0 ? <CheckCircle2 className="h-4 w-4 mr-1.5"/> : <XCircle className="h-4 w-4 mr-1.5"/>;
            statusColor = position.pnl! >= 0 ? "border-green-500/50 bg-green-900/60 text-green-300" : "border-red-500/50 bg-red-900/60 text-red-300";
            statusText = "Closed";
            break;
        default:
            statusIcon = <Bot className="h-4 w-4 mr-1.5"/>;
            statusColor = "border-border bg-secondary";
            statusText = "Unknown";
    }

    let signalColor = 'text-primary';
    if (signalType === 'BUY') signalColor = 'text-green-400';
    if (signalType === 'SELL') signalColor = 'text-red-400';

    return (
        <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-3 gap-2">
                <div>
                    <CardTitle className="text-lg">
                        <span className={`mr-2 font-bold ${signalColor}`}>{signalType}</span>
                        <span className="text-foreground">{symbol}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1.5"/>
                        {status === 'CLOSED' && position.closeTimestamp 
                            ? `Closed ${formatDistanceToNow(new Date(position.closeTimestamp))} ago`
                            : status === 'OPEN' && position.openTimestamp
                            ? `Opened ${formatDistanceToNow(new Date(position.openTimestamp))} ago`
                            : `Logged ${formatDistanceToNow(new Date(position.id.split('-')[0]))}` // Fallback for pending
                        }
                    </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className={cn("transition-colors", statusColor)}>
                        {statusIcon} {statusText}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><LogIn size={12}/>Entry</span>
                    <span className="font-mono font-semibold text-primary">${formatPrice(position.entryPrice)}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">${formatPrice(position.stopLoss)}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">${formatPrice(position.takeProfit)}</span>
                </div>
                {status === 'CLOSED' && (
                    <div className="col-span-full flex flex-col items-center p-2 bg-background/50 rounded-md">
                        <span className="text-muted-foreground text-xs flex items-center gap-1">Final PnL</span>
                         <span className={`font-mono font-semibold text-lg ${position.pnl! >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${formatPrice(position.pnl)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function MonitorPage() {
    const [activeSignals, setActiveSignals] = useState<Position[]>([]);
    const [closedSignals, setClosedSignals] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();

    const fetchData = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [activeResult, closedResult] = await Promise.all([
                fetchPendingAndOpenPositionsAction(userId),
                fetchTradeHistoryAction(userId),
            ]);
            setActiveSignals(activeResult);
            setClosedSignals(closedResult);
        } catch (e: any) {
            setError("Failed to fetch signal data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData(currentUser.id);
            const intervalId = setInterval(() => fetchData(currentUser.id), 30000); // Poll every 30 seconds
            return () => clearInterval(intervalId);
        }
    }, [currentUser, fetchData]);

    if (isUserLoading) {
        return (
            <>
                <AppHeader />
                <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[calc(100vh-200px)]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin"/>
                </div>
            </>
        )
    }

    if (!currentUser) {
        return (
            <>
                <AppHeader />
                <div className="container mx-auto px-4 py-8 text-center">
                    <Card className="max-w-lg mx-auto border-destructive">
                        <CardHeader>
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>
                            <CardTitle className="text-destructive mt-4">Access Denied</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">You must be logged in to view your signal monitor. Please visit the Core Console to initialize your session.</p>
                            <Button asChild className="mt-4 glow-button">
                                <Link href="/core">Go to Core Console</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
    
    const renderSignalList = (signals: Position[], emptyState: React.ReactNode) => {
        if (isLoading && signals.length === 0) {
            return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>;
        }
        if (signals.length === 0) {
            return emptyState;
        }
        return (
            <div className="space-y-4">
                {signals.map(signal => <SignalCard key={signal.id} position={signal} />)}
            </div>
        );
    };

    const emptyActiveState = (
        <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Eye className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">No Active Signals</CardTitle>
                <CardDescription className="mt-2 text-base">
                    Generate a signal on the Core Console. It will appear here while pending or open.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="glow-button">
                    <Link href="/core">Go to Core Console</Link>
                </Button>
            </CardContent>
        </Card>
    );

    const emptyClosedState = (
        <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Bot className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">No Closed Signals</CardTitle>
                <CardDescription className="mt-2 text-base">
                    Your trade history will appear here once positions are closed.
                </CardDescription>
            </CardHeader>
        </Card>
    );

    return (
        <>
            <AppHeader />
            <div className="container mx-auto px-4 py-8 pb-24">
                <Tabs defaultValue="active" className="w-full">
                     <div className="flex justify-center">
                        <TabsList className="bg-card/80 grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="active">Active Signals ({activeSignals.length})</TabsTrigger>
                            <TabsTrigger value="closed">History ({closedSignals.length})</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active" className="mt-6">
                         <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                             {renderSignalList(activeSignals, emptyActiveState)}
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="closed" className="mt-6">
                        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                            {renderSignalList(closedSignals, emptyClosedState)}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
