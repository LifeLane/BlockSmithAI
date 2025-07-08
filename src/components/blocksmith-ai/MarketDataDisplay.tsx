
import { FunctionComponent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

const StatBox = ({ title, value, icon, valueClassName }: { title: string; value: React.ReactNode; icon: React.ReactNode, valueClassName?: string }) => (
    <div className="bg-secondary p-3 rounded-lg">
        <div className="flex items-center text-xs text-muted-foreground mb-1">
            {icon}
            <span className="ml-1.5">{title}</span>
        </div>
        <div className={`text-xl font-bold font-mono break-all ${valueClassName || 'text-foreground'}`}>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[75px] w-full bg-secondary" />)}
        </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border border-destructive/50 transition-all duration-300 ease-in-out">
        <CardContent className="text-center p-4"> 
            <div className="flex justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">
                Market Pulse Error
            </h3>
          <p className="text-destructive-foreground text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!liveMarketData) {
     return (
        <div className="text-center p-4 col-span-full"> 
          <p className="text-sm text-muted-foreground">No market data for <strong className="text-accent">{displaySymbol}</strong>. Select an asset.</p>
        </div>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox 
          title="Current Price"
          icon={<DollarSign size={14} />}
          value={`$${lastPriceFormatted}`}
          valueClassName="text-primary"
        />
        <StatBox
          title="24h Change"
          icon={<Percent size={14} />}
          value={formattedPriceChange}
          valueClassName={isPositiveChange ? "text-green-400" : "text-destructive"}
        />
        <StatBox
          title="24h High"
          icon={<ArrowUp size={14} />}
          value={`$${parseFloat(data.highPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          valueClassName="text-green-400"
        />
        <StatBox
          title="24h Low"
          icon={<ArrowDown size={14} />}
          value={`$${parseFloat(data.lowPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          valueClassName="text-destructive"
        />
        <StatBox
          title={`Volume (${actualBaseSymbol})`}
          icon={<BarChart2 size={14} />}
          value={formatNumber(data.volume)}
          valueClassName="text-primary"
        />
        <StatBox
          title="Volume (USDT)"
          icon={<Activity size={14} />}
          value={`$${formatNumber(data.quoteVolume)}`}
          valueClassName="text-primary"
        />
    </div>
  );
};

export default MarketDataDisplay;
