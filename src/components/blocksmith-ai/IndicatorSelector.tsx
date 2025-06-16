
import { FunctionComponent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal, CheckSquare, Square } from 'lucide-react';
import { cn } from "@/lib/utils";

interface IndicatorSelectorProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
}

const INDICATORS = ["RSI", "EMA", "VWAP", "BOLL", "SAR", "ADX", "MACD", "STOCH", "ATR", "OBV"];

const IndicatorSelector: FunctionComponent<IndicatorSelectorProps> = ({
  selectedIndicators,
  onIndicatorChange,
}) => {
  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_3px_hsl(var(--tertiary)/0.6)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
          Technical <span className="text-primary ml-1">Indicators</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {INDICATORS.map((indicator) => {
            const isSelected = selectedIndicators.includes(indicator);
            return (
              <Button
                key={indicator}
                onClick={() => onIndicatorChange(indicator, !isSelected)}
                variant="outline"
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                )}
              >
                {isSelected ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4 opacity-50" />}
                {indicator}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicatorSelector;
