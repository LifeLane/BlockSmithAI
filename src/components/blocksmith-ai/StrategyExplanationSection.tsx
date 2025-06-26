import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import type { LiveMarketData } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
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
  Target,
  ShieldCheck,
  Percent,
  MessageSquareHeart,
  Unlock,
  Loader2,
  Copy,
  Zap
} from 'lucide-react';

interface StrategyExplanationSectionProps {
  strategy: GenerateTradingStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
  onSimulate?: () => void;
  onChat?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  titleClassName?: string;
}

const StatCard: FunctionComponent<StatCardProps> = ({ title, value, icon, className = '', valueClassName = '', titleClassName = '' }) => (
  <div className={`p-4 bg-background/50 rounded-lg shadow border border-border/50 flex flex-col items-center text-center ${className}`}>
    <div className={`flex items-center text-sm text-muted-foreground mb-1 ${titleClassName}`}>
      {icon && <span className="mr-2 opacity-80">{icon}</span>}
      {title}
    </div>
    <div className={`text-xl font-bold text-foreground ${valueClassName}`}>
      {value}
    </div>
  </div>
);


const StrategyExplanationSection: FunctionComponent<StrategyExplanationSectionProps> = ({
  strategy,
  liveMarketData,
  isLoading,
  error,
  symbol,
  onSimulate,
  onChat,
}) => {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (!strategy) return;

    const currentDateTime = new Date().toLocaleString();
    const parameters = [
      { label: "Signal", value: strategy.signal || 'N/A' },
      { label: "Entry Zone", value: strategy.entry_zone || 'N/A' },
      { label: "Stop Loss", value: strategy.stop_loss || 'N/A' },
      { label: "Take Profit", value: strategy.take_profit || 'N/A' },
      { label: "Confidence", value: strategy.confidence || 'N/A' },
      { label: "Risk Rating", value: strategy.risk_rating || 'N/A' },
      { label: "SHADOW Score", value: strategy.gpt_confidence_score || 'N/A' },
      { label: "Sentiment", value: strategy.sentiment || 'N/A' },
    ];

    const maxLabelLength = Math.max(...parameters.map(p => p.label.length));

    const formattedParameters = parameters
      .map(p => `  ${p.label.padEnd(maxLabelLength + 2)}: ${p.value}`)
      .join('\n');

    const indentedDisclaimer = strategy.disclaimer
      ? strategy.disclaimer.split('\n').map(line => `  ${line.trim()}`).join('\n')
      : "No disclaimer provided.";

    const textToCopy = `
====== SHADOW'S INSIGHT: ${symbol.toUpperCase()} ======

Core Parameters:
------------------------------------
${formattedParameters}
------------------------------------

SHADOW's Edict (Disclaimer):
------------------------------------
${indentedDisclaimer}
------------------------------------
Analysis Timestamp: ${currentDateTime}
    `.trim();

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: <span className="text-accent">SHADOW's Parameters Copied!</span>,
          description: "The core strategy parameters and edict have been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error("Failed to copy SHADOW's parameters: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy SHADOW's parameters. Please try again or copy manually.",
          variant: "destructive",
        });
      });
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg w-full bg-card border-border transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
           <Skeleton className="h-8 w-3/4 mb-2 bg-muted" />
           <Skeleton className="h-5 w-1/2 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <Skeleton className="h-6 w-full mt-4 bg-muted" />
          <Skeleton className="h-10 w-full mt-2 bg-muted" />
          <Skeleton className="h-20 w-full mt-2 bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive w-full bg-card transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center text-destructive text-xl font-headline">
            <AlertTriangle className="mr-2 h-6 w-6" />
            SHADOW's Analysis <span className="text-red-400 ml-1">Disrupted!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="text-destructive-foreground text-base">{error}</p>
          <p className="text-sm text-muted-foreground mt-3">
            My <strong className="text-accent">quantum awareness</strong> encounters <strong className="text-orange-500">interference</strong>. The signal is unclear. Retry, or perhaps the market itself is too <strong className="text-purple-400">volatile</strong> for current parameters.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return null;
  }

  const currentPrice = liveMarketData?.lastPrice ? parseFloat(liveMarketData.lastPrice).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, (liveMarketData.lastPrice.split('.')[1]?.length || 0)) }) : 'N/A';

  let sentimentIcon, sentimentColor = 'text-foreground';
  const lowerSentiment = strategy.sentiment?.toLowerCase();
  if (lowerSentiment?.includes('bullish')) {
    sentimentIcon = <TrendingUp className="h-5 w-5 text-green-400" />;
    sentimentColor = 'text-green-400 font-bold';
  } else if (lowerSentiment?.includes('bearish')) {
    sentimentIcon = <TrendingDown className="h-5 w-5 text-red-400" />;
    sentimentColor = 'text-red-400 font-bold';
  } else if (lowerSentiment?.includes('volatile')) {
    sentimentIcon = <Brain className="h-5 w-5 text-orange-400" />;
    sentimentColor = 'text-orange-400 font-semibold';
  }
  else {
    sentimentIcon = <Brain className="h-5 w-5 text-purple-400" />;
    sentimentColor = 'text-purple-400 font-semibold';
  }

  let signalIcon, signalColorCls, signalTextFormatted = strategy.signal?.toUpperCase() || 'N/A';
  switch (signalTextFormatted) {
    case 'BUY':
    case 'LONG':
      signalIcon = <ArrowUpCircle className="h-6 w-6 text-green-400" />;
      signalColorCls = "text-green-400 font-bold";
      signalTextFormatted = "BUY / LONG"
      break;
    case 'SELL':
    case 'SHORT':
      signalIcon = <ArrowDownCircle className="h-6 w-6 text-red-400" />;
      signalColorCls = "text-red-400 font-bold";
      signalTextFormatted = "SELL / SHORT"
      break;
    case 'HOLD':
    default:
      signalIcon = <PauseCircle className="h-6 w-6 text-orange-400" />;
      signalColorCls = "text-orange-400 font-bold";
      break;
  }

  return (
    <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out">
      <CardHeader className="text-center pb-4 pt-5">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground flex items-center justify-center flex-wrap font-headline break-words">
           <Unlock className="mr-1.5 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary shrink-0" />
          SHADOW's <span className="text-primary mx-1 sm:mx-1.5">Insight</span> Unveiled: <span className="text-accent ml-1 sm:ml-1.5 font-extrabold">{symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-2 sm:px-4 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            title="SHADOW Signal"
            value={signalTextFormatted}
            icon={signalIcon}
            valueClassName={signalColorCls}
            className="sm:col-span-1 lg:col-span-1 border-primary/50"
          />
          <StatCard
            title="Current Price"
            value={<span className="text-primary">{currentPrice}</span>}
            icon={<DollarSign size={20} className="text-primary"/>}
          />
          <StatCard
            title="Sentiment Scan"
            value={strategy.sentiment || 'N/A'}
            icon={sentimentIcon}
            valueClassName={`${sentimentColor}`}
          />
          <StatCard
            title="Entry Zone"
            value={<span className="text-primary">{strategy.entry_zone || 'N/A'}</span>}
            icon={<LogIn size={20} className="text-primary"/>}
          />
          <StatCard
            title="Stop Loss"
            value={<span className="text-red-400">{strategy.stop_loss || 'N/A'}</span>}
            icon={<ShieldX size={20} className="text-red-400"/>}
          />
          <StatCard
            title="Take Profit"
            value={<span className="text-green-400">{strategy.take_profit || 'N/A'}</span>}
            icon={<Target size={20} className="text-green-400"/>}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
            <StatCard
                title="Confidence Level"
                value={<span className="text-tertiary">{strategy.confidence || 'N/A'}</span>}
                icon={<ShieldCheck size={20} className="text-tertiary"/>}
            />
            <StatCard
                title="SHADOW Score"
                value={<span className="text-accent">{strategy.gpt_confidence_score || 'N/A'}</span>}
                icon={<Percent size={20} className="text-accent"/>}
            />
            <StatCard
                title="Risk Rating"
                value={<span className="text-orange-500">{strategy.risk_rating || 'N/A'}</span>}
                icon={<AlertTriangle size={20} className="text-orange-500"/>}
            />
        </div>
         <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 hover:text-accent font-semibold"
            >
                <Copy className="mr-2 h-4 w-4" /> Copy Parameters
            </Button>
            {onChat && (
                <Button
                    onClick={onChat}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground font-semibold"
                >
                    <MessageSquareHeart className="mr-2 h-4 w-4" /> Chat with SHADOW
                </Button>
            )}
        </div>

        {strategy.disclaimer && (
          <div className="mt-6 p-4 border-t border-primary/30 bg-background/50 rounded-lg shadow">
            <p className="text-xs text-yellow-400 italic font-code text-center flex items-center justify-center">
              <MessageSquareHeart className="mr-2 h-4 w-4 text-yellow-400 flex-shrink-0" />
              "SHADOW's Edict: {strategy.disclaimer}"
            </p>
          </div>
        )}
      </CardContent>
       <CardFooter className="flex-col gap-4 pt-2">
            {onSimulate && (
                <Button
                    onClick={onSimulate}
                    className="w-full max-w-sm bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-semibold py-3 text-base shadow-lg"
                    disabled={strategy.signal?.toUpperCase() === 'HOLD'}
                >
                    <Zap className="mr-2 h-5 w-5"/>
                    Simulate This Insight
                </Button>
            )}
             {strategy.signal?.toUpperCase() === 'HOLD' && (
                <p className="text-xs text-center text-muted-foreground">A 'HOLD' signal indicates no action. Simulation is disabled.</p>
            )}
       </CardFooter>
    </Card>
  );
};

export default StrategyExplanationSection;
