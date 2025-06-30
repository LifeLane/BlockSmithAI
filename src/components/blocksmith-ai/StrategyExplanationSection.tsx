
import { FunctionComponent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput } from '@/app/actions';
import type { LiveMarketData } from '@/app/actions';
import {
  MessageSquareHeart,
  Orbit,
  Route,
  Newspaper,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import GlyphScramble from './GlyphScramble';

type CombinedStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
    id?: string;
    analysisSummary?: string | null; 
    newsAnalysis?: string | null;
    strategyReasoning?: string | null;
    chosenTradingMode?: string;
    chosenRiskProfile?: string;
};

interface StrategyExplanationSectionProps {
  strategy: CombinedStrategyOutput | null;
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error?: string | null;
  symbol: string;
  isCustomSignal?: boolean;
}

const StrategyExplanationSection: FunctionComponent<StrategyExplanationSectionProps> = ({
  strategy,
  liveMarketData,
  isLoading,
  error,
  symbol,
  isCustomSignal,
}) => {

  if (isLoading || error || !strategy) {
    return null;
  }
  
  const isHoldSignal = strategy.signal?.toUpperCase() === 'HOLD';

  return (
    <Card className="shadow-xl w-full bg-card/80 backdrop-blur-sm border-border/20 transition-all duration-300 ease-in-out">
      <CardContent className="space-y-6 p-4 sm:p-6">
        
        {strategy.strategyReasoning && (
             <div className="p-4 bg-background/50 rounded-lg border-l-4 border-accent/50">
                <p className="text-sm text-muted-foreground italic">"{strategy.strategyReasoning}"</p>
             </div>
        )}

        {strategy.analysisSummary && (
            <div className="w-full space-y-2">
                <div className="flex items-center text-primary">
                    <BookOpen className="h-5 w-5 mr-2" />
                    <h4 className="font-semibold font-headline">Technical Analysis</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-1">{strategy.analysisSummary}</p>
            </div>
        )}

        {strategy.newsAnalysis && (
            <div className="w-full space-y-2">
                <div className="flex items-center text-primary">
                    <Newspaper className="h-5 w-5 mr-2" />
                    <h4 className="font-semibold font-headline">Market News Context</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-1">{strategy.newsAnalysis}</p>
            </div>
        )}
        
        <div className="text-center w-full p-4 bg-secondary rounded-lg">
            <p className="text-sm text-foreground flex items-center justify-center gap-2 font-semibold">
                <Orbit className="h-5 w-5 text-tertiary" />
                {isCustomSignal ? 
                    <>Custom Signal generated and <strong className="text-tertiary">saved</strong>.</>
                    : <><strong className="text-tertiary">Instant Signal</strong> executed and <strong className="text-tertiary">logged</strong>.</>
                }
            </p>
                <p className="text-xs text-muted-foreground mt-1">
                {isCustomSignal ? 
                    <>You can review and execute it from the <strong className="text-primary">Signals</strong> page.</>
                    : (isHoldSignal ? "No action is required." : <>You can track its performance on the <strong className="text-tertiary">Portfolio</strong> page.</>)
                }
            </p>
        </div>

        <div className="flex justify-center">
            <Button asChild className="glow-button px-8 py-6 text-base">
              <Link href={isCustomSignal ? '/signals' : '/pulse'}>
                <Route className="mr-2 h-5 w-5"/>
                {isCustomSignal ? "Review & Execute Signal" : "Track in Portfolio"}
              </Link>
            </Button>
        </div>

        {strategy.disclaimer && (
            <div className="shadow-edict-container">
                <div className="shadow-edict-title-container">
                    <MessageSquareHeart className="h-6 w-6" />
                    <div className="shadow-edict-title">
                        <GlyphScramble text="SHADOW's Edict" />
                    </div>
                </div>
                <p className="shadow-edict-body">
                    {strategy.disclaimer}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyExplanationSection;
