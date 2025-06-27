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
  generateShadowChoiceStrategyAction,
  fetchMarketDataAction,
  fetchAllTradingSymbolsAction,
  openSimulatedPositionAction,
  getOrCreateUserAction,
  type LiveMarketData,
  type FormattedSymbol,
  type UserProfile,
  fetchCurrentUserJson,
  type GenerateTradingStrategyOutput as AIOutputType,
  type GenerateShadowChoiceStrategyOutput,
} from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { useApiKeys } from '@/context/ApiKeyContext';
import { Loader2, Sparkles, ShieldQuestion, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

// This combined type will now encompass both standard and SHADOW's Choice outputs.
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
  const [showConfirmTradeDialog, setShowConfirmTradeDialog] = useState<boolean>(false);
  
  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Guest usage tracking
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>('');

  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);


  // Get or create user on initial load
  useEffect(() => {
    const initializeUser = async () => {
      setIsUserLoading(true);
      const userIdFromStorage = localStorage.getItem('currentUserId');
      try {
        const user = await getOrCreateUserAction(userIdFromStorage);
        setCurrentUser(user);
        if (user.id !== userIdFromStorage) {
          localStorage.setItem('currentUserId', user.id);
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
        toast({
          title: "User Session Error",
          description: "Could not initialize your analyst profile. Some features may be limited.",
          variant: "destructive",
        });
      }
      setIsUserLoading(false);
    };
    initializeUser();
  }, [toast]);
  

  // Load guest usage data from local storage
  useEffect(() => {
    if (!currentUser || currentUser.status !== 'Guest') {
        // If user is registered, don't apply guest limits
        setAnalysisCount(0);
        return;
    }

    const storedCount = localStorage.getItem('bsaiAnalysisCount');
    const storedDate = localStorage.getItem('bsaiLastAnalysisDate');
    const today = new Date().toISOString().split('T')[0];

    if (storedDate === today && storedCount) {
        setAnalysisCount(parseInt(storedCount, 10));
    } else {
        // Reset count for a new day or if no data exists
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


  const handleGenerateStrategy = useCallback(async () => {
    // Scroll to results block after generation
    setTimeout(() => {
        const resultsRef = document.getElementById('results-block');
        resultsRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        if(currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
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
      toast({
        title: "SHADOW's Insight Blocked",
        description: result.error,
        variant: "destructive",
      });
      if(currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount -1);
    } else {
      const resultWithId: AIStrategyOutput = {
          ...result,
          id: crypto.randomUUID(),
      };
      setAiStrategy(resultWithId);
      toast({
        title: <span className="text-accent">SHADOW's Insight Materialized!</span>,
        description: <span className="text-foreground">New analysis for <strong className="text-primary">{result.symbol}</strong> has been generated.</span>,
      });

      try {
        const history = JSON.parse(localStorage.getItem('bsaiSignalHistory') || '[]');
        const newEntry = { ...resultWithId, timestamp: new Date().toISOString() };
        const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep latest 20
        localStorage.setItem('bsaiSignalHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save signal to history:", e);
      }
    }
    setIsLoadingStrategy(false);
  }, [symbol, tradingMode, riskProfile, liveMarketData, currentUser, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData, toast]);

    const handleGenerateShadowChoice = useCallback(async () => {
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
                    description: "Guests are limited. Register for unlimited SHADOW's Choice analyses.",
                });
                return;
            }
            updateUsageData(currentCount + 1);
        }

        setIsLoadingShadowChoice(true);
        setStrategyError(null);
        setAiStrategy(null);

        let marketDataForAIString = '{}';
        let currentDataToUse = liveMarketData;

        if (!currentDataToUse || (currentDataToUse.symbol !== symbol)) {
            const result = await fetchAndSetMarketData(symbol, true);
            if ('error' in result) {
                setStrategyError("Market data unavailable. SHADOW's Choice aborted.");
                setIsLoadingShadowChoice(false);
                if (currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
                return;
            }
            currentDataToUse = result;
        }

        if (currentDataToUse) {
            marketDataForAIString = JSON.stringify(currentDataToUse);
        }

        const result = await generateShadowChoiceStrategyAction({ symbol, marketData: marketDataForAIString });

        if ('error' in result) {
            setStrategyError(result.error);
            setAiStrategy(null);
            toast({ title: "SHADOW's Choice Failed", description: result.error, variant: "destructive" });
            if (currentUser?.status === 'Guest' && analysisCount > 0) updateUsageData(analysisCount - 1);
        } else {
            const resultWithId: AIStrategyOutput = { ...result, id: crypto.randomUUID() };
            setAiStrategy(resultWithId);
            toast({
                title: <span className="text-tertiary">SHADOW's Choice Received!</span>,
                description: <span className="text-foreground">Autonomous analysis for <strong className="text-primary">{result.symbol}</strong> is complete.</span>,
            });
             try {
                const history = JSON.parse(localStorage.getItem('bsaiSignalHistory') || '[]');
                const newEntry = { ...resultWithId, timestamp: new Date().toISOString() };
                const updatedHistory = [newEntry, ...history].slice(0, 20);
                localStorage.setItem('bsaiSignalHistory', JSON.stringify(updatedHistory));
            } catch (e) {
                console.error("Failed to save signal to history:", e);
            }
        }
        setIsLoadingShadowChoice(false);
    }, [symbol, liveMarketData, currentUser, analysisCount, lastAnalysisDate, fetchAndSetMarketData, updateUsageData, toast]);


  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleAirdropSignupSuccess = async () => {
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-orange-400">$BSAI airdrop</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
    });
    // Refresh user data
     if (currentUser) {
        const updatedUser = await fetchCurrentUserJson(currentUser.id);
        if (updatedUser) {
            setCurrentUser(updatedUser);
        }
    }
  };

  const handleSimulateTrade = () => {
    if (!aiStrategy) {
         toast({
            title: "No SHADOW Insight Available",
            description: "Please generate an analysis from SHADOW first.",
            variant: "default",
        });
        return;
    }
    if (aiStrategy.signal.toUpperCase() === 'HOLD') {
        toast({
            title: "Cannot Simulate 'HOLD'",
            description: "A 'HOLD' signal indicates no action should be taken.",
            variant: "default",
        });
        return;
    }
    setShowConfirmTradeDialog(true);
  };

  const confirmSimulatedTrade = async () => {
    if (!currentUser) {
        toast({
            title: "User Not Found",
            description: "Cannot simulate trade without a user profile. Please refresh the page.",
            variant: "destructive",
        });
        setShowConfirmTradeDialog(false);
        return;
    }
    if (!aiStrategy) {
        setShowConfirmTradeDialog(false);
        return;
    }

    const result = await openSimulatedPositionAction(currentUser.id, aiStrategy);

    if (result.error) {
        toast({
            title: <span className="text-destructive">Position Open Failed!</span>,
            description: <span className="text-foreground">{result.error}</span>,
            variant: "destructive",
        });
    } else {
        toast({
            title: <span className="text-tertiary">Position Opened!</span>,
            description: <span>Simulated {aiStrategy?.signal} for {aiStrategy?.symbol} opened. View in your Portfolio.</span>,
            variant: "default",
        });
        // Mark the signal as executed in history
        if (aiStrategy?.id) {
            try {
                const history = JSON.parse(localStorage.getItem('bsaiSignalHistory') || '[]');
                const updatedHistory = history.map((signal: any) => {
                    if (signal.id === aiStrategy.id) {
                        return { ...signal, status: 'EXECUTED' };
                    }
                    return signal;
                });
                localStorage.setItem('bsaiSignalHistory', JSON.stringify(updatedHistory));
            } catch (e) {
                console.error("Failed to update signal status in history:", e);
            }
        }
    }
    setShowConfirmTradeDialog(false);
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
                        onClick={handleGenerateStrategy}
                        disabled={isButtonDisabled}
                        className="w-full font-semibold py-3 text-base shadow-lg transition-all duration-300 ease-in-out generate-signal-button"
                    >
                        {isLoadingStrategy ? (
                            <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            SHADOW is Analyzing...
                            </>
                        ) : isUserLoading ? (
                             <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Initializing Analyst Profile...
                            </>
                        ) : (
                            <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Signal
                            </>
                        )}
                    </Button>

                     <Button
                        onClick={handleGenerateShadowChoice}
                        disabled={isButtonDisabled}
                        className="w-full font-semibold py-3 text-base shadow-lg transition-all duration-300 ease-in-out shadow-choice-button"
                    >
                        {isLoadingShadowChoice ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                SHADOW is Deciding...
                            </>
                        ) : (
                            <>
                                <BrainCircuit className="mr-2 h-5 w-5" />
                                Invoke SHADOW's Choice
                            </>
                        )}
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
                        onSimulate={handleSimulateTrade}
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
      <AirdropSignupModal
        isOpen={showAirdropModal}
        onOpenChange={setShowAirdropModal}
        onSignupSuccess={handleAirdropSignupSuccess}
      />
      <ApiSettingsModal />
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
                This position is <strong className="text-accent">NOT a real trade</strong> and will be tracked in your portfolio.
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
