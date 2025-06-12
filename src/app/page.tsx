
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

  const appHeaderRef = useRef<HTMLDivElement>(null);
  const symbolSelectorsRef = useRef<HTMLDivElement>(null);
  const tradingViewRef = useRef<HTMLDivElement>(null);
  const strategySectionContainerRef = useRef<HTMLDivElement>(null);
  const controlsColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elementsToAnimate = [
      appHeaderRef.current,
      symbolSelectorsRef.current,
      tradingViewRef.current,
      strategySectionContainerRef.current,
      controlsColumnRef.current,
    ].filter(Boolean);

    if (elementsToAnimate.length > 0) {
      gsap.from(elementsToAnimate, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
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

    if (!liveMarketData && !marketDataError) { 
        const fetchedData = await fetchAndSetMarketData(symbol);
        if (fetchedData) {
            currentDataToUse = fetchedData; 
        } else {
            setStrategyError(marketDataError || "Market data is unavailable. Cannot generate strategy.");
            toast({
                title: "Strategy Aborted",
                description: marketDataError || "Failed to fetch market data before generating strategy.",
                variant: "destructive",
            });
            setIsLoadingStrategy(false);
            return;
        }
    } else if (marketDataError && !liveMarketData) { 
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
            description: "Not enough market data to generate a strategy.",
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
        title: "Strategy Generated!",
        description: `New AI strategy for ${symbol}.`,
      });
    }
    setIsLoadingStrategy(false);
  }, [symbol, interval, selectedIndicators, riskLevel, toast, liveMarketData, fetchAndSetMarketData, marketDataError]);


  return (
    <div className="min-h-screen flex flex-col pb-12">
      <div ref={appHeaderRef}>
        <AppHeader />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div ref={symbolSelectorsRef}>
          <SymbolIntervalSelectors
            symbol={symbol}
            onSymbolChange={setSymbol}
            interval={interval}
            onIntervalChange={setInterval}
          />
        </div>

        <div className="bg-card p-1 rounded-lg shadow-xl" ref={tradingViewRef}>
          <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2" ref={strategySectionContainerRef}>
            <StrategyExplanationSection 
              strategy={aiStrategy} 
              liveMarketData={liveMarketData}
              isLoading={isLoadingStrategy} 
              error={strategyError}
              symbol={symbol}
            />
          </div>

          <div className="space-y-6 flex flex-col" ref={controlsColumnRef}>
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base"
            >
              {isLoadingStrategy ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                "Generate AI Strategy"
              )}
            </Button>
             {marketDataError && !liveMarketData && ( 
                <p className="text-xs text-center text-red-500">{marketDataError}</p>
            )}
          </div>
        </div>
      </main>
      <LivePriceTicker />
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        Powered by Firebase Studio & Google AI. Not financial advice.
      </footer>
    </div>
  );
}
