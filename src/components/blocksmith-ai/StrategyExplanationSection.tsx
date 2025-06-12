
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Target,
  Info,
  BarChart,
  ShieldCheck,
  Percent,
  MessageSquareHeart,
  Sparkles,
  Unlock
} from 'lucide-react';

interface StrategyExplanationSectionProps {
  strategy: GenerateTradingStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
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
  <div className={`p-4 bg-background/50 rounded-lg shadow border border-border/50 flex flex-col ${className}`}>
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
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg w-full bg-card border-border transition-all duration-300 ease-in-out">
        <CardHeader>
          <Skeleton className="h-7 w-1/3 mb-2" />
           <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
          <Skeleton className="h-12 w-full mt-4" /> {/* For accordion trigger */}
          <Skeleton className="h-10 w-full mt-4" /> {/* Disclaimer */}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive w-full bg-card transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive text-xl">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Strategy Generation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            There was an issue generating the strategy. Please check server logs or try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card className="shadow-lg w-full bg-card border-border transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_20px_5px_hsl(var(--primary)/0.4)]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold text-foreground">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            Your Next Market Edge is Waiting...
          </CardTitle>
           <CardDescription>Don't miss out! Get your AI-powered insights for {symbol} now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Hit 'Reveal My AI Edge!' and Discover What the AI Recommends!
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = liveMarketData?.lastPrice ? parseFloat(liveMarketData.lastPrice).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';
  
  let sentimentIcon, sentimentColor = 'text-foreground';
  const lowerSentiment = strategy.sentiment?.toLowerCase();
  if (lowerSentiment === 'bullish') {
    sentimentIcon = <TrendingUp className="h-5 w-5" />;
    sentimentColor = 'text-green-400';
  } else if (lowerSentiment === 'bearish') {
    sentimentIcon = <TrendingDown className="h-5 w-5" />;
    sentimentColor = 'text-red-400';
  } else {
    sentimentIcon = <Brain className="h-5 w-5" />;
  }

  let signalIcon, signalColorCls;
  const signalText = strategy.signal?.toUpperCase() || 'N/A';
  switch (signalText) {
    case 'BUY':
    case 'LONG':
      signalIcon = <ArrowUpCircle className="h-6 w-6" />;
      signalColorCls = "text-green-400";
      break;
    case 'SELL':
    case 'SHORT':
      signalIcon = <ArrowDownCircle className="h-6 w-6" />;
      signalColorCls = "text-red-400";
      break;
    case 'HOLD':
    default:
      signalIcon = <PauseCircle className="h-6 w-6" />;
      signalColorCls = "text-primary";
      break;
  }

  return (
    <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_20px_5px_hsl(var(--primary)/0.5)]">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground flex items-center">
           <Unlock className="mr-3 h-7 w-7 text-primary" />
          Your AI Edge Revealed: <span className="text-primary ml-2">{symbol}</span>
        </CardTitle>
         <CardDescription>Act on these AI-driven parameters before the market moves!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="AI Signal" 
            value={signalText} 
            icon={signalIcon} 
            valueClassName={signalColorCls} 
            className="sm:col-span-1 lg:col-span-1"
          />
          <StatCard 
            title="Current Price" 
            value={currentPrice} 
            icon={<DollarSign size={20}/>} 
            valueClassName="text-primary"
          />
           <StatCard 
            title="Sentiment" 
            value={strategy.sentiment || 'N/A'} 
            icon={sentimentIcon} 
            valueClassName={sentimentColor}
          />
          <StatCard 
            title="Entry Zone" 
            value={strategy.entry_zone || 'N/A'} 
            icon={<LogIn size={20}/>} 
          />
          <StatCard 
            title="Stop Loss" 
            value={strategy.stop_loss || 'N/A'} 
            icon={<ShieldX size={20}/>} 
          />
          <StatCard 
            title="Take Profit" 
            value={strategy.take_profit || 'N/A'} 
            icon={<Target size={20}/>} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title="Confidence" 
                value={strategy.confidence || 'N/A'} 
                icon={<ShieldCheck size={20}/>} 
            />
            <StatCard 
                title="GPT Score" 
                value={strategy.gpt_confidence_score || 'N/A'} 
                icon={<Percent size={20}/>} 
            />
            <StatCard 
                title="Risk Rating" 
                value={strategy.risk_rating || 'N/A'} 
                icon={<AlertTriangle size={20}/>} 
            />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-border/50 bg-background/30 rounded-lg shadow">
            <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">
              <div className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" />
                Dive Deeper: Unpack the Full AI Rationale
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <article className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed">
                {strategy.explanation || 'No detailed explanation provided.'}
              </article>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {strategy.disclaimer && (
          <div className="mt-6 p-4 border-t border-border/50 bg-background/30 rounded-lg shadow">
            <p className="text-xs text-muted-foreground italic text-center flex items-center justify-center">
              <MessageSquareHeart className="mr-2 h-4 w-4 text-pink-400 flex-shrink-0" />
              "{strategy.disclaimer}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyExplanationSection;
