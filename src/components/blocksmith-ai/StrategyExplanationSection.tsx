
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
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg w-full bg-card border-border transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <Skeleton className="h-7 w-2/3 mb-2 bg-muted" />
           <Skeleton className="h-4 w-1/3 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full bg-muted" />)}
          </div>
          <Skeleton className="h-12 w-full mt-4 bg-muted" /> 
          <Skeleton className="h-10 w-full mt-4 bg-muted" /> 
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive w-full bg-card transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center text-destructive text-xl">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Strategy Generation <span className="text-red-400 ml-1">Misfire</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-destructive-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Looks like my <strong className="text-accent">genius circuits</strong> are <strong className="text-orange-500">misfiring</strong>. Try again, or perhaps the market itself is too <strong className="text-purple-400">chaotic</strong> even for me.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card className="shadow-lg w-full bg-card border-border transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_20px_5px_hsl(var(--tertiary)/0.6)]">
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center text-xl font-semibold text-foreground">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            My <span className="text-primary mx-1">AI Brain</span> is <span className="text-accent">Buzzing</span> with Potential <span className="text-orange-400">Alpha</span>...
          </CardTitle>
           <CardDescription className="text-center text-muted-foreground">
             ...but it's not going to analyze <strong className="text-accent">{symbol}</strong> for free, you know. Or maybe it will. <strong className="text-primary">There's only one way to find out.</strong>
           </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground py-8">
            Go on, press that <strong className="text-accent">ridiculously bright yellow button</strong>. What's the worst that could happen? 
            You might actually get a (hypothetically) <strong className="text-primary">brilliant trading idea</strong>. Or, you know, just amuse the <strong className="text-purple-400">AI overlord</strong>.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = liveMarketData?.lastPrice ? parseFloat(liveMarketData.lastPrice).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, (liveMarketData.lastPrice.split('.')[1]?.length || 0)) }) : 'N/A';
  
  let sentimentIcon, sentimentColor = 'text-foreground';
  const lowerSentiment = strategy.sentiment?.toLowerCase();
  if (lowerSentiment === 'bullish') {
    sentimentIcon = <TrendingUp className="h-5 w-5 text-green-400" />;
    sentimentColor = 'text-green-400 font-bold';
  } else if (lowerSentiment === 'bearish') {
    sentimentIcon = <TrendingDown className="h-5 w-5 text-red-400" />;
    sentimentColor = 'text-red-400 font-bold';
  } else {
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
    <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_20px_5px_hsl(var(--tertiary)/0.6)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-foreground flex items-center justify-center">
           <Unlock className="mr-3 h-7 w-7 text-accent" />
          Your <span className="text-primary mx-1">AI Edge</span> Revealed: <span className="text-accent ml-2 font-bold">{symbol}</span>
        </CardTitle>
         <CardDescription className="text-muted-foreground">These <strong className="text-primary">AI-driven parameters</strong> could be your next <strong className="text-orange-400">market move</strong>. <strong className="text-purple-400">No promises!</strong></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="AI Signal" 
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
            title="Sentiment" 
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title="Confidence" 
                value={<span className="text-tertiary">{strategy.confidence || 'N/A'}</span>}
                icon={<ShieldCheck size={20} className="text-tertiary"/>} 
            />
            <StatCard 
                title="GPT Score" 
                value={<span className="text-accent">{strategy.gpt_confidence_score || 'N/A'}</span>}
                icon={<Percent size={20} className="text-accent"/>} 
            />
            <StatCard 
                title="Risk Rating" 
                value={<span className="text-orange-500">{strategy.risk_rating || 'N/A'}</span>} 
                icon={<AlertTriangle size={20} className="text-orange-500"/>} 
            />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-accent/30 bg-background/30 rounded-lg shadow hover:border-tertiary transition-colors">
            <AccordionTrigger className="px-4 py-3 text-base hover:no-underline hover:text-primary transition-colors">
              <div className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" />
                <span className="font-semibold">Dive Deeper: Unpack the Full <span className="text-accent">AI Rationale</span></span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <article className="prose prose-base prose-invert max-w-none text-foreground/90 leading-relaxed 
                                prose-strong:text-primary prose-headings:text-accent 
                                prose-ul:text-foreground/90 prose-ol:text-foreground/90
                                prose-li:marker:text-primary">
                {strategy.explanation || 'No detailed explanation provided.'}
              </article>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {strategy.disclaimer && (
          <div className="mt-6 p-4 border-t border-primary/30 bg-background/30 rounded-lg shadow">
            <p className="text-xs text-yellow-400 italic font-code text-center flex items-center justify-center">
              <MessageSquareHeart className="mr-2 h-4 w-4 text-yellow-400 flex-shrink-0" />
              "{strategy.disclaimer}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyExplanationSection;
