
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, BrainCircuit, Play, Trash2, LogIn, ShieldX, Target, CheckCircle2, Hourglass, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
    GeneratedSignal,
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

const GeneratedSignalCard = ({ signal, onDismiss, onExecute, isProcessing }: { signal: GeneratedSignal, onDismiss: (id: string) => void, onExecute: (id: string) => void, isProcessing: boolean }) => {
    const formatPrice = (priceString?: string | null): string => {
        if (!priceString) return 'N/A';
        const price = parseFloat(priceString);
        if (isNaN(price)) {
            const parts = priceString.split('-').map(p => parseFloat(p.trim()));
            return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? `${parts[0].toFixed(2)} - ${parts[1].toFixed(2)}` : priceString;
        }
        return price.toFixed(2);
    };
    
    const isBuy = signal.signal === 'BUY';

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
        if (!user || isGuest) return;
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
        if (user && !isGuest && isInitialized) {
            loadData();
        } else if (isGuest || !isUserLoading) {
            setIsLoadingData(false);
        }
    }, [user, isGuest, loadData, isUserLoading, isInitialized]);
    
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
                loadData();
            }
        }
        setProcessingId(null);
    }, [user, isGuest, dismissClientSignal, loadData, toast]);
    
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
            } else {
                toast({ title: "Signal Executed", description: "Your pending order has been created. Check your portfolio.", });
                router.push('/pulse');
            }
        }
        setProcessingId(null);
    }, [user, isGuest, executeClientSignal, router, toast]);

    const renderContent = () => {
        if ((isUserLoading && !isGuest) || !isInitialized) {
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

        const pendingSignals = signals.filter(s => s.status === 'PENDING_EXECUTION');
        const oldSignals = signals.filter(s => s.status !== 'PENDING_EXECUTION');

        return (
            <div className="space-y-6">
                {pendingSignals.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-accent">Pending Signals</h3>
                        {pendingSignals.map(signal => (
                            <GeneratedSignalCard key={signal.id} signal={signal} onDismiss={handleDismiss} onExecute={handleExecute} isProcessing={processingId === signal.id} />
                        ))}
                    </div>
                )}
                {oldSignals.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-muted-foreground">Archived Signals</h3>
                        {oldSignals.map(signal => (
                            <GeneratedSignalCard key={signal.id} signal={signal} onDismiss={handleDismiss} onExecute={handleExecute} isProcessing={processingId === signal.id} />
                        ))}
                    </div>
                )}
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
                    <CardDescription> A log of signals generated by <strong className="text-accent">SHADOW</strong>. Executed signals become positions in your Portfolio. </CardDescription>
                </div>
                 <Button variant="outline" size="icon" onClick={loadData} disabled={isLoadingData}> <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} /> </Button>
            </CardHeader>
        </Card>
        {renderContent()}
      </div>
    </>
  );
}
