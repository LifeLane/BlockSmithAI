
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import IndicatorSelector from '@/components/blocksmith-ai/IndicatorSelector';
import RiskSelector from '@/components/blocksmith-ai/RiskSelector';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
import WelcomeScreen from '@/components/blocksmith-ai/WelcomeScreen';
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
import type { GenerateTradingStrategyOutput, GenerateTradingStrategyInput } from '@/ai/flows/generate-trading-strategy';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ShieldQuestion } from 'lucide-react';
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

  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [apiKeysSet, setApiKeysSet] = useState<boolean>(false);
  const [showApiSettingsModal, setShowApiSettingsModal] = useState<boolean>(false);
  const [showConfirmTradeDialog, setShowConfirmTradeDialog] = useState<boolean>(false);


  const { toast } = useToast();

  const appHeaderRef = useRef<HTMLDivElement>(null);
  const strategyBannerRef = useRef<HTMLDivElement>(null); 
  const mainContentRef = useRef<HTMLDivElement>(null);
  const liveTickerRef = useRef<HTMLDivElement>(null);
  const symbolSelectorsRef = useRef<HTMLDivElement>(null);
  const tradingViewWidgetRef = useRef<HTMLDivElement>(null);
  const controlsContainerRef = useRef<HTMLDivElement>(null);


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
        liveTickerRef.current,
        strategyBannerRef.current, 
        symbolSelectorsRef.current,
        tradingViewWidgetRef.current,
        controlsContainerRef.current, 
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [symbol, interval, selectedIndicators, riskLevel, toast, liveMarketData, fetchAndSetMarketData, marketDataError, isSignedUp, analysisCount, lastAnalysisDate, updateUsageData]);

  const handleProceedFromWelcome = () => {
    setShowWelcomeScreen(false);
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
      title: <span className="text-accent">Signup Successful!</span>,
      description: <span className="text-foreground">You're all set for the <strong className="text-orange-400">airdrop</strong> & <strong className="text-purple-400">offering</strong>. <strong className="text-primary">Unlimited analyses</strong> unlocked!</span>,
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
            title: "No Strategy Available",
            description: "Please generate an AI strategy first.",
            variant: "default",
        });
    }
  };

  const confirmSimulatedTrade = () => {
     toast({
        title: <span className="text-tertiary">Trade Simulation Initiated!</span>,
        description: <span className="text-foreground">Simulating <strong className={aiStrategy?.signal?.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}>{aiStrategy?.signal}</strong> for <strong className="text-primary">{aiStrategy?.symbol || symbol}</strong>. This is a DEV feature.</span>,
        variant: "default",
      });
      setShowConfirmTradeDialog(false);
  }

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
        <main className="flex-grow container mx-auto px-4 py-2 flex flex-col items-center justify-center">
          <WelcomeScreen onProceed={handleProceedFromWelcome} />
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
                liveMarketData={liveMarketData}
                isLoading={isLoadingStrategy}
                error={strategyError}
                symbol={symbol}
              />
            </div>
            
            <div ref={symbolSelectorsRef} className="mb-6 w-full">
              <SymbolIntervalSelectors
                symbol={symbol}
                onSymbolChange={setSymbol}
                interval={interval}
                onIntervalChange={setInterval}
                symbols={availableSymbols}
                isLoadingSymbols={isLoadingSymbols}
              />
            </div>

            <div ref={tradingViewWidgetRef} className="mb-8 w-full bg-card p-1 rounded-lg shadow-xl">
              <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
            </div>

            <div ref={controlsContainerRef} className="w-full mt-8">
              <div className="w-full max-w-lg mx-auto space-y-6 flex flex-col">
                <MarketDataDisplay
                  liveMarketData={liveMarketData}
                  isLoading={isLoadingMarketData}
                  error={marketDataError}
                  symbolForDisplay={symbol}
                />
                <IndicatorSelector
                  selectedIndicators={selectedIndicators}
                  onIndicatorChange={handleIndicatorChange}
                />
                <RiskSelector 
                  riskLevel={riskLevel} 
                  onRiskChange={setRiskLevel} 
                />
                <ExchangeLinkCard
                  apiKeysSet={apiKeysSet}
                  onConfigureKeys={() => setShowApiSettingsModal(true)}
                  onPlaceTrade={handleAttemptSimulatedTrade}
                  strategyAvailable={!!aiStrategy}
                />
                 {marketDataError && !liveMarketData && (
                    <p className="text-xs text-center text-red-400">{marketDataError}</p>
                )}
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isButtonDisabled}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base shadow-lg border-2 border-transparent hover:border-primary hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.7)] transition-all duration-300 ease-in-out"
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
                    for <strong className="text-primary">{aiStrategy.symbol || symbol}</strong>.
                    <br />
                    <br />
                    This is <strong className="text-accent">NOT a real trade</strong> and is for demonstration purposes only. 
                    BlockSmithAI is not responsible for any actions taken based on this simulation.
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
      <footer className="text-center py-4 px-6 mt-auto text-sm text-muted-foreground border-t border-border/50">
        {currentYear ? `© ${currentYear} ` : ''}<strong className="text-primary">BlockSmithAI</strong> (because someone has to build this <strong className="text-accent">awesome</strong> stuff).
        Not financial advice, <strong className="text-tertiary">obviously</strong>. Do Your Own Research, <strong className="text-orange-400">genius</strong>! 🧐
      </footer>
    </div>
  );
}

    

    