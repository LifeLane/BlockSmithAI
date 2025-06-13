
import { FunctionComponent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndicatorSelector from './IndicatorSelector';
import RiskSelector from './RiskSelector';
import MarketDataDisplay from './MarketDataDisplay';
import type { LiveMarketData } from '@/app/actions';
import { Activity, Settings } from 'lucide-react';

interface ControlsTabsProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
  riskLevel: string;
  onRiskChange: (riskLevel: string) => void;
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
  liveMarketData,
  isLoadingMarketData,
  marketDataError,
  symbolForDisplay,
}) => {
  return (
    <Tabs defaultValue="market-pulse" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-border/70 mb-4">
        <TabsTrigger value="market-pulse" className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-primary/5">
          <Activity className="mr-1.5 h-4 w-4" /> Market Pulse
        </TabsTrigger>
        <TabsTrigger value="strategy-config" className="text-xs sm:text-sm data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-md hover:bg-accent/5">
          <Settings className="mr-1.5 h-4 w-4" /> AI Strategy Config
        </TabsTrigger>
      </TabsList>
      <TabsContent value="market-pulse">
        <MarketDataDisplay
          liveMarketData={liveMarketData}
          isLoading={isLoadingMarketData}
          error={marketDataError}
          symbolForDisplay={symbolForDisplay}
        />
      </TabsContent>
      <TabsContent value="strategy-config">
        <div className="space-y-6">
          <IndicatorSelector
            selectedIndicators={selectedIndicators}
            onIndicatorChange={onIndicatorChange}
          />
          <RiskSelector riskLevel={riskLevel} onRiskChange={onRiskChange} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ControlsTabs;
