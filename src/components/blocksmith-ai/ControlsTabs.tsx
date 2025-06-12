
import { FunctionComponent } from 'react';
import IndicatorSelector from './IndicatorSelector';
import RiskSelector from './RiskSelector';
import MarketDataDisplay from './MarketDataDisplay';
import type { LiveMarketData } from '@/app/actions';

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
    <div className="space-y-6">
      <MarketDataDisplay
        liveMarketData={liveMarketData}
        isLoading={isLoadingMarketData}
        error={marketDataError}
        symbolForDisplay={symbolForDisplay}
      />
      <IndicatorSelector
        selectedIndicators={selectedIndicators}
        onIndicatorChange={onIndicatorChange}
      />
      <RiskSelector riskLevel={riskLevel} onRiskChange={onRiskChange} />
    </div>
  );
};

export default ControlsTabs;
