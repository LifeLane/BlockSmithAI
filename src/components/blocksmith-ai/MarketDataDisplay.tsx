
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
    if (!numStr) return '0';
    const num = parseFloat(numStr);
    if (isNaN(num)) return '0';
    if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// A small component for each stat to avoid repetition
const StatBox = ({ title, value, icon, valueClassName }: { title: string; value: React.ReactNode; icon: React.ReactNode, valueClassName?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg text-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {title}</span>
        <span className={`text-lg font-bold font-mono ${valueClassName || 'text-primary'} mt-1`}>{value}</span>
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
      <Card className="shadow-md transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm border-0">
        <CardHeader className="items-center text-center pb-4">
          <CardTitle className="text-xl font-headline text-foreground">
             <Skeleton className="h-7 w-48 bg-muted" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-secondary" />)}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border border-destructive/50 transition-all duration-300 ease-in-out">
        <CardHeader className="items-center text-center">
          <AlertCircle className="mr-2 h-6 w-6 text-destructive" />
          <CardTitle className="text-xl font-semibold text-destructive">
            Market Pulse Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4"> 
          <p className="text-destructive-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!liveMarketData) {
     return (
      <Card className="bg-card/80 backdrop-blur-sm border-0">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl font-headline text-foreground">
            Market Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4"> 
          <p className="text-sm text-muted-foreground">No market data for <strong className="text-accent">{displaySymbol}</strong>. Select an asset.</p>
        </CardContent>
      </Card>
    );
  }
  
  const data = liveMarketData;
  const priceChangePercentVal = parseFloat(data.priceChangePercent);
  const formattedPriceChange = `${priceChangePercentVal.toFixed(2)}%`;
  const isPositiveChange = priceChangePercentVal >= 0;
  const actualBaseSymbol = data.symbol.replace('USDT', '');

  const lastPriceFormatted = parseFloat(data.lastPrice).toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 4 // Allow more precision for smaller price assets
  });


  return (
    <Card className="shadow-lg transition-all duration-300 ease-in-out border-border/50 bg-gradient-to-br from-card to-background">
      <CardHeader className="items-center text-center pb-4">
        <CardTitle className="text-2xl font-headline text-foreground">
          Market Pulse: <span className="text-accent">{actualBaseSymbol}/USDT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        <StatBox 
          title="Current Price"
          icon={<DollarSign size={14} />}
          value={`$${lastPriceFormatted}`}
        />
        <StatBox
          title="24h Change"
          icon={<Percent size={14} />}
          value={
            <span className={isPositiveChange ? "text-green-400" : "text-destructive"}>
              {formattedPriceChange}
            </span>
          }
        />
        <StatBox
          title="24h High"
          icon={<ArrowUp size={14} />}
          value={`$${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}`}
          valueClassName="text-primary/90"
        />
        <StatBox
          title="24h Low"
          icon={<ArrowDown size={14} />}
          value={`$${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}`}
          valueClassName="text-primary/90"
        />
        <StatBox
          title={`Volume (${actualBaseSymbol})`}
          icon={<BarChart2 size={14} />}
          value={formatNumber(data.volume)}
          valueClassName="text-primary/90"
        />
        <StatBox
          title="Volume (USDT)"
          icon={<Activity size={14} />}
          value={`$${formatNumber(data.quoteVolume)}`}
          valueClassName="text-primary/90"
        />
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
