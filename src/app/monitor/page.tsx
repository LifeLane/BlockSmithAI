
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass, TrendingUp, TrendingDown, Clock, Bot, Info, LogIn, Target, ShieldX, Zap, ShieldQuestion, PauseCircle, BrainCircuit, Percent, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput } from '@/app/actions';
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
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

type SignalWithTimestamp = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id: string; 
  timestamp: string; 
  status?: 'EXECUTED' | 'SIMULATED' | 'PENDING' 
};


const SignalIcon = ({ signal }: { signal: string }) => {
    switch(signal.toUpperCase()) {
        case 'BUY':
            return <TrendingUp className="h-6 w-6 text-green-400"/>;
        case 'SELL':
            return <TrendingDown className="h-6 w-6 text-red-400"/>;
        case 'HOLD':
            return <PauseCircle className="h-6 w-6 text-primary"/>;
        default:
            return <Bot className="h-6 w-6 text-primary"/>;
    }
}

const formatPrice = (priceStr?: string) => {
    if (!priceStr) return 'N/A';
    const price = parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
    if (isNaN(price)) return priceStr;
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


export default function MonitorPage() {
  const [signals, setSignals] = useState<SignalWithTimestamp[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalWithTimestamp | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useCurrentUser();

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
    setSelectedSignal(signal);
    setShowConfirmDialog(true);
  };

  const confirmSimulatedTrade = async () => {
    if (!currentUser) {
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

    const result = await openSimulatedPositionAction(currentUser.id, selectedSignal);

    if (result.error) {
        toast({
            title: <span className="text-destructive">Action Failed!</span>,
            description: <span className="text-foreground">{result.error}</span>,
            variant: "destructive",
        });
    } else {
        const isHoldSignal = selectedSignal.signal.toUpperCase() === 'HOLD';
        const toastTitle = isHoldSignal
            ? <span className="text-primary">HOLD Signal Acknowledged</span>
            : <span className="text-tertiary">Position Opened!</span>;
        
        const toastDescription = isHoldSignal
            ? <span>The HOLD signal for {selectedSignal?.symbol} has been acknowledged. No position was opened.</span>
            : <span>Simulated {selectedSignal?.signal} for {selectedSignal?.symbol} opened. View in your Portfolio.</span>;
        
        toast({
            title: toastTitle,
            description: toastDescription,
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
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4">
            {signals.length > 0 ? signals.map((signal) => {
                const isActionTaken = signal.status === 'EXECUTED' || signal.status === 'SIMULATED';
                const signalType = signal.signal.toUpperCase();
                let signalColor = 'text-foreground';
                if (signalType === 'BUY') signalColor = 'text-green-400';
                if (signalType === 'SELL') signalColor = 'text-red-400';
                if (signalType === 'HOLD') signalColor = 'text-primary';

                const tradingMode = 'tradingMode' in signal ? signal.tradingMode : ('chosenTradingMode' in signal ? signal.chosenTradingMode : 'N/A');
                
                return (
              <Card key={signal.id} className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-3 gap-2">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-background rounded-md shrink-0">
                        <SignalIcon signal={signal.signal} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        <span className={`mr-2 font-bold ${signalColor}`}>{signal.signal}</span>
                        <span className="text-foreground">{signal.symbol}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1.5"/>{formatDistanceToNow(new Date(signal.timestamp))} ago
                      </CardDescription>
                    </div>
                  </div>
                   <div className="flex flex-col items-end gap-1.5 self-start sm:self-center">
                    <Badge variant={isActionTaken ? "default" : "secondary"} className={cn(
                        "transition-colors",
                        isActionTaken ? "bg-green-900/60 text-green-300 border-green-500/50" : "bg-background"
                    )}>
                        {isActionTaken ? <CheckCircle2 className="h-3 w-3 mr-1.5"/> : <Hourglass className="h-3 w-3 mr-1.5"/>}
                        {isActionTaken ? 'Executed' : 'Pending'}
                    </Badge>
                     <Badge variant="outline" className="border-tertiary text-tertiary">
                       {tradingMode}
                    </Badge>
                   </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                   <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><LogIn size={12}/>Entry</span>
                    <span className="font-mono font-semibold text-primary">{formatPrice(signal.entry_zone)}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><ShieldX size={12}/>Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">{formatPrice(signal.stop_loss)}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><Target size={12}/>Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">{formatPrice(signal.take_profit)}</span>
                  </div>
                   <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><ShieldCheck size={12}/>Confidence</span>
                    <span className="font-mono font-semibold text-tertiary">{signal.confidence}</span>
                  </div>
                   <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><BrainCircuit size={12}/>Sentiment</span>
                    <span className="font-mono font-semibold text-purple-400">{signal.sentiment}</span>
                  </div>
                   <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                    <span className="text-muted-foreground text-xs flex items-center gap-1"><Percent size={12}/>SHADOW Score</span>
                    <span className="font-mono font-semibold text-accent">{signal.gpt_confidence_score}%</span>
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
                            isActionTaken ? "bg-secondary hover:bg-secondary/80 cursor-not-allowed" : "bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
                        )}
                        onClick={() => handleSimulateClick(signal)}
                        disabled={isActionTaken}
                    >
                        {isActionTaken ? <CheckCircle2 className="h-4 w-4 mr-2"/> : <Zap className="h-4 w-4 mr-2"/>}
                        {isActionTaken ? 'Action Executed' : `Acknowledge & Log ${signal.signal}`}
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
                Confirm Action
              </AlertDialogTitle>
               <AlertDialogDescription>
                {selectedSignal.signal.toUpperCase() === 'HOLD'
                  ? <>You are about to acknowledge a <strong className="text-primary">HOLD</strong> signal for <strong className="text-primary">{selectedSignal.symbol}</strong>. This will be logged in your signal history but will not open a trade.</>
                  : <>You are about to open a simulated <strong className={selectedSignal.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{selectedSignal.signal}</strong> position
                    for <strong className="text-primary">{selectedSignal.symbol}</strong> based on this historical analysis.</>
                }
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
                {selectedSignal.signal.toUpperCase() === 'HOLD' ? 'Acknowledge & Log' : 'Open Simulated Position'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
