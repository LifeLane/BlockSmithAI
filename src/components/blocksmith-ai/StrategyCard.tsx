import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Brain, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface StrategyCardProps {
  strategy: GenerateTradingStrategyOutput | null;
  isLoading: boolean;
  error?: string | null;
}

const StrategyCard: FunctionComponent<StrategyCardProps> = ({ strategy, isLoading, error }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-1/3" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Generating Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            AI Trading Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure options and generate a strategy.</p>
        </CardContent>
      </Card>
    );
  }

  const signalColor = strategy.signal === 'BUY' ? 'text-green-400' : strategy.signal === 'SELL' ? 'text-red-400' : 'text-yellow-400';
  const SignalIcon = strategy.signal === 'BUY' ? ArrowUpCircle : strategy.signal === 'SELL' ? ArrowDownCircle : MinusCircle;

  return (
    <Card className="shadow-lg border-primary transform hover:scale-[1.01] transition-transform duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold font-headline">
          <Brain className="mr-3 h-7 w-7 text-primary" />
          AI Trading Strategy
        </CardTitle>
        <CardDescription className={`flex items-center text-lg font-semibold ${signalColor}`}>
          <SignalIcon className="mr-2 h-6 w-6" />
          Signal: {strategy.signal} ({strategy.confidence})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><strong className="text-muted-foreground">Entry Zone:</strong> ${strategy.entry_zone}</p>
        <p><strong className="text-muted-foreground">Stop Loss:</strong> ${strategy.stop_loss}</p>
        <p><strong className="text-muted-foreground">Take Profit:</strong> ${strategy.take_profit}</p>
        <p><strong className="text-muted-foreground">Market Sentiment:</strong> {strategy.sentiment}</p>
        <div className="flex items-center text-xs text-muted-foreground pt-2">
          <ShieldCheck className="mr-1 h-4 w-4 text-primary" />
          Risk: {strategy.risk_rating}
          <Zap className="ml-3 mr-1 h-4 w-4 text-primary" />
          GPT Confidence: {strategy.gpt_confidence_score}%
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground italic leading-tight">"{strategy.disclaimer}"</p>
        <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          Confirm Setup (Demo)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StrategyCard;
