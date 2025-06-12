
import { FunctionComponent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndicatorSelector from './IndicatorSelector';
import RiskSelector from './RiskSelector';
// ApiSettingsForm import removed
import MarketDataDisplay from './MarketDataDisplay';
import type { LiveMarketData } from '@/app/actions';

interface ControlsTabsProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
  riskLevel: string;
  onRiskChange: (riskLevel: string) => void;
  // API key related props removed
  liveMarketData: LiveMarketData | null;
  isLoadingMarketData: boolean;
  marketDataError: string | null;
  symbolForDisplay: string;
}

const ControlsTabs: FunctionComponent<ControlsTabsProps> = ({
  selectedIndicators,
  onIndicatorChange,
  riskLevel,
  onRiskChange,
  // API key props removed
  liveMarketData,
  isLoadingMarketData,
  marketDataError,
  symbolForDisplay,
}) => {
  return (
    <Tabs defaultValue="indicators" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border-b-0 rounded-t-lg"> {/* Grid cols changed from 4 to 3 */}
        <TabsTrigger value="market" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Market</TabsTrigger>
        <TabsTrigger value="indicators" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Indicators</TabsTrigger>
        <TabsTrigger value="risk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Risk</TabsTrigger>
        {/* API TabTrigger removed */}
      </TabsList>
      <TabsContent value="market" className="mt-0 rounded-b-lg bg-card p-0">
        <MarketDataDisplay
          // apiKeySet prop removed
          liveMarketData={liveMarketData}
          isLoading={isLoadingMarketData}
          error={marketDataError}
          symbolForDisplay={symbolForDisplay}
        />
      </TabsContent>
      <TabsContent value="indicators" className="mt-0 rounded-b-lg bg-card p-0">
        <IndicatorSelector
          selectedIndicators={selectedIndicators}
          onIndicatorChange={onIndicatorChange}
        />
      </TabsContent>
      <TabsContent value="risk" className="mt-0 rounded-b-lg bg-card p-0">
        <RiskSelector riskLevel={riskLevel} onRiskChange={onRiskChange} />
      </TabsContent>
      {/* API TabsContent removed */}
    </Tabs>
  );
};

export default ControlsTabs;
