import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Database } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: string;
  change_24h: string;
  volume_24h: string;
  market_cap: string;
  sentiment: string; // "Bullish", "Bearish", "Neutral"
  fear_greed_index?: number; 
}

interface MarketDataDisplayProps {
  symbol: string; // To update the title dynamically
}

// Mock data as APIs are not integrated here
const getMockMarketData = (symbol: string): MarketData => {
  const baseSymbol = symbol.replace('USDT', '');
  const prices: { [key: string]: string } = {
    BTC: "67,215.40",
    ETH: "3,788.12",
    SOL: "165.30",
    BNB: "598.70",
  };
  const marketCaps: { [key: string]: string } = {
    BTC: "$1.3T",
    ETH: "$455B",
    SOL: "$75B",
    BNB: "$88B",
  };
  return {
    symbol: `${baseSymbol}/USDT`,
    price: prices[baseSymbol] || "N/A",
    change_24h: "+1.8%",
    volume_24h: `2,488 ${baseSymbol}`,
    market_cap: marketCaps[baseSymbol] || "N/A",
    sentiment: "Bullish", // Example sentiment
    fear_greed_index: 62, // Example fear & greed
  };
};

const MarketDataDisplay: FunctionComponent<MarketDataDisplayProps> = ({ symbol }) => {
  const data = getMockMarketData(symbol);
  const isPositiveChange = data.change_24h.startsWith('+');

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Database className="mr-2 h-5 w-5 text-primary" />
          Market Overview
        </CardTitle>
        <CardDescription className="font-headline text-primary">{data.symbol} - ${data.price}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          24h Change:{" "}
          <span className={isPositiveChange ? "text-green-400" : "text-red-400"}>
            {data.change_24h}
          </span>
        </p>
        <p>Volume (24h): {data.volume_24h}</p>
        <p>Market Cap: {data.market_cap}</p>
        <p>
          Sentiment:{" "}
          <span className={`${data.sentiment === 'Bullish' ? 'text-green-400' : data.sentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'} font-semibold`}>
            {data.sentiment}
          </span>
        </p>
        {data.fear_greed_index && (
          <p>Fear & Greed Index: <span className="font-semibold">{data.fear_greed_index}</span></p>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketDataDisplay;
