
'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import SymbolIntervalSelectors from '@/components/blocksmith-ai/SymbolIntervalSelectors';
import TradingViewWidget from '@/components/blocksmith-ai/TradingViewWidget';
import ControlsTabs from '@/components/blocksmith-ai/ControlsTabs';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import StrategyCard from '@/components/blocksmith-ai/StrategyCard';
import { Button } from '@/components/ui/button';
import { generateTradingStrategyAction } from './actions';
import type { GenerateTradingStrategyOutput, GenerateTradingStrategyInput } from '@/ai/flows/generate-trading-strategy';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

export default function BlockSmithAIPage() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('15'); // TradingView format: "15" for 15m
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['RSI', 'EMA']);
  const [riskLevel, setRiskLevel] = useState<string>('Medium');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  
  const [aiStrategy, setAiStrategy] = useState<GenerateTradingStrategyOutput | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleIndicatorChange = (indicator: string, checked: boolean) => {
    setSelectedIndicators((prev) =>
      checked ? [...prev, indicator] : prev.filter((i) => i !== indicator)
    );
  };

  const handleApiKeysSave = () => {
    // In a real app, you would securely save these keys to a backend or environment config.
    // For this prototype, we're just updating local state and showing a toast.
    toast({
      title: "API Keys Updated (Locally)",
      description: "Your API keys have been updated in the current session.",
    });
  };

  const fetchStrategy = useCallback(async () => {
    setIsLoadingStrategy(true);
    setStrategyError(null);
    setAiStrategy(null);

    // TODO: In the future, use apiKey and apiSecret to fetch real market data from Binance
    // For now, mockMarketData is still used.
    const mockMarketData = { 
      symbol: `${symbol.replace('USDT', '')}/USDT`,
      price: "67,215.40", 
      "24h_change": "+1.8%",
      volume_24h: "2488.243 BTC",
      market_cap: "$1.3T",
      sentiment: "Bullish",
      fear_greed: 62
    };

    const input: GenerateTradingStrategyInput = {
      symbol,
      interval: `${interval}m`, 
      indicators: selectedIndicators,
      riskLevel,
      marketData: JSON.stringify(mockMarketData), 
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
  }, [symbol, interval, selectedIndicators, riskLevel, toast, apiKey, apiSecret]); // Added apiKey, apiSecret to dependencies

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
              apiSecret={apiSecret}
              onApiSecretChange={setApiSecret}
              onApiKeysSave={handleApiKeysSave}
            />
            <MarketDataDisplay symbol={symbol} />
            
            <Button onClick={fetchStrategy} disabled={isLoadingStrategy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base">
              {isLoadingStrategy ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                "Generate AI Strategy"
              )}
            </Button>

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
