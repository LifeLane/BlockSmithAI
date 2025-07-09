
"use server";
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Position as PrismaPosition, GeneratedSignal as PrismaGeneratedSignal, SignalType, PositionStatus, PositionType, SignalStatus, Badge } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type PromptInput as TradingStrategyPromptInput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';
import {
    generatePerformanceReview as genPerformanceReview,
    type PerformanceReviewInput,
    type PerformanceReviewOutput
} from '@/ai/flows/generate-performance-review';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';
import { fetchMarketDataAction } from '@/services/market-data-service';

// --- Type Definitions ---
// Helper to convert Prisma's Date objects to ISO strings for client-side serialization
type Serializable<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K];
};

// Define a type for User with badges included
const userWithBadgesArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { badges: true },
});
export type UserProfile = Prisma.UserGetPayload<typeof userWithBadgesArgs>;


export type Position = Serializable<PrismaPosition>;
export type GeneratedSignal = Serializable<PrismaGeneratedSignal>;


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
export interface FormattedSymbol {
  value: string;
  label: string;
}
export type TickerSymbolData = Pick<LiveMarketData, 'symbol' | 'lastPrice' | 'priceChangePercent'>;

// This type is now defined and used on the client-side
export interface PortfolioStats {
    totalTrades: number;
    winRate: number;
    winningTrades: number;
    totalPnl: number;
    totalPnlPercentage: number;
    bestTradePnl: number;
    worstTradePnl: number;
    lifetimeRewards: number; // this is airdropPoints
    nodesTrained: number;
    xpGained: number;
}
export type GenerateTradingStrategyOutput = Awaited<ReturnType<typeof genCoreStrategy>> & {
  id: string;
  disclaimer: string;
  symbol: string;
  tradingMode: string;
  risk_rating: string;
  type: 'INSTANT';
  size: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'OPEN';
  openTimestamp: string;
  createdAt: string;
};
export type GenerateShadowChoiceStrategyOutput = ShadowChoiceStrategyCoreOutput & {
  id: string;
  symbol: string;
  disclaimer: string;
  type: 'CUSTOM';
  status: 'PENDING_EXECUTION';
  createdAt: string;
};
export type { PerformanceReviewOutput };

const serializeWithDates = <T>(obj: T): Serializable<T> => {
    if (obj === null || obj === undefined) return obj as any;
    const newObj: any = { ...obj };
    for (const key in newObj) {
        if (newObj[key] instanceof Date) {
            newObj[key] = newObj[key].toISOString();
        }
    }
    return newObj;
};


// --- ---

export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    const userQuery = {
        include: {
            badges: true,
        },
    };

    if (userId) {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            ...userQuery
        });
        if(existingUser) return existingUser;
    }

    const newUser = await prisma.user.create({
        data: {
            username: `Analyst_${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`,
        },
        ...userQuery
    });
    return newUser;
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    return prisma.user.findUnique({
        where: { id: userId },
        include: {
            badges: true,
        },
    });
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
    if (!userId || !data.username) return null;
    return prisma.user.update({
        where: { id: userId },
        data: { username: data.username },
        include: { badges: true },
    });
}

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<{ userId: string; } | { error: string; }> {
    if (!userId) return { error: "User not found." };
    await prisma.user.update({
        where: { id: userId },
        data: {
            status: "Registered",
            wallet_address: formData.wallet_address,
            wallet_type: formData.wallet_type,
            email: formData.email,
            phone: formData.phone,
            x_handle: formData.x_handle,
            telegram_handle: formData.telegram_handle,
            youtube_handle: formData.youtube_handle,
        }
    });
    return { userId };
}

export async function fetchLeaderboardDataJson(): Promise<LeaderboardUser[]> {
    const users = await prisma.user.findMany({
        take: 10,
        orderBy: { weeklyPoints: 'desc' },
    });
    return users.map((user, index) => ({
        id: user.id,
        username: user.username,
        weeklyPoints: user.weeklyPoints,
        airdropPoints: user.airdropPoints,
        rank: index + 1,
    }));
}

const timeframeMappings: { [key: string]: { short: string; medium: string; long: string; } } = {
    Scalper: { short: '1m', medium: '3m', long: '5m' },
    Sniper: { short: '5m', medium: '15m', long: '30m' },
    Intraday: { short: '15m', medium: '30m', long: '1h' },
    Swing: { short: '1h', medium: '4h', long: '1d' },
};

const parsePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
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
        
        await prisma.user.update({
            where: { id: input.userId },
            data: {
                weeklyPoints: { increment: 25 },
                airdropPoints: { increment: 50 },
            }
        });
        
        const now = new Date().toISOString();

        return {
            ...strategy,
            id: randomUUID(),
            symbol: input.symbol,
            disclaimer: disclaimer.disclaimer,
            tradingMode: input.tradingMode,
            risk_rating: strategy.risk_rating || input.riskProfile,
            type: 'INSTANT',
            size: 1, // Default size
            entryPrice: parsePrice(strategy.entry_zone),
            stopLoss: parsePrice(strategy.stop_loss),
            takeProfit: parsePrice(strategy.take_profit),
            status: 'OPEN',
            openTimestamp: now,
            createdAt: now,
        };

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

        await prisma.user.update({
            where: { id: userId },
            data: { airdropPoints: { increment: 10 } }
        });

        return { 
            ...strategy, 
            id: randomUUID(), 
            symbol: input.symbol, 
            disclaimer: disclaimer.disclaimer, 
            type: 'CUSTOM',
            status: 'PENDING_EXECUTION',
            createdAt: new Date().toISOString()
        };

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

export async function claimMissionRewardAction(userId: string, missionId: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'User not found.' };

    await prisma.user.update({
        where: { id: userId },
        data: { claimedMissions: { push: missionId } }
    });
    return { success: true, message: `Mission reward claimed.` };
}

export async function executeCustomSignalAction(userId: string): Promise<{ success: boolean, error?: string }> {
    try {
         await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: 25 },
                airdropPoints: { increment: 50 },
            }
        });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: "Failed to update user points." }
    }
}

const calculateTradeRewards = (pnl: number, tradingMode: string, riskProfile: string) => {
    const BASE_WIN_XP = 50;
    const BASE_LOSS_XP = 10;
    const BASE_WIN_AIRDROP_BONUS = 25;
    const BASE_LOSS_AIRDROP_BONUS = 5;

    const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
    const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };

    const modeMultiplier = modeMultipliers[tradingMode] || 1.0;
    const riskMultiplier = riskMultipliers[riskProfile] || 1.0;

    let gainedXp: number;
    let gainedAirdropPoints: number;

    if (pnl > 0) {
        gainedXp = BASE_WIN_XP * modeMultiplier * riskMultiplier;
        gainedAirdropPoints = pnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier);
    } else {
        gainedXp = BASE_LOSS_XP * modeMultiplier;
        gainedAirdropPoints = pnl + BASE_LOSS_AIRDROP_BONUS;
    }

    const gasPaid = 1.25 + (riskMultiplier - 1) + (modeMultiplier - 1);
    const blocksTrained = 100 + Math.floor(Math.abs(pnl) * 2);

    return {
        gainedXp: Math.round(gainedXp),
        gainedAirdropPoints: Math.round(gainedAirdropPoints),
        gasPaid: parseFloat(gasPaid.toFixed(2)),
        blocksTrained
    };
};

export async function closePositionAction(userId: string, position: Position, closePrice: number): Promise<{ updatedPosition: Position; error?: string; }> {
    if (position.status !== 'OPEN') return { error: 'Position is not open.', updatedPosition: position };

    const pnl = (position.signalType === 'BUY'
        ? (closePrice - position.entryPrice)
        : (position.entryPrice - position.closePrice!)) * position.size;
    
    const rewards = calculateTradeRewards(pnl, position.tradingMode, position.riskProfile);

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                airdropPoints: { increment: rewards.gainedAirdropPoints },
                weeklyPoints: { increment: rewards.gainedXp },
            }
        });
    } catch (e: any) {
         return { error: 'Failed to update user rewards points.', updatedPosition: position };
    }
    
    const updatedPosition: Position = {
        ...position,
        status: 'CLOSED',
        closePrice: closePrice,
        closeTimestamp: new Date().toISOString(),
        pnl: pnl,
        gainedXp: rewards.gainedXp,
        gainedAirdropPoints: rewards.gainedAirdropPoints,
        gasPaid: rewards.gasPaid,
        blocksTrained: rewards.blocksTrained,
    };
    
    return { updatedPosition };
}


export async function generatePerformanceReviewAction(userId: string, input: PerformanceReviewInput): Promise<PerformanceReviewOutput | { error: string }> {
    if (input.tradeHistory.length < 3) return { error: 'Insufficient trade history for analysis. Complete at least 3 trades.' };
    
    return genPerformanceReview(input);
}

export async function killSwitchAction(userId: string): Promise<{ success: boolean; message: string; }> {
    // This action now only needs to inform the client. The client will handle closing positions.
    // In a real scenario, this might still trigger some backend process, but for this architecture, it's a client-side loop.
    return { success: true, message: `Kill switch signal acknowledged. Client will now close positions.` };
}
