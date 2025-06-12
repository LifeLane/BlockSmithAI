
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, AlertCircle, Loader2 } from 'lucide-react';
import type { LiveMarketData } from '@/app/actions';

interface MarketDataDisplayProps {
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error: string | null;
  symbolForDisplay: string;
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
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Market <span className="text-primary ml-1">Overview</span>
          </CardTitle>
          <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Market Data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border-destructive transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Market <span className="text-red-400 ml-1">Overview Error</span>
          </CardTitle>
           <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent> 
          <p className="text-destructive-foreground text-sm">{error}</p>
           {error.includes("Binance API Key is not configured") && (
            <p className="text-xs text-muted-foreground mt-1">Please contact the administrator to set up the API key on the server.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!liveMarketData) {
     return (
      <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_2px_hsl(var(--primary)/0.4)]">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Market <span className="text-primary ml-1">Overview</span>
          </CardTitle>
           <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent> 
          <p className="text-sm text-muted-foreground text-center p-4">No market data available for <span className="font-bold text-accent">{displaySymbol}</span>.</p>
        </CardContent>
      </Card>
    );
  }
  
  const data = liveMarketData;
  const priceChangePercent = parseFloat(data.priceChangePercent);
  const formattedPriceChange = `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`;
  const isPositiveChange = priceChangePercent >= 0;
  const actualBaseSymbol = data.symbol.replace('USDT', '');


  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_2px_hsl(var(--primary)/0.4)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <Database className="mr-2 h-5 w-5 text-primary" />
          Market <span className="text-primary ml-1">Overview</span>
        </CardTitle>
        <CardDescription className="font-headline">
            <span className="text-accent font-bold">{actualBaseSymbol}/USDT</span> - <span className="text-primary font-bold">${parseFloat(data.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm"> 
        <p>
          <span className="font-medium text-muted-foreground">24h Change:</span>{" "}
          <span className={`font-bold ${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
            {formattedPriceChange}
          </span>
        </p>
        <p><span className="font-medium text-muted-foreground">24h High:</span> <span className="font-bold text-foreground">${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        <p><span className="font-medium text-muted-foreground">24h Low:</span> <span className="font-bold text-foreground">${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        <p><span className="font-medium text-muted-foreground">Volume (24h Base):</span> <span className="font-bold text-foreground">{parseFloat(data.volume).toLocaleString(undefined, {maximumFractionDigits: 3})} {actualBaseSymbol}</span></p>
        <p><span className="font-medium text-muted-foreground">Volume (24h Quote):</span> <span className="font-bold text-foreground">{parseFloat(data.quoteVolume).toLocaleString(undefined, {maximumFractionDigits: 2})} USDT</span></p>
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
