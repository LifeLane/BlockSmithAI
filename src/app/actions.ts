
"use server";
// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type PromptInput as TradingStrategyPromptInput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';
import { generateMissionLog, type GenerateMissionLogInput } from '@/ai/flows/generate-mission-log';
import { 
    generatePerformanceReview as genPerformanceReview, 
    type PerformanceReviewInput, 
    type PerformanceReviewOutput 
} from '@/ai/flows/generate-performance-review';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';


// Node/Prisma Imports
import { randomUUID } from 'crypto';
import { add, isBefore } from 'date-fns';
import { fetchMarketDataAction } from '@/services/market-data-service';


// --- MOCK DATA AND TYPES (DATABASE REMOVED) ---

// Helper function to robustly parse price strings, which could be a single number or a range.
const parsePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' '); 
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
};


// Type Definitions
// Re-defining types to avoid Prisma dependency.
export interface Position {
    id: string;
    userId: string;
    symbol: string;
    signalType: 'BUY' | 'SELL';
    status: 'PENDING' | 'OPEN' | 'CLOSED';
    entryPrice: number;
    closePrice: number | null;
    size: number;
    stopLoss: number | null;
    takeProfit: number | null;
    pnl: number | null;
    openTimestamp: Date | null;
    closeTimestamp: Date | null;
    expirationTimestamp: Date | null;
    strategyId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Badge { name: string; }
export interface UserProfile {
    id: string;
    username: string;
    shadowId: string;
    status: string;
    weeklyPoints: number;
    airdropPoints: number;
    badges: Badge[];
    claimedMissions: string[];
    claimedSpecialOps: string[];
    email?: string | null;
    phone?: string | null;
    x_handle?: string | null;
    telegram_handle?: string | null;
    youtube_handle?: string | null;
    wallet_address?: string | null;
    wallet_type?: string | null;
}
export interface GeneratedSignal {
    id: string;
    userId: string;
    symbol: string;
    signal: string;
    entry_zone: string;
    stop_loss: string;
    take_profit: string;
    confidence: string;
    risk_rating: string;
    gpt_confidence_score: string;
    sentiment: string;
    currentThought: string;
    shortTermPrediction: string | null;
    sentimentTransition: string | null;
    chosenTradingMode: string;
    chosenRiskProfile: string;
    strategyReasoning: string;
    analysisSummary: string;
    newsAnalysis: string | null;
    disclaimer: string;
    type: 'INSTANT' | 'CUSTOM';
    status: 'PENDING_EXECUTION' | 'EXECUTED' | 'DISMISSED' | 'ARCHIVED' | 'ERROR';
    createdAt: Date;
    updatedAt: Date;
}

export type ChatMessage = AIChatMessage;
export interface LeaderboardUser {
    id: string;
    username: string;
    weeklyPoints: number;
    airdropPoints: number;
    rank?: number;
    badge?: string;
}
export interface AirdropFormData {
    wallet_address: string;
    wallet_type?: string;
    email?: string;
    phone?: string;
    x_handle?: string;
    telegram_handle?: string;
    youtube_handle?: string;
}
export interface LiveMarketData {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    volume: string;
    highPrice: string;
    lowPrice: string;
    quoteVolume: string;
}
export interface AgentLevel {
  level: number;
  deployDuration: number;
  xpReward: number;
  bsaiReward: number;
  upgradeCost: number;
}
export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: AgentLevel[];
}
export interface UserAgent {
  id: string;
  userId: string;
  agentId: string;
  level: number;
  status: 'IDLE' | 'DEPLOYED';
  deploymentEndTime: string | null;
}
export interface UserAgentData extends Agent {
  userState: UserAgent | null;
}
export interface SpecialOp {
    id: string;
    title: string;
    description: string;
    requiredAgentId: string;
    requiredAgentLevel: number;
    xpReward: number;
    bsaiReward: number;
    isActive: boolean;
    claimedBy: string[];
}
export interface FormattedSymbol {
  value: string;
  label: string;
}
export type TickerSymbolData = Pick<LiveMarketData, 'symbol' | 'lastPrice' | 'priceChangePercent'>;
export interface PortfolioStats {
    totalTrades: number;
    winRate: number;
    winningTrades: number;
    totalPnl: number;
    totalPnlPercentage: number;
    bestTradePnl: number;
    worstTradePnl: number;
    lifetimeRewards: number;
    totalCapitalInvested: number;
}
export type GenerateTradingStrategyOutput = Awaited<ReturnType<typeof genCoreStrategy>> & {
  id: string;
  disclaimer: string;
  symbol: string;
  tradingMode: string;
};
export type GenerateShadowChoiceStrategyOutput = ShadowChoiceStrategyCoreOutput & {
  id: string;
  symbol: string;
  disclaimer: string;
};
export type { PerformanceReviewOutput };

