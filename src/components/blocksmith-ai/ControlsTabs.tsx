import { FunctionComponent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndicatorSelector from './IndicatorSelector';
import RiskSelector from './RiskSelector';

interface ControlsTabsProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
  riskLevel: string;
  onRiskChange: (riskLevel: string) => void;
}

const ControlsTabs: FunctionComponent<ControlsTabsProps> = ({
  selectedIndicators,
  onIndicatorChange,
  riskLevel,
  onRiskChange,
}) => {
  return (
    <Tabs defaultValue="indicators" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-card border-b-0 rounded-t-lg">
        <TabsTrigger value="indicators" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Indicators</TabsTrigger>
        <TabsTrigger value="risk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Risk</TabsTrigger>
      </TabsList>
      <TabsContent value="indicators" className="mt-0 rounded-b-lg bg-card p-0">
        <IndicatorSelector
          selectedIndicators={selectedIndicators}
          onIndicatorChange={onIndicatorChange}
        />
      </TabsContent>
      <TabsContent value="risk" className="mt-0 rounded-b-lg bg-card p-0">
        <RiskSelector riskLevel={riskLevel} onRiskChange={onRiskChange} />
      </TabsContent>
    </Tabs>
  );
};

export default ControlsTabs;
