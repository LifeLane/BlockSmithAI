
'use client';

import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LogIn,
  ShieldX,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ShieldCheck,
  Percent,
  Zap,
  PlayCircle,
  MessageSquareHeart,
  Briefcase,
} from 'lucide-react';
import type { LiveMarketData, Position, GeneratedSignal } from '@/app/actions';
import { useClientState } from '@/hooks/use-client-state';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import GlyphScramble from './GlyphScramble';
import { useRouter } from 'next/navigation';

type AIStrategyOutput = (Position | GeneratedSignal) & { 
  id?: string;
  type: 'INSTANT' | 'CUSTOM';
  disclaimer?: string;
  analysisSummary?: string | null;
  newsAnalysis?: string | null;
};

interface SignalTrackerProps {
  aiStrategy: AIStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  userId: string;
}

const ParameterCard = ({ label, value, icon, valueClassName, isLarge = false }: { label: string, value: string, icon: React.ReactNode, valueClassName?: string, isLarge?: boolean }) => (
    <div className={cn("flex flex-col p-3 bg-secondary rounded-lg shadow-inner", isLarge ? "col-span-1" : "")}>
        <span className="text-xs text-muted-foreground flex items-center">{icon}{label}</span>
        <span className={`font-mono font-semibold truncate ${isLarge ? 'text-2xl mt-1' : 'text-base'} ${valueClassName || ''}`}>{value}</span>
    </div>
);


const SignalTracker: FunctionComponent<SignalTrackerProps> = ({ aiStrategy, liveMarketData, userId }) => {
  const { executeSignal } = useClientState();
  const { toast } = useToast();
  const router = useRouter();

  const formatPrice = (priceString?: string | number | null): string => {
    if (priceString === null || priceString === undefined) return 'N/A';

    if (typeof priceString === 'number') {
        return priceString.toFixed(2);
    }
    
    if (priceString.includes('-')) {
        const parts = priceString.split('-').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return `${parts[0].toFixed(2)} - ${parts[1].toFixed(2)}`;
        }
    }
    const price = parseFloat(priceString);
    if (isNaN(price)) {
        return priceString;
    }
    return price.toFixed(2);
  };
  
  if (!aiStrategy) {
    return null;
  }
  
  const { signal, type, entry_zone, stop_loss, take_profit, confidence, gpt_confidence_score, risk_rating, sentiment, analysisSummary, disclaimer } = aiStrategy as any;

  const isBuy = signal === 'BUY';

  const signalText = isBuy ? 'BUY / LONG' : 'SELL / SHORT';
  const signalIcon = isBuy ? <TrendingUp className="mr-2 h-4 w-4" /> : <TrendingDown className="mr-2 h-4 w-4" />;
  
  const currentPriceFormatted = liveMarketData?.lastPrice ? `$${formatPrice(liveMarketData.lastPrice)}` : 'N/A';
  
  const titleText = type === 'INSTANT' 
    ? `Instant Signal Executed: ${aiStrategy.symbol}` 
    : `SHADOW's Insight Unveiled: ${aiStrategy.symbol}`;

  const handleExecute = () => {
    if (type !== 'CUSTOM' || !aiStrategy.id) return;
    executeSignal(aiStrategy.id);
    toast({
        title: <span className="text-accent">Custom Signal Simulated!</span>,
        description: <span className="text-foreground">Your pending order for <strong className="text-primary">{aiStrategy.symbol}</strong> is now active.</span>,
    });
    router.push('/pulse');
  };

  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-card/80 backdrop-blur-sm space-y-4 shadow-lg interactive-card">
        <h2 className="text-lg sm:text-xl font-headline text-center">
            <GlyphScramble text={titleText} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <ParameterCard 
                isLarge
                label="Signal"
                value={signalText}
                icon={signalIcon}
                valueClassName={isBuy ? 'text-green-400' : 'text-red-400'}
            />
             <ParameterCard 
                isLarge
                label="Current Price"
                value={currentPriceFormatted}
                icon={<DollarSign className="mr-2 h-4 w-4" />}
                valueClassName="text-primary"
            />
             <ParameterCard 
                isLarge
                label="Sentiment Scan"
                value={sentiment || 'N/A'}
                icon={<Activity className="mr-2 h-4 w-4" />}
                valueClassName={sentiment === 'Bullish' ? 'text-green-400' : sentiment === 'Bearish' ? 'text-red-400' : 'text-muted-foreground'}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ParameterCard 
                label={type === 'CUSTOM' ? "Limit Entry" : "Executed Entry"}
                value={`$${formatPrice(entry_zone || aiStrategy.entryPrice)}`}
                icon={<LogIn className="mr-2 h-3 w-3" />}
                valueClassName="text-foreground"
            />
            <ParameterCard 
                label="Stop Loss" 
                value={`$${formatPrice(stop_loss || aiStrategy.stopLoss)}`}
                icon={<ShieldX className="mr-2 h-3 w-3" />}
                valueClassName="text-red-400"
            />
            <ParameterCard 
                label="Take Profit" 
                value={`$${formatPrice(take_profit || aiStrategy.takeProfit)}`}
                icon={<Target className="mr-2 h-3 w-3" />}
                valueClassName="text-green-400"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <ParameterCard 
                label="Confidence Level" 
                value={confidence || 'N/A'}
                icon={<ShieldCheck className="mr-2 h-3 w-3" />}
                valueClassName="text-tertiary"
            />
             <ParameterCard 
                label="SHADOW Score" 
                value={`${gpt_confidence_score || '0'}%`}
                icon={<Percent className="mr-2 h-3 w-3" />}
                valueClassName="text-tertiary"
            />
            <ParameterCard 
                label="Risk Rating" 
                value={risk_rating || 'N/A'}
                icon={<Zap className="mr-2 h-3 w-3" />}
                valueClassName="text-orange-400"
            />
        </div>

        {analysisSummary && (
             <div className="p-4 bg-secondary rounded-lg shadow-inner">
                <h4 className="flex items-center text-sm font-semibold text-primary mb-2"><Zap className="mr-2 h-4 w-4"/>SHADOW's Technical Analysis</h4>
                <p className="text-xs text-muted-foreground italic">"{analysisSummary}"</p>
            </div>
        )}

        <div className="pt-2">
            {type === 'CUSTOM' ? (
                <Button 
                    className="w-full glow-button"
                    onClick={handleExecute} 
                >
                    <PlayCircle className="mr-2 h-4 w-4"/>
                    Simulate Signal
                </Button>
            ) : (
                 <Button asChild className="w-full glow-button">
                    <Link href="/pulse">
                         <Briefcase className="mr-2 h-4 w-4"/>
                         Track in Portfolio
                    </Link>
                </Button>
            )}
        </div>

        {disclaimer && (
            <div className="shadow-edict-container">
                <div className="shadow-edict-title-container">
                    <MessageSquareHeart className="h-6 w-6" />
                    <div className="shadow-edict-title">
                        <GlyphScramble text="SHADOW's Edict" />
                    </div>
                </div>
                <p className="shadow-edict-body">
                    {disclaimer}
                </p>
            </div>
        )}
    </div>
  );
};

export default SignalTracker;

    