const MOCK_USER_STORE: { [id: string]: UserProfile } = {};

function getMockUser(userId: string): UserProfile {
    if (MOCK_USER_STORE[userId]) {
        return MOCK_USER_STORE[userId];
    }
    const newUser: UserProfile = {
        id: userId,
        username: `Analyst_${userId.substring(0, 6)}`,
        shadowId: `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`,
        status: "Guest",
        weeklyPoints: 100,
        airdropPoints: 50,
        badges: [],
        claimedMissions: [],
        claimedSpecialOps: [],
    };
    MOCK_USER_STORE[userId] = newUser;
    return newUser;
}

// --- ---

export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    if (userId) {
        return getMockUser(userId);
    }
    const newId = randomUUID();
    return getMockUser(newId);
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    return getMockUser(userId);
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
    const user = getMockUser(userId);
    if(data.username) {
        user.username = data.username;
    }
    return user;
}

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<{ userId: string; } | { error: string; }> {
    const user = getMockUser(userId);
    user.status = "Registered";
    user.wallet_address = formData.wallet_address;
    user.wallet_type = formData.wallet_type;
    user.email = formData.email;
    user.phone = formData.phone;
    user.x_handle = formData.x_handle;
    user.telegram_handle = formData.telegram_handle;
    user.youtube_handle = formData.youtube_handle;
    return { userId };
}

export async function fetchLeaderboardDataJson(): Promise<LeaderboardUser[]> {
    return []; // Feature disabled
}


const timeframeMappings: { [key: string]: { short: string; medium: string; long: string; } } = {
    Scalper: { short: '1m', medium: '3m', long: '5m' },
    Sniper: { short: '5m', medium: '15m', long: '30m' },
    Intraday: { short: '15m', medium: '30m', long: '1h' },
    Swing: { short: '1h', medium: '4h', long: '1d' },
};

export async function generateTradingStrategyAction(input: Omit<TradingStrategyPromptInput, 'shortTermCandles' | 'mediumTermCandles' | 'longTermCandles'> & { userId: string }): Promise<GenerateTradingStrategyOutput | { error: string }> {
    try {
        const timeframes = timeframeMappings[input.tradingMode] || timeframeMappings.Intraday;

        const [shortTermResult, mediumTermResult, longTermResult] = await Promise.all([
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.short }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.medium }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.long }),
        ]);

        if (shortTermResult.error || mediumTermResult.error || longTermResult.error) {
            const error = shortTermResult.error || mediumTermResult.error || longTermResult.error;
            return { error: `Failed to retrieve historical market data required for analysis. Reason: ${error}` };
        }

        const promptInput: TradingStrategyPromptInput = { 
            ...input,
            shortTermCandles: JSON.stringify(shortTermResult.candles),
            mediumTermCandles: JSON.stringify(mediumTermResult.candles),
            longTermCandles: JSON.stringify(longTermResult.candles),
        };
        
        const [strategy, disclaimer] = await Promise.all([ genCoreStrategy(promptInput), generateSarcasticDisclaimer() ]);
        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };
        
        return { ...strategy, id: randomUUID(), symbol: input.symbol, disclaimer: disclaimer.disclaimer, tradingMode: input.tradingMode };

    } catch (error: any) {
        console.error("Error in generateTradingStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(input: ShadowChoiceStrategyInput, userId: string): Promise<GenerateShadowChoiceStrategyOutput | { error: string }> {
    try {
        const timeframes = { short: '15m', medium: '1h', long: '4h' };

        const [shortTermResult, mediumTermResult, longTermResult] = await Promise.all([
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.short }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.medium }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.long }),
        ]);

        if (shortTermResult.error || mediumTermResult.error || longTermResult.error) {
            const error = shortTermResult.error || mediumTermResult.error || longTermResult.error;
            return { error: `Failed to retrieve historical market data required for analysis. Reason: ${error}` };
        }

        const promptInput = {
            ...input,
            shortTermCandles: JSON.stringify(shortTermResult.candles),
            mediumTermCandles: JSON.stringify(mediumTermResult.candles),
            longTermCandles: JSON.stringify(longTermResult.candles),
        };
        
        const [strategy, disclaimer] = await Promise.all([ genShadowChoice(promptInput), generateSarcasticDisclaimer() ]);
        if (!strategy) return { error: "SHADOW Core failed to generate an autonomous strategy." };
        
        return { ...strategy, id: randomUUID(), symbol: input.symbol, disclaimer: disclaimer.disclaimer };

    } catch (error: any) {
        console.error("Error in generateShadowChoiceStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's autonomous core: ${error.message}` };
    }
}


