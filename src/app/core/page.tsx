
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import StrategySelectors from '@/components/blocksmith-ai/StrategySelectors';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SignalTracker from '@/components/blocksmith-ai/SignalTracker';
import {
  generateTradingStrategyAction,
  generateShadowChoiceStrategyAction,
  type GenerateTradingStrategyOutput,
  type GenerateShadowChoiceStrategyOutput,
} from '@/app/actions';

import { 
    fetchMarketDataAction, 
    type FormattedSymbol,
    type LiveMarketData,
} from '@/services/market-data-service';
import { fetchAllTradingSymbolsAction } from '@/services/market-data-service';
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Sparkles, BrainCircuit, Unlock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import DisclaimerFooter from '@/components/blocksmith-ai/DisclaimerFooter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
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
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(true);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [availableSymbols, setAvailableSymbols] = useState<FormattedSymbol[]>(DEFAULT_SYMBOLS);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showAirdropModal, setShowAirdropModal] = useState<boolean>(false);
  
  const { user: currentUser, isLoading: isUserLoading, refetch: refetchUser } = useCurrentUser();
  const router = useRouter();
  
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
          description: <span className="text-foreground">Guests are limited to <strong className="text-accent">{MAX_GUEST_ANALYSES} analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong> & the <strong className="text-tertiary">$BSAI airdrop!</strong></span>,
        });
        return;
      }
      updateUsageData(currentCount + 1);
    }

    if (isCustom) setIsLoadingCustom(true);
    else setIsLoadingInstant(true);
    
    setStrategyError(null);
    setAiStrategy(null);

    const marketDataForAIString = JSON.stringify(liveMarketData);
    let result;

    const commonInput = { 
        symbol, 
        tradingMode, 
        riskProfile, 
        marketData: marketDataForAIString, 
        userId: currentUser.id 
    };

    if (isCustom) {
        result = await generateShadowChoiceStrategyAction(commonInput);
    } else {
        result = await generateTradingStrategyAction(commonInput);
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
      setAiStrategy(result as AIStrategyOutput);
      
      const isHold = result.signal?.toUpperCase() === 'HOLD';
      const toastTitle = isCustom ? "Custom Signal Generated!" : "Instant Signal Executed!";
      const toastDescription = isHold 
          ? `HOLD signal for ${result.symbol} received. No position logged.`
          : isCustom
              ? `Your custom signal for ${result.symbol} is ready to be simulated.`
              : `Position for ${result.symbol} has been opened. Track it in your Portfolio.`;

      toast({
          title: <span className="text-accent">{toastTitle}</span>,
          description: <span className="text-foreground">{toastDescription}</span>,
      });
    }
    
    if (isCustom) setIsLoadingCustom(false);
    else setIsLoadingInstant(false);
  }, [symbol, tradingMode, riskProfile, liveMarketData, currentUser, analysisCount, lastAnalysisDate, updateUsageData, toast]);


  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleAirdropSignupSuccess = async () => {
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-tertiary">$BSAI airdrop</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
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
        <Card className="shadow-lg border border-destructive/50 w-full bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out">
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
        <SignalTracker
            aiStrategy={aiStrategy}
            liveMarketData={liveMarketData}
            userId={currentUser?.id || ''}
            onSimulateSuccess={() => router.push('/pulse')}
        />
      );
    }
  
    return null;
  }

  return (
    <TooltipProvider>
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
                
                <div className="pt-4">
                    {isLimitReached ? (
                        <Button
                            onClick={() => setShowAirdropModal(true)}
                            className="w-full font-semibold py-3 text-base sm:text-lg shadow-lg transition-all duration-300 ease-in-out glow-button"
                        >
                            <Unlock className="mr-2 h-5 w-5" />
                            Join Network for Unlimited Signals
                        </Button>
                    ) : (
                        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
                            <div className="w-full md:w-1/2 flex flex-col">
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-sm font-bold text-center text-primary mb-2 cursor-help">Executes immediately at market price.</p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-center">
                                        <p>SHADOW generates a trade based on your exact parameters and opens a position instantly.</p>
                                    </TooltipContent>
                                 </Tooltip>
                                <Button
                                    onClick={() => handleGenerateStrategy({ isCustom: false })}
                                    disabled={isButtonDisabled}
                                    className="w-full flex-grow font-semibold py-3 text-base sm:text-lg shadow-lg transition-all duration-300 ease-in-out generate-signal-button"
                                >
                                    {isLoadingInstant ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        : isUserLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        : <Sparkles className="mr-2 h-5 w-5" />}
                                    {isLoadingInstant ? "Analyzing..." : isUserLoading ? "Initializing..." : <GlyphScramble text="Instant Signal" />}
                                </Button>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-sm font-bold text-center text-accent mb-2 cursor-help">SHADOW finds the optimal entry.</p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-center">
                                        <p>SHADOW analyzes the order book to find a better entry price, providing a limit order signal.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Button
                                    onClick={() => handleGenerateStrategy({ isCustom: true })}
                                    disabled={isButtonDisabled}
                                    className="w-full flex-grow font-semibold py-3 text-base sm:text-lg shadow-lg transition-all duration-300 ease-in-out shadow-choice-button"
                                >
                                    {isLoadingCustom ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                                    {isLoadingCustom ? "Deciding..." : <GlyphScramble text="SHADOW's Signal" />}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {currentUser?.status === 'Guest' && (
                        <p className="text-xs text-center text-muted-foreground mt-4">
                        {isLimitReached ? (
                            <>
                                You've reached your daily limit of <strong className="text-primary">{MAX_GUEST_ANALYSES} analyses</strong>.
                            </>
                        ) : (
                            <>
                                Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-tertiary">unlimited</strong>.
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
        
        <DisclaimerFooter />
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
    </TooltipProvider>
  );
}
