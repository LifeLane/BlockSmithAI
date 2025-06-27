
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import StrategySelectors from '@/components/blocksmith-ai/StrategySelectors';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import SignalTracker from '@/components/blocksmith-ai/SignalTracker';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import ApiSettingsModal from '@/components/blocksmith-ai/ApiSettingsModal';
import { Button } from '@/components/ui/button';
import {
  generateTradingStrategyAction,
  generateShadowChoiceStrategyAction,
  fetchMarketDataAction,
  fetchAllTradingSymbolsAction,
  logSimulatedPositionAction,
  type LiveMarketData,
  type FormattedSymbol,
  type GenerateTradingStrategyOutput as AIOutputType,
  type GenerateShadowChoiceStrategyOutput,
} from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

type AIStrategyOutput = (AIOutputType | GenerateShadowChoiceStrategyOutput) & { 
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
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);
  const [isLoadingShadowChoice, setIsLoadingShadowChoice] = useState<boolean>(false);
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
  const mainContentRef = useRef<HTMLDivElement>(null);
  
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


  const handleGenerateStrategy = useCallback(async (isShadowChoice = false) => {
    setTimeout(() => {
        document.getElementById('results-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    if (currentUser?.status === 'Guest') {
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

    if (isShadowChoice) setIsLoadingShadowChoice(true);
    else setIsLoadingStrategy(true);
    
    setStrategyError(null);
    setAiStrategy(null);

    let currentDataToUse = liveMarketData;
    if (!currentDataToUse || (currentDataToUse.symbol !== symbol)) {
      const result = await fetchAndSetMarketData(symbol, true);
      if ('error' in result) {
        setStrategyError("Market data unavailable. Strategy generation aborted.");
        if(currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
        if (isShadowChoice) setIsLoadingShadowChoice(false);
        else setIsLoadingStrategy(false);
        return;
      }
      currentDataToUse = result;
    }

    const marketDataForAIString = JSON.stringify(currentDataToUse);
    let result;

    if (isShadowChoice) {
        result = await generateShadowChoiceStrategyAction({ symbol, marketData: marketDataForAIString });
    } else {
        result = await generateTradingStrategyAction({ symbol, tradingMode, riskProfile, marketData: marketDataForAIString });
    }
    
    if ('error' in result) {
      setStrategyError(result.error);
      setAiStrategy(null);
      toast({
        title: "SHADOW's Insight Blocked",
        description: result.error,
        variant: "destructive",
      });
      if(currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
    } else {
      const resultWithId: AIStrategyOutput = { ...result, id: crypto.randomUUID() };
      setAiStrategy(resultWithId);
      
      let toastDescription;
      const isHold = result.signal?.toUpperCase() === 'HOLD';

      if (currentUser && !isUserLoading) {
        if (!isHold) {
          const logResult = await logSimulatedPositionAction(currentUser.id, resultWithId);
          if (logResult.error) {
            toastDescription = <span className="text-foreground">Analysis generated, but <strong className="text-destructive">auto-logging failed:</strong> {logResult.error}</span>;
          } else {
            toastDescription = <span className="text-foreground">Analysis for <strong className="text-primary">{result.symbol}</strong> generated and <strong className="text-tertiary">auto-logged</strong> for simulation.</span>;
          }
        } else {
          toastDescription = <span className="text-foreground">HOLD signal for <strong className="text-primary">{result.symbol}</strong> generated. No position logged.</span>;
        }
      } else {
        toastDescription = <span className="text-foreground">New analysis for <strong className="text-primary">{result.symbol}</strong> has been generated.</span>;
      }

      toast({
        title: <span className="text-accent">SHADOW's Insight Materialized!</span>,
        description: toastDescription,
      });
    }
    
    if (isShadowChoice) setIsLoadingShadowChoice(false);
    else setIsLoadingStrategy(false);
  }, [symbol, tradingMode, riskProfile, liveMarketData, currentUser, isUserLoading, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData, toast]);


  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleAirdropSignupSuccess = async () => {
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-orange-400">$BSAI airdrop</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
    });
    await refetchUser();
  };

  const isButtonDisabled = isUserLoading || isLoadingStrategy || isLoadingShadowChoice || isLoadingSymbols || (currentUser?.status === 'Guest' && analysisCount >= MAX_GUEST_ANALYSES);
  const showResults = aiStrategy || isLoadingStrategy || isLoadingShadowChoice || strategyError;

  return (
    <>
      <AppHeader />
      <div ref={mainContentRef} className="container mx-auto px-4 py-4 flex flex-col w-full min-h-[calc(100vh-140px)]">
        
        <div className={cn(
            "w-full space-y-4 transition-all duration-500",
            !showResults ? 'flex-grow flex flex-col justify-center' : ''
        )}>
            <div className="space-y-4">
                <MarketDataDisplay
                    liveMarketData={liveMarketData}
                    isLoading={isLoadingMarketData}
                    error={marketDataError}
                    symbolForDisplay={symbol}
                />
            
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
                
                <div className="flex flex-col items-center gap-4 pt-2">
                    <Button
                        onClick={() => handleGenerateStrategy(false)}
                        disabled={isButtonDisabled}
                        className="w-full font-semibold py-3 text-base shadow-lg transition-all duration-300 ease-in-out generate-signal-button"
                    >
                        {isLoadingStrategy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            : isUserLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            : <Sparkles className="mr-2 h-5 w-5" />}
                        {isLoadingStrategy ? "SHADOW is Analyzing..." : isUserLoading ? "Initializing Analyst Profile..." : "Generate Signal"}
                    </Button>

                     <Button
                        onClick={() => handleGenerateStrategy(true)}
                        disabled={isButtonDisabled}
                        className="w-full font-semibold py-3 text-base shadow-lg transition-all duration-300 ease-in-out shadow-choice-button"
                    >
                        {isLoadingShadowChoice ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                        {isLoadingShadowChoice ? "SHADOW is Deciding..." : "Invoke SHADOW's Choice"}
                    </Button>
                    
                    {currentUser?.status === 'Guest' && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                        Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-orange-400">unlimited</strong>.
                        </p>
                    )}
                </div>
            </div>
        </div>

        {showResults && (
            <div id="results-block" className="w-full space-y-6 mt-8">
                <div className="w-full relative space-y-6">
                    <StrategyExplanationSection
                        strategy={aiStrategy}
                        liveMarketData={liveMarketData} 
                        isLoading={isLoadingStrategy || isLoadingShadowChoice}
                        error={strategyError}
                        symbol={symbol}
                        onChat={handleToggleChat}
                    />

                    {aiStrategy && liveMarketData && !(isLoadingStrategy || isLoadingShadowChoice) && !strategyError && (
                      <SignalTracker
                        aiStrategy={aiStrategy}
                        liveMarketData={liveMarketData}
                      />
                    )}

                    {aiStrategy && !(isLoadingStrategy || isLoadingShadowChoice) && !strategyError && (
                      <ShadowMindInterface 
                          signalConfidence={aiStrategy.gpt_confidence_score}
                          currentThought={aiStrategy.currentThought}
                          sentimentMemory={aiStrategy.sentimentTransition || aiStrategy.sentiment}
                          prediction={aiStrategy.shortTermPrediction}
                      />
                    )}
                </div>
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
      <ApiSettingsModal />
    </>
  );
}
