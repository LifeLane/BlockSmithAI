
'use client';

import type { FunctionComponent} from 'react';
import { useState, useEffect } from 'react';
import { fetchTopSymbolsForTickerAction, type TickerSymbolData } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2 } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
}

const LivePriceTicker: FunctionComponent = () => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTickerData = async () => {
      setIsLoading(true);
      const result = await fetchTopSymbolsForTickerAction();
      if ('error' in result) {
        toast({
          title: "Ticker Error",
          description: result.error,
          variant: "destructive",
        });
        setTickerItems([]); // Clear items on error
      } else {
        const formattedItems = result.map((item: TickerSymbolData) => {
          const price = parseFloat(item.lastPrice);
          const changePercent = parseFloat(item.priceChangePercent);
          return {
            symbol: item.symbol.replace('USDT', '/USDT'),
            price: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, (price.toString().split('.')[1]?.length || 0)) })}`,
            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
            positive: changePercent >= 0,
          };
        });
        setTickerItems(formattedItems);
      }
      setIsLoading(false);
    };

    loadTickerData();
    // Set up an interval to refresh data, e.g., every 30 seconds
    const intervalId = setInterval(loadTickerData, 30000); 
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [toast]);

  if (isLoading && tickerItems.length === 0) {
    return (
      <div className="bg-card border-y border-border/80 shadow-sm h-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading Ticker Data...
      </div>
    );
  }

  if (!isLoading && tickerItems.length === 0) {
     return (
      <div className="bg-card border-y border-border/80 shadow-sm h-12 flex items-center justify-center text-muted-foreground">
        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
        Ticker data currently unavailable.
      </div>
    );
  }
  
  // Duplicate items for continuous scroll effect if list is short
  const displayItems = tickerItems.length > 0 && tickerItems.length < 10 
    ? [...tickerItems, ...tickerItems, ...tickerItems] 
    : tickerItems;


  return (
    <div className="relative bg-card border-y border-border/80 shadow-sm h-12 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex items-center h-full">
        {displayItems.map((item, index) => (
          <div key={index} className="inline-flex items-center mx-4 px-2 py-1 rounded">
            <span className="font-semibold text-sm text-foreground mr-2">{item.symbol}:</span>
            <span className="text-sm text-foreground mr-1">{item.price}</span>
            <span className={`text-xs ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
              ({item.change})
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-${100 / (displayItems.length / tickerItems.length > 1 ? (displayItems.length / tickerItems.length) : 1)}%); }
        }
        .animate-marquee {
          animation: marquee ${displayItems.length * 2}s linear infinite;
          will-change: transform;
          min-width: ${displayItems.length * 150}px; /* Ensure enough width for smooth scroll */
        }
      `}</style>
    </div>
  );
};

export default LivePriceTicker;
