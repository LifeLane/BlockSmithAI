
"use client";
import type { FunctionComponent} from 'react';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Check, ChevronsUpDown, Target, Zap, Clock, TrendingUp, Shield } from "lucide-react" 
import { cn } from "@/lib/utils"
import type { FormattedSymbol } from '@/app/actions';

interface StrategySelectorsProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  tradingMode: string;
  onTradingModeChange: (mode: string) => void;
  riskProfile: string;
  onRiskProfileChange: (profile: string) => void;
  symbols: FormattedSymbol[];
  isLoadingSymbols: boolean;
}

const TRADING_MODES = [
  { value: "Scalper", label: "Scalper", icon: <Zap className="h-4 w-4" /> },
  { value: "Sniper", label: "Sniper", icon: <Target className="h-4 w-4" /> },
  { value: "Intraday", label: "Intraday", icon: <Clock className="h-4 w-4" /> },
  { value: "Swing", label: "Swing", icon: <TrendingUp className="h-4 w-4" /> },
];

const RISK_PROFILES = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const StrategySelectors: FunctionComponent<StrategySelectorsProps> = ({
  symbol,
  onSymbolChange,
  tradingMode,
  onTradingModeChange,
  riskProfile,
  onRiskProfileChange,
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
    <div className="grid grid-cols-1 gap-6 p-4 bg-card rounded-lg border border-border/50 interactive-card">
      <div>
        <Label htmlFor="symbol-select" className="mb-2 block text-sm font-medium text-muted-foreground flex items-center">
          <Target className="mr-2 h-4 w-4 text-primary" />
          Target <span className="text-primary ml-1 font-semibold">Asset</span>
        </Label>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPopover}
              className="w-full justify-between text-base bg-background text-foreground border-input hover:border-accent focus:border-accent focus:ring-accent font-semibold"
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
        <Label className="mb-2 block text-sm font-medium text-muted-foreground flex items-center">
          <Zap className="mr-2 h-4 w-4 text-primary" />
          Trading <span className="text-primary ml-1 font-semibold">Mode</span>
        </Label>
        <Tabs value={tradingMode} onValueChange={onTradingModeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                {TRADING_MODES.map((mode) => (
                    <TabsTrigger key={mode.value} value={mode.value} className="flex flex-col sm:flex-row gap-1.5 py-2 h-auto text-xs sm:text-sm">
                        {mode.icon}
                        {mode.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
      </div>
      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground flex items-center">
          <Shield className="mr-2 h-4 w-4 text-primary" />
          Risk <span className="text-primary ml-1 font-semibold">Profile</span>
        </Label>
         <Tabs value={riskProfile} onValueChange={onRiskProfileChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
                {RISK_PROFILES.map((profile) => (
                    <TabsTrigger key={profile.value} value={profile.value} className="text-sm h-full">
                        {profile.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default StrategySelectors;
