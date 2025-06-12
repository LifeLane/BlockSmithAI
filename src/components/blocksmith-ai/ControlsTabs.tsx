
import { FunctionComponent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndicatorSelector from './IndicatorSelector';
import RiskSelector from './RiskSelector';
import ApiSettingsForm from './ApiSettingsForm';
import MarketDataDisplay from './MarketDataDisplay'; // Import MarketDataDisplay
import type { LiveMarketData } from '@/app/actions'; // Import LiveMarketData type

interface ControlsTabsProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicator: string, checked: boolean) => void;
  riskLevel: string;
  onRiskChange: (riskLevel: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  apiSecret: string;
  onApiSecretChange: (secret: string) => void;
  onApiKeysSave: () => void;
  // Props for MarketDataDisplay
  apiKeySet: boolean;
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
  apiKey,
  onApiKeyChange,
  apiSecret,
  onApiSecretChange,
  onApiKeysSave,
  apiKeySet,
  liveMarketData,
  isLoadingMarketData,
  marketDataError,
  symbolForDisplay,
}) => {
  return (
    <Tabs defaultValue="indicators" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-card border-b-0 rounded-t-lg">
        <TabsTrigger value="market" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Market</TabsTrigger>
        <TabsTrigger value="indicators" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Indicators</TabsTrigger>
        <TabsTrigger value="risk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Risk</TabsTrigger>
        <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">API</TabsTrigger>
      </TabsList>
      <TabsContent value="market" className="mt-0 rounded-b-lg bg-card p-0">
        <MarketDataDisplay
          apiKeySet={apiKeySet}
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
      <TabsContent value="api" className="mt-0 rounded-b-lg bg-card p-0">
        <ApiSettingsForm
          apiKey={apiKey}
          onApiKeyChange={onApiKeyChange}
          apiSecret={apiSecret}
          onApiSecretChange={onApiSecretChange}
          onSave={onApiKeysSave}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ControlsTabs;
