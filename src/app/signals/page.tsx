
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, BrainCircuit, Play, Trash2, LogIn, ShieldX, Target, CheckCircle2, Hourglass, RefreshCw, Layers, Bitcoin, Zap, Gift, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
    GeneratedSignal,
    Position,
    fetchPositionsAndSignalsAction,
    dismissSignalAction,
    executeSignalAction
} from '@/app/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useClientState } from '@/hooks/use-client-state';

const StatusBadge = ({ status }: { status: GeneratedSignal['status'] }) => {
    const statusMap = {
        PENDING_EXECUTION: { icon: <Hourglass className="h-3 w-3 mr-1.5"/>, text: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        EXECUTED: { icon: <CheckCircle2 className="h-3 w-3 mr-1.5"/>, text: 'Executed', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
        DISMISSED: { icon: <Trash2 className="h-3 w-3 mr-1.5"/>, text: 'Dismissed', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };
    const currentStatus = statusMap[status] || statusMap.PENDING_EXECUTION;
    return <Badge variant="outline" className={cn("text-xs", currentStatus.className)}> {currentStatus.icon} {currentStatus.text} </Badge>;
}

const formatPrice = (priceVal?: number | string | null): string => {
    if (priceVal === null || priceVal === undefined) return 'N/A';
    if (typeof priceVal === 'string') {
        const price = parseFloat(priceVal);
         if (isNaN(price)) return priceVal; // Handle ranges or non-numeric strings
        return price.toFixed(2);
    }
    return priceVal.toFixed(2);
};

const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? 'N/A' : `$${value.toFixed(2)}`;

const RewardInfo = ({ label, value, icon, valueClassName }: { label: string, value: React.ReactNode, icon: React.ReactNode, valueClassName?: string }) => (
    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
        <div className={cn("text-primary", valueClassName)}> {icon} </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold font-mono">{value}</p>
        </div>
    </div>
);

const GeneratedSignalCard = ({ signal, onDismiss, onExecute, isProcessing }: { signal: GeneratedSignal, onDismiss: (id: string) => void, onExecute: (id: string) => void, isProcessing: boolean }) => {
    const isBuy = signal.signal === 'BUY';

    const renderExecutionDetails = (position: Position) => {
        const pnl = position.pnl ?? 0;
        const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-destructive';

        return (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-accent flex items-center gap-2">
                        <CheckCircle /> Execution & Trade Result
                    </h4>
                     <Badge variant="outline" className={cn("text-xs font-bold", position.status === 'CLOSED' ? "border-muted text-muted-foreground" : "border-primary text-primary animate-pulse")}>
                        {position.status}
                    </Badge>
                </div>

                <div className="text-xs p-3 bg-background/50 rounded-md grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><LogIn size={12}/> Entry Price</span> <span className="font-mono font-semibold">${formatPrice(position.entryPrice)}</span> </div>
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><LogIn size={12}/> Close Price</span> <span className="font-mono font-semibold">{position.closePrice ? `$${formatPrice(position.closePrice)}` : 'N/A'}</span> </div>
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><ArrowRight size={12}/> Final PnL</span> <span className={cn("font-mono font-semibold", pnlColor)}>{formatCurrency(position.pnl)}</span> </div>
                </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <RewardInfo label="$BSAI Gained" value={position.gainedAirdropPoints?.toLocaleString() ?? '0'} icon={<Gift size={16} />} valueClassName="text-orange-400" />
                    <RewardInfo label="XP Gained" value={position.gainedXp?.toLocaleString() ?? '0'} icon={<Zap size={16} />} valueClassName="text-tertiary" />
                    <RewardInfo label="Blocks Trained" value={position.blocksTrained?.toLocaleString() ?? 'N/A'} icon={<Layers size={16} />} />
                    <RewardInfo label="Gas Paid (Mock)" value={formatCurrency(position.gasPaid) ?? 'N/A'} icon={<Bitcoin size={16} />} />
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 flex flex-col interactive-card">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                             <span className={cn("font-bold", isBuy ? 'text-green-400' : 'text-red-400')}>{signal.signal}</span>
                            {signal.symbol}
                        </CardTitle>
                        <CardDescription className="text-xs">{format(new Date(signal.createdAt), "MMM d, yyyy 'at' h:mm a")}</CardDescription>
                    </div>
                     <StatusBadge status={signal.status} />
                </div>
                 <p className="text-sm text-muted-foreground pt-2 italic line-clamp-2"> <BrainCircuit className="inline h-4 w-4 mr-2 text-tertiary"/> {signal.currentThought} </p>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="text-xs p-3 bg-background/50 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><LogIn size={12}/> Entry</span> <span className="font-mono font-semibold text-primary">${formatPrice(signal.entry_zone)}</span> </div>
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><ShieldX size={12}/> Stop Loss</span> <span className="font-mono font-semibold text-destructive">${formatPrice(signal.stop_loss)}</span> </div>
                    <div className="flex flex-col"> <span className="text-muted-foreground flex items-center gap-1"><Target size={12}/> Take Profit</span> <span className="font-mono font-semibold text-green-400">${formatPrice(signal.take_profit)}</span> </div>
                </div>
                {signal.position && renderExecutionDetails(signal.position)}
            </CardContent>
            {signal.status === 'PENDING_EXECUTION' && (
                <CardFooter className="mt-auto flex gap-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onDismiss(signal.id)} disabled={isProcessing}> {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 mr-2"/>} Dismiss </Button>
                        <Button size="sm" className="w-full glow-button" onClick={() => onExecute(signal.id)} disabled={isProcessing}> {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>} Execute </Button>
                </CardFooter>
            )}
        </Card>
    );
};


export default function SignalsPage() {
    const { user, isLoading: isUserLoading } = useCurrentUser();
    const [dbSignals, setDbSignals] = useState<GeneratedSignal[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const { 
        signals: clientSignals, 
        dismissSignal: dismissClientSignal, 
        executeSignal: executeClientSignal,
        isInitialized 
    } = useClientState();
    
    const isGuest = user?.status === 'Guest';
    const signals = isGuest ? clientSignals : dbSignals;

    const loadData = useCallback(async () => {
        if (!user || isGuest) {
             setIsLoadingData(false);
             return;
        }
        setIsLoadingData(true);
        const result = await fetchPositionsAndSignalsAction(user.id);
        if ('error' in result) {
            toast({ title: 'Error', description: result.error, variant: 'destructive'});
        } else {
            setDbSignals(result.signals);
        }
        setIsLoadingData(false);
    }, [user, isGuest, toast]);
    
    useEffect(() => {
        if (isInitialized) {
            loadData();
        }
    }, [isInitialized, loadData]);
    
    const handleDismiss = useCallback(async (signalId: string) => {
        if (!user) return;
        setProcessingId(signalId);
        if (isGuest) {
            dismissClientSignal(signalId);
        } else {
            const result = await dismissSignalAction(signalId, user.id);
            if ('error' in result) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: "Signal Dismissed" });
                setDbSignals(prev => prev.map(s => s.id === signalId ? result : s));
            }
        }
        setProcessingId(null);
    }, [user, isGuest, dismissClientSignal, toast]);
    
    const handleExecute = useCallback(async (signalId: string) => {
        if (!user) return;
        setProcessingId(signalId);
        if (isGuest) {
            executeClientSignal(signalId);
            toast({ title: "Signal Executed", description: "Your pending order has been created. Check your portfolio.", });
            router.push('/pulse');
        } else {
            const result = await executeSignalAction(signalId, user.id);
            if ('error' in result) {
                toast({ title: "Error", description: result.error, variant: 'destructive'});
                 setProcessingId(null);
            } else {
                toast({ title: "Signal Executed", description: "Your pending position has been created. Check your portfolio.", });
                router.push('/pulse');
            }
        }
    }, [user, isGuest, executeClientSignal, router, toast]);

    const renderContent = () => {
        if (isLoadingData) {
            return <div className="flex justify-center items-center h-64"> <Loader2 className="h-8 w-8 animate-spin text-primary"/> </div>;
        }

        if (signals.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit"> <Bot className="h-10 w-10 text-primary" /> </div>
                        <CardTitle className="mt-4">No Generated Signals</CardTitle>
                        <CardDescription className="mt-2 text-base"> Generate a signal from the <strong className="text-primary">Core Console</strong> to see it here. </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="glow-button">
                            <Link href="/core">Go to Core Console</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }
        
        const sortedSignals = [...signals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return (
            <div className="space-y-4">
                {sortedSignals.map(signal => (
                    <GeneratedSignalCard key={signal.id} signal={signal} onDismiss={handleDismiss} onExecute={handleExecute} isProcessing={processingId === signal.id} />
                ))}
            </div>
        );
    };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/10 interactive-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center text-lg text-primary"> <BrainCircuit className="mr-3 h-5 w-5"/> Signal Log </CardTitle>
                    <CardDescription> A log of signals generated by <strong className="text-accent">SHADOW</strong> and their trade outcomes. </CardDescription>
                </div>
                 <Button variant="outline" size="icon" onClick={loadData} disabled={isLoadingData}> <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} /> </Button>
            </CardHeader>
        </Card>
        {renderContent()}
      </div>
    </>
  );
}
