
import { FunctionComponent } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';

interface IndicatorSelectorProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
}

const INDICATORS = ["RSI", "EMA", "VWAP", "BOLL", "SAR", "ADX"];

const IndicatorSelector: FunctionComponent<IndicatorSelectorProps> = ({
  selectedIndicators,
  onIndicatorChange,
}) => {
  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-[0_0_15px_2px_hsl(var(--primary)/0.3)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {INDICATORS.map((indicator) => (
            <div key={indicator} className="flex items-center space-x-2">
              <Checkbox
                id={`indicator-${indicator}`}
                checked={selectedIndicators.includes(indicator)}
                onCheckedChange={(checked) => onIndicatorChange(indicator, !!checked)}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label htmlFor={`indicator-${indicator}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {indicator}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicatorSelector;
