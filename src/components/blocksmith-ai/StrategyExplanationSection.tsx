
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import type { LiveMarketData } from '@/app/actions';
import { Brain, AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

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
          <p className="text-sm text-muted-foreground mt-2">Please ensure your API key is correct and try again.</p>
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
