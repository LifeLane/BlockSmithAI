
'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function BlockSmithAIPage() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('15');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['RSI', 'EMA']);
  const [riskLevel, setRiskLevel] = useState<string>('Medium');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  
  const [aiStrategy, setAiStrategy] = useState<GenerateTradingStrategyOutput | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleIndicatorChange = (indicator: string, checked: boolean) => {
    setSelectedIndicators((prev) =>
      checked ? [...prev, indicator] : prev.filter((i) => i !== indicator)
    );
  };

  const fetchAndSetMarketData = useCallback(async (currentSymbol: string, currentApiKey: string) => {
    if (!currentApiKey) {
      setMarketDataError("API Key is required to fetch live market data.");
      setLiveMarketData(null);
      return false;
    }
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    // Keep existing liveMarketData while loading new, or set to null if you prefer a cleared state
    // setLiveMarketData(null); 

    const result = await fetchMarketDataAction({ symbol: currentSymbol, apiKey: currentApiKey });

    if ('error' in result) {
      setMarketDataError(result.error);
      setLiveMarketData(null); // Clear data on error
      toast({
        title: "Market Data Error",
        description: result.error,
        variant: "destructive",
      });
      setIsLoadingMarketData(false);
      return false;
    } else {
      setLiveMarketData(result);
      setIsLoadingMarketData(false);
      return true;
    }
  }, [toast]);

  useEffect(() => {
    if (apiKey && symbol) {
      fetchAndSetMarketData(symbol, apiKey);
    } else {
      setLiveMarketData(null); 
      if (!apiKey) {
         setMarketDataError("Please enter your Binance API Key in the API tab to fetch live market data.");
      }
    }
  }, [symbol, apiKey, fetchAndSetMarketData]);

  const handleApiKeysSave = () => {
    toast({
      title: "API Keys Updated (Locally)",
      description: "Your API keys have been updated in the current session.",
    });
    if (apiKey && symbol) {
      fetchAndSetMarketData(symbol, apiKey);
    }
  };
  
  const fetchStrategy = useCallback(async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Binance API Key to generate a strategy with live data.",
        variant: "destructive",
      });
      setStrategyError("API Key is required.");
      return;
    }

    setIsLoadingStrategy(true);
    setStrategyError(null);
    setAiStrategy(null);

    let currentMarketData = liveMarketData;
    if (!currentMarketData) { // If market data isn't already loaded, try fetching it
        const marketDataFetched = await fetchAndSetMarketData(symbol, apiKey);
        if (!marketDataFetched) {
          setIsLoadingStrategy(false);
          setStrategyError("Failed to fetch market data for strategy generation.");
          // Toast is handled by fetchAndSetMarketData
          return;
        }
        // Need to get the updated state value, cannot directly use result of fetchAndSetMarketData
        // This is a bit tricky due to state update timing. For simplicity, we'll assume it's available
        // or rely on a subsequent render. A better approach might involve a local variable from fetch.
        // For now, let's just proceed, and if liveMarketData is still null, the AI call will use an empty object.
    }
    
    // Re-check liveMarketData from state after potential fetch attempt.
    const latestMarketData = await fetchMarketDataAction({ symbol: symbol, apiKey: apiKey });
    let marketDataForAIString = '{}';

    if ('error' in latestMarketData) {
        // Use existing liveMarketData if fetch fails but we had some before
        if (liveMarketData) {
             marketDataForAIString = JSON.stringify({
                symbol: liveMarketData.symbol,
                price: liveMarketData.lastPrice,
                price_change_percent_24h: `${parseFloat(liveMarketData.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(liveMarketData.priceChangePercent).toFixed(2)}%`,
                volume_24h_base: `${liveMarketData.volume} ${liveMarketData.symbol.replace('USDT', '')}`,
                volume_24h_quote: `${liveMarketData.quoteVolume} USDT`,
                high_24h: liveMarketData.highPrice,
                low_24h: liveMarketData.lowPrice,
            });
        } else {
            // No market data at all
            toast({
                title: "Market Data Unavailable",
                description: "Could not fetch fresh market data. Strategy generation might be impaired.",
                variant: "destructive",
            });
        }
    } else {
        setLiveMarketData(latestMarketData); // Update state with freshest data
        marketDataForAIString = JSON.stringify({
            symbol: latestMarketData.symbol,
            price: latestMarketData.lastPrice,
            price_change_percent_24h: `${parseFloat(latestMarketData.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(latestMarketData.priceChangePercent).toFixed(2)}%`,
            volume_24h_base: `${latestMarketData.volume} ${latestMarketData.symbol.replace('USDT', '')}`,
            volume_24h_quote: `${latestMarketData.quoteVolume} USDT`,
            high_24h: latestMarketData.highPrice,
            low_24h: latestMarketData.lowPrice,
        });
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
  }, [symbol, interval, selectedIndicators, riskLevel, toast, apiKey, fetchAndSetMarketData, liveMarketData]); // Added liveMarketData to dependencies


  return (
    <div className="min-h-screen flex flex-col pb-12"> {/* Added pb-12 for ticker */}
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <SymbolIntervalSelectors
          symbol={symbol}
          onSymbolChange={setSymbol}
          interval={interval}
          onIntervalChange={setInterval}
        />

        <div className="bg-card p-1 rounded-lg shadow-xl">
          <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <StrategyExplanationSection 
              strategy={aiStrategy} 
              liveMarketData={liveMarketData}
              isLoading={isLoadingStrategy} 
              error={strategyError}
              symbol={symbol}
            />
          </div>

          <div className="space-y-6 flex flex-col">
            <ControlsTabs
              selectedIndicators={selectedIndicators}
              onIndicatorChange={handleIndicatorChange}
              riskLevel={riskLevel}
              onRiskChange={setRiskLevel}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              apiSecret={apiSecret} 
              onApiSecretChange={setApiSecret}
              onApiKeysSave={handleApiKeysSave}
              // Pass market data props
              apiKeySet={!!apiKey}
              liveMarketData={liveMarketData}
              isLoadingMarketData={isLoadingMarketData}
              marketDataError={marketDataError}
              symbolForDisplay={symbol}
            />
            
            <Button 
              onClick={fetchStrategy} 
              disabled={isLoadingStrategy || !apiKey || isLoadingMarketData} 
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
             {!apiKey && (
                <p className="text-xs text-center text-amber-500">Enter API Key in the 'API' tab to enable market data and strategy generation.</p>
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
