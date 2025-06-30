
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, BrainCircuit, Play, Trash2, LogIn, ShieldX, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  fetchAllGeneratedSignalsAction,
  executeCustomSignalAction,
  dismissCustomSignalAction,
  type GeneratedSignal,
} from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const GeneratedSignalCard = ({ signal, onExecute, onDismiss, isProcessing }: { signal: GeneratedSignal, onExecute: (s: GeneratedSignal) => void, onDismiss: (id: string) => void, isProcessing: boolean }) => {
    
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
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    const canExecute = signal.type === 'CUSTOM' && signal.status === 'PENDING_EXECUTION' && signal.signal !== 'HOLD';

    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 flex flex-col interactive-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                    <Badge variant={signal.type === 'CUSTOM' ? 'outline' : 'secondary'} className={signal.type === 'CUSTOM' ? 'border-accent text-accent' : ''}>
                        {signal.type}
                    </Badge>
                </div>
                 <p className="text-sm text-muted-foreground pt-2 italic line-clamp-2">"{signal.strategyReasoning}"</p>
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
            <CardFooter className="mt-auto flex gap-2">
                {canExecute ? (
                    <>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onDismiss(signal.id)} disabled={isProcessing}>
                            <Trash2 className="h-4 w-4 mr-2"/> Dismiss
                        </Button>
                        <Button className="w-full glow-button" size="sm" onClick={() => onExecute(signal)} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>} Execute Manually
                        </Button>
                    </>
                ) : (
                    <div className="text-xs text-muted-foreground text-center w-full py-2">
                        This signal has been {signal.status.toLowerCase().replace(/_/g, ' ')} and cannot be executed.
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};


export default function SignalsPage() {
    const [signals, setSignals] = useState<GeneratedSignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user, isLoading: isUserLoading } = useCurrentUser();
    const { toast } = useToast();

    const fetchSignals = useCallback(async (userId: string) => {
        setIsLoading(true);
        const result = await fetchAllGeneratedSignalsAction(userId);
        if ('error' in result) {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
            setSignals([]);
        } else {
            setSignals(result);
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        if (user?.id) {
            fetchSignals(user.id);
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, isUserLoading, fetchSignals]);

    const handleExecute = useCallback(async (signalToExecute: GeneratedSignal) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to execute a signal.", variant: "destructive" });
            return;
        }
        setProcessingId(signalToExecute.id);
        const result = await executeCustomSignalAction(signalToExecute.id, user.id);

        if (result.error) {
            toast({ title: "Execution Failed", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Signal Submitted!", description: `${signalToExecute.symbol} position is now pending execution.`, variant: "default" });
            fetchSignals(user.id); // Re-fetch signals
        }
        setProcessingId(null);
    }, [user, toast, fetchSignals]);

    const handleDismiss = useCallback(async (signalId: string) => {
        if (!user) return;
        setProcessingId(signalId);
        const result = await dismissCustomSignalAction(signalId, user.id);
        
        if (result.success) {
            toast({ title: "Signal Dismissed", description: "The custom signal has been removed." });
            fetchSignals(user.id); // Re-fetch signals
        } else {
            toast({ title: "Dismissal Failed", description: result.error, variant: 'destructive' });
        }
        setProcessingId(null);
    }, [user, toast, fetchSignals]);

    const renderContent = () => {
        if (isLoading || isUserLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }
        
        if (!user) {
            // New state for non-logged-in users
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">Please Log In</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           You need to have a user session to view or generate signals.
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

        if (signals.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Generated Signals</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Generate a signal from the Core Console to see it here.
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
                {signals.map(signal => (
                    <GeneratedSignalCard
                        key={signal.id}
                        signal={signal}
                        onExecute={handleExecute}
                        onDismiss={handleDismiss}
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
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center text-lg text-primary">
                    <BrainCircuit className="mr-3 h-5 w-5"/>
                    Signal Log
                </CardTitle>
                <CardDescription>
                    A complete log of all signals generated by SHADOW. Custom signals can be executed from here.
                </CardDescription>
            </CardHeader>
        </Card>
        {renderContent()}
      </div>
    </>
  );
}
