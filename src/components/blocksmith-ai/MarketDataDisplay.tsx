
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRightFromCircle, 
  ArrowDownRightFromCircle,
  DollarSign,
  BarChartHorizontalBig, // Changed from BarChartBig for variety
  Sigma // Using Sigma for volume representation
} from 'lucide-react';
import type { LiveMarketData } from '@/app/actions';

interface MarketDataDisplayProps {
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error: string | null;
  symbolForDisplay: string;
}

const DataPoint: FunctionComponent<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode; valueClassName?: string }> = ({ label, value, icon, valueClassName }) => (
  <div className="p-3 bg-background/30 rounded-md shadow-sm border border-border/50 flex flex-col items-start space-y-1 hover:bg-background/50 transition-colors">
    <div className="flex items-center text-xs text-muted-foreground">
      {icon && <span className="mr-1.5 opacity-70">{icon}</span>}
      {label}
    </div>
    <div className={`text-sm font-semibold ${valueClassName || 'text-foreground'}`}>
      {value}
    </div>
  </div>
);


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
          <Activity className="mr-2 h-6 w-6 text-primary animate-pulse" />
          <CardTitle className="text-xl font-semibold text-foreground">
            Fetching Market <span className="text-primary">Pulse...</span>
          </CardTitle>
          <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
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
           <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
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
          <Activity className="mr-2 h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground">
            Live Market <span className="text-primary">Pulse</span>
          </CardTitle>
           <CardDescription className="font-headline text-accent">{displaySymbol}</CardDescription>
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
        <Activity className="mr-2 h-7 w-7 text-primary mb-1" />
        <CardTitle className="text-xl md:text-2xl font-semibold text-foreground">
          Live Market <span className="text-primary">Pulse</span>
        </CardTitle>
        <CardDescription className="font-headline text-accent font-bold text-base">{actualBaseSymbol}/USDT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-5">
        <div className="text-center p-4 bg-card/80 rounded-lg shadow-inner border border-border/60">
          <p className="text-xs text-muted-foreground mb-0.5">Current Price (USDT)</p>
          <p className="text-3xl font-bold text-primary">${lastPriceFormatted}</p>
          <div className={`flex items-center justify-center text-sm font-semibold mt-1 ${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
            {isPositiveChange ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {formattedPriceChange} (24h)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DataPoint 
            label="24h High" 
            value={`$${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            icon={<ArrowUpRightFromCircle size={16} className="text-green-400"/>}
            valueClassName="text-green-400"
          />
          <DataPoint 
            label="24h Low" 
            value={`$${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            icon={<ArrowDownRightFromCircle size={16} className="text-red-400"/>}
            valueClassName="text-red-400"
          />
        </div>
        
        <div className="space-y-3">
          <DataPoint 
            label={`Volume (${actualBaseSymbol})`} 
            value={parseFloat(data.volume).toLocaleString(undefined, {maximumFractionDigits: 3})}
            icon={<Sigma size={16} className="text-tertiary"/>}
            valueClassName="text-tertiary"
          />
          <DataPoint 
            label="Volume (USDT)" 
            value={parseFloat(data.quoteVolume).toLocaleString(undefined, {maximumFractionDigits: 2})}
            icon={<DollarSign size={16} className="text-purple-400"/>}
            valueClassName="text-purple-400"
          />
        </div>
        
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
