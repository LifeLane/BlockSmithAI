
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import StrategySelectors from '@/components/blocksmith-ai/StrategySelectors';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import SignalTracker from '@/components/blocksmith-ai/SignalTracker';
import {
  generateTradingStrategyAction,
  generateShadowChoiceStrategyAction,
  type GeneratedSignal,
} from '@/app/actions';
import { 
    fetchMarketDataAction, 
    type FormattedSymbol,
    type LiveMarketData,
} from '@/services/market-data-service';
import { fetchAllTradingSymbolsAction } from '@/services/market-data-service';
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { Loader2, Sparkles, BrainCircuit, Unlock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { useClientState } from '@/hooks/use-client-state';

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];
const INITIAL_DEFAULT_SYMBOL = 'BTCUSDT';
const MAX_GUEST_ANALYSES = 5;

const LOADING_STEPS = [
    "Initiating Neural Core...",
    "Fusing Live Market Data...",
    "Analyzing Multi-Timeframe Trends...",
    "Scanning News & Sentiment...",
    "Querying On-Chain Intelligence...",
    "Assessing Volatility Matrix...",
    "Formulating Core Strategy...",
    "Pinpointing Entry & Exit Vectors...",
    "Calculating Risk Parameters...",
    "Finalizing SHADOW Edict...",
];

const STATIC_DISCLAIMER = "My analysis is a beacon in the chaos, not a crystal ball. The market writes its own script. Tread wisely.";

