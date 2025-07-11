
'use client';
// This file is no longer needed as state management has been moved to the server and database.
// It is kept here to prevent build errors from components that might still import it,
// but it should be considered deprecated and can be removed in a future cleanup.

export type PositionStatus = 'PENDING' | 'OPEN' | 'CLOSED';
export type SignalType = 'BUY' | 'SELL';
export type PositionType = 'INSTANT' | 'CUSTOM';

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  signalType: SignalType;
  status: PositionStatus;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  size: number;
  tradingMode: string;
  riskProfile: string;
  type: PositionType;
  sentiment: string;
  gpt_confidence_score: string;
  createdAt: string;
  openTimestamp: string | null;
  closeTimestamp: string | null;
  closePrice: number | null;
  pnl: number | null;
  gainedXp?: number | null;
  gainedAirdropPoints?: number | null;
  gasPaid?: number | null;
  blocksTrained?: number | null;
  strategyId?: string | null;
}

export type GeneratedSignalStatus = 'PENDING_EXECUTION' | 'EXECUTED' | 'DISMISSED';

export interface GeneratedSignal {
  id: string;
  userId: string;
  symbol: string;
  signal: SignalType;
  entry_zone: string;
  stop_loss: string;
  take_profit: string;
  confidence: string;
  gpt_confidence_score: string;
  risk_rating: string;
  sentiment: string;
  currentThought: string;
  shortTermPrediction: string;
  chosenTradingMode: string;
  chosenRiskProfile: string;
  strategyReasoning: string;
  analysisSummary: string;
  newsAnalysis?: string | null;
  status: GeneratedSignalStatus;
  createdAt: string;
}

// The actual hook is removed. We export empty functions and values
// to avoid breaking imports during the transition.

const useClientState = () => {
    return {
        positions: [],
        addPosition: () => {},
        updatePosition: () => {},
        closePosition: () => null,
        activatePosition: () => {},
        closeAllPositions: async () => 0,
        signals: [],
        addSignal: () => {},
        updateSignal: () => {},
        dismissSignal: () => {},
        executeSignal: () => {},
        isInitialized: true,
    };
};

export { useClientState };
