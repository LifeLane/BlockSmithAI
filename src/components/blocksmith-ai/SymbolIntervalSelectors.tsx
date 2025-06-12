
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
import { Check, ChevronsUpDown, Target as TargetIcon, Clock } from "lucide-react" 
import { cn } from "@/lib/utils"
import type { FormattedSymbol } from '@/app/actions';

interface SymbolIntervalSelectorsProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  interval: string;
  onIntervalChange: (interval: string) => void;
  symbols: FormattedSymbol[];
  isLoadingSymbols: boolean;
}

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
  symbols,
  isLoadingSymbols,
}) => {
  const [openPopover, setOpenPopover] = useState(false);
  const [currentSymbolLabel, setCurrentSymbolLabel] = useState('');

  useEffect(() => {
    const selectedSymbolObj = symbols.find((s) => s.value === symbol);
    if (selectedSymbolObj) {
      setCurrentSymbolLabel(selectedSymbolObj.label);
    } else if (symbol && symbols.length > 0) {
      const defaultSymbolInList = symbols.find(s => s.value === 'BTCUSDT');
      if (defaultSymbolInList && symbol === 'BTCUSDT') {
        setCurrentSymbolLabel(defaultSymbolInList.label);
      } else {
         setCurrentSymbolLabel(symbol); 
      }
    } else if (symbol && isLoadingSymbols) {
        setCurrentSymbolLabel("Loading assets...");
    }
     else {
      setCurrentSymbolLabel(symbol || "Select asset...");
    }
  }, [symbol, symbols, isLoadingSymbols]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card rounded-lg shadow-md">
      <div>
        <Label htmlFor="symbol-select" className="mb-2 block text-sm font-medium text-muted-foreground flex items-center">
          <TargetIcon className="mr-2 h-4 w-4 text-primary" />
          Target <span className="text-primary ml-1 font-semibold">Asset</span>
        </Label>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPopover}
              className="w-full justify-between text-sm border-input focus:border-accent focus:ring-accent"
              id="symbol-select"
              disabled={isLoadingSymbols && symbols.length === 0}
            >
              <span className="truncate">
                {currentSymbolLabel || (isLoadingSymbols ? "Loading assets..." : "Select asset...")}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search asset..." disabled={isLoadingSymbols && symbols.length === 0} />
              <CommandList>
                {isLoadingSymbols && symbols.length === 0 ? (
                  <CommandEmpty>Loading available assets...</CommandEmpty>
                ) : symbols.length === 0 && !isLoadingSymbols ? (
                  <CommandEmpty>No assets found. Check API or try again.</CommandEmpty>
                ): (
                  <CommandEmpty>No asset found.</CommandEmpty>
                )}
                <CommandGroup>
                  {symbols.map((s) => (
                    <CommandItem
                      key={s.value}
                      value={s.label} 
                      onSelect={(currentValue) => {
                        const selected = symbols.find(item => item.label.toLowerCase() === currentValue.toLowerCase());
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
                          symbol === s.value ? "opacity-100 text-accent" : "opacity-0"
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
        <Label htmlFor="interval-select" className="mb-2 block text-sm font-medium text-muted-foreground flex items-center">
          <Clock className="mr-2 h-4 w-4 text-primary" />
          Analysis <span className="text-primary ml-1 font-semibold">Horizon</span>
        </Label>
        <Select value={interval} onValueChange={onIntervalChange}>
          <SelectTrigger id="interval-select" className="w-full text-sm border-input focus:border-accent focus:ring-accent">
            <SelectValue placeholder="Select horizon" />
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
