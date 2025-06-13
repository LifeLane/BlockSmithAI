
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
      <TabsList className="grid w-full grid-cols-2 bg-card border border-border/80 rounded-lg p-1 mb-4">
        <TabsTrigger
          value="market-pulse"
          className="text-sm sm:text-base py-2.5 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 ease-in-out rounded-md"
        >
          <Activity className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> Market Pulse
        </TabsTrigger>
        <TabsTrigger
          value="strategy-config"
          className="text-sm sm:text-base py-2.5 px-3 data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:shadow-lg hover:bg-accent/10 hover:text-accent transition-all duration-200 ease-in-out rounded-md"
        >
          <Settings className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> AI Strategy Config
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
