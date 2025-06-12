
import { FunctionComponent } from 'react';

interface LivePriceTickerProps {}

const LivePriceTicker: FunctionComponent<LivePriceTickerProps> = () => {
  // Placeholder data - in a real app, this would come from a WebSocket or frequent API calls
  const placeholderPrices = [
    { symbol: 'BTC/USDT', price: '$65,034.12', change: '+1.25%', positive: true },
    { symbol: 'ETH/USDT', price: '$3,501.88', change: '-0.52%', positive: false },
    { symbol: 'SOL/USDT', price: '$148.50', change: '+2.78%', positive: true },
    { symbol: 'BNB/USDT', price: '$589.20', change: '-0.11%', positive: false },
    { symbol: 'DOGE/USDT', price: '$0.1234', change: '+5.03%', positive: true },
    { symbol: 'XRP/USDT', price: '$0.4901', change: '-1.15%', positive: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/80 shadow-md h-12 overflow-hidden z-50">
      <div className="animate-marquee whitespace-nowrap flex items-center h-full">
        {placeholderPrices.concat(placeholderPrices).map((item, index) => ( // Duplicate for continuous scroll
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
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default LivePriceTicker;
