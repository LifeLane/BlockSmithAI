
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
          <CardTitle className="flex items-center text-lg font-semibold">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Market Overview
          </CardTitle>
          <CardDescription className="font-headline text-primary">{displaySymbol}</CardDescription>
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
            Market Overview
          </CardTitle>
           <CardDescription className="font-headline text-primary">{displaySymbol}</CardDescription>
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
      <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_2px_hsl(var(--accent)/0.4)]">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Market Overview
          </CardTitle>
           <CardDescription className="font-headline text-primary">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center p-4">No market data available for {displaySymbol}.</p>
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
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_2px_hsl(var(--accent)/0.4)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Database className="mr-2 h-5 w-5 text-primary" />
          Market Overview
        </CardTitle>
        <CardDescription className="font-headline text-primary">{actualBaseSymbol}/USDT - ${parseFloat(data.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          24h Change:{" "}
          <span className={isPositiveChange ? "text-green-400" : "text-red-400"}>
            {formattedPriceChange}
          </span>
        </p>
        <p>24h High: <span className="font-semibold">${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        <p>24h Low: <span className="font-semibold">${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        <p>Volume (24h Base): {parseFloat(data.volume).toLocaleString(undefined, {maximumFractionDigits: 3})} {actualBaseSymbol}</p>
        <p>Volume (24h Quote): {parseFloat(data.quoteVolume).toLocaleString(undefined, {maximumFractionDigits: 2})} USDT</p>
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
