
'use client';

import { useState } from 'react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
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
  AlertTriangle,
  Zap,
  PlayCircle,
  Loader2,
  MessageSquareHeart,
  Route,
} from 'lucide-react';
import { executeCustomSignalAction, type GenerateTradingStrategyOutput, type GenerateShadowChoiceStrategyOutput } from '@/app/actions';
import type { LiveMarketData } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import GlyphScramble from './GlyphScramble';
import Link from 'next/link';

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
  analysisSummary?: string | null;
  newsAnalysis?: string | null;
  chosenTradingMode?: string;
};

interface SignalTrackerProps {
  aiStrategy: AIStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  userId: string;
  onSimulateSuccess: () => void;
}

const ParameterCard = ({ label, value, icon, valueClassName, isLarge = false }: { label: string, value: string, icon: React.ReactNode, valueClassName?: string, isLarge?: boolean }) => (
    <div className={cn("flex flex-col p-3 bg-secondary rounded-lg shadow-inner", isLarge ? "col-span-1" : "")}>
        <span className="text-xs text-muted-foreground flex items-center">{icon}{label}</span>
        <span className={`font-mono font-semibold truncate ${valueClassName} ${isLarge ? 'text-2xl mt-1' : 'text-base'}`}>{value}</span>
    </div>
);


const SignalTracker: FunctionComponent<SignalTrackerProps> = ({ aiStrategy, liveMarketData, userId, onSimulateSuccess }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  if (!aiStrategy || !aiStrategy.id) {
    return null;
  }
  
  const handleSimulate = async () => {
    if (!userId || !aiStrategy.id) {
        toast({ title: "Error", description: "User or Signal ID not found.", variant: "destructive" });
        return;
    }
    setIsSimulating(true);
    const result = await executeCustomSignalAction(aiStrategy.id, userId);
    if (result.position) {
        toast({
            title: <span className="text-accent">Signal Simulated!</span>,
            description: <span className="text-foreground">Your pending order for <strong className="text-primary">{aiStrategy.symbol}</strong> is now active. You are being redirected to your portfolio.</span>,
        });
        onSimulateSuccess();
    } else {
        toast({ title: "Simulation Failed", description: result.error, variant: "destructive" });
    }
    setIsSimulating(false);
  };

  const { signal, entry_zone, stop_loss, take_profit, confidence, gpt_confidence_score, risk_rating, sentiment, analysisSummary, disclaimer } = aiStrategy;

  const isBuy = signal === 'BUY';
  const isCustomSignal = !!aiStrategy.chosenTradingMode;

  const formatPrice = (priceString?: string | null): string => {
    if (!priceString) return 'N/A';
    const price = parseFloat(priceString);
    if (isNaN(price)) return priceString;
    return price.toFixed(2);
  };

  const signalText = isBuy ? 'BUY / LONG' : 'SELL / SHORT';
  const signalIcon = isBuy ? <TrendingUp className="mr-2 h-4 w-4" /> : <TrendingDown className="mr-2 h-4 w-4" />;

  const currentPriceFormatted = liveMarketData?.lastPrice ? `$${formatPrice(liveMarketData.lastPrice)}` : 'N/A';

  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-card/80 backdrop-blur-sm space-y-4 shadow-lg interactive-card">
        <h2 className="text-lg sm:text-xl font-headline text-center">
            <GlyphScramble text={`SHADOW's Insight Unveiled: ${aiStrategy.symbol}`} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <ParameterCard 
                isLarge
                label="SHADOW Signal"
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
                label="Entry Zone" 
                value={`$${formatPrice(entry_zone)}`}
                icon={<LogIn className="mr-2 h-3 w-3" />}
                valueClassName="text-foreground"
            />
            <ParameterCard 
                label="Stop Loss" 
                value={`$${formatPrice(stop_loss)}`}
                icon={<ShieldX className="mr-2 h-3 w-3" />}
                valueClassName="text-red-400"
            />
            <ParameterCard 
                label="Take Profit" 
                value={`$${formatPrice(take_profit)}`}
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
                icon={<AlertTriangle className="mr-2 h-3 w-3" />}
                valueClassName="text-orange-400"
            />
        </div>

        {analysisSummary && (
             <div className="p-4 bg-secondary rounded-lg shadow-inner">
                <h4 className="flex items-center text-sm font-semibold text-primary mb-2"><Zap className="mr-2 h-4 w-4"/>SHADOW's Technical Analysis</h4>
                <p className="text-xs text-muted-foreground italic">"{analysisSummary}"</p>
            </div>
        )}

        {isCustomSignal ? (
          <div className="pt-2">
             <Button className="w-full glow-button" onClick={handleSimulate} disabled={isSimulating}>
                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlayCircle className="h-4 w-4 mr-2"/>}
                Simulate Signal
             </Button>
          </div>
        ) : (
            <div className="pt-2">
                <Button asChild className="w-full shadow-choice-button">
                    <Link href="/pulse">
                        <Route className="mr-2 h-4 w-4" />
                        Track in Portfolio
                    </Link>
                </Button>
            </div>
        )}

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
