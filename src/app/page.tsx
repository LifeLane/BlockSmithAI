
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
  const controlPanelRef = useRef<HTMLDivElement>(null); // For the entire left column
  const mainDisplayAreaRef = useRef<HTMLDivElement>(null); // For the entire right column (chart + strategy)


  useEffect(() => {
    const elementsToAnimate = [
      appHeaderRef.current,
      controlPanelRef.current,
      mainDisplayAreaRef.current,
    ].filter(Boolean);

    if (elementsToAnimate.length > 0) {
      gsap.from(elementsToAnimate, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.25, // Slightly increased stagger for better visual separation of columns
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
    // console.log(`Fetching market data for ${currentSymbol} in fetchAndSetMarketData`);

    const result = await fetchMarketDataAction({ symbol: currentSymbol });

    if ('error' in result) {
      // console.error("Market data fetch error in fetchAndSetMarketData:", result.error);
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
      // console.log("Market data fetched successfully in fetchAndSetMarketData:", result);
      setLiveMarketData(result);
      setMarketDataError(null);
      setIsLoadingMarketData(false);
      return result;
    }
  }, [toast]);

  useEffect(() => {
    if (symbol) {
      // console.log(`Symbol changed to ${symbol}, fetching market data.`);
      fetchAndSetMarketData(symbol);
    } else {
      // console.log("No symbol selected, clearing market data.");
      setLiveMarketData(null); 
      setMarketDataError("No symbol selected to fetch market data.");
    }
  }, [symbol, fetchAndSetMarketData]);
  
  const fetchStrategy = useCallback(async () => {
    setIsLoadingStrategy(true);
    setStrategyError(null);
    setAiStrategy(null);
    // console.log("Attempting to fetch strategy. Current liveMarketData:", liveMarketData, "MarketDataError:", marketDataError);

    let marketDataForAIString = '{}';
    let currentDataToUse = liveMarketData;

    // If liveMarketData is null AND there's no existing marketDataError, try fetching fresh data.
    if (!currentDataToUse && !marketDataError) { 
        // console.log("No current market data and no error, fetching fresh for strategy...");
        const fetchedData = await fetchAndSetMarketData(symbol);
        if (fetchedData) {
            // console.log("Fresh market data fetched successfully for strategy:", fetchedData);
            currentDataToUse = fetchedData; 
        } else {
            // console.error("Failed to fetch market data before generating strategy. Error:", marketDataError);
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
    // If there IS a marketDataError and no live data, abort.
    } else if (marketDataError && !currentDataToUse) { 
        // console.error(`Market data error exists: ${marketDataError}. Strategy generation aborted.`);
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
        // console.log("Using current market data for AI:", currentDataToUse);
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
         // console.error("Insufficient market data (currentDataToUse is null) for strategy generation.");
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
    // console.log("Generating strategy with input:", input);

    const result = await generateTradingStrategyAction(input);

    if ('error' in result) {
      // console.error("Strategy generation failed:", result.error);
      setStrategyError(result.error);
      toast({
        title: "Strategy Generation Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      // console.log("Strategy generated successfully:", result);
      setAiStrategy(result);
       toast({
        title: "Strategy Generated!",
        description: `New AI strategy for ${symbol}.`,
      });
    }
    setIsLoadingStrategy(false);
  }, [symbol, interval, selectedIndicators, riskLevel, toast, liveMarketData, fetchAndSetMarketData, marketDataError]);


  return (
    <div className="min-h-screen flex flex-col pb-12 bg-background">
      <div ref={appHeaderRef}>
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
