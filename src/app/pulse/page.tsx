
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import MarketDataDisplay from '@/components/blocksmith-ai/MarketDataDisplay';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Users, Rss, TrendingUp, Shield, Crown, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMarketDataAction, type LiveMarketData } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const PulseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary mb-1">
        <path d="M3 12h4.5l2.5-6 3 12 2.5-6L19.5 12H22" />
    </svg>
)

export default function PulsePage() {
  const [btcData, setBtcData] = useState<LiveMarketData | null>(null);
  const [ethData, setEthData] = useState<LiveMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ btc: string | null, eth: string | null }>({ btc: null, eth: null });
  const toastRef = useRef(useToast());

  const fetchPulseData = useCallback(async (showToastOnError = true) => {
    const [btcResult, ethResult] = await Promise.allSettled([
        fetchMarketDataAction({ symbol: 'BTCUSDT' }),
        fetchMarketDataAction({ symbol: 'ETHUSDC' })
    ]);

    if (btcResult.status === 'fulfilled' && 'error' in btcResult.value) {
        const errorMessage = `BTC: ${btcResult.value.error}`;
        setError(prev => ({ ...prev, btc: errorMessage }));
        if (showToastOnError) toastRef.current.toast({ title: "BTC Data Error", description: btcResult.value.error, variant: "destructive" });
    } else if (btcResult.status === 'fulfilled') {
        setBtcData(btcResult.value as LiveMarketData);
        setError(prev => ({ ...prev, btc: null }));
    }

    if (ethResult.status === 'fulfilled' && 'error' in ethResult.value) {
        const errorMessage = `ETH: ${ethResult.value.error}`;
        setError(prev => ({ ...prev, eth: errorMessage }));
        if (showToastOnError) toastRef.current.toast({ title: "ETH Data Error", description: ethResult.value.error, variant: "destructive" });
    } else if (ethResult.status === 'fulfilled') {
        setEthData(ethResult.value as LiveMarketData);
        setError(prev => ({ ...prev, eth: null }));
    }
    
    if (btcResult.status === 'rejected' || ethResult.status === 'rejected') {
        const fetchError = "A network error occurred while fetching market data.";
        if (showToastOnError) toastRef.current.toast({ title: "Network Error", description: fetchError, variant: "destructive" });
        setError(prev => ({ btc: prev.btc || fetchError, eth: prev.eth || fetchError }));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPulseData(true);
    const intervalId = setInterval(() => fetchPulseData(false), 30000);
    return () => clearInterval(intervalId);
  }, [fetchPulseData]);


  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        <div className="text-center">
            <div className="flex justify-center items-center">
                <PulseIcon />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Live Market <span className="text-primary">Pulse</span></h1>
            <p className="text-muted-foreground">Real-time overview of key market metrics.</p>
        </div>

        <Tabs defaultValue="btc" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="btc">BTC/USDT</TabsTrigger>
                <TabsTrigger value="eth">ETH/USDC</TabsTrigger>
            </TabsList>
            <TabsContent value="btc">
                 <MarketDataDisplay
                    liveMarketData={btcData}
                    isLoading={isLoading}
                    error={error.btc}
                    symbolForDisplay="BTCUSDT"
                />
            </TabsContent>
            <TabsContent value="eth">
                 <MarketDataDisplay
                    liveMarketData={ethData}
                    isLoading={isLoading}
                    error={error.eth}
                    symbolForDisplay="ETHUSDC"
                />
            </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:border-primary/70 transition-colors md:col-span-2">
                <CardHeader>
                <CardTitle className="flex items-center">
                    <Globe className="mr-3 h-6 w-6 text-primary" />
                    Total Crypto Market Cap
                </CardTitle>
                <CardDescription>Aggregate value of all cryptocurrencies.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-baseline justify-center space-x-2">
                    <p className="text-3xl font-bold text-primary">$2.51 Trillion</p>
                    <div className="flex items-center text-lg font-semibold text-green-400">
                        <TrendingUp className="h-5 w-5 mr-1" />
                        <span>+2.34%</span>
                         <span className="text-sm text-muted-foreground ml-1">(24h)</span>
                    </div>
                </CardContent>
            </Card>

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
        </div>

        <Card className="hover:border-tertiary/70 transition-colors col-span-1 md:col-span-2">
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
    </>
  );
}
