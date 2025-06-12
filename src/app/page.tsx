
'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import ControlsTabs from '@/components/blocksmith-ai/ControlsTabs';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import StrategyCard from '@/components/blocksmith-ai/StrategyCard'; // Added import
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
    setLiveMarketData(null);

    const result = await fetchMarketDataAction({ symbol: currentSymbol, apiKey: currentApiKey });

    if ('error' in result) {
      setMarketDataError(result.error);
      setLiveMarketData(null);
      toast({
        title: "Market Data Fetch Failed",
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
      setLiveMarketData(null); // Clear data if API key is removed or symbol changes to none
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
      return;
    }

    setIsLoadingStrategy(true);
    setStrategyError(null);
    setAiStrategy(null);

    // Attempt to fetch fresh market data first
    const marketDataFetched = await fetchAndSetMarketData(symbol, apiKey);
    if (!marketDataFetched || !liveMarketData) { // Check liveMarketData from state after fetch attempt
      setIsLoadingStrategy(false);
      // Error toast is handled by fetchAndSetMarketData
      return;
    }
    
    const marketDataForAI = {
      symbol: liveMarketData.symbol,
      price: liveMarketData.lastPrice,
      price_change_percent_24h: `${parseFloat(liveMarketData.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(liveMarketData.priceChangePercent).toFixed(2)}%`,
      volume_24h_base: `${liveMarketData.volume} ${liveMarketData.symbol.replace('USDT', '')}`,
      volume_24h_quote: `${liveMarketData.quoteVolume} USDT`,
      high_24h: liveMarketData.highPrice,
      low_24h: liveMarketData.lowPrice,
    };

    const input: GenerateTradingStrategyInput = {
      symbol,
      interval: `${interval}m`, 
      indicators: selectedIndicators,
      riskLevel,
      marketData: JSON.stringify(marketDataForAI), 
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
        description: `New ${result.signal} signal for ${symbol}.`,
      });
    }
    setIsLoadingStrategy(false);
  }, [symbol, interval, selectedIndicators, riskLevel, toast, apiKey, fetchAndSetMarketData, liveMarketData]);


  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <SymbolIntervalSelectors
          symbol={symbol}
          onSymbolChange={setSymbol}
          interval={interval}
          onIntervalChange={setInterval}
        />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-card p-1 rounded-lg shadow-xl">
            <TradingViewWidget symbol={symbol} interval={interval} selectedIndicators={selectedIndicators} />
          </div>

          <div className="space-y-6 flex flex-col">
            <ControlsTabs
              selectedIndicators={selectedIndicators}
              onIndicatorChange={handleIndicatorChange}
              riskLevel={riskLevel}
              onRiskChange={setRiskLevel}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              apiSecret={apiSecret} // Secret is not used for public data fetching but kept for completeness
              onApiSecretChange={setApiSecret}
              onApiKeysSave={handleApiKeysSave}
            />
            <MarketDataDisplay 
              apiKeySet={!!apiKey}
              liveMarketData={liveMarketData}
              isLoading={isLoadingMarketData}
              error={marketDataError}
              symbolForDisplay={symbol} // Pass the selected symbol for context
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
                <p className="text-xs text-center text-amber-500">Enter API Key in the 'API' tab to enable strategy generation.</p>
            )}

            <StrategyCard strategy={aiStrategy} isLoading={isLoadingStrategy} error={strategyError} />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        Powered by Firebase Studio & Google AI. Not financial advice.
      </footer>
    </div>
  );
}
