
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass, TrendingUp, TrendingDown, Clock, Bot, Info, LogIn, Target, ShieldX } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { formatDistanceToNow } from 'date-fns';


type SignalWithTimestamp = GenerateTradingStrategyOutput & { timestamp: string };

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Target Hit': return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case 'Stopped Out': return <XCircle className="h-5 w-5 text-red-400" />;
    case 'Monitoring':
    default: return <Hourglass className="h-5 w-5 text-purple-400 animate-pulse" />;
  }
};


export default function MonitorPage() {
  const [signals, setSignals] = useState<SignalWithTimestamp[]>([]);
  const [mounted, setMounted] = useState(false);

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
          <h1 className="text-4xl font-bold text-primary mb-2">Signal Monitor</h1>
          <p className="text-muted-foreground">Review your historical SHADOW analyses.</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4">
            {signals.length > 0 ? signals.map((signal, index) => (
              <Card key={`${signal.symbol}-${index}`} className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
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
                   <Badge variant="secondary">{signal.risk_rating} Risk</Badge>
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
              </Card>
            )) : (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <Bot className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="mt-4">No Signals Generated</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            Your signal history is empty. Go to the <strong className="text-accent">Core Console</strong> to generate your first analysis from SHADOW.
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
    </>
  );
}
