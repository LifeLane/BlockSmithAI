
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
// IndicatorSelector, RiskSelector, and ControlsTabs are removed
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
// WelcomeScreen component is no longer used directly for its previous content
import ChatbotIcon from '@/components/blocksmith-ai/ChatbotIcon';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import ApiSettingsModal from '@/components/blocksmith-ai/ApiSettingsModal';
import ExchangeLinkCard from '@/components/blocksmith-ai/ExchangeLinkCard';
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
  type LiveMarketData,
  type FormattedSymbol
} from './actions';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy'; // Keep this type
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ShieldQuestion, LogIn } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from "@/lib/utils";

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];
const INITIAL_WELCOME_SYMBOL = 'BTCUSDT';
const MAX_GUEST_ANALYSES = 3;

export default function BlockSmithAIPage() {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [symbol, setSymbol] = useState<string>(INITIAL_WELCOME_SYMBOL); // Default symbol for welcome screen
  const [interval, setInterval] = useState<string>('15');

  // Removed selectedIndicators and riskLevel states
  // const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['RSI', 'EMA']);
  // const [riskLevel, setRiskLevel] = useState<string>('Medium');

  const [aiStrategy, setAiStrategy] = useState<GenerateTradingStrategyOutput | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [availableSymbols, setAvailableSymbols] = useState<FormattedSymbol[]>(DEFAULT_SYMBOLS);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState<boolean>(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>('');
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [showAirdropModal, setShowAirdropModal] = useState<boolean>(false);

  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [apiKeysSet, setApiKeysSet] = useState<boolean>(false);
  const [showApiSettingsModal, setShowApiSettingsModal] = useState<boolean>(false);
  const [showConfirmTradeDialog, setShowConfirmTradeDialog] = useState<boolean>(false);


  const { toast } = useToast();

  const appHeaderRef = useRef<HTMLDivElement>(null);
  const strategyBannerRef = useRef<HTMLDivElement>(null);
  // marketDataBannerRef is removed as MarketDataDisplay is now part of welcome or not in main view
  const shadowMindInterfaceRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const liveTickerRef = useRef<HTMLDivElement>(null);
  const symbolSelectorsRef = useRef<HTMLDivElement>(null);
  const tradingViewWidgetRef = useRef<HTMLDivElement>(null);
  const controlsContainerRef = useRef<HTMLDivElement>(null); // Will now hold selectors, CTA, ExchangeLinkCard


  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
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

    const storedApiKey = localStorage.getItem('bsaiApiKey');
    const storedApiSecret = localStorage.getItem('bsaiApiSecret');
    if (storedApiKey && storedApiSecret) {
      setApiKey(storedApiKey);
      setApiSecret(storedApiSecret);
      setApiKeysSet(true);
    }
  }, []);

  const updateUsageData = (newCount: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bsaiAnalysisCount', newCount.toString());
    localStorage.setItem('bsaiLastAnalysisDate', today);
    setAnalysisCount(newCount);
    setLastAnalysisDate(today);
  };

  const handleSaveApiKeys = (newApiKey: string, newApiSecret: string) => {
    localStorage.setItem('bsaiApiKey', newApiKey);
    localStorage.setItem('bsaiApiSecret', newApiSecret);
    setApiKey(newApiKey);
    setApiSecret(newApiSecret);
    setApiKeysSet(true);
    setShowApiSettingsModal(false);
    toast({ title: "API Keys Saved", description: "Your Binance API keys have been saved locally." });
  };

  const handleClearApiKeys = () => {
    localStorage.removeItem('bsaiApiKey');
    localStorage.removeItem('bsaiApiSecret');
    setApiKey('');
    setApiSecret('');
    setApiKeysSet(false);
    setShowApiSettingsModal(false);
    toast({ title: "API Keys Cleared", description: "Your Binance API keys have been cleared from local storage." });
  };


  useEffect(() => {
    if (!showWelcomeScreen && mainContentRef.current) {
      const elementsToAnimate = [
        liveTickerRef.current, // Animate ticker when main app shows
        strategyBannerRef.current,
        controlsContainerRef.current, // Unified controls (selectors, CTA, exchange link)
        tradingViewWidgetRef.current,
        shadowMindInterfaceRef.current,
      ].filter(Boolean);

      if (elementsToAnimate.length > 0) {
        gsap.from(elementsToAnimate, {
          opacity: 0,
          y: -30,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.2,
          ease: 'power3.out',
        });
      }
    }
  }, [showWelcomeScreen]);


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
        // If the initial welcome symbol isn't in the fetched list, update to the first available.
        if (!result.find(s => s.value === INITIAL_WELCOME_SYMBOL) && result.length > 0) {
            setSymbol(result[0].value);
        }
      }
      setIsLoadingSymbols(false);
    };
    loadSymbols();
  }, [toast]);

  // Removed handleIndicatorChange and handleRiskChange

  const fetchAndSetMarketData = useCallback(async (currentSymbolToFetch: string): Promise<LiveMarketData | null> => {
    setIsLoadingMarketData(true);
    setMarketDataError(null); // Clear previous errors
    const result = await fetchMarketDataAction({ symbol: currentSymbolToFetch });

    if ('error' in result) {
      setMarketDataError(result.error);
      setLiveMarketData(null);
      toast({
        title: "Market Data Error",
        description: result.error,
        variant: "destructive",
      });
      setIsLoadingMarketData(false);
      return null;
    } else {
      setLiveMarketData(result);
      setMarketDataError(null); // Clear error on success
      setIsLoadingMarketData(false);
      return result;
    }
  }, [toast]);

  // Fetch market data for welcome screen or when symbol changes in main app
  useEffect(() => {
    if (symbol) { // Ensure symbol is set before fetching
        fetchAndSetMarketData(symbol);
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
        toast({
          title: "Daily Limit Reached",
          description: <span className="text-foreground">Guests are limited to <strong className="text-accent">3 analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong> & the <strong className="text-orange-400">$BSAI airdrop!</strong></span>,
          variant: "default",
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

    if (!currentDataToUse || (currentDataToUse.symbol !== symbol && !marketDataError)) {
        const fetchedData = await fetchAndSetMarketData(symbol); // Ensure data is for the current symbol
        if (fetchedData) {
            currentDataToUse = fetchedData;
        }
    } else if (marketDataError && !currentDataToUse) {
        setStrategyError("Market data unavailable: " + marketDataError + ". Strategy generation aborted.");
        toast({
            title: "Market Data Error",
            description: "Cannot generate strategy: " + marketDataError,
            variant: "destructive",
        });
        setIsLoadingStrategy(false);
        if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (currentDataToUse) {
        const priceChangePercentVal = parseFloat(currentDataToUse.priceChangePercent);
        const formattedPriceChangePercent = `${priceChangePercentVal >= 0 ? '+' : ''}${priceChangePercentVal.toFixed(2)}%`;
        const baseAsset = currentDataToUse.symbol.replace('USDT', '');
        const formattedVolumeBase = `${parseFloat(currentDataToUse.volume).toLocaleString(undefined, {maximumFractionDigits: 3})} ${baseAsset}`;
        const formattedVolumeQuote = `${parseFloat(currentDataToUse.quoteVolume).toLocaleString(undefined, {maximumFractionDigits: 2})} USDT`;
        const lastPriceFormatted = parseFloat(currentDataToUse.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, (currentDataToUse.lastPrice.toString().split('.')[1]?.length || 0))});
        const highPriceFormatted = parseFloat(currentDataToUse.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        const lowPriceFormatted = parseFloat(currentDataToUse.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

        marketDataForAIString = JSON.stringify({
            symbol: currentDataToUse.symbol,
            price: lastPriceFormatted,
            price_change_percent_24h: formattedPriceChangePercent,
            volume_24h_base: formattedVolumeBase,
            volume_24h_quote: formattedVolumeQuote,
            high_24h: highPriceFormatted,
            low_24h: lowPriceFormatted,
        });
    } else {
        toast({
            title: "Insufficient Data",
            description: "Not enough market data to generate a strategy. Please try again or check market data source.",
            variant: "destructive",
        });
        setStrategyError("Insufficient market data for strategy generation.");
        setIsLoadingStrategy(false);
        if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Input for AI now simplified (no indicators, no riskLevel)
    const inputForAI = {
      symbol,
      interval: `${interval}m`,
      marketData: marketDataForAIString,
    };

    const result = await generateTradingStrategyAction(inputForAI);

    if ('error' in result) {
      setStrategyError(result.error);
      setAiStrategy(null);
      toast({
        title: "SHADOW's Insight Blocked",
        description: result.error,
        variant: "destructive",
      });
      if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
    } else {
      setAiStrategy(result);
       toast({
        title: <span className="text-accent">SHADOW's Insight Materialized!</span>,
        description: <span className="text-foreground">New analysis for <strong className="text-primary">{symbol}</strong> has been generated.</span>,
      });
    }
    setIsLoadingStrategy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [symbol, interval, toast, liveMarketData, fetchAndSetMarketData, marketDataError, isSignedUp, analysisCount, lastAnalysisDate, updateUsageData]);

  const handleProceedFromWelcome = () => {
    setShowWelcomeScreen(false);
    // Optionally, fetch data for a default main screen symbol if different from welcome
    // or rely on user selecting a symbol. For now, 'symbol' state persists.
    window.scrollTo(0, 0);
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const handleAirdropSignupSuccess = () => {
    setIsSignedUp(true);
    localStorage.setItem('bsaiIsSignedUp', 'true');
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">BlockShadow Registration Complete!</span>,
      description: <span className="text-foreground">You're confirmed for the <strong className="text-orange-400">$BSAI airdrop</strong> & <strong className="text-purple-400">offering</strong>. <strong className="text-primary">Unlimited SHADOW analyses</strong> unlocked!</span>,
    });
  };

  const handleAttemptSimulatedTrade = () => {
    if (apiKeysSet && aiStrategy) {
      setShowConfirmTradeDialog(true);
    } else if (!apiKeysSet) {
      toast({
        title: "API Keys Required",
        description: "Please configure your Binance API keys to simulate trades.",
        variant: "destructive",
      });
      setShowApiSettingsModal(true);
    } else if (!aiStrategy) {
         toast({
            title: "No SHADOW Insight Available",
            description: "Please generate an analysis from SHADOW first.",
            variant: "default",
        });
    }
  };

  const confirmSimulatedTrade = () => {
     toast({
        title: <span className="text-tertiary">Trade Simulation Initiated!</span>,
        description: <span className="text-foreground">Simulating <strong className={aiStrategy?.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{aiStrategy?.signal}</strong> for <strong className="text-primary">{aiStrategy?.symbol || symbol}</strong>. This is for dev/demo.</span>,
        variant: "default",
      });
      setShowConfirmTradeDialog(false);
  }

  const isButtonDisabled = isLoadingStrategy ||
                           isLoadingMarketData || // This now primarily affects the welcome screen
                           !!marketDataError && showWelcomeScreen || // Only block CTA if error on welcome
                           isLoadingSymbols || // Still relevant for main app selectors
                           (!isSignedUp && analysisCount >= MAX_GUEST_ANALYSES && !showAirdropModal);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div ref={appHeaderRef}>
        <AppHeader />
      </div>

      {showWelcomeScreen ? (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl"> {/* Container for MarketDataDisplay on welcome */}
            <MarketDataDisplay
                symbolForDisplay={symbol}
                liveMarketData={liveMarketData}
                isLoading={isLoadingMarketData}
                error={marketDataError}
            />
          </div>
          <Button
            onClick={handleProceedFromWelcome}
            disabled={isLoadingMarketData || !!marketDataError} // Disable if market data fails on welcome
            className="mt-8 glow-button py-3 px-8 text-lg"
          >
            {isLoadingMarketData ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                 <LogIn className="mr-2 h-5 w-5" />
            )}
            Proceed to Analysis Core
          </Button>
           {marketDataError && <p className="text-sm text-red-400 mt-4 text-center">{marketDataError}</p>}
        </main>
      ) : (
        <>
          <div ref={liveTickerRef} className="w-full sticky top-0 z-40">
            <LivePriceTicker />
          </div>
          <main ref={mainContentRef} className="flex-grow container mx-auto px-4 py-8 flex flex-col w-full">

            <div ref={strategyBannerRef} className="mb-8 w-full relative">
              <StrategyExplanationSection
                strategy={aiStrategy}
                liveMarketData={liveMarketData} // This liveMarketData is updated by SymbolIntervalSelectors
                isLoading={isLoadingStrategy}
                error={strategyError}
                symbol={symbol}
              />
            </div>
            
            {/* MarketDataDisplay as a banner is REMOVED from here */}

            {/* Unified Controls Container - Simplified */}
            <div ref={controlsContainerRef} className="w-full space-y-6 mb-8">
              <div ref={symbolSelectorsRef} className="w-full">
                <SymbolIntervalSelectors
                  symbol={symbol}
                  onSymbolChange={setSymbol} // This will trigger fetchAndSetMarketData for main view
                  interval={interval}
                  onIntervalChange={setInterval}
                  symbols={availableSymbols}
                  isLoadingSymbols={isLoadingSymbols}
                />
              </div>
              {/* IndicatorSelector and RiskSelector are REMOVED */}
              
              <Button
                onClick={handleGenerateStrategy}
                disabled={isButtonDisabled} // Updated disability logic
                className="w-full bg-accent hover:bg-primary text-accent-foreground hover:text-primary-foreground font-semibold py-3 text-base shadow-lg border-2 border-transparent hover:border-primary hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.7)] transition-all duration-300 ease-in-out glow-button"
              >
                {isLoadingStrategy ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    SHADOW is Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                     Invoke SHADOW's Insight
                  </>
                )}
              </Button>
              
              <ExchangeLinkCard
                apiKeysSet={apiKeysSet}
                onConfigureKeys={() => setShowApiSettingsModal(true)}
                onPlaceTrade={handleAttemptSimulatedTrade}
                strategyAvailable={!!aiStrategy}
              />

              {!isSignedUp && analysisCount > 0 && (
                 <p className="text-xs text-center text-muted-foreground mt-2">
                   Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Register</button> for <strong className="text-orange-400">unlimited</strong>.
                 </p>
              )}
            </div>
            
            {aiStrategy && !isLoadingStrategy && !strategyError && (
                 <div ref={shadowMindInterfaceRef}>
                    <ShadowMindInterface 
                        signalConfidence={aiStrategy.gpt_confidence_score}
                        currentThought={aiStrategy.currentThought}
                        sentimentMemory={aiStrategy.sentimentTransition || aiStrategy.sentiment}
                        prediction={aiStrategy.shortTermPrediction}
                    />
                 </div>
            )}

            <div ref={tradingViewWidgetRef} className="w-full bg-card p-1 rounded-lg shadow-xl mt-8">
              <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={[]} /> {/* Pass empty array for indicators */}
               <p className="text-xs text-center text-muted-foreground mt-2 p-2">
                🧠 SHADOW SEES: “Stability Decay Detected — Pulse Watch Activated”
               </p>
            </div>

          </main>
          <ChatbotIcon onClick={handleToggleChat} />
          <ChatbotPopup isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
          <AirdropSignupModal
            isOpen={showAirdropModal}
            onOpenChange={setShowAirdropModal}
            onSignupSuccess={handleAirdropSignupSuccess}
          />
          <ApiSettingsModal
            isOpen={showApiSettingsModal}
            onOpenChange={setShowApiSettingsModal}
            currentApiKey={apiKey}
            currentApiSecret={apiSecret}
            onSave={handleSaveApiKeys}
            onClear={handleClearApiKeys}
            apiKeysAreSet={apiKeysSet}
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
                    You are about to simulate placing a <strong className={aiStrategy.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{aiStrategy.signal}</strong> order
                    for <strong className="text-primary">{symbol}</strong>.
                    <br />
                    <br />
                    This is <strong className="text-accent">NOT a real trade</strong> and is for demonstration purposes only.
                    BlockShadow is not responsible for any actions taken based on this simulation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmSimulatedTrade}
                    className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
                  >
                    Proceed with Simulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
      <footer className={cn(
        "text-center py-4 px-6 mt-auto text-xs text-muted-foreground border-t border-border/50 font-code",
        !showWelcomeScreen && "mb-24" 
      )}>
        {currentYear ? `© ${currentYear} ` : ''}<strong className="text-primary">BlockShadow</strong> (The architects of SHADOW).
        Not financial advice, <strong className="text-tertiary">obviously</strong>. The chain is listening. 👁️
        <br />
        🧠 ShadowMind is evolving. Every trade feeds the mind.
      </footer>
    </div>
  );
}
    