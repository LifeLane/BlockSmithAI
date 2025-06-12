import { FunctionComponent } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SymbolIntervalSelectorsProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]; // Add more symbols as needed
const INTERVALS = [
  { value: "1", label: "1m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "240", label: "4h" },
];

const SymbolIntervalSelectors: FunctionComponent<SymbolIntervalSelectorsProps> = ({
  symbol,
  onSymbolChange,
  interval,
  onIntervalChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card rounded-lg shadow-md">
      <div>
        <Label htmlFor="symbol-select" className="mb-2 block text-sm font-medium text-muted-foreground">Symbol</Label>
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger id="symbol-select" className="w-full">
            <SelectValue placeholder="Select symbol" />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="interval-select" className="mb-2 block text-sm font-medium text-muted-foreground">Timeframe</Label>
        <Select value={interval} onValueChange={onIntervalChange}>
          <SelectTrigger id="interval-select" className="w-full">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            {INTERVALS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SymbolIntervalSelectors;
