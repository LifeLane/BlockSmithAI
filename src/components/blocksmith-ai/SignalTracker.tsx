
'use client';

import type { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Target,
  ShieldX,
  LogIn,
  TrendingUp,
  TrendingDown,
  Hourglass,
  CheckCircle2,
  XCircle,
  CircleDotDashed,
  Info,
  Loader2,
} from 'lucide-react';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput } from '@/app/actions';
import type { LiveMarketData } from '@/app/actions';

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
};

interface SignalTrackerProps {
  aiStrategy: AIStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
}

const SignalTracker: FunctionComponent<SignalTrackerProps> = ({ aiStrategy, liveMarketData }) => {
  if (!aiStrategy) {
    return null;
  }
  
  if (!liveMarketData) {
     return (
        <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-tertiary">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                    <AreaChart className="mr-2 h-5 w-5 text-tertiary" />
                    Signal Tracker: <span className="text-tertiary ml-1">{aiStrategy.symbol || 'N/A'}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-24 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Awaiting live market data...
            </CardContent>
        </Card>
     )
  }

  // Data for Outcome and Parameters tabs
  const { signal, entry_zone, stop_loss, take_profit } = aiStrategy;
  const currentPrice = parseFloat(liveMarketData.lastPrice);
  const entryPrice = parseFloat(entry_zone?.replace(/[^0-9.-]/g, '') || '0');
  const slPrice = parseFloat(stop_loss || '0');
  const tpPrice = parseFloat(take_profit || '0');

  let status = 'Monitoring';
  let statusIcon = <Hourglass className="h-5 w-5 text-purple-400" />;
  let statusColor = 'text-purple-400';
  let pnl = 0;
  let pnlPercent = 0;
  let outcomeDescription = "Awaiting price movement relative to signal parameters.";
  
  if (!isNaN(currentPrice) && !isNaN(entryPrice)) {
    if (signal?.toLowerCase().includes('buy')) {
        if (!isNaN(tpPrice) && tpPrice > 0 && currentPrice >= tpPrice) {
            status = 'Target Hit'; statusIcon = <CheckCircle2 className="h-5 w-5 text-green-400" />; statusColor = 'text-green-400'; pnl = tpPrice - entryPrice; outcomeDescription = "Price reached the Take Profit target."
        } else if (!isNaN(slPrice) && slPrice > 0 && currentPrice <= slPrice) {
            status = 'Stopped Out'; statusIcon = <XCircle className="h-5 w-5 text-red-400" />; statusColor = 'text-red-400'; pnl = slPrice - entryPrice; outcomeDescription = "Price hit the Stop Loss level."
        } else {
            pnl = currentPrice - entryPrice; outcomeDescription = `Currently in trade. Price is ${currentPrice > entryPrice ? 'above' : 'below'} entry.`
        }
    } else if (signal?.toLowerCase().includes('sell')) {
        if (!isNaN(tpPrice) && tpPrice > 0 && currentPrice <= tpPrice) {
            status = 'Target Hit'; statusIcon = <CheckCircle2 className="h-5 w-5 text-green-400" />; statusColor = 'text-green-400'; pnl = entryPrice - tpPrice; outcomeDescription = "Price reached the Take Profit target."
        } else if (!isNaN(slPrice) && slPrice > 0 && currentPrice >= slPrice) {
            status = 'Stopped Out'; statusIcon = <XCircle className="h-5 w-5 text-red-400" />; statusColor = 'text-red-400'; pnl = entryPrice - slPrice; outcomeDescription = "Price hit the Stop Loss level."
        } else {
            pnl = entryPrice - currentPrice; outcomeDescription = `Currently in trade. Price is ${currentPrice < entryPrice ? 'below' : 'above'} entry.`
        }
    } else { // HOLD signal
        status = 'On Hold'; statusIcon = <CircleDotDashed className="h-5 w-5 text-muted-foreground" />; statusColor = 'text-muted-foreground'; outcomeDescription = "The signal is 'HOLD'. No active trade to monitor."; pnl = 0;
    }
  }
  
  if (!isNaN(entryPrice) && entryPrice > 0) {
      pnlPercent = (pnl / entryPrice) * 100;
  } else {
      pnlPercent = 0;
  }

  const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';

  const ParameterRow = ({ label, value, icon, valueClassName }: { label: string, value: string, icon: React.ReactNode, valueClassName?: string }) => (
    <div className="flex items-center justify-between p-3 bg-background/30 rounded-md shadow-sm border border-border/50">
        <span className="text-sm font-medium text-muted-foreground flex items-center">{icon}{label}</span>
        <span className={`font-mono text-sm font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );

  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-tertiary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <AreaChart className="mr-2 h-5 w-5 text-tertiary" />
          Signal Tracker: <span className="text-tertiary ml-1">{aiStrategy.symbol || 'N/A'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="outcome" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outcome">Real-time Outcome</TabsTrigger>
            <TabsTrigger value="parameters">Signal Parameters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="outcome" className="mt-4 space-y-3">
             <div className="flex items-center justify-between p-3 bg-background/30 rounded-md shadow-sm border border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div className={`flex items-center text-sm font-bold ${statusColor}`}>
                {statusIcon}
                <span className="ml-2">{status}</span>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/30 rounded-md shadow-sm border border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Est. P/L</span>
                <div className={`flex items-center text-sm font-bold ${pnlColor}`}>
                {pnl >= 0 ? <TrendingUp className="h-5 w-5 mr-2" /> : <TrendingDown className="h-5 w-5 mr-2" />}
                <span>{isNaN(pnlPercent) ? 'N/A' : `${pnlPercent.toFixed(2)}%`}</span>
                </div>
            </div>
            <div className="flex items-start p-3 bg-background/30 rounded-md shadow-sm border border-border/50 text-xs text-muted-foreground">
                <Info className="h-4 w-4 mr-2 mt-px shrink-0"/>
                <p>{outcomeDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="mt-4 space-y-3">
            <ParameterRow 
                label="Entry Zone" 
                value={aiStrategy.entry_zone || 'N/A'}
                icon={<LogIn className="h-4 w-4 mr-2 text-primary"/>}
                valueClassName="text-primary"
            />
            <ParameterRow 
                label="Stop Loss" 
                value={aiStrategy.stop_loss || 'N/A'}
                icon={<ShieldX className="h-4 w-4 mr-2 text-red-400"/>}
                valueClassName="text-red-400"
            />
            <ParameterRow 
                label="Take Profit" 
                value={aiStrategy.take_profit || 'N/A'}
                icon={<Target className="h-4 w-4 mr-2 text-green-400"/>}
                valueClassName="text-green-400"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SignalTracker;
