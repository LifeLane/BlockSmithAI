
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Unlock,
  ListChecks,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Activity, // For Summary
  FileText, // For Key Findings
  Goal, // For Key Suggestions
  ClipboardList, // For Do's and Don'ts
  Glasses // For Indicator Deep Dive
} from 'lucide-react';

interface StrategyExplanationSectionProps {
  strategy: GenerateTradingStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
  selectedIndicators: string[]; // Pass selected indicators for context
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

const MarkdownContentDisplay: FunctionComponent<{ content: string | undefined; fallbackText: string }> = ({ content, fallbackText }) => (
  <article className="prose prose-sm sm:prose-base prose-invert max-w-none text-foreground/90 leading-relaxed 
                    prose-strong:text-primary prose-headings:text-accent prose-headings:font-headline
                    prose-ul:text-foreground/90 prose-ol:text-foreground/90 prose-ul:list-disc prose-ul:ml-5
                    prose-li:marker:text-primary prose-a:text-tertiary hover:prose-a:text-accent
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic">
    {content || fallbackText}
  </article>
);


const StrategyExplanationSection: FunctionComponent<StrategyExplanationSectionProps> = ({
  strategy,
  liveMarketData,
  isLoading,
  error,
  symbol,
  // selectedIndicators // available if needed for the banner
}) => {
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
            Strategy Generation <span className="text-red-400 ml-1">Misfire!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="text-destructive-foreground text-base">{error}</p>
          <p className="text-sm text-muted-foreground mt-3">
            Looks like my <strong className="text-accent">genius circuits</strong> are <strong className="text-orange-500">overloaded</strong>. Try again, or perhaps the market itself is too <strong className="text-purple-400">chaotic</strong> even for me.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Initial Banner State
  if (!strategy) {
    return (
      <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_25px_7px_hsl(var(--tertiary)/0.5)]">
        <CardHeader className="items-center text-center pt-6 pb-4">
          <CardTitle className="flex items-center text-2xl md:text-3xl font-bold font-headline text-foreground">
            <Sparkles className="mr-3 h-8 w-8 text-primary animate-pulse" />
            My <span className="text-primary mx-1">AI Brain</span> is <span className="text-accent">Buzzing</span> with <span className="text-orange-400">Potential Alpha</span>...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center px-6 pb-6 space-y-3">
           <p className="text-base text-muted-foreground">
             ...but it's not going to analyze <strong className="text-accent font-semibold">{symbol}</strong> for free, you know. Or <strong className="text-purple-400">maybe</strong> it will. <strong className="text-primary">There's only one way to find out.</strong>
           </p>
           <p className="text-sm text-muted-foreground/80">
            Go on, press that <strong className="text-accent">ridiculously bright yellow button</strong>. What's the worst that could happen? You
            might actually get a (hypothetically) <strong className="text-primary">brilliant trading idea</strong>. Or, you know, just amuse the <strong className="text-tertiary">AI overlord</strong>.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Strategy Loaded State - Multi-Tab Interface
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
    <Card className="shadow-xl w-full bg-card border-border transition-all duration-300 ease-in-out">
      <CardHeader className="text-center pb-4 pt-5">
        <CardTitle className="text-2xl font-semibold text-foreground flex items-center justify-center font-headline">
           <Unlock className="mr-3 h-7 w-7 text-accent" />
          Your <span className="text-primary mx-1">AI Edge</span> Revealed: <span className="text-accent ml-2 font-bold">{symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-2 sm:px-4 pb-5">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 bg-card/60 border border-border/70 mb-4 p-1 h-auto">
            <TabsTrigger value="summary" className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-primary/5 py-1.5 sm:py-2 px-1"><Activity className="mr-1.5 h-4 w-4" />Summary</TabsTrigger>
            <TabsTrigger value="findings" className="text-xs sm:text-sm data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-md hover:bg-accent/5 py-1.5 sm:py-2 px-1"><FileText className="mr-1.5 h-4 w-4" />Findings</TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs sm:text-sm data-[state=active]:bg-tertiary/10 data-[state=active]:text-tertiary data-[state=active]:shadow-md hover:bg-tertiary/5 py-1.5 sm:py-2 px-1"><Goal className="mr-1.5 h-4 w-4" />Suggestions</TabsTrigger>
            <TabsTrigger value="dos-donts" className="text-xs sm:text-sm data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500 data-[state=active]:shadow-md hover:bg-orange-500/5 py-1.5 sm:py-2 px-1"><ClipboardList className="mr-1.5 h-4 w-4" />Do's/Don'ts</TabsTrigger>
            <TabsTrigger value="deep-dive" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500 data-[state=active]:shadow-md hover:bg-purple-500/5 py-1.5 sm:py-2 px-1"><Glasses className="mr-1.5 h-4 w-4" />Deep Dive</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
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
          </TabsContent>

          <TabsContent value="findings" className="p-2 sm:p-4 bg-background/30 rounded-md border border-border/50">
             <MarkdownContentDisplay content={strategy.keyFindings} fallbackText="No specific key findings provided by AI." />
          </TabsContent>

          <TabsContent value="suggestions" className="p-2 sm:p-4 bg-background/30 rounded-md border border-border/50">
             <MarkdownContentDisplay content={strategy.keySuggestions} fallbackText="No specific suggestions provided by AI." />
          </TabsContent>
          
          <TabsContent value="dos-donts" className="p-2 sm:p-4 bg-background/30 rounded-md border border-border/50">
             <MarkdownContentDisplay content={strategy.dosAndDonts} fallbackText="No specific Do's and Don'ts provided by AI." />
          </TabsContent>

          <TabsContent value="deep-dive" className="p-2 sm:p-4 bg-background/30 rounded-md border border-border/50">
            <MarkdownContentDisplay content={strategy.explanation} fallbackText="No detailed explanation provided by AI." />
          </TabsContent>
        </Tabs>
        
        {strategy.disclaimer && (
          <div className="mt-6 p-4 border-t border-primary/30 bg-background/50 rounded-lg shadow">
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
