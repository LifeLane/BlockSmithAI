
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, BrainCircuit, Play, Trash2, LogIn, ShieldX, Target, CheckCircle2, AlertCircle, Hourglass, Archive, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  executeCustomSignalAction,
  type GeneratedSignal,
  type Position,
} from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useClientState } from '@/hooks/use-client-state';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { randomUUID } from 'crypto';

const StatusBadge = ({ status }: { status: GeneratedSignal['status'] }) => {
    const statusMap = {
        PENDING_EXECUTION: { icon: <Hourglass className="h-3 w-3 mr-1.5"/>, text: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        EXECUTED: { icon: <CheckCircle2 className="h-3 w-3 mr-1.5"/>, text: 'Executed', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
        DISMISSED: { icon: <Trash2 className="h-3 w-3 mr-1.5"/>, text: 'Dismissed', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };
    const currentStatus = statusMap[status] || statusMap.PENDING_EXECUTION;
    return (
        <Badge variant="outline" className={cn("text-xs", currentStatus.className)}>
            {currentStatus.icon} {currentStatus.text}
        </Badge>
    );
}

const GeneratedSignalCard = ({ signal, onDismiss, onExecute, isProcessing }: { signal: GeneratedSignal, onDismiss: (id: string) => void, onExecute: (signal: GeneratedSignal) => void, isProcessing: boolean }) => {
    
    const formatPrice = (priceString?: string | null): string => {
        if (!priceString) return 'N/A';
        const price = parseFloat(priceString);
        if (isNaN(price)) {
            const parts = priceString.split('-').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return `${parts[0].toFixed(2)} - ${parts[1].toFixed(2)}`;
            }
            return priceString;
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
                 <p className="text-sm text-muted-foreground pt-2 italic line-clamp-2">
                    <BrainCircuit className="inline h-4 w-4 mr-2 text-tertiary"/>
                    {signal.currentThought}
                 </p>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="text-xs p-3 bg-background/50 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center gap-1"><LogIn size={12}/> Entry</span>
                        <span className="font-mono font-semibold text-primary">${formatPrice(signal.entry_zone)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center gap-1"><ShieldX size={12}/> Stop Loss</span>
                        <span className="font-mono font-semibold text-destructive">${formatPrice(signal.stop_loss)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center gap-1"><Target size={12}/> Take Profit</span>
                        <span className="font-mono font-semibold text-green-400">${formatPrice(signal.take_profit)}</span>
                    </div>
                </div>
            </CardContent>
            {signal.status === 'PENDING_EXECUTION' && (
                <CardFooter className="mt-auto flex gap-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onDismiss(signal.id)} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 mr-2"/>} Dismiss
                        </Button>
                        <Button size="sm" className="w-full glow-button" onClick={() => onExecute(signal)} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>} Execute
                        </Button>
                </CardFooter>
            )}
        </Card>
    );
};


export default function SignalsPage() {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useCurrentUser();
    const { generatedSignals, updateGeneratedSignal, addPosition } = useClientState();
    const { toast } = useToast();
    const router = useRouter();
    
    const handleDismiss = useCallback(async (signalId: string) => {
        setProcessingId(signalId);
        updateGeneratedSignal(signalId, { status: 'DISMISSED' });
        toast({ title: "Signal Dismissed", description: "This signal will no longer be available for execution." });
        setProcessingId(null);
    }, [updateGeneratedSignal, toast]);
    
    const parsePrice = (priceStr: string | undefined | null): number => {
        if (!priceStr) return NaN;
        const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
        const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
        if (parts.length === 0) return NaN;
        if (parts.length === 1) return parseFloat(parts[0]);
        const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
        return sum / parts.length;
    };
    
    const handleExecute = useCallback(async (signal: GeneratedSignal) => {
        if (!user) return;
        setProcessingId(signal.id);
        
        const result = await executeCustomSignalAction(user.id);
        
        if (result.success) {
            // Create a new position on the client
            const newPosition: Position = {
                id: `pos_${signal.id}`, // or generate a new UUID
                userId: user.id,
                symbol: signal.symbol,
                signalType: signal.signal,
                status: 'PENDING',
                entryPrice: parsePrice(signal.entry_zone),
                stopLoss: parsePrice(signal.stop_loss),
                takeProfit: parsePrice(signal.take_profit),
                size: 1, // default size
                openTimestamp: null,
                closeTimestamp: null,
                pnl: null,
                gainedXp: null,
                gainedAirdropPoints: null,
                gasPaid: null,
                blocksTrained: null,
                createdAt: new Date().toISOString(),
                expirationTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                type: 'CUSTOM',
                tradingMode: signal.chosenTradingMode || 'Custom',
                riskProfile: signal.chosenRiskProfile || 'Medium',
                gpt_confidence_score: signal.gpt_confidence_score,
                sentiment: signal.sentiment,
                strategyId: signal.id,
            };
            addPosition(newPosition);

            // Update the signal status
            updateGeneratedSignal(signal.id, { status: 'EXECUTED' });

            // Refetch user to update points
            refetchUser();

            toast({
                title: "Signal Executed",
                description: "Your pending order has been created. Redirecting to portfolio...",
            });
            router.push('/pulse');
        } else {
            toast({ title: "Execution Failed", description: result.error || "Could not execute the signal.", variant: 'destructive' });
            setProcessingId(null);
        }
    }, [user, toast, router, addPosition, updateGeneratedSignal, refetchUser]);


    const renderContent = () => {
        if (isUserLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }
        
        if (userError || !user) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 border-destructive interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="mt-4 text-destructive">Access Denied</CardTitle>
                        <CardDescription className="mt-2 text-base text-destructive-foreground">
                           {userError || "A user session is required to view your signals."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild className="glow-button">
                             <Link href="/core">
                                Return to Core
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (generatedSignals.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Generated Signals</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Generate a signal from the <strong className="text-primary">Core Console</strong> to see it here.
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
                {generatedSignals.map(signal => (
                    <GeneratedSignalCard
                        key={signal.id}
                        signal={signal}
                        onDismiss={handleDismiss}
                        onExecute={handleExecute}
                        isProcessing={processingId === signal.id}
                    />
                ))}
            </div>
        );
    };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/10 interactive-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center text-lg text-primary">
                        <BrainCircuit className="mr-3 h-5 w-5"/>
                        <GlyphScramble text="Signal Log" />
                    </CardTitle>
                    <CardDescription>
                        A complete log of all signals generated by <strong className="text-accent">SHADOW</strong>. <strong className="text-primary">Custom signals</strong> that have been executed can be tracked in your Portfolio.
                    </CardDescription>
                </div>
                 <Button variant="outline" size="icon" disabled>
                    <RefreshCw className={cn("h-4 w-4")} />
                 </Button>
            </CardHeader>
        </Card>
        {renderContent()}
      </div>
    </>
  );
}