export async function shadowChatAction(input: ShadowChatInput): Promise<ShadowChatOutput | { error: string }> {
    try {
        return await shadowChatFlow(input);
    } catch (error: any) {
        return { error: `SHADOW's response was lost in the ether: ${error.message}` };
    }
}

export async function getDailyGreeting(): Promise<GenerateDailyGreetingOutput> {
    return generateDailyGreeting();
}

// --- Stubbed out functions that require a database ---

export async function claimMissionRewardAction(userId: string, missionId: string): Promise<{ success: boolean; message: string }> {
    const user = getMockUser(userId);
    user.claimedMissions.push(missionId);
    return { success: true, message: `Mission reward claimed (session only).` };
}

export async function logInstantPositionAction(userId: string, strategy: GenerateTradingStrategyOutput): Promise<{ success: boolean; error?: string; }> {
    console.log(`MOCK: Logging instant position for user ${userId} for symbol ${strategy.symbol}. No database is connected.`);
    return { success: true };
}

export async function executeCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`MOCK: Executing custom signal ${signalId} for user ${userId}. No database is connected.`);
    return { success: true };
}

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ position?: Position; airdropPointsEarned?: number; error?: string; }> {
    return { error: 'Feature disabled: Database connection is not active.' };
}

export async function fetchPendingAndOpenPositionsAction(userId: string): Promise<Position[]> {
    return [];
}

export async function fetchTradeHistoryAction(userId: string): Promise<Position[]> {
    return [];
}

export async function fetchPortfolioStatsAction(userId: string): Promise<PortfolioStats | { error: string }> {
    const user = getMockUser(userId);
    return { 
        totalTrades: 0, 
        winRate: 0, 
        winningTrades: 0, 
        totalPnl: 0, 
        totalPnlPercentage: 0, 
        bestTradePnl: 0, 
        worstTradePnl: 0, 
        lifetimeRewards: user.airdropPoints, 
        totalCapitalInvested: 0
    };
}

export async function fetchAgentDataAction(userId: string): Promise<{ agents: UserAgentData[], userXp: number } | { error: string }> {
    const user = getMockUser(userId);
    return { agents: [], userXp: user.weeklyPoints };
}

export async function deployAgentAction(userId: string, agentId: string): Promise<{ success: boolean, error?: string }> {
    return { success: false, error: "Feature disabled: Database connection is not active." };
}

export async function claimAgentRewardsAction(userId: string, agentId: string): Promise<{ success: boolean; log?: string, message?: string }> {
     return { success: false, message: "Feature disabled: Database connection is not active." };
}

export async function upgradeAgentAction(userId: string, agentId: string): Promise<{ success: boolean; message: string }> {
    return { success: false, message: "Feature disabled: Database connection is not active." };
}

export async function fetchSpecialOpsAction(userId: string): Promise<SpecialOp[]> {
   return [];
}

export async function claimSpecialOpAction(userId: string, opId: string): Promise<{ success: boolean; message: string; }> {
    return { success: false, message: "Feature disabled: Database connection is not active." };
}

export async function generatePerformanceReviewAction(userId: string): Promise<PerformanceReviewOutput | { error: string }> {
    return { error: 'Feature disabled: No trade history available without a database.' };
}

export async function killSwitchAction(userId: string): Promise<{ success: boolean; message: string; }> {
    return { success: true, message: 'No active positions to close (Database is disabled).' };
}

export async function activatePendingPositionAction(positionId: string): Promise<{ position?: Position; error?: string; }> {
    return { error: 'Feature disabled: Database connection is not active.' };
}

export async function cancelPendingPositionAction(positionId: string): Promise<{ success: boolean; error?: string; }> {
    return { success: true, error: 'Feature disabled: Database connection is not active.' };
}

export async function fetchAllGeneratedSignalsAction(userId: string): Promise<GeneratedSignal[] | { error: string }> {
    return [];
}

export async function dismissCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean, error?: string }> {
    return { success: true, error: "Feature disabled: Database connection is not active." };
}
