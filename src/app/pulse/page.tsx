
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Users, Rss, TrendingUp, Shield, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchMarketDataAction, type LiveMarketData } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const PULSE_SYMBOL = 'BTCUSDT';

export default function PulsePage() {
  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef(useToast());

  const fetchAndSetMarketData = useCallback(async (showToastOnError = true) => {
    // No need to set loading to true every time for background refresh
    if (isLoading === false) setIsLoading(false);
    
    setError(null);
    const result = await fetchMarketDataAction({ symbol: PULSE_SYMBOL });

    if ('error' in result) {
      setError(result.error);
      setLiveMarketData(null);
      if (showToastOnError) {
        toastRef.current.toast({
          title: "Market Data Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } else {
      setLiveMarketData(result);
      setError(null);
    }
    setIsLoading(false);
  }, [isLoading]); // Dependency on isLoading to avoid resetting on background fetch

  useEffect(() => {
    setIsLoading(true);
    fetchAndSetMarketData(true);
    const intervalId = setInterval(() => fetchAndSetMarketData(false), 30000);
    return () => clearInterval(intervalId);
  }, [fetchAndSetMarketData]);


  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        <MarketDataDisplay
          liveMarketData={liveMarketData}
          isLoading={isLoading}
          error={error}
          symbolForDisplay={PULSE_SYMBOL}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-3 h-6 w-6 text-primary" />
                Global Signal Insights
              </CardTitle>
              <CardDescription>Aggregate view of all SHADOW signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Bullish Signals (24h):</span>
                    <span className="font-bold text-green-400">1,402</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Bearish Signals (24h):</span>
                    <span className="font-bold text-red-400">877</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Most Frequent Target:</span>
                    <Badge variant="secondary">SOL/USDT</Badge>
                </div>
                 <p className="text-xs text-muted-foreground pt-2">* Aggregate data from all analysts.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-accent/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-3 h-6 w-6 text-accent" />
                Leaderboard Highlights
              </CardTitle>
               <CardDescription>Top performing analysts this week.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                    <Crown className="h-5 w-5 text-yellow-400 shrink-0"/>
                    <span className="font-semibold text-foreground">QuantumTrader</span>
                    <span className="ml-auto font-mono text-primary">15,200 pts</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-gray-400 shrink-0"/>
                    <span className="font-semibold text-foreground">Cipher</span>
                    <span className="ml-auto font-mono text-primary">14,850 pts</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="h-5 w-5 text-tertiary shrink-0"/>
                    <span className="font-semibold text-foreground">SHADOW_Simp_7</span>
                    <span className="ml-auto font-mono text-primary">13,500 pts</span>
                </div>
            </CardContent>
          </Card>

          <Card className="hover:border-tertiary/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rss className="mr-3 h-6 w-6 text-tertiary" />
                Community Activity Feed
              </CardTitle>
              <CardDescription>Latest missions and achievements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
               <p><strong className="text-accent">User_42</strong> completed "The Analyst" mission.</p>
               <p><strong className="text-accent">BlockchainBelle</strong> unlocked the <strong className="text-primary">Adept</strong> badge.</p>
               <p><strong className="text-accent">SatoshiJr</strong> claimed reward for "First Signal".</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
