
import { FunctionComponent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

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
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-accent hover:shadow-[0_0_15px_3px_hsl(var(--primary)/0.6)]">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
          Risk <span className="text-primary ml-1">Tolerance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-3">
          {RISK_LEVELS.map((level) => {
            const isSelected = riskLevel === level;
            return (
              <Button
                key={level}
                onClick={() => onRiskChange(level)}
                variant="outline"
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
                )}
              >
                {isSelected ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4 opacity-50" />}
                {level}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskSelector;
