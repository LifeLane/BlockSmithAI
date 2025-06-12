
import { FunctionComponent } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface RiskSelectorProps {
  riskLevel: string;
  onRiskChange: (riskLevel: string) => void;
}

const RISK_LEVELS = ["Low", "Medium", "High"];

const RiskSelector: FunctionComponent<RiskSelectorProps> = ({
  riskLevel,
  onRiskChange,
}) => {
  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_15px_2px_hsl(var(--primary)/0.5)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
          Risk <span className="text-primary ml-1">Tolerance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={riskLevel} onValueChange={onRiskChange} className="space-y-2">
          {RISK_LEVELS.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`risk-${level}`} className="border-primary text-primary focus:ring-primary"/>
              <Label htmlFor={`risk-${level}`} className="text-sm font-medium hover:text-primary transition-colors">{level}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default RiskSelector;
