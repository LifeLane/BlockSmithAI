
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import ControlsTabs from '@/components/blocksmith-ai/ControlsTabs';
import StrategyExplanationSection from '@/components/blocksmith-ai/StrategyExplanationSection';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
import { Button } from '@/components/ui/button';
import { generateTradingStrategyAction, fetchMarketDataAction, type LiveMarketData } from './actions';
import type { GenerateTradingStrategyOutput, GenerateTradingStrategyInput } from '@/ai/flows/generate-trading-strategy';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

export default function BlockSmithAIPage() {
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

  const { toast } = useToast();

  const appHeaderRef = useRef<HTMLDivElement>(null); // Ref for the header container div
  const controlPanelRef = useRef<HTMLDivElement>(null); 
  const mainDisplayAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // AppHeader now handles its own animation.
    // Animate control panel and main display area.
    const elementsToAnimate = [
      controlPanelRef.current,
      mainDisplayAreaRef.current,
    ].filter(Boolean);

    if (elementsToAnimate.length > 0) {
      gsap.from(elementsToAnimate, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.25, 
        delay: 0.5, // Delay to allow header animation to start
        ease: 'power3.out',
      });
    }
  }, []);

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
    if (symbol) {
      fetchAndSetMarketData(symbol);
    } else {
      setLiveMarketData(null); 
      setMarketDataError("No symbol selected to fetch market data.");
    }
  }, [symbol, fetchAndSetMarketData]);
  
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


  return (
    <div className="min-h-screen flex flex-col pb-12 bg-background">
      <div ref={appHeaderRef}> {/* Wrapper for AppHeader */}
        <AppHeader />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Control Panel Column (Left) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col" ref={controlPanelRef}>
            <SymbolIntervalSelectors
              symbol={symbol}
              onSymbolChange={setSymbol}
              interval={interval}
              onIntervalChange={setInterval}
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
              disabled={isLoadingStrategy || isLoadingMarketData || !!marketDataError} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base shadow-lg hover:shadow-primary/50 transition-shadow"
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
                <p className="text-xs text-center text-red-500">{marketDataError}</p>
            )}
          </div>

          {/* Main Display Area (Right) */}
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
      <LivePriceTicker />
      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border/50">
        Powered by Firebase Studio & Google AI. Not financial advice.
      </footer>
    </div>
  );
}
