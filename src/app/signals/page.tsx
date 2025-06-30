
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Bot, BrainCircuit, Play, Trash2, LogIn, ShieldX, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  logSimulatedPositionAction,
  type GenerateShadowChoiceStrategyOutput,
} from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type CustomSignal = GenerateShadowChoiceStrategyOutput & { id: string };

const STORAGE_KEY = 'customSignals';

const CustomSignalCard = ({ signal, onExecute, onDismiss, isProcessing }: { signal: CustomSignal, onExecute: (s: CustomSignal) => void, onDismiss: (id: string) => void, isProcessing: boolean }) => {
    
    const formatPrice = (priceString?: string): string => {
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
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 flex flex-col interactive-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                    <div className="text-xs p-1.5 px-2.5 bg-background rounded-md font-semibold border border-border">
                        {signal.chosenTradingMode} / {signal.chosenRiskProfile} Risk
                    </div>
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
                <Button variant="outline" size="sm" className="w-full" onClick={() => onDismiss(signal.id)} disabled={isProcessing}>
                    <Trash2 className="h-4 w-4 mr-2"/> Dismiss
                </Button>
                <Button className="w-full glow-button" size="sm" onClick={() => onExecute(signal)} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>} Execute Manually
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function SignalsPage() {
    const [signals, setSignals] = useState<CustomSignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user, isLoading: isUserLoading } = useCurrentUser();
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedSignalsJSON = localStorage.getItem(STORAGE_KEY);
            if (savedSignalsJSON) {
                setSignals(JSON.parse(savedSignalsJSON));
            }
        } catch (error) {
            console.error("Failed to parse custom signals from localStorage", error);
        }
        setIsLoading(false);
    }, []);

    const updateSignals = (newSignals: CustomSignal[]) => {
        setSignals(newSignals);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSignals));
    };

    const handleExecute = useCallback(async (signalToExecute: CustomSignal) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to execute a signal.", variant: "destructive" });
            return;
        }
        setProcessingId(signalToExecute.id);
        const result = await logSimulatedPositionAction(user.id, signalToExecute);

        if (result.error) {
            toast({ title: "Execution Failed", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Signal Executed!", description: `${signalToExecute.symbol} position has been logged to your portfolio.`, variant: "default" });
            const newSignals = signals.filter(s => s.id !== signalToExecute.id);
            updateSignals(newSignals);
        }
        setProcessingId(null);
    }, [user, signals, toast]);

    const handleDismiss = useCallback((signalId: string) => {
        const newSignals = signals.filter(s => s.id !== signalId);
        updateSignals(newSignals);
        toast({ title: "Signal Dismissed", description: "The custom signal has been removed." });
    }, [signals, toast]);

    const renderContent = () => {
        if (isLoading || isUserLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (signals.length === 0) {
             return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm mt-4 interactive-card">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Custom Signals</CardTitle>
                        <CardDescription className="mt-2 text-base">
                           Generate a "Custom Signal" from the Core Console to see it here.
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
                    <CustomSignalCard
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
                    Custom Signal Bay
                </CardTitle>
                <CardDescription>
                    Review SHADOW's generated strategies here. Execute them manually to log them to your portfolio.
                </CardDescription>
            </CardHeader>
        </Card>
        {renderContent()}
      </div>
    </>
  );
}
