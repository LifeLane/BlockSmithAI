
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import ControlsTabs from '@/components/blocksmith-ai/ControlsTabs';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
import WelcomeScreen from '@/components/blocksmith-ai/WelcomeScreen';
import ChatbotIcon from '@/components/blocksmith-ai/ChatbotIcon';
import ChatbotPopup from '@/components/blocksmith-ai/ChatbotPopup';
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import { Button } from '@/components/ui/button';
import {
  generateTradingStrategyAction,
  fetchMarketDataAction,
  fetchAllTradingSymbolsAction,
  type LiveMarketData,
  type FormattedSymbol
} from './actions';
import type { GenerateTradingStrategyOutput, GenerateTradingStrategyInput } from '@/ai/flows/generate-trading-strategy';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];

const MAX_GUEST_ANALYSES = 3;

export default function BlockSmithAIPage() {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('15');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['RSI', 'EMA']);
  const [riskLevel, setRiskLevel] = useState<string>('Medium');

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


  const { toast } = useToast();

  const appHeaderRef = useRef<HTMLDivElement>(null);
  const controlPanelRef = useRef<HTMLDivElement>(null);
  const strategyExplanationRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const liveTickerRef = useRef<HTMLDivElement>(null);
  const tradingViewWidgetWrapperRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const updateUsageData = (newCount: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bsaiAnalysisCount', newCount.toString());
    localStorage.setItem('bsaiLastAnalysisDate', today);
    setAnalysisCount(newCount);
    setLastAnalysisDate(today);
  };


  useEffect(() => {
    if (!showWelcomeScreen && mainContentRef.current) {
      window.scrollTo(0, 0); // Scroll to top when welcome screen is hidden

      const elementsToAnimate = [
        liveTickerRef.current,
        tradingViewWidgetWrapperRef.current,
        controlPanelRef.current,
        strategyExplanationRef.current,
      ].filter(Boolean);

      if (elementsToAnimate.length > 0) {
        gsap.from(elementsToAnimate, {
          opacity: 0,
          y: -50, // Animate from above
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3, // Slight delay for scroll to settle and better visual
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
      }
      setIsLoadingSymbols(false);
    };
    loadSymbols();
  }, [toast]);

  const handleIndicatorChange = (indicator: string, checked: boolean) => {
    setSelectedIndicators((prev) =>
      checked ? [...prev, indicator] : prev.filter((i) => i !== indicator)
    );
  };

  const fetchAndSetMarketData = useCallback(async (currentSymbol: string): Promise<LiveMarketData | null> => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);

    const result = await fetchMarketDataAction({ symbol: currentSymbol });

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
      setMarketDataError(null);
      setIsLoadingMarketData(false);
      return result;
    }
  }, [toast]);

  useEffect(() => {
    if (!showWelcomeScreen && symbol) {
      fetchAndSetMarketData(symbol);
    } else if (!showWelcomeScreen) {
      setLiveMarketData(null);
      setMarketDataError("No symbol selected to fetch market data.");
    }
  }, [symbol, fetchAndSetMarketData, showWelcomeScreen]);

  const handleGenerateStrategy = useCallback(async () => {
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
          description: <span className="text-foreground">Guests are limited to <strong className="text-accent">3 analyses per day</strong>. <strong className="text-primary">Sign up</strong> for <strong className="text-tertiary">unlimited access</strong> & the <strong className="text-orange-400">BSAI airdrop!</strong></span>,
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
        const fetchedData = await fetchAndSetMarketData(symbol);
        if (fetchedData) {
            currentDataToUse = fetchedData;
        } else {
            const errorMsg = marketDataError || "Market data is unavailable. Cannot generate strategy.";
            setStrategyError(errorMsg);
            toast({
                title: "Strategy Aborted",
                description: errorMsg,
                variant: "destructive",
            });
            setIsLoadingStrategy(false);
            if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
            return;
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
        return;
    }

    const input: GenerateTradingStrategyInput = {
      symbol,
      interval: `${interval}m`,
      indicators: selectedIndicators,
      riskLevel,
      marketData: marketDataForAIString,
    };

    const result = await generateTradingStrategyAction(input);

    if ('error' in result) {
      setStrategyError(result.error);
      toast({
        title: "Strategy Generation Failed",
        description: result.error,
        variant: "destructive",
      });
      if(!isSignedUp && analysisCount > 0) updateUsageData(analysisCount -1);
    } else {
      setAiStrategy(result);
       toast({
        title: <span className="text-accent">AI Edge Revealed!</span>,
        description: <span className="text-foreground">New AI strategy generated for <strong className="text-primary">{symbol}</strong>.</span>,
      });
    }
    setIsLoadingStrategy(false);
  }, [symbol, interval, selectedIndicators, riskLevel, toast, liveMarketData, fetchAndSetMarketData, marketDataError, isSignedUp, analysisCount, lastAnalysisDate, updateUsageData]);

  const handleProceedFromWelcome = () => {
    setShowWelcomeScreen(false);
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const handleAirdropSignupSuccess = () => {
    setIsSignedUp(true);
    localStorage.setItem('bsaiIsSignedUp', 'true');
    setShowAirdropModal(false);
    toast({
      title: <span className="text-accent">Signup Successful!</span>,
      description: <span className="text-foreground">You're all set for the <strong className="text-orange-400">airdrop</strong> & <strong className="text-purple-400">offering</strong>. <strong className="text-primary">Unlimited analyses</strong> unlocked!</span>,
    });
  };

  const isButtonDisabled = isLoadingStrategy ||
                           isLoadingMarketData ||
                           !!marketDataError ||
                           isLoadingSymbols ||
                           (!isSignedUp && analysisCount >= MAX_GUEST_ANALYSES && !showAirdropModal);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div ref={appHeaderRef}>
        <AppHeader />
      </div>

      {showWelcomeScreen ? (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
          <WelcomeScreen onProceed={handleProceedFromWelcome} />
        </main>
      ) : (
        <>
          <div ref={liveTickerRef} className="w-full sticky top-0 z-40">
            <LivePriceTicker />
          </div>
          <main ref={mainContentRef} className="flex-grow container mx-auto px-4 py-8 flex flex-col w-full">
            <div ref={tradingViewWidgetWrapperRef} className="bg-card p-1 rounded-lg shadow-xl mb-8">
              <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               {/* Control Panel Column (Source Order 1, Visual Order 1 on LG) */}
              <div className="lg:col-span-1 space-y-6 flex flex-col lg:order-1" ref={controlPanelRef}>
                <SymbolIntervalSelectors
                  symbol={symbol}
                  onSymbolChange={setSymbol}
                  interval={interval}
                  onIntervalChange={setInterval}
                  symbols={availableSymbols}
                  isLoadingSymbols={isLoadingSymbols}
                />
                <ControlsTabs
                  selectedIndicators={selectedIndicators}
                  onIndicatorChange={handleIndicatorChange}
                  riskLevel={riskLevel}
                  onRiskChange={setRiskLevel}
                  liveMarketData={liveMarketData}
                  isLoadingMarketData={isLoadingMarketData}
                  marketDataError={marketDataError}
                  symbolForDisplay={symbol}
                />
                 {marketDataError && !liveMarketData && (
                    <p className="text-xs text-center text-red-400">{marketDataError}</p>
                )}
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isButtonDisabled}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base shadow-lg border-2 border-transparent hover:border-primary hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.7)] transition-all duration-300 ease-in-out mt-auto"
                >
                  {isLoadingStrategy ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Unlocking Your Edge...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                       Reveal My AI Edge!
                    </>
                  )}
                </Button>
                {!isSignedUp && analysisCount > 0 && (
                   <p className="text-xs text-center text-muted-foreground mt-2">
                     Analyses today: <strong className="text-primary">{analysisCount}</strong> / <strong className="text-accent">{MAX_GUEST_ANALYSES}</strong>. <button onClick={() => setShowAirdropModal(true)} className="underline text-tertiary hover:text-accent">Sign up</button> for <strong className="text-orange-400">unlimited</strong>.
                   </p>
                )}
              </div>

              {/* Strategy Explanation Column (Source Order 2, Visual Order 2 on LG) */}
              <div className="lg:col-span-2 space-y-8 lg:order-2" ref={strategyExplanationRef}>
                <StrategyExplanationSection
                  strategy={aiStrategy}
                  liveMarketData={liveMarketData}
                  isLoading={isLoadingStrategy}
                  error={strategyError}
                  symbol={symbol}
                />
              </div>
            </div>
          </main>
          <ChatbotIcon onClick={handleToggleChat} />
          <ChatbotPopup isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
          <AirdropSignupModal
            isOpen={showAirdropModal}
            onOpenChange={setShowAirdropModal}
            onSignupSuccess={handleAirdropSignupSuccess}
          />
        </>
      )}
      <footer className="text-center py-4 px-6 mt-auto text-sm text-muted-foreground border-t border-border/50">
        {currentYear ? `© ${currentYear} ` : ''}<strong className="text-primary">BlockSmithAI</strong> (because someone has to build this <strong className="text-accent">awesome</strong> stuff).
        Not financial advice, <strong className="text-tertiary">obviously</strong>. Do Your Own Research, <strong className="text-orange-400">genius</strong>! 🧐
      </footer>
    </div>
  );

    