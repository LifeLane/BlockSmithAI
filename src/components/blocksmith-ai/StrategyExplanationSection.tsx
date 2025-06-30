
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput } from '@/app/actions';
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
  Zap,
  BrainCircuit,
  Info,
  Newspaper,
} from 'lucide-react';

type CombinedStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
    id?: string;
    analysisSummary?: string; 
    newsAnalysis?: string;
};

interface StrategyExplanationSectionProps {
  strategy: CombinedStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
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

const sentimentConfig = {
  bullish: { icon: <TrendingUp className="h-5 w-5 text-green-400" />, color: 'text-green-400 font-bold' },
  bearish: { icon: <TrendingDown className="h-5 w-5 text-red-400" />, color: 'text-red-400 font-bold' },
  volatile: { icon: <Brain className="h-5 w-5 text-orange-400" />, color: 'text-orange-400 font-semibold' },
  default: { icon: <Brain className="h-5 w-5 text-purple-400" />, color: 'text-purple-400 font-semibold' },
};

const getSentimentStyle = (sentiment?: string) => {
  const lowerSentiment = sentiment?.toLowerCase() || '';
  if (lowerSentiment.includes('bullish')) return sentimentConfig.bullish;
  if (lowerSentiment.includes('bearish')) return sentimentConfig.bearish;
  if (lowerSentiment.includes('volatile')) return sentimentConfig.volatile;
  return sentimentConfig.default;
};


const StrategyExplanationSection: FunctionComponent<StrategyExplanationSectionProps> = ({
  strategy,
  liveMarketData,
  isLoading,
  error,
  symbol,
  onChat,
}) => {
  const { toast } = useToast();

  const formatPrice = (priceString?: string): string => {
    if (!priceString) return 'N/A';
    const price = parseFloat(priceString);
    if (isNaN(price)) {
      // Handle ranges like "123.45 - 123.55"
      const parts = priceString.split('-').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return `${parts[0].toFixed(2)} - ${parts[1].toFixed(2)}`;
      }
      return priceString; // Return original string if it's not a number or range
    }
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopyToClipboard = () => {
    if (!strategy) return;

    const currentDateTime = new Date().toLocaleString();
    let parameters = [
      { label: "Signal", value: strategy.signal || 'N/A' },
      { label: "Entry Zone", value: strategy.entry_zone || 'N/A' },
      { label: "Stop Loss", value: strategy.stop_loss || 'N/A' },
      { label: "Take Profit", value: strategy.take_profit || 'N/A' },
      { label: "Confidence", value: strategy.confidence || 'N/A' },
      { label: "Risk Rating", value: strategy.risk_rating || 'N/A' },
      { label: "SHADOW Score", value: strategy.gpt_confidence_score || 'N/A' },
      { label: "Sentiment", value: strategy.sentiment || 'N/A' },
    ];
    
    let reasoningSection = '';
    if ('strategyReasoning' in strategy && strategy.strategyReasoning) {
        reasoningSection = `
SHADOW's Autonomous Choice:
------------------------------------
  Chosen Mode       : ${strategy.chosenTradingMode}
  Chosen Risk       : ${strategy.chosenRiskProfile}
  Reasoning         : "${strategy.strategyReasoning}"
------------------------------------
`;
    }

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
${reasoningSection}
SHADOW's Technical Analysis:
------------------------------------
  ${strategy.analysisSummary || "Not provided."}
------------------------------------
SHADOW's Market Intelligence:
------------------------------------
  ${strategy.newsAnalysis || "Not provided."}
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

  const currentPrice = liveMarketData?.lastPrice ? parseFloat(liveMarketData.lastPrice).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';

  const { icon: sentimentIcon, color: sentimentColor } = getSentimentStyle(strategy.sentiment);

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

  const isHoldSignal = signalTextFormatted === 'HOLD';


  return (
    <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out animated-border-glow">
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
          {!isHoldSignal && (
            <>
              <StatCard
                title="Entry Zone"
                value={<span className="text-primary">{formatPrice(strategy.entry_zone)}</span>}
                icon={<LogIn size={20} className="text-primary"/>}
              />
              <StatCard
                title="Stop Loss"
                value={<span className="text-red-400">{formatPrice(strategy.stop_loss)}</span>}
                icon={<ShieldX size={20} className="text-red-400"/>}
              />
              <StatCard
                title="Take Profit"
                value={<span className="text-green-400">{formatPrice(strategy.take_profit)}</span>}
                icon={<Target size={20} className="text-green-400"/>}
              />
            </>
          )}
        </div>

        {isHoldSignal && (
             <div className="mt-4 p-4 bg-background/40 border-l-4 border-orange-400 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-foreground">
                            A <strong className="font-semibold text-orange-400">HOLD</strong> signal indicates that market conditions are neutral or uncertain. SHADOW recommends staying on the sidelines and not entering a new position at this time.
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
            <StatCard
                title="Confidence Level"
                value={<span className="text-tertiary">{strategy.confidence || 'N/A'}</span>}
                icon={<ShieldCheck size={20} className="text-tertiary"/>}
            />
            <StatCard
                title="SHADOW Score"
                value={<span className="text-accent">{strategy.gpt_confidence_score || 'N/A'}%</span>}
                icon={<Percent size={20} className="text-accent"/>}
            />
            <StatCard
                title="Risk Rating"
                value={<span className="text-orange-500">{strategy.risk_rating || 'N/A'}</span>}
                icon={<AlertTriangle size={20} className="text-orange-500"/>}
            />
        </div>
        
        {'strategyReasoning' in strategy && strategy.strategyReasoning && (
            <Card className="bg-background/40 border-tertiary/70 shadow-inner">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-tertiary">
                        <BrainCircuit className="mr-3 h-6 w-6"/>
                        SHADOW's Autonomous Rationale
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground italic border-l-2 border-tertiary pl-3">"{strategy.strategyReasoning}"</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-secondary/50 rounded-md">
                            <span className="font-semibold text-foreground">Chosen Mode: </span> 
                            <span className="text-tertiary font-bold">{('chosenTradingMode' in strategy && strategy.chosenTradingMode) || 'N/A'}</span>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-md">
                            <span className="font-semibold text-foreground">Chosen Risk: </span>
                            <span className="text-tertiary font-bold">{('chosenRiskProfile' in strategy && strategy.chosenRiskProfile) || 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {strategy.analysisSummary && (
            <Card className="bg-background/40 border-primary/70 shadow-inner">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-primary">
                        <Zap className="mr-3 h-6 w-6"/>
                        SHADOW's Technical Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">"{strategy.analysisSummary}"</p>
                </CardContent>
            </Card>
        )}

        {strategy.newsAnalysis && (
            <Card className="bg-background/40 border-purple-400/70 shadow-inner">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-purple-400">
                        <Newspaper className="mr-3 h-6 w-6"/>
                        Market Intelligence Briefing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground italic border-l-2 border-purple-400 pl-3">"{strategy.newsAnalysis}"</p>
                </CardContent>
            </Card>
        )}


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
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary font-semibold"
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
       <CardFooter className="flex-col gap-2 pt-4">
        <div className="text-center w-full">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-tertiary" />
                {isHoldSignal 
                  ? "HOLD signal acknowledged. No position logged." 
                  : "Signal automatically logged for simulation."
                }
            </p>
        </div>
       </CardFooter>
    </Card>
  );
};

export default StrategyExplanationSection;
