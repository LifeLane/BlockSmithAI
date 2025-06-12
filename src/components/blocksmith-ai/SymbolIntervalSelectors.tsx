
"use client";
import { FunctionComponent, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface SymbolIntervalSelectorsProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const SYMBOLS = [
  // Major USDT pairs
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
  { value: "BNBUSDT", label: "BNB/USDT" },
  { value: "XRPUSDT", label: "XRP/USDT" },
  { value: "ADAUSDT", label: "ADA/USDT" },
  { value: "DOGEUSDT", label: "DOGE/USDT" },
  { value: "AVAXUSDT", label: "AVAX/USDT" },
  { value: "DOTUSDT", label: "DOT/USDT" },
  { value: "TRXUSDT", label: "TRX/USDT" },
  { value: "MATICUSDT", label: "MATIC/USDT" },
  { value: "SHIBUSDT", label: "SHIB/USDT" },
  { value: "LTCUSDT", label: "LTC/USDT" },
  { value: "LINKUSDT", label: "LINK/USDT" },
  { value: "UNIUSDT", label: "UNI/USDT" },
  { value: "ATOMUSDT", label: "ATOM/USDT" },
  { value: "ICPUSDT", label: "ICP/USDT" },
  { value: "ETCUSDT", label: "ETC/USDT" },
  { value: "XLMUSDT", label: "XLM/USDT" },
  { value: "BCHUSDT", label: "BCH/USDT" },
  { value: "FILUSDT", label: "FIL/USDT" },
  { value: "NEARUSDT", label: "NEAR/USDT" },
  { value: "APTUSDT", label: "APT/USDT" },
  { value: "VETUSDT", label: "VET/USDT" },
  { value: "HBARUSDT", label: "HBAR/USDT" },
  { value: "OPUSDT", label: "OP/USDT" },
  { value: "ARB1USDT", label: "ARB/USDT" }, // Note: ARB often uses ARB1USDT on Binance for spot
  { value: "GRTUSDT", label: "GRT/USDT" },
  { value: "AAVEUSDT", label: "AAVE/USDT" },
  { value: "MKRUSDT", label: "MKR/USDT" },
  // Other common pairs or interesting assets
  { value: "PEPEUSDT", label: "PEPE/USDT" },
  { value: "WIFUSDT", label: "WIF/USDT" },
  { value: "BONKUSDT", label: "BONK/USDT" },
  { value: "SUIUSDT", label: "SUI/USDT" },
  { value: "SEIUSDT", label: "SEI/USDT" },
];

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
  const [openPopover, setOpenPopover] = useState(false);
  const [currentSymbolLabel, setCurrentSymbolLabel] = useState(symbol);

  useEffect(() => {
    const selectedSymbolObj = SYMBOLS.find((s) => s.value === symbol);
    if (selectedSymbolObj) {
      setCurrentSymbolLabel(selectedSymbolObj.label);
    } else {
      setCurrentSymbolLabel(symbol); // Fallback if not in list
    }
  }, [symbol]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card rounded-lg shadow-md">
      <div>
        <Label htmlFor="symbol-select" className="mb-2 block text-sm font-medium text-muted-foreground">Symbol</Label>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPopover}
              className="w-full justify-between text-sm"
              id="symbol-select"
            >
              <span className="truncate">
                {currentSymbolLabel || "Select symbol..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search symbol..." />
              <CommandList>
                <CommandEmpty>No symbol found.</CommandEmpty>
                <CommandGroup>
                  {SYMBOLS.map((s) => (
                    <CommandItem
                      key={s.value}
                      value={s.value}
                      onSelect={(currentValue) => {
                        const selected = SYMBOLS.find(item => item.value.toLowerCase() === currentValue.toLowerCase());
                        if (selected) {
                          onSymbolChange(selected.value);
                          setCurrentSymbolLabel(selected.label);
                        }
                        setOpenPopover(false);
                      }}
                      className="text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          symbol === s.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {s.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="interval-select" className="mb-2 block text-sm font-medium text-muted-foreground">Timeframe</Label>
        <Select value={interval} onValueChange={onIntervalChange}>
          <SelectTrigger id="interval-select" className="w-full text-sm">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            {INTERVALS.map((i) => (
              <SelectItem key={i.value} value={i.value} className="text-sm">
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
