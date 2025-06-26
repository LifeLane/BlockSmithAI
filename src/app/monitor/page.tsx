
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass, TrendingUp, TrendingDown, Clock, Bot, Info, LogIn, Target, ShieldX, Zap, ShieldQuestion } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { openSimulatedPositionAction } from '@/app/actions';
import { cn } from '@/lib/utils';

type SignalWithTimestamp = GenerateTradingStrategyOutput & { id: string; timestamp: string; status?: 'EXECUTED' };

const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

export default function MonitorPage() {
  const [signals, setSignals] = useState<SignalWithTimestamp[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithTimestamp | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    try {
        const storedSignals = localStorage.getItem('bsaiSignalHistory');
        if (storedSignals) {
            setSignals(JSON.parse(storedSignals));
        }
    } catch (error) {
        console.error("Failed to parse signal history from localStorage", error);
    }
  }, []);
  
  const handleSimulateClick = (signal: SignalWithTimestamp) => {
    if (signal.signal.toUpperCase() === 'HOLD') {
        toast({
            title: "Cannot Simulate 'HOLD'",
            description: "A 'HOLD' signal indicates no action should be taken. You cannot open a position based on it.",
            variant: "default",
        });
        return;
    }
    setSelectedSignal(signal);
    setShowConfirmDialog(true);
  };

  const confirmSimulatedTrade = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        toast({
            title: "User Not Found",
            description: "Cannot simulate trade without a user profile. Please sign up from the Profile page.",
            variant: "destructive",
        });
        setShowConfirmDialog(false);
        return;
    }
    if (!selectedSignal) {
        toast({ title: "Signal Not Found", description: "No signal was selected to simulate.", variant: "destructive" });
        setShowConfirmDialog(false);
        return;
    }

    const result = await openSimulatedPositionAction(userId, selectedSignal);

    if (result.error) {
        toast({
            title: <span className="text-destructive">Position Open Failed!</span>,
            description: <span className="text-foreground">{result.error}</span>,
            variant: "destructive",
        });
    } else {
        toast({
            title: <span className="text-tertiary">Position Opened!</span>,
            description: <span>Simulated {selectedSignal?.signal} for {selectedSignal?.symbol} opened. View in your Portfolio.</span>,
            variant: "default",
        });
         try {
            const history: SignalWithTimestamp[] = JSON.parse(localStorage.getItem('bsaiSignalHistory') || '[]');
            const updatedHistory = history.map(signal => {
                if (signal.id === selectedSignal.id) {
                    return { ...signal, status: 'EXECUTED' };
                }
                return signal;
            });
            localStorage.setItem('bsaiSignalHistory', JSON.stringify(updatedHistory));
            setSignals(updatedHistory); // Refresh the component state
        } catch (e) {
            console.error("Failed to update signal status in history:", e);
        }
    }
    setShowConfirmDialog(false);
    setSelectedSignal(null);
  };


  if (!mounted) {
    return (
        <>
            <AppHeader />
             <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[calc(100vh-200px)]">
                <Hourglass className="h-8 w-8 text-primary animate-spin"/>
             </div>
        </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Signal Archive</h1>
          <p className="text-muted-foreground">Review historical analyses from SHADOW.</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4">
            {signals.length > 0 ? signals.map((signal, index) => {
                const isExecuted = signal.status === 'EXECUTED';
                return (
              <Card key={signal.id || `${signal.symbol}-${index}`} className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-background rounded-md">
                        {signal.signal === 'BUY' ? <TrendingUp className="h-6 w-6 text-green-400"/> : signal.signal === 'SELL' ? <TrendingDown className="h-6 w-6 text-red-400"/> : <Bot className="h-6 w-6 text-primary"/>}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        <span className={`mr-2 font-bold ${signal.signal === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{signal.signal}</span>
                        <span className="text-foreground">{signal.symbol}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1.5"/>{formatDistanceToNow(new Date(signal.timestamp))} ago
                      </CardDescription>
                    </div>
                  </div>
                   <Badge variant={isExecuted ? "default" : "secondary"} className={cn(
                        "transition-colors",
                        isExecuted ? "bg-green-900/60 text-green-300 border-green-500/50" : "bg-background"
                    )}>
                        {isExecuted ? <CheckCircle2 className="h-3 w-3 mr-1.5"/> : <Hourglass className="h-3 w-3 mr-1.5"/>}
                        {isExecuted ? 'Executed' : 'Pending'} | {signal.risk_rating} Risk
                    </Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 text-sm pt-4">
                   <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><LogIn size={12}/>Entry</span>
                    <span className="font-mono font-semibold text-primary">{signal.entry_zone}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">{signal.stop_loss}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">{signal.take_profit}</span>
                  </div>
                </CardContent>
                <CardContent className="pt-2">
                    <div className="flex items-center justify-center p-2 bg-background/50 rounded-md text-xs text-muted-foreground italic">
                        <Info size={14} className="mr-2 shrink-0"/>
                        <p>"{signal.currentThought}"</p>
                    </div>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                    <Button 
                        className={cn(
                            "w-full",
                            isExecuted ? "bg-secondary hover:bg-secondary/80 cursor-not-allowed" : "bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
                        )}
                        onClick={() => handleSimulateClick(signal)}
                        disabled={isExecuted || signal.signal.toUpperCase() === 'HOLD'}
                    >
                        {isExecuted ? <CheckCircle2 className="h-4 w-4 mr-2"/> : <Zap className="h-4 w-4 mr-2"/>}
                        {isExecuted ? 'Trade Executed' : 'Simulate This Trade'}
                    </Button>
                </CardFooter>
              </Card>
            );
            }) : (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">Signal History is Empty</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            Generate an analysis on the Core Console to populate your history.
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
            )}
          </div>
        </ScrollArea>
      </div>
       {selectedSignal && (
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <ShieldQuestion className="mr-2 h-6 w-6 text-tertiary"/>
                Confirm Simulated Trade
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to open a simulated <strong className={selectedSignal.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{selectedSignal.signal}</strong> position
                for <strong className="text-primary">{selectedSignal.symbol}</strong> based on this historical analysis.
                <br />
                <br />
                This position will be tracked in your Portfolio. This is <strong className="text-accent">NOT a real trade</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSignal(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSimulatedTrade}
                className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
              >
                Open Simulated Position
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
