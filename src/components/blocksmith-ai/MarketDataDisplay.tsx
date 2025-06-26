import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign
} from 'lucide-react';
import type { LiveMarketData } from '@/app/actions';

interface MarketDataDisplayProps {
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error: string | null;
  symbolForDisplay: string;
}

const PulseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary mb-1">
        <path d="M3 12h4.5l2.5-6 3 12 2.5-6L19.5 12H22" />
    </svg>
)

const formatNumber = (numStr: string) => {
    const num = parseFloat(numStr);
    if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

const MarketDataDisplay: FunctionComponent<MarketDataDisplayProps> = ({ 
  liveMarketData, 
  isLoading, 
  error,
  symbolForDisplay
}) => {
  const baseSymbol = symbolForDisplay.replace('USDT', '');
  const displaySymbol = `${baseSymbol}/USDT`;

  if (isLoading) {
    return (
      <Card className="shadow-md transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <PulseIcon />
          <CardTitle className="text-2xl font-headline text-foreground">
            Fetching Market <span className="text-primary">Pulse...</span>
          </CardTitle>
          <CardDescription className="font-headline text-accent font-bold text-lg">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-16 w-3/4 mx-auto bg-muted" />
          <div className="grid grid-cols-2 gap-3 mt-4">
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-12 w-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border-destructive transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <AlertCircle className="mr-2 h-6 w-6 text-destructive" />
          <CardTitle className="text-xl font-semibold text-destructive">
            Market Pulse <span className="text-red-400">Error</span>
          </CardTitle>
           <CardDescription className="font-headline text-accent font-bold text-lg">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4"> 
          <p className="text-destructive-foreground text-sm">{error}</p>
           {error.includes("Binance API Key is not configured") && (
            <p className="text-xs text-muted-foreground mt-1">Contact admin: <strong className="text-orange-400">API key</strong> setup needed.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!liveMarketData) {
     return (
      <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-tertiary hover:shadow-[0_0_15px_3px_hsl(var(--accent)/0.5)]">
        <CardHeader className="items-center text-center">
          <PulseIcon />
          <CardTitle className="text-2xl font-headline text-foreground">
            Live Market <span className="text-primary">Pulse</span>
          </CardTitle>
           <CardDescription className="font-headline text-accent font-bold text-lg">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4"> 
          <p className="text-sm text-muted-foreground">No market data for <strong className="text-accent">{displaySymbol}</strong>. Select asset or refresh.</p>
        </CardContent>
      </Card>
    );
  }
  
  const data = liveMarketData;
  const priceChangePercentVal = parseFloat(data.priceChangePercent);
  const formattedPriceChange = `${priceChangePercentVal >= 0 ? '+' : ''}${priceChangePercentVal.toFixed(2)}%`;
  const isPositiveChange = priceChangePercentVal >= 0;
  const actualBaseSymbol = data.symbol.replace('USDT', '');

  const lastPriceFormatted = parseFloat(data.lastPrice).toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: Math.max(2, (data.lastPrice.split('.')[1]?.length || 2)) 
  });


  return (
    <Card className="shadow-lg transition-all duration-300 ease-in-out hover:border-primary/70 hover:shadow-[0_0_18px_4px_hsl(var(--primary)/0.5)]">
      <CardHeader className="items-center text-center pb-4">
        <PulseIcon />
        <CardTitle className="text-2xl font-headline text-foreground">
          Live Market <span className="text-primary">Pulse</span>
        </CardTitle>
        <CardDescription className="font-headline text-accent font-bold text-lg">{actualBaseSymbol}/USDT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 py-6">
        <div className="text-center p-4 bg-card/80 rounded-lg shadow-inner border border-border/60">
          <p className="text-sm text-muted-foreground mb-1">Current Price (USDT)</p>
          <p className="text-4xl lg:text-5xl font-bold font-mono text-primary">${lastPriceFormatted}</p>
          <div className={`flex items-center justify-center text-base font-semibold mt-2 ${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
            {isPositiveChange ? <TrendingUp className="h-5 w-5 mr-1.5" /> : <TrendingDown className="h-5 w-5 mr-1.5" />}
            {formattedPriceChange} (24h)
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUp size={12}/>24h High</span>
                <span className="font-mono font-semibold text-primary">${parseFloat(data.highPrice).toLocaleString()}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDown size={12}/>24h Low</span>
                <span className="font-mono font-semibold text-primary">${parseFloat(data.lowPrice).toLocaleString()}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity size={12}/>24h Volume ({baseSymbol})</span>
                <span className="font-mono font-semibold text-primary">{formatNumber(data.volume)}</span>
            </div>
             <div className="flex flex-col items-center p-2 bg-background/50 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12}/>24h Volume (USDT)</span>
                <span className="font-mono font-semibold text-primary">{formatNumber(data.quoteVolume)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
