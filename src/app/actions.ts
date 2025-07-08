
"use server";
import { prisma } from '@/lib/prisma';
import type { User as UserProfile, Position as PrismaPosition, GeneratedSignal as PrismaGeneratedSignal, SignalType, PositionStatus, PositionType, SignalStatus } from '@prisma/client';
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

export type Position = Serializable<PrismaPosition>;
export type GeneratedSignal = Serializable<PrismaGeneratedSignal>;
export type { UserProfile };

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
};
export type GenerateShadowChoiceStrategyOutput = ShadowChoiceStrategyCoreOutput & {
  id: string;
  symbol: string;
  disclaimer: string;
  type: 'CUSTOM';
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
    if (userId) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if(existingUser) return existingUser;
    }

    const newUser = await prisma.user.create({
        data: {
            username: `Analyst_${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`,
        }
    });
    return newUser;
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
    if (!userId || !data.username) return null;
    return prisma.user.update({
        where: { id: userId },
        data: { username: data.username },
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
        
        const resultId = randomUUID();
        const fullResult: GenerateTradingStrategyOutput = {
            ...strategy,
            id: resultId,
            symbol: input.symbol,
            disclaimer: disclaimer.disclaimer,
            tradingMode: input.tradingMode,
            risk_rating: strategy.risk_rating || input.riskProfile,
            type: 'INSTANT' as const
        };
        
        await prisma.$transaction(async (tx) => {
            await tx.position.create({
                data: {
                    userId: input.userId,
                    symbol: fullResult.symbol,
                    signalType: fullResult.signal as SignalType,
                    status: 'OPEN',
                    entryPrice: parsePrice(fullResult.entry_zone),
                    stopLoss: parsePrice(fullResult.stop_loss),
                    takeProfit: parsePrice(fullResult.take_profit),
                    openTimestamp: new Date(),
                    type: 'INSTANT',
                    tradingMode: fullResult.tradingMode,
                    riskProfile: fullResult.risk_rating,
                    gpt_confidence_score: fullResult.gpt_confidence_score,
                    sentiment: fullResult.sentiment,
                }
            });

            await tx.user.update({
                where: { id: input.userId },
                data: {
                    weeklyPoints: { increment: 25 },
                    airdropPoints: { increment: 50 },
                }
            });
        });

        return fullResult;

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

        const fullResult = { ...strategy, id: randomUUID(), symbol: input.symbol, disclaimer: disclaimer.disclaimer, type: 'CUSTOM' as const };
        
        await prisma.$transaction(async (tx) => {
            await tx.generatedSignal.create({
                data: { ...fullResult, userId, status: 'PENDING_EXECUTION' as SignalStatus }
            });
            await tx.user.update({
                where: { id: userId },
                data: { airdropPoints: { increment: 10 } }
            });
        });

        return fullResult;

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

export async function executeCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    return prisma.$transaction(async (tx) => {
        const signal = await tx.generatedSignal.findUnique({ where: { id: signalId } });
        if (!signal || signal.userId !== userId) return { success: false, error: 'Signal not found.' };

        await tx.position.create({
            data: {
                userId,
                symbol: signal.symbol,
                signalType: signal.signal as SignalType,
                status: 'PENDING' as PositionStatus,
                entryPrice: parsePrice(signal.entry_zone),
                stopLoss: parsePrice(signal.stop_loss),
                takeProfit: parsePrice(signal.take_profit),
                expirationTimestamp: add(new Date(), { hours: 24 }),
                strategyId: signal.id,
                type: 'CUSTOM' as PositionType,
                tradingMode: signal.chosenTradingMode || 'Custom',
                riskProfile: signal.chosenRiskProfile || 'Medium',
                gpt_confidence_score: signal.gpt_confidence_score,
                sentiment: signal.sentiment,
            }
        });

        await tx.generatedSignal.update({
            where: { id: signalId },
            data: { status: 'EXECUTED' as SignalStatus }
        });
        
        await tx.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: 25 },
                airdropPoints: { increment: 50 },
            }
        });
        
        return { success: true };
    });
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

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ position?: Position; error?: string; }> {
    const positionToUpdate = await prisma.position.findUnique({ where: { id: positionId } });
    if (!positionToUpdate) return { error: 'Position not found.' };
    if (positionToUpdate.status !== 'OPEN') return { error: 'Position is not open.' };

    const pnl = (positionToUpdate.signalType === 'BUY'
        ? (closePrice - positionToUpdate.entryPrice)
        : (positionToUpdate.entryPrice - closePrice)) * positionToUpdate.size;
    
    const rewards = calculateTradeRewards(pnl, positionToUpdate.tradingMode, positionToUpdate.riskProfile);

    const updatedPosition = await prisma.$transaction(async (tx) => {
        const pos = await tx.position.update({
            where: { id: positionId },
            data: {
                status: 'CLOSED',
                closePrice: closePrice,
                closeTimestamp: new Date(),
                pnl: pnl,
                gainedXp: rewards.gainedXp,
                gainedAirdropPoints: rewards.gainedAirdropPoints,
                gasPaid: rewards.gasPaid,
                blocksTrained: rewards.blocksTrained,
            }
        });

        await tx.user.update({
            where: { id: pos.userId },
            data: {
                airdropPoints: { increment: rewards.gainedAirdropPoints },
                weeklyPoints: { increment: rewards.gainedXp },
            }
        });
        return pos;
    });
    
    return { position: serializeWithDates(updatedPosition) };
}

