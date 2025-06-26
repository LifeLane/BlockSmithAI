
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import StrategySelectors from '@/components/blocksmith-ai/StrategySelectors';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import SignalTracker from '@/components/blocksmith-ai/SignalTracker';
import ChatbotIcon from '@/components/blocksmith-ai/ChatbotIcon';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  generateTradingStrategyAction,
  fetchMarketDataAction,
  fetchAllTradingSymbolsAction,
  openSimulatedPositionAction,
  type LiveMarketData,
  type FormattedSymbol
} from '@/app/actions';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ShieldQuestion, Zap } from 'lucide-react';

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];
const INITIAL_DEFAULT_SYMBOL = 'BTCUSDT';
const MAX_GUEST_ANALYSES = 3;

// Helper to get user ID from client-side storage
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};


export default function CoreConsolePage() {
  const [symbol, setSymbol] = useState<string>(INITIAL_DEFAULT_SYMBOL);
  const [tradingMode, setTradingMode] = useState<string>('Intraday');
  const [riskProfile, setRiskProfile] = useState<string>('Medium');

  const [aiStrategy, setAiStrategy] = useState<GenerateTradingStrategyOutput | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [availableSymbols, setAvailableSymbols] = useState<FormattedSymbol[]>(DEFAULT_SYMBOLS);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>('');
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [showAirdropModal, setShowAirdropModal] = useState<boolean>(false);
  
  const [showConfirmTradeDialog, setShowConfirmTradeDialog] = useState<boolean>(false);

  const toastRef = useRef(useToast());

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedCount = localStorage.getItem('bsaiAnalysisCount');
    const storedDate = localStorage.getItem('bsaiLastAnalysisDate');
    const storedSignupStatus = localStorage.getItem('bsaiIsSignedUp');
    const today = new Date().toISOString().split('T')[0];

    if (storedSignupStatus === 'true') {
      setIsSignedUp(true);
    } else {
      if (storedDate === today && storedCount) {
        setAnalysisCount(parseInt(storedCount, 10));
      } else {
        localStorage.setItem('bsaiAnalysisCount', '0');
        localStorage.setItem('bsaiLastAnalysisDate', today);
        setAnalysisCount(0);
      }
      setLastAnalysisDate(today);
    }
  }, []);

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
        toastRef.current.toast({
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
  }, []);

  useEffect(() => {
    const loadSymbols = async () => {
      setIsLoadingSymbols(true);
      const result = await fetchAllTradingSymbolsAction();
      if ('error' in result) {
        toastRef.current.toast({
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
  }, []);

  useEffect(() => {
    if (symbol) {
      fetchAndSetMarketData(symbol, true);
      const intervalId = setInterval(() => fetchAndSetMarketData(symbol, false), 30000);
      return () => clearInterval(intervalId);
    }
  }, [symbol, fetchAndSetMarketData]);


  const handleGenerateStrategy = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!isSignedUp) {
      const today = new Date().toISOString().split('T')[0];
      let currentCount = analysisCount;
      if (lastAnalysisDate !== today) {
        currentCount = 0;
        updateUsageData(0);
      }

      if (currentCount >= MAX_GUEST_ANALYSES) {
        setShowAirdropModal(true);
        toastRef.current.toast({
          title: "Daily Limit Reached",
          description: <span className="text-foreground">Guests are limited to <strong className="text-accent">3 analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong> & the <strong className="text-orange-400">$BSAI airdrop!</strong></span>,
        });
        return;
      }
      updateUsageData(currentCount + 1);
    }

    setIsLoadingStrategy(true);
    setStrategyError(null);
    setAiStrategy(null);

    let marketDataForAIString = '{}';
    let currentDataToUse = liveMarketData;

    if (!currentDataToUse || (currentDataToUse.symbol !== symbol)) {
      const result = await fetchAndSetMarketData(symbol, true);
      if ('error' in result) {
        setStrategyError("Market data unavailable. Strategy generation aborted.");
        setIsLoadingStrategy(false);
        if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount - 1);
        return;
      }
      currentDataToUse = result;
    }

    if (currentDataToUse) {
        marketDataForAIString = JSON.stringify(currentDataToUse);
    }

    const inputForAI = { symbol, tradingMode, riskProfile, marketData: marketDataForAIString };

    const result = await generateTradingStrategyAction(inputForAI);

    if ('error' in result) {
      setStrategyError(result.error);
      setAiStrategy(null);
      toastRef.current.toast({
        title: "SHADOW's Insight Blocked",
        description: result.error,
        variant: "destructive",
      });
      if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
    } else {
      setAiStrategy(result);
      toastRef.current.toast({
        title: <span className="text-accent">SHADOW's Insight Materialized!</span>,
        description: <span className="text-foreground">New analysis for <strong className="text-primary">{result.symbol}</strong> has been generated.</span>,
      });

      try {
        const history = JSON.parse(localStorage.getItem('bsaiSignalHistory') || '[]');
        const newEntry = { ...result, timestamp: new Date().toISOString() };
        const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep latest 20
        localStorage.setItem('bsaiSignalHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save signal to history:", e);
      }
    }
    setIsLoadingStrategy(false);
  }, [symbol, tradingMode, riskProfile, liveMarketData, isSignedUp, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData]);

  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleAirdropSignupSuccess = () => {
    setIsSignedUp(true);
    localStorage.setItem('bsaiIsSignedUp', 'true');
    setShowAirdropModal(false);
    toastRef.current.toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-orange-400">$BSAI airdrop</strong> & <strong className="text-purple-400">offering</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
    });
  };

  const handleSimulateTrade = () => {
    if (!aiStrategy) {
         toastRef.current.toast({
            title: "No SHADOW Insight Available",
            description: "Please generate an analysis from SHADOW first.",
            variant: "default",
        });
        return;
    }
    if (aiStrategy.signal.toUpperCase() === 'HOLD') {
        toastRef.current.toast({
            title: "Cannot Simulate 'HOLD'",
            description: "A 'HOLD' signal indicates no action should be taken.",
            variant: "default",
        });
        return;
    }
    setShowConfirmTradeDialog(true);
  };

  const confirmSimulatedTrade = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        toastRef.current.toast({
            title: "User Not Found",
            description: "Cannot simulate trade without a user profile. Please sign up.",
            variant: "destructive",
        });
        setShowConfirmTradeDialog(false);
        return;
    }
    if (!aiStrategy) {
        setShowConfirmTradeDialog(false);
        return;
    }

    const result = await openSimulatedPositionAction(userId, aiStrategy);

    if (result.error) {
        toastRef.current.toast({
            title: <span className="text-destructive">Position Open Failed!</span>,
            description: <span className="text-foreground">{result.error}</span>,
            variant: "destructive",
        });
    } else {
        toastRef.current.toast({
            title: <span className="text-tertiary">Position Opened!</span>,
            description: <span>Simulated {aiStrategy?.signal} for {aiStrategy?.symbol} opened. View in your Portfolio.</span>,
            variant: "default",
        });
    }
    setShowConfirmTradeDialog(false);
  };

  const isButtonDisabled = isLoadingStrategy || isLoadingMarketData || isLoadingSymbols || (!isSignedUp && analysisCount >= MAX_GUEST_ANALYSES);

  return (
    <>
      <AppHeader />
      <div ref={mainContentRef} className="container mx-auto px-4 py-8 flex flex-col w-full">
        
        <div className="mb-8 w-full relative">
            <StrategyExplanationSection
                strategy={aiStrategy}
                liveMarketData={liveMarketData} 
                isLoading={isLoadingStrategy}
                error={strategyError}
                symbol={symbol}
                onSimulate={handleSimulateTrade}
            />
        </div>

        <div className="w-full space-y-6 mb-8">
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
            
            <Button
                onClick={handleGenerateStrategy}
                disabled={isButtonDisabled}
                className="w-full font-semibold py-3 text-base shadow-lg transition-all duration-300 ease-in-out generate-signal-button"
            >
                {isLoadingStrategy ? (
                    <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    SHADOW is Analyzing...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Signal
                    </>
                )}
            </Button>
            
            {!isSignedUp && analysisCount > 0 && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-orange-400">unlimited</strong>.
                </p>
            )}
        </div>
        
        {aiStrategy && liveMarketData && (
          <div className="mb-8">
            <SignalTracker
              aiStrategy={aiStrategy}
              liveMarketData={liveMarketData}
            />
          </div>
        )}

        {aiStrategy && !isLoadingStrategy && !strategyError && (
              <div>
                <ShadowMindInterface 
                    signalConfidence={aiStrategy.gpt_confidence_score}
                    currentThought={aiStrategy.currentThought}
                    sentimentMemory={aiStrategy.sentimentTransition || aiStrategy.sentiment}
                    prediction={aiStrategy.shortTermPrediction}
                />
              </div>
        )}
          <p className="text-xs text-center text-muted-foreground mt-4 font-code">
            🧠 SHADOW SEES: “Stability Decay Detected — Pulse Watch Activated”
        </p>

      </div>
      <ChatbotIcon onClick={handleToggleChat} />
      <ChatbotPopup isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      <AirdropSignupModal
        isOpen={showAirdropModal}
        onOpenChange={setShowAirdropModal}
        onSignupSuccess={handleAirdropSignupSuccess}
      />
      {aiStrategy && (
        <AlertDialog open={showConfirmTradeDialog} onOpenChange={setShowConfirmTradeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <ShieldQuestion className="mr-2 h-6 w-6 text-tertiary"/>
                Confirm Simulated Trade
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to open a simulated <strong className={aiStrategy.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{aiStrategy.signal}</strong> position
                for <strong className="text-primary">{symbol}</strong> based on SHADOW's parameters.
                <br />
                <br />
                This position will be tracked in your Portfolio. This is <strong className="text-accent">NOT a real trade</strong>.
                BlockShadow is not responsible for any actions taken based on this simulation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSimulatedTrade}
                className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
              >
                Open Simulated Position
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
