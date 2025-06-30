
'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import StrategySelectors from '@/components/blocksmith-ai/StrategySelectors';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import {
  generateTradingStrategyAction,
  generateShadowChoiceStrategyAction,
  fetchMarketDataAction,
  fetchAllTradingSymbolsAction,
  logInstantPositionAction,
  type LiveMarketData,
  type FormattedSymbol,
  type GenerateTradingStrategyOutput,
  type GenerateShadowChoiceStrategyOutput,
} from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Sparkles, BrainCircuit, Unlock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
  gpt_confidence_score?: string;
  confidence?: string;
  sentiment?: string;
  risk_rating?: string;
  currentThought?: string;
  shortTermPrediction?: string;
  analysisSummary?: string | null;
  newsAnalysis?: string | null;
  strategyReasoning?: string | null;
};

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];
const INITIAL_DEFAULT_SYMBOL = 'BTCUSDT';
const MAX_GUEST_ANALYSES = 3;


export default function CoreConsolePage() {
  const [symbol, setSymbol] = useState<string>(INITIAL_DEFAULT_SYMBOL);
  const [tradingMode, setTradingMode] = useState<string>('Intraday');
  const [riskProfile, setRiskProfile] = useState<string>('Medium');

  const [aiStrategy, setAiStrategy] = useState<AIStrategyOutput | null>(null);
  const [isLoadingInstant, setIsLoadingInstant] = useState<boolean>(false);
  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);
  const [isCustomSignal, setIsCustomSignal] = useState(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(true);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [availableSymbols, setAvailableSymbols] = useState<FormattedSymbol[]>(DEFAULT_SYMBOLS);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showAirdropModal, setShowAirdropModal] = useState<boolean>(false);
  
  const { user: currentUser, isLoading: isUserLoading, refetch: refetchUser } = useCurrentUser();
  
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>('');

  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!currentUser || currentUser.status !== 'Guest') {
        setAnalysisCount(0);
        return;
    }
    const storedCount = localStorage.getItem('bsaiAnalysisCount');
    const storedDate = localStorage.getItem('bsaiLastAnalysisDate');
    const today = new Date().toISOString().split('T')[0];

    if (storedDate === today && storedCount) {
        setAnalysisCount(parseInt(storedCount, 10));
    } else {
        localStorage.setItem('bsaiAnalysisCount', '0');
        localStorage.setItem('bsaiLastAnalysisDate', today);
        setAnalysisCount(0);
    }
    setLastAnalysisDate(today);

  }, [currentUser]);

  const updateUsageData = useCallback((newCount: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bsaiAnalysisCount', newCount.toString());
    localStorage.setItem('bsaiLastAnalysisDate', today);
    setAnalysisCount(newCount);
    setLastAnalysisDate(today);
  }, []);

  const fetchAndSetMarketData = useCallback(async (currentSymbolToFetch: string, showToastOnError = true) => {
    setIsLoadingMarketData(true);
    setMarketDataError(null); 
    const result = await fetchMarketDataAction({ symbol: currentSymbolToFetch });

    if ('error' in result) {
      setMarketDataError(result.error);
      setLiveMarketData(null);
      if (showToastOnError) {
        toast({
          title: "Market Data Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } else {
      setLiveMarketData(result);
      setMarketDataError(null);
    }
    setIsLoadingMarketData(false);
    return result;
  }, [toast]);

  useEffect(() => {
    const loadSymbols = async () => {
      setIsLoadingSymbols(true);
      const result = await fetchAllTradingSymbolsAction();
      if ('error' in result) {
        toast({
          title: "Failed to Load Symbols",
          description: result.error + " Using default list.",
          variant: "destructive",
        });
        setAvailableSymbols(DEFAULT_SYMBOLS);
      } else {
        setAvailableSymbols(result);
        if (!result.find(s => s.value === INITIAL_DEFAULT_SYMBOL) && result.length > 0) {
            setSymbol(result[0].value);
        }
      }
      setIsLoadingSymbols(false);
    };
    loadSymbols();
  }, [toast]);

  useEffect(() => {
    if (symbol) {
      fetchAndSetMarketData(symbol, true);
      const intervalId = setInterval(() => fetchAndSetMarketData(symbol, false), 30000);
      return () => clearInterval(intervalId);
    }
  }, [symbol, fetchAndSetMarketData]);


  const handleGenerateStrategy = useCallback(async ({ isCustom }: { isCustom: boolean }) => {
    setTimeout(() => {
        document.getElementById('results-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    if (!currentUser) {
        setShowAirdropModal(true);
        toast({
          title: "User Session Required",
          description: "Please sign up to generate signals and interact with SHADOW.",
        });
        return;
    }

    if (currentUser.status === 'Guest') {
      const today = new Date().toISOString().split('T')[0];
      let currentCount = analysisCount;
      if (lastAnalysisDate !== today) {
        currentCount = 0;
        updateUsageData(0);
      }

      if (currentCount >= MAX_GUEST_ANALYSES) {
        setShowAirdropModal(true);
        toast({
          title: "Daily Limit Reached",
          description: <span className="text-foreground">Guests are limited to <strong className="text-accent">{MAX_GUEST_ANALYSES} analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong> & the <strong className="text-orange-400">$BSAI airdrop!</strong></span>,
        });
        return;
      }
      updateUsageData(currentCount + 1);
    }

    if (isCustom) setIsLoadingCustom(true);
    else setIsLoadingInstant(true);
    
    setIsCustomSignal(isCustom);
    setStrategyError(null);
    setAiStrategy(null);

    let currentDataToUse = liveMarketData;
    if (!currentDataToUse || (currentDataToUse.symbol !== symbol)) {
      const result = await fetchAndSetMarketData(symbol, true);
      if ('error' in result) {
        setStrategyError("Market data unavailable. Strategy generation aborted.");
        if(currentUser.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
        if (isCustom) setIsLoadingCustom(false);
        else setIsLoadingInstant(false);
        return;
      }
      currentDataToUse = result;
    }

    const marketDataForAIString = JSON.stringify(currentDataToUse);
    let result;

    if (isCustom) {
        result = await generateShadowChoiceStrategyAction({ symbol, marketData: marketDataForAIString }, currentUser.id);
    } else {
        result = await generateTradingStrategyAction({ symbol, tradingMode, riskProfile, marketData: marketDataForAIString, userId: currentUser.id });
    }
    
    if ('error' in result) {
      setStrategyError(result.error);
      setAiStrategy(null);
      toast({
        title: "SHADOW's Insight Blocked",
        description: result.error,
        variant: "destructive",
      });
      if(currentUser.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
    } else {
      setAiStrategy(result);
      
      if (isCustom) {
        toast({
          title: <span className="text-accent">Custom Signal Generated!</span>,
          description: (
             <Link href="/signals">
                <span className="text-foreground hover:underline">Review and execute on the <strong className="text-primary">Signals</strong> page.</span>
             </Link>
          )
        });
      } else {
         // Instant Signal: Log the position immediately
        const isHold = result.signal?.toUpperCase() === 'HOLD';
        if (!isHold) {
            const logResult = await logInstantPositionAction(currentUser.id, result as GenerateTradingStrategyOutput);
            if (logResult.error) {
                 toast({
                    title: <span className="text-accent">Instant Signal Generated!</span>,
                    description: <span className="text-foreground">Analysis generated, but <strong className="text-destructive">auto-logging failed:</strong> {logResult.error}</span>
                });
            } else {
                 toast({
                    title: <span className="text-accent">Instant Signal Executed!</span>,
                    description:  <span className="text-foreground">Analysis for <strong className="text-primary">{result.symbol}</strong> generated and <strong className="text-tertiary">auto-logged</strong> for simulation.</span>
                });
            }
        } else if (isHold) {
            toast({
                title: <span className="text-accent">HOLD Signal Generated</span>,
                description: <span className="text-foreground">HOLD signal for <strong className="text-primary">{result.symbol}</strong> received. No position logged.</span>
            });
        }
      }
    }
    
    if (isCustom) setIsLoadingCustom(false);
    else setIsLoadingInstant(false);
  }, [symbol, tradingMode, riskProfile, liveMarketData, currentUser, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData, toast]);


  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleAirdropSignupSuccess = async () => {
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-orange-400">$BSAI airdrop</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
    });
    await refetchUser();
  };

  const isButtonDisabled = isUserLoading || isLoadingInstant || isLoadingCustom || isLoadingSymbols;
  const showResults = aiStrategy || isLoadingInstant || isLoadingCustom || strategyError;
  const isLimitReached = currentUser?.status === 'Guest' && analysisCount >= MAX_GUEST_ANALYSES;

  const renderResults = () => {
    if (isLoadingInstant || isLoadingCustom) {
      return (
        <Card className="shadow-lg w-full bg-card/80 backdrop-blur-sm border-0 transition-all duration-300 ease-in-out">
          <CardHeader className="items-center text-center">
             <Skeleton className="h-8 w-3/4 mb-2 bg-muted" />
             <Skeleton className="h-5 w-1/2 bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <p className="text-center text-muted-foreground font-semibold animate-pulse">SHADOW is analyzing data streams...</p>
          </CardContent>
        </Card>
      );
    }
  
    if (strategyError) {
      return (
        <Card className="shadow-lg border border-destructive/50 w-full bg-card transition-all duration-300 ease-in-out">
          <CardHeader className="items-center text-center">
            <CardTitle className="flex items-center text-destructive text-xl font-headline">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Analysis Disrupted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-6">
            <p className="text-destructive-foreground text-base">{strategyError}</p>
            <p className="text-sm text-muted-foreground mt-3">
              My quantum awareness encounters interference. The signal is unclear. Please try again.
            </p>
          </CardContent>
        </Card>
      );
    }
  
    if (aiStrategy) {
      return (
        <>
            <ShadowMindInterface
              shadowScore={aiStrategy.gpt_confidence_score}
              confidence={aiStrategy.confidence}
              sentiment={aiStrategy.sentiment}
              riskRating={aiStrategy.risk_rating}
              currentThought={aiStrategy.currentThought}
              prediction={aiStrategy.shortTermPrediction}
            />
            <StrategyExplanationSection
                strategy={aiStrategy}
                liveMarketData={liveMarketData}
                isLoading={isLoadingInstant || isLoadingCustom}
                symbol={symbol}
                isCustomSignal={isCustomSignal}
            />
        </>
      );
    }
  
    return null;
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-4 flex flex-col w-full min-h-[calc(100vh-140px)]">
        
        <div className={cn(
            "w-full space-y-4 transition-all duration-500",
            !showResults ? 'flex-grow flex flex-col justify-center' : ''
        )}>
            <div className="space-y-4">
                <div id="market-data-display">
                    <MarketDataDisplay
                        liveMarketData={liveMarketData}
                        isLoading={isLoadingMarketData}
                        error={marketDataError}
                        symbolForDisplay={symbol}
                    />
                </div>
                <div id="strategy-selectors">
                    <StrategySelectors
                        symbol={symbol}
                        onSymbolChange={setSymbol} 
                        tradingMode={tradingMode}
                        onTradingModeChange={setTradingMode}
                        riskProfile={riskProfile}
                        onRiskProfileChange={setRiskProfile}
                        symbols={availableSymbols}
                        isLoadingSymbols={isLoadingSymbols}
                    />
                </div>
                
                <div className="flex flex-col items-center gap-4 pt-2">
                    {isLimitReached ? (
                        <Button
                            onClick={() => setShowAirdropModal(true)}
                            className="w-full font-semibold py-3 text-sm sm:text-base shadow-lg transition-all duration-300 ease-in-out glow-button generate-buttons"
                        >
                            <Unlock className="mr-2 h-5 w-5" />
                            Join Network for Unlimited Signals
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => handleGenerateStrategy({ isCustom: false })}
                                disabled={isButtonDisabled}
                                className="w-full font-semibold py-3 text-sm sm:text-base shadow-lg transition-all duration-300 ease-in-out generate-signal-button generate-buttons"
                            >
                                {isLoadingInstant ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    : isUserLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    : <Sparkles className="mr-2 h-5 w-5" />}
                                {isLoadingInstant ? "SHADOW is Analyzing..." : isUserLoading ? "Initializing..." : "Instant Signal"}
                            </Button>

                            <Button
                                onClick={() => handleGenerateStrategy({ isCustom: true })}
                                disabled={isButtonDisabled}
                                className="w-full font-semibold py-3 text-sm sm:text-base shadow-lg transition-all duration-300 ease-in-out shadow-choice-button generate-buttons"
                            >
                                {isLoadingCustom ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                                {isLoadingCustom ? "SHADOW is Deciding..." : "Custom Signal"}
                            </Button>
                        </>
                    )}
                    
                    {currentUser?.status === 'Guest' && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                        {isLimitReached ? (
                            <>
                                You've reached your daily limit of <strong className="text-primary">{MAX_GUEST_ANALYSES} analyses</strong>.
                            </>
                        ) : (
                            <>
                                Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-orange-400">unlimited</strong>.
                            </>
                        )}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {showResults && (
            <div id="results-block" className="w-full space-y-6 mt-8">
                {renderResults()}
            </div>
        )}
        
      </div>
      <ChatbotPopup isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      {currentUser && (
        <AirdropSignupModal
            isOpen={showAirdropModal}
            onOpenChange={setShowAirdropModal}
            onSignupSuccess={handleAirdropSignupSuccess}
            userId={currentUser.id}
        />
      )}
    </>
  );
}
