
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import ControlsTabs from '@/components/blocksmith-ai/ControlsTabs';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
import WelcomeScreen from '@/components/blocksmith-ai/WelcomeScreen';
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
import { Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

const DEFAULT_SYMBOLS: FormattedSymbol[] = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
];

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

  const { toast } = useToast();

  const appHeaderRef = useRef<HTMLDivElement>(null); 
  const controlPanelRef = useRef<HTMLDivElement>(null); 
  const mainDisplayAreaRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const liveTickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // GSAP animation for main content area after welcome screen
  useEffect(() => {
    if (!showWelcomeScreen && mainContentRef.current) {
      const elementsToAnimate = [
        liveTickerRef.current, 
        controlPanelRef.current,
        mainDisplayAreaRef.current,
      ].filter(Boolean);

      if (elementsToAnimate.length > 0) {
        gsap.from(elementsToAnimate, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          stagger: 0.2, 
          delay: 0.3, 
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
  
  const fetchStrategy = useCallback(async () => {
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
            return;
        }
    } else if (marketDataError && !currentDataToUse) { 
        setStrategyError(`Market data unavailable: ${marketDataError}. Strategy generation aborted.`);
        toast({
            title: "Market Data Error",
            description: `Cannot generate strategy: ${marketDataError}`,
            variant: "destructive",
        });
        setIsLoadingStrategy(false);
        return;
    }

    if (currentDataToUse) {
        marketDataForAIString = JSON.stringify({
            symbol: currentDataToUse.symbol,
            price: currentDataToUse.lastPrice,
            price_change_percent_24h: `${parseFloat(currentDataToUse.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(currentDataToUse.priceChangePercent).toFixed(2)}%`,
            volume_24h_base: `${currentDataToUse.volume} ${currentDataToUse.symbol.replace('USDT', '')}`,
            volume_24h_quote: `${currentDataToUse.quoteVolume} USDT`,
            high_24h: currentDataToUse.highPrice,
            low_24h: currentDataToUse.lowPrice,
        });
    } else {
        toast({
            title: "Insufficient Data",
            description: "Not enough market data to generate a strategy. Please try again or check market data source.",
            variant: "destructive",
        });
        setStrategyError("Insufficient market data for strategy generation.");
        setIsLoadingStrategy(false);
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
    } else {
      setAiStrategy(result);
       toast({
        title: "AI Edge Revealed!",
        description: `New AI strategy generated for ${symbol}.`,
      });
    }
    setIsLoadingStrategy(false);
  }, [symbol, interval, selectedIndicators, riskLevel, toast, liveMarketData, fetchAndSetMarketData, marketDataError]);

  const handleProceedFromWelcome = () => {
    setShowWelcomeScreen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div ref={appHeaderRef}> 
        <AppHeader />
      </div>
      
      {showWelcomeScreen ? (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <WelcomeScreen onProceed={handleProceedFromWelcome} />
        </main>
      ) : (
        <>
          <div ref={liveTickerRef} className="w-full sticky top-0 z-40">
            <LivePriceTicker />
          </div>
          <main ref={mainContentRef} className="flex-grow container mx-auto px-4 py-8 flex flex-col w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-6 flex flex-col" ref={controlPanelRef}>
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
                <Button 
                  onClick={fetchStrategy} 
                  disabled={isLoadingStrategy || isLoadingMarketData || !!marketDataError || isLoadingSymbols} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base shadow-lg border-2 border-transparent hover:border-accent hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.7)] transition-all duration-300 ease-in-out"
                >
                  {isLoadingStrategy ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Unlocking Your Edge...
                    </>
                  ) : (
                    "Reveal My AI Edge!"
                  )}
                </Button>
                 {marketDataError && !liveMarketData && ( 
                    <p className="text-xs text-center text-red-400">{marketDataError}</p>
                )}
              </div>

              <div className="lg:col-span-2 space-y-8" ref={mainDisplayAreaRef}>
                <div className="bg-card p-1 rounded-lg shadow-xl">
                  <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
                </div>
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
        </>
      )}
      <footer className="text-center py-4 mt-auto text-sm text-muted-foreground border-t border-border/50">
        {currentYear ? `© ${currentYear} ` : ''}BlockSmithAI. Powered by Google AI. Not financial advice.
      </footer>
    </div>
  );
}