export async function fetchPendingAndOpenPositionsAction(userId: string): Promise<Position[]> {
    const positions = await prisma.position.findMany({
        where: { userId, status: { in: ['PENDING', 'OPEN'] } },
        orderBy: { createdAt: 'desc' }
    });
    return positions.map(serializeWithDates);
}

export async function fetchTradeHistoryAction(userId: string): Promise<Position[]> {
    const positions = await prisma.position.findMany({
        where: { userId, status: 'CLOSED' },
        orderBy: { closeTimestamp: 'desc' }
    });
    return positions.map(serializeWithDates);
}

export async function fetchPortfolioStatsAction(userId: string): Promise<PortfolioStats | { error: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found' };

    const closedTrades = await prisma.position.findMany({ where: { userId: userId, status: 'CLOSED' } });
    const signalsCount = await prisma.generatedSignal.count({ where: { userId: userId } });
    
    const totalTrades = closedTrades.length;
    
    if (totalTrades === 0) {
        return {
            totalTrades: 0, winRate: 0, winningTrades: 0, totalPnl: 0,
            totalPnlPercentage: 0, bestTradePnl: 0, worstTradePnl: 0,
            lifetimeRewards: user.airdropPoints,
            nodesTrained: signalsCount, xpGained: user.weeklyPoints,
        };
    }

    const winningTrades = closedTrades.filter((t) => t.pnl && t.pnl > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const bestTradePnl = Math.max(...closedTrades.map((t) => t.pnl || 0), 0);
    const worstTradePnl = Math.min(...closedTrades.map((t) => t.pnl || 0), 0);
    
    return {
        totalTrades, winRate, winningTrades, totalPnl,
        totalPnlPercentage: 0, // Simplified for now
        bestTradePnl, worstTradePnl,
        lifetimeRewards: user.airdropPoints,
        nodesTrained: signalsCount, xpGained: user.weeklyPoints
    };
}

export async function generatePerformanceReviewAction(userId: string): Promise<PerformanceReviewOutput | { error: string }> {
    const tradeHistory = await prisma.position.findMany({
      where: { userId: userId, status: 'CLOSED' },
      take: 50,
      orderBy: { closeTimestamp: 'desc' }
    });
    if (tradeHistory.length < 3) return { error: 'Insufficient trade history for analysis. Complete at least 3 trades.' };
    
    const stats = await fetchPortfolioStatsAction(userId);
    if('error' in stats) return stats;

    const reviewInput: PerformanceReviewInput = {
        stats: {
            totalTrades: stats.totalTrades,
            winRate: stats.winRate,
            winningTrades: stats.winningTrades,
            totalPnl: stats.totalPnl,
            bestTradePnl: stats.bestTradePnl,
            worstTradePnl: stats.worstTradePnl,
        },
        tradeHistory: tradeHistory.map(t => ({
            id: t.id,
            symbol: t.symbol,
            signalType: t.signalType,
            entryPrice: t.entryPrice,
            closePrice: t.closePrice,
            pnl: t.pnl,
            openTimestamp: t.openTimestamp?.toISOString() || "",
            closeTimestamp: t.closeTimestamp?.toISOString() || null,
        }))
    }
    
    return genPerformanceReview(reviewInput);
}

export async function killSwitchAction(userId: string): Promise<{ success: boolean; message: string; }> {
    const openPositions = await prisma.position.findMany({ where: { userId: userId, status: 'OPEN' } });
    if(openPositions.length === 0) return { success: true, message: 'No active positions to close.' };
    
    for (const p of openPositions) {
        // Here we assume a live price check would happen, but for simplicity, we close at entry.
        const marketData = await fetchMarketDataAction({symbol: p.symbol});
        const closePrice = 'error' in marketData ? p.entryPrice : parseFloat(marketData.lastPrice);
        await closePositionAction(p.id, closePrice);
    }
    
    return { success: true, message: `Successfully closed ${openPositions.length} open positions.` };
}

export async function activatePendingPositionAction(positionId: string): Promise<{ position?: Position; error?: string; }> {
    const updatedPosition = await prisma.position.update({
        where: { id: positionId, status: 'PENDING' },
        data: { status: 'OPEN', openTimestamp: new Date() }
    });
    if (!updatedPosition) return { error: "Position not found or not pending." };
    return { position: serializeWithDates(updatedPosition) };
}

export async function cancelPendingPositionAction(positionId: string): Promise<{ success: boolean; error?: string; }> {
    const result = await prisma.position.deleteMany({
        where: { id: positionId, status: 'PENDING' }
    });
    if (result.count === 0) return { success: false, error: "Position not found or not pending." };
    return { success: true };
}

export async function fetchAllGeneratedSignalsAction(userId: string): Promise<GeneratedSignal[] | { error: string }> {
    if (!userId) return { error: 'User ID is required' };
    const signals = await prisma.generatedSignal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    return signals.map(serializeWithDates);
}

export async function dismissCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean, error?: string }> {
    const result = await prisma.generatedSignal.updateMany({
        where: { id: signalId, userId: userId },
        data: { status: 'DISMISSED' as SignalStatus }
    });
    if(result.count === 0) return { success: false, error: 'Signal not found' };
    return { success: true };
}
