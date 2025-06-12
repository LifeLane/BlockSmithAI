
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import type { LiveMarketData } from '@/app/actions';
import { 
  Brain, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  PauseCircle,
  LogIn,
  ShieldX,
  Target
} from 'lucide-react';

interface StrategyExplanationSectionProps {
  strategy: GenerateTradingStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
}

const StrategyExplanationSection: FunctionComponent<StrategyExplanationSectionProps> = ({
  strategy,
  liveMarketData,
  isLoading,
  error,
  symbol,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg w-full">
        <CardHeader>
          <Skeleton className="h-7 w-1/3 mb-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" /> {/* For explanation */}
          <div className="grid md:grid-cols-3 gap-4 pt-4">
            <Skeleton className="h-16 w-full" /> {/* Price */}
            <Skeleton className="h-16 w-full" /> {/* Sentiment */}
            <Skeleton className="h-16 w-full" /> {/* Confidence */}
          </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <Skeleton className="h-16 w-full" /> {/* Signal */}
            <Skeleton className="h-16 w-full" /> {/* Entry */}
            <Skeleton className="h-16 w-full" /> {/* SL */}
            <Skeleton className="h-16 w-full" /> {/* TP */}
          </div>
          <Skeleton className="h-10 w-full mt-4" /> {/* Disclaimer */}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Strategy Generation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            There was an issue generating the strategy. Please check server logs or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            Strategy Explanation:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Generate an AI strategy to see the explanation and details here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = liveMarketData?.lastPrice ? parseFloat(liveMarketData.lastPrice).toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : 'N/A';
  const sentimentIcon = strategy.sentiment?.toLowerCase() === 'bullish' ? <TrendingUp className="mr-2 h-5 w-5 text-green-400" /> : strategy.sentiment?.toLowerCase() === 'bearish' ? <TrendingDown className="mr-2 h-5 w-5 text-red-400" /> : <Brain className="mr-2 h-5 w-5 text-primary" />;

  let signalIcon, signalColor;
  const signalText = strategy.signal?.toUpperCase() || 'N/A';
  switch (signalText) {
    case 'BUY':
    case 'LONG':
      signalIcon = <ArrowUpCircle className="mr-2 h-6 w-6" />;
      signalColor = "text-green-400";
      break;
    case 'SELL':
    case 'SHORT':
      signalIcon = <ArrowDownCircle className="mr-2 h-6 w-6" />;
      signalColor = "text-red-400";
      break;
    case 'HOLD':
    default:
      signalIcon = <PauseCircle className="mr-2 h-6 w-6" />;
      signalColor = "text-primary";
      break;
  }


  return (
    <Card className="shadow-lg w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Strategy Explanation: <span className="text-primary">{symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border border-border/50 rounded-md bg-background/30 shadow">
          <p className="text-foreground leading-relaxed">
            {strategy.explanation || 'No detailed explanation provided.'}
          </p>
        </div>

        {/* Row 1: Price, Sentiment, Confidence */}
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Fetched Current Price</p>
            <p className="text-2xl font-bold text-primary flex items-center">
              <DollarSign className="mr-2 h-6 w-6 opacity-70" />
              {currentPrice}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">QuantumGPT Sentiment</p>
            <p className="text-2xl font-bold text-foreground flex items-center">
              {sentimentIcon}
              {strategy.sentiment || 'N/A'}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">AI Confidence Level</p>
            <p className="text-2xl font-bold text-foreground">
              {strategy.confidence || 'N/A'}
            </p>
            {strategy.gpt_confidence_score && (
               <p className="text-xs text-muted-foreground">(GPT: {strategy.gpt_confidence_score})</p>
            )}
          </div>
        </div>

        {/* Row 2: Signal, Entry, SL, TP */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">AI Signal</p>
            <p className={`text-2xl font-bold flex items-center ${signalColor}`}>
              {signalIcon}
              {signalText}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Entry Zone</p>
            <p className="text-xl font-bold text-foreground flex items-center">
              <LogIn className="mr-2 h-5 w-5 opacity-70" />
              {strategy.entry_zone || 'N/A'}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Stop Loss</p>
            <p className="text-xl font-bold text-foreground flex items-center">
              <ShieldX className="mr-2 h-5 w-5 opacity-70" />
              {strategy.stop_loss || 'N/A'}
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background/30 rounded-lg shadow border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Take Profit</p>
            <p className="text-xl font-bold text-foreground flex items-center">
              <Target className="mr-2 h-5 w-5 opacity-70" />
              {strategy.take_profit || 'N/A'}
            </p>
          </div>
        </div>
        
        {strategy.disclaimer && (
          <div className="mt-6 p-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground italic text-center">
              "{strategy.disclaimer}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyExplanationSection;