export default function CoreConsolePage() {
  const [symbol, setSymbol] = useState<string>(INITIAL_DEFAULT_SYMBOL);
  const [tradingMode, setTradingMode] = useState<string>('Intraday');
  const [riskProfile, setRiskProfile] = useState<string>('Medium');

  const [aiStrategy, setAiStrategy] = useState<GeneratedSignal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>(LOADING_STEPS[0]);
  const [strategyError, setStrategyError] = useState<string | null>(null);
  
  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(true);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [availableSymbols, setAvailableSymbols] = useState<FormattedSymbol[]>(DEFAULT_SYMBOLS);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showAirdropModal, setShowAirdropModal] = useState<boolean>(false);
  
  const { user, isLoading: isUserLoading, refetchUser, setUser } = useCurrentUserState();
  const { addSignal: addClientSignal } = useClientState();
  
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>('');

  const { toast } = useToast();
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !user || user.status !== 'Guest') {
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

  }, [user]);

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
      if (showToastOnError) toast({ title: "Market Data Error", description: result.error, variant: "destructive" });
    } else {
      setLiveMarketData(result);
    }
    setIsLoadingMarketData(false);
    return result;
  }, [toast]);

  useEffect(() => {
    const loadSymbols = async () => {
      setIsLoadingSymbols(true);
      const result = await fetchAllTradingSymbolsAction();
      if ('error' in result) {
        toast({ title: "Failed to Load Symbols", description: result.error + " Using default list.", variant: "destructive" });
        setAvailableSymbols(DEFAULT_SYMBOLS);
      } else {
        setAvailableSymbols(result);
        if (!result.find(s => s.value === INITIAL_DEFAULT_SYMBOL) && result.length > 0) setSymbol(result[0].value);
      }
      setIsLoadingSymbols(false);
    };
    loadSymbols();
  }, [toast]);

  useEffect(() => {
    if (symbol && !isUserLoading) {
      fetchAndSetMarketData(symbol, true);
      const intervalId = setInterval(() => fetchAndSetMarketData(symbol, false), 30000);
      return () => clearInterval(intervalId);
    }
  }, [symbol, fetchAndSetMarketData, isUserLoading]);

  const stopLoadingAnimation = useCallback(() => {
    if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
    }
    setIsLoading(false);
  }, []);


  const handleGenerateStrategy = useCallback(async ({ isCustom }: { isCustom: boolean }) => {
    setTimeout(() => document.getElementById('results-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    if (!user) {
        toast({ title: "User Session Required", description: "Your guest session is still being created. Please try again in a moment." });
        return;
    }

    if (user.status === 'Guest') {
      const today = new Date().toISOString().split('T')[0];
      let currentCount = lastAnalysisDate !== today ? 0 : analysisCount;
      if (currentCount >= MAX_GUEST_ANALYSES) {
        setShowAirdropModal(true);
        toast({ title: "Daily Limit Reached", description: <span className="text-foreground">Guests have <strong className="text-accent">{MAX_GUEST_ANALYSES} analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong>.</span> });
        return;
      }
      updateUsageData(currentCount + 1);
    }

    setIsLoading(true);
    setStrategyError(null);
    setAiStrategy(null);

    let step = 0;
    setLoadingText(LOADING_STEPS[step]);
    loadingIntervalRef.current = setInterval(() => {
        step = (step + 1) % LOADING_STEPS.length;
        setLoadingText(LOADING_STEPS[step]);
    }, 1500);

    let currentDataToUse = liveMarketData;
    if (!currentDataToUse || (currentDataToUse.symbol !== symbol)) {
      const result = await fetchAndSetMarketData(symbol, true);
      if ('error' in result) {
        setStrategyError("Market data unavailable. Strategy generation aborted.");
        if(user.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
        stopLoadingAnimation();
        return;
      }
      currentDataToUse = result;
    }

    const marketDataForAIString = JSON.stringify(currentDataToUse);
    let result;

    try {
        if (isCustom) {
            result = await generateShadowChoiceStrategyAction({ symbol, marketData: marketDataForAIString }, user.id);
        } else {
            result = await generateTradingStrategyAction({ symbol, tradingMode, riskProfile, marketData: marketDataForAIString, userId: user.id });
        }
        
        if ('error' in result) {
          setStrategyError(result.error);
          toast({ title: "SHADOW's Insight Blocked", description: result.error, variant: "destructive" });
          if(user.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
        } else {
            const strategyResult = result.signal;
            setAiStrategy(strategyResult);
            
            if (user.status === 'Guest') {
                addClientSignal(result.signal);
            } else {
                refetchUser(); // Update points display
            }
            
            toast({ 
                title: <span className="text-accent">Signal Generated!</span>, 
                description: `SHADOW's analysis for ${symbol} is complete.`, 
            });
        }
    } catch (e: any) {
        const errorMessage = e.message || "An unexpected server error occurred.";
        setStrategyError(errorMessage);
        toast({ title: "SHADOW Core Fault", description: errorMessage, variant: "destructive" });
    } finally {
        stopLoadingAnimation();
    }

  }, [symbol, tradingMode, riskProfile, liveMarketData, user, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData, toast, refetchUser, addClientSignal, stopLoadingAnimation]);

  useEffect(() => {
    return () => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
        }
    }
  }, []);

  const handleAirdropSignupSuccess = async () => {
    setShowAirdropModal(false);
    toast({ title: <span className="text-accent">Registration Complete!</span>, description: <span className="text-foreground">You're confirmed for the airdrop. Unlimited analyses unlocked!</span> });
    await refetchUser();
  };

  const isButtonDisabled = isUserLoading || isLoading || isLoadingSymbols;
  const showResults = aiStrategy || isLoading || strategyError;
  const isLimitReached = user?.status === 'Guest' && analysisCount >= MAX_GUEST_ANALYSES;

  if (isUserLoading || !user) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-col flex-grow items-center justify-center h-full text-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground font-semibold">Initializing SHADOW Interface...</p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-2 flex flex-col w-full pb-24">
        
        <div className={cn("w-full space-y-3 transition-all duration-500", !showResults && 'flex-grow flex flex-col justify-center')}>
            <div className="space-y-3">
                <div id="market-data-display">
                    <MarketDataDisplay liveMarketData={liveMarketData} isLoading={isLoadingMarketData} error={marketDataError} symbolForDisplay={symbol} />
                </div>
                <div id="strategy-selectors">
                    <StrategySelectors symbol={symbol} onSymbolChange={setSymbol} tradingMode={tradingMode} onTradingModeChange={setTradingMode} riskProfile={riskProfile} onRiskProfileChange={setRiskProfile} symbols={availableSymbols} isLoadingSymbols={isLoadingSymbols} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 pt-2">
                    {isLimitReached ? (
                        <Button onClick={() => setShowAirdropModal(true)} className="w-full font-semibold py-3 text-lg shadow-lg transition-all duration-300 ease-in-out glow-button h-auto md:col-span-2">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center"> <Unlock className="mr-2 h-5 w-5" /> Join for Unlimited Signals </div>
                                <span className="text-xs font-normal opacity-80 mt-1">Register for full access.</span>
                            </div>
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => handleGenerateStrategy({ isCustom: false })} disabled={isButtonDisabled} className="w-full font-semibold py-3 text-lg shadow-lg transition-all duration-300 ease-in-out generate-signal-button h-auto">
                                 <div className="flex flex-col items-center">
                                    <div className="flex items-center">
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                        {isLoading ? "Analyzing..." : <GlyphScramble text="Generate Instant Signal" />}
                                    </div>
                                    <span className="text-xs font-normal opacity-80 mt-1">AI-driven market order analysis.</span>
                                </div>
                            </Button>

                            <Button onClick={() => handleGenerateStrategy({ isCustom: true })} disabled={isButtonDisabled} className="w-full font-semibold py-3 text-lg shadow-lg transition-all duration-300 ease-in-out shadow-choice-button h-auto">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center">
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                                        {isLoading ? "Deciding..." : <GlyphScramble text="Generate SHADOW's Signal" />}
                                    </div>
                                    <span className="text-xs font-normal opacity-80 mt-1">AI-chosen custom limit order.</span>
                                </div>
                            </Button>
                        </>
                    )}
                    
                    {user?.status === 'Guest' && (
                        <p className="text-xs text-center text-muted-foreground mt-2 md:col-span-2">
                        {isLimitReached ? <>You've reached your daily limit of <strong className="text-primary">{MAX_GUEST_ANALYSES} analyses</strong>.</>
                         : <>Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-orange-400">unlimited</strong>.</>
                        }
                        </p>
                    )}
                </div>
            </div>
        </div>

        {showResults && (
            <div id="results-block" className="w-full space-y-6 mt-8">
                {isLoading ? (
                    <Card className="shadow-lg w-full bg-card/80 backdrop-blur-sm border-0 transition-all duration-300 ease-in-out">
                        <CardHeader className="items-center text-center">
                            <CardTitle className="text-primary text-xl flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                SHADOW is Analyzing...
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6 text-center">
                           <p className="text-lg font-semibold text-accent animate-pulse">
                                <GlyphScramble text={loadingText} />
                           </p>
                           <p className="text-xs text-muted-foreground">Please stand by. Cognitive processes engaged.</p>
                        </CardContent>
                    </Card>
                ) : strategyError ? (
                    <Card className="shadow-lg border border-destructive/50 w-full bg-card transition-all duration-300 ease-in-out">
                        <CardHeader className="items-center text-center"> <CardTitle className="flex items-center text-destructive text-xl"> <AlertTriangle className="mr-2 h-6 w-6" /> Analysis Disrupted </CardTitle> </CardHeader>
                        <CardContent className="text-center p-6">
                            <p className="text-destructive-foreground text-base">{strategyError}</p>
                            <p className="text-sm text-muted-foreground mt-3"> My quantum awareness encounters interference. The signal is unclear. Please try again. </p>
                        </CardContent>
                    </Card>
                ) : aiStrategy && (
                    <SignalTracker aiStrategy={aiStrategy} liveMarketData={liveMarketData} userId={user?.id || ''} />
                )}
            </div>
        )}
        
      </div>
      <ChatbotPopup isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      {user && <AirdropSignupModal isOpen={showAirdropModal} onOpenChange={setShowAirdropModal} onSignupSuccess={handleAirdropSignupSuccess} userId={user.id} />}
    </>
  );
}

    