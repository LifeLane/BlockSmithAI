
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  BarChart2,
  Percent
} from 'lucide-react';
import type { LiveMarketData } from '@/app/actions';

interface MarketDataDisplayProps {
  liveMarketData: LiveMarketData | null;
  isLoading: boolean;
  error: string | null;
  symbolForDisplay: string;
}

const formatNumber = (numStr: string) => {
    const num = parseFloat(numStr);
    if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// A small component for each stat to avoid repetition
const StatBox = ({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) => (
    <div className="flex flex-col items-center p-3 bg-background/50 rounded-md border border-border/50">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {title}</span>
        <span className="text-lg font-bold font-mono text-primary mt-1">{value}</span>
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
        <CardHeader className="items-center text-center pb-4">
          <CardTitle className="text-xl font-headline text-foreground">
            Fetching Market <span className="text-primary">Pulse...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-muted" />)}
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
      <Card className="shadow-md transition-all duration-300 ease-in-out animated-border-glow">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl font-headline text-foreground">
            Market <span className="text-primary">Pulse</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4"> 
          <p className="text-sm text-muted-foreground">No market data for <strong className="text-accent">{displaySymbol}</strong>. Select an asset or refresh.</p>
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
    maximumFractionDigits: 2
  });


  return (
    <Card className="shadow-lg transition-all duration-300 ease-in-out animated-border-glow">
      <CardHeader className="items-center text-center pb-4">
        <CardTitle className="text-xl font-headline text-foreground">
          Market Pulse: <span className="text-accent">{actualBaseSymbol}/USDT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
        <StatBox 
          title="Current Price"
          icon={<DollarSign size={14} />}
          value={`$${lastPriceFormatted}`}
        />
        <StatBox
          title="24h Change"
          icon={<Percent size={14} />}
          value={
            <span className={isPositiveChange ? "text-green-400" : "text-red-400"}>
              {formattedPriceChange}
            </span>
          }
        />
        <StatBox
          title="24h High"
          icon={<ArrowUp size={14} />}
          value={`$${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        />
        <StatBox
          title="24h Low"
          icon={<ArrowDown size={14} />}
          value={`$${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        />
        <StatBox
          title={`Volume (${baseSymbol})`}
          icon={<BarChart2 size={14} />}
          value={formatNumber(data.volume)}
        />
        <StatBox
          title="Volume (USDT)"
          icon={<Activity size={14} />}
          value={`$${formatNumber(data.quoteVolume)}`}
        />
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
