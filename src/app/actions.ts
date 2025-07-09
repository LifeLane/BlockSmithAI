
"use server";
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Position as PrismaPosition, GeneratedSignal as PrismaGeneratedSignal, Badge as PrismaBadge } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type PromptInput as TradingStrategyPromptInput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput } from '@/ai/flows/generate-shadow-choice-strategy';
import {
    generatePerformanceReview as genPerformanceReview,
    type PerformanceReviewInput,
    type PerformanceReviewOutput
} from '@/ai/flows/generate-performance-review';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';

// --- Type Definitions ---
type Serializable<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K];
};

const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { badges: true },
});
export type UserProfile = Prisma.UserGetPayload<typeof userWithRelations>;

export type Position = Serializable<PrismaPosition>;
export type GeneratedSignal = Serializable<PrismaGeneratedSignal>;

export type ChatMessage = AIChatMessage;
export interface LeaderboardUser {
    id: string;
    username: string;
    weeklyPoints: number;
    airdropPoints: number;
    rank?: number;
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
    bestTradePnl: number;
    worstTradePnl: number;
}

export type { PerformanceReviewOutput };

const serializeWithDates = <T>(obj: T | T[]): Serializable<T> | Serializable<T>[] => {
    if (Array.isArray(obj)) {
        return obj.map(item => serializeWithDates(item) as Serializable<T>);
    }
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj as any;

    const newObj: any = { ...obj };
    for (const key in newObj) {
        if (newObj[key] instanceof Date) {
            newObj[key] = newObj[key].toISOString();
        }
    }
    return newObj;
};

// --- User Actions ---
export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    const userQuery = { include: { badges: true } };

    if (userId) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId }, ...userQuery });
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

// --- Trading & Signal Actions ---
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


export async function generateTradingStrategyAction(input: Omit<TradingStrategyPromptInput, 'shortTermCandles' | 'mediumTermCandles' | 'longTermCandles'> & { userId: string }): Promise<{ position: Position } | { error: string }> {
    try {
        const timeframes = timeframeMappings[input.tradingMode] || timeframeMappings.Intraday;

        const [shortTermResult, mediumTermResult, longTermResult] = await Promise.all([
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.short }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.medium }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.long }),
        ]);

        if (shortTermResult.error || mediumTermResult.error || longTermResult.error) {
            return { error: `Failed to retrieve market data. Reason: ${shortTermResult.error || mediumTermResult.error || longTermResult.error}` };
        }

        const promptInput: TradingStrategyPromptInput = { ...input, shortTermCandles: JSON.stringify(shortTermResult.candles), mediumTermCandles: JSON.stringify(mediumTermResult.candles), longTermCandles: JSON.stringify(longTermResult.candles) };

        const strategy = await genCoreStrategy(promptInput);
        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };

        const newPosition = await prisma.position.create({
            data: {
                userId: input.userId,
                symbol: input.symbol,
                signalType: strategy.signal,
                status: 'OPEN',
                entryPrice: parsePrice(strategy.entry_zone),
                stopLoss: parsePrice(strategy.stop_loss),
                takeProfit: parsePrice(strategy.take_profit),
                tradingMode: input.tradingMode,
                riskProfile: input.riskProfile,
                type: 'INSTANT',
                sentiment: strategy.sentiment,
                gpt_confidence_score: strategy.gpt_confidence_score,
            }
        });

        await prisma.user.update({
            where: { id: input.userId },
            data: { weeklyPoints: { increment: 25 }, airdropPoints: { increment: 50 } }
        });
        
        return { position: serializeWithDates(newPosition) as Position };

    } catch (error: any) {
        console.error("Error in generateTradingStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(input: ShadowChoiceStrategyInput, userId: string): Promise<{ signal: GeneratedSignal } | { error: string }> {
    try {
        const timeframes = { short: '15m', medium: '1h', long: '4h' };

        const [shortTermResult, mediumTermResult, longTermResult] = await Promise.all([
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.short }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.medium }),
            fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.long }),
        ]);

        if (shortTermResult.error || mediumTermResult.error || longTermResult.error) {
            return { error: `Failed to retrieve market data. Reason: ${shortTermResult.error || mediumTermResult.error || longTermResult.error}` };
        }

        const promptInput = { ...input, shortTermCandles: JSON.stringify(shortTermResult.candles), mediumTermCandles: JSON.stringify(mediumTermResult.candles), longTermCandles: JSON.stringify(longTermResult.candles) };

        const strategy = await genShadowChoice(promptInput);
        if (!strategy) return { error: "SHADOW Core failed to generate an autonomous strategy." };

        const newSignal = await prisma.generatedSignal.create({
            data: {
                userId: userId,
                symbol: input.symbol,
                signal: strategy.signal,
                entry_zone: strategy.entry_zone,
                stop_loss: strategy.stop_loss,
                take_profit: strategy.take_profit,
                confidence: strategy.confidence,
                gpt_confidence_score: strategy.gpt_confidence_score,
                risk_rating: strategy.risk_rating,
                sentiment: strategy.sentiment,
                currentThought: strategy.currentThought,
                shortTermPrediction: strategy.shortTermPrediction,
                chosenTradingMode: strategy.chosenTradingMode,
                chosenRiskProfile: strategy.chosenRiskProfile,
                strategyReasoning: strategy.strategyReasoning,
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
            }
        });
        
        await prisma.user.update({
            where: { id: userId },
            data: { airdropPoints: { increment: 10 } }
        });

        return { signal: serializeWithDates(newSignal) as GeneratedSignal };

    } catch (error: any) {
        console.error("Error in generateShadowChoiceStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's autonomous core: ${error.message}` };
    }
}

export async function fetchPositionsAction(userId: string): Promise<{ positions: Position[] } | { error: string }> {
    if (!userId) return { error: 'User session not found.' };
    try {
        const positions = await prisma.position.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        return { positions: serializeWithDates(positions) as Position[] };
    } catch (error: any) {
        return { error: 'Failed to fetch portfolio from database.' };
    }
}

export async function fetchGeneratedSignalsAction(userId: string): Promise<{ signals: GeneratedSignal[] } | { error: string }> {
    if (!userId) return { error: 'User session not found.' };
    try {
        const signals = await prisma.generatedSignal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        return { signals: serializeWithDates(signals) as GeneratedSignal[] };
    } catch (error: any) {
        return { error: 'Failed to fetch signals from database.' };
    }
}

const calculateTradeRewards = (pnl: number, tradingMode: string, riskProfile: string) => {
    const BASE_WIN_XP = 50, BASE_LOSS_XP = 10, BASE_WIN_AIRDROP_BONUS = 25, BASE_LOSS_AIRDROP_BONUS = 5;
    const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
    const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };
    const modeMultiplier = modeMultipliers[tradingMode] || 1.0;
    const riskMultiplier = riskMultipliers[riskProfile] || 1.0;
    const gainedXp = pnl > 0 ? BASE_WIN_XP * modeMultiplier * riskMultiplier : BASE_LOSS_XP * modeMultiplier;
    const gainedAirdropPoints = pnl > 0 ? pnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier) : pnl + BASE_LOSS_AIRDROP_BONUS;
    const gasPaid = 1.25 + (riskMultiplier - 1) + (modeMultiplier - 1);
    const blocksTrained = 100 + Math.floor(Math.abs(pnl) * 2);
    return { gainedXp: Math.round(gainedXp), gainedAirdropPoints: Math.round(gainedAirdropPoints), gasPaid: parseFloat(gasPaid.toFixed(2)), blocksTrained };
};

export async function closePositionAction(userId: string, positionId: string, closePrice: number): Promise<{ updatedPosition: Position; } | { error: string; }> {
    const position = await prisma.position.findUnique({ where: { id: positionId, userId: userId }});
    if (!position || position.status !== 'OPEN') return { error: 'Position is not open or not found.' };

    const pnl = (position.signalType === 'BUY' ? (closePrice - position.entryPrice) : (position.entryPrice - closePrice)) * position.size;
    const rewards = calculateTradeRewards(pnl, position.tradingMode, position.riskProfile);

    const [, updatedPosition] = await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { airdropPoints: { increment: rewards.gainedAirdropPoints }, weeklyPoints: { increment: rewards.gainedXp } }
        }),
        prisma.position.update({
            where: { id: positionId },
            data: { status: 'CLOSED', closePrice: closePrice, closeTimestamp: new Date(), pnl, ...rewards }
        })
    ]);
    
    return { updatedPosition: serializeWithDates(updatedPosition) as Position };
}

export async function executeCustomSignalAction(signalId: string, userId: string): Promise<{ position: Position } | { error: string }> {
    const signal = await prisma.generatedSignal.findUnique({ where: { id: signalId, userId }});
    if (!signal || signal.status !== 'PENDING_EXECUTION') return { error: 'Signal not available for execution.' };
    
    const [newPosition,] = await prisma.$transaction([
        prisma.position.create({
            data: {
                userId: userId,
                symbol: signal.symbol,
                signalType: signal.signal,
                status: 'PENDING',
                entryPrice: parsePrice(signal.entry_zone),
                stopLoss: parsePrice(signal.stop_loss),
                takeProfit: parsePrice(signal.take_profit),
                tradingMode: signal.chosenTradingMode || 'Custom',
                riskProfile: signal.chosenRiskProfile || 'Medium',
                type: 'CUSTOM',
                gpt_confidence_score: signal.gpt_confidence_score,
                sentiment: signal.sentiment,
                strategyId: signal.id,
            }
        }),
        prisma.generatedSignal.update({
            where: { id: signalId },
            data: { status: 'EXECUTED' }
        }),
        prisma.user.update({
            where: { id: userId },
            data: { weeklyPoints: { increment: 25 }, airdropPoints: { increment: 50 } }
        })
    ]);

    return { position: serializeWithDates(newPosition) as Position };
}

export async function activatePendingPositionAction(positionId: string, userId: string): Promise<{ success: boolean, error?: string }> {
    const result = await prisma.position.updateMany({
        where: { id: positionId, userId, status: 'PENDING' },
        data: { status: 'OPEN', openTimestamp: new Date() }
    });
    if (result.count === 0) return { success: false, error: 'Pending position not found.' };
    return { success: true };
}

export async function dismissSignalAction(signalId: string, userId: string): Promise<{ success: boolean }> {
    await prisma.generatedSignal.updateMany({ where: { id: signalId, userId }, data: { status: 'DISMISSED' }});
    return { success: true };
}


// --- Other Actions ---
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

export async function generatePerformanceReviewAction(userId: string, input: PerformanceReviewInput): Promise<PerformanceReviewOutput | { error: string }> {
    if (input.tradeHistory.length < 3) return { error: 'Insufficient trade history for analysis. Complete at least 3 trades.' };
    
    return genPerformanceReview(input);
}

export async function killSwitchAction(userId: string): Promise<{ closedCount: number; error?: string }> {
    const openPositions = await prisma.position.findMany({ where: { userId, status: 'OPEN' }});
    if (openPositions.length === 0) return { closedCount: 0 };
    
    let closedCount = 0;
    // This should ideally be a single transaction, but for simplicity we'll loop.
    for (const pos of openPositions) {
        const marketData = await fetchMarketDataAction({symbol: pos.symbol});
        const closePrice = 'error' in marketData ? pos.entryPrice : parseFloat(marketData.lastPrice);
        const closeResult = await closePositionAction(userId, pos.id, closePrice);
        if (!('error' in closeResult)) {
            closedCount++;
        }
    }
    return { closedCount };
}

export async function fetchMarketDataAction({ symbol }: { symbol: string }): Promise<LiveMarketData | { error: string }> {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch market data for ${symbol} from Binance: ${response.statusText} - ${errorData.msg || 'Unknown API error'}` };
    }
    const data = await response.json();
    return {
      symbol: data.symbol,
      lastPrice: data.lastPrice,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume,
      highPrice: data.highPrice,
      lowPrice: data.lowPrice,
      quoteVolume: data.quoteVolume,
    };
  } catch (error: any) {
    console.error(`Error in fetchMarketDataAction for ${symbol}:`, error);
    return { error: `Network error or failed to parse market data for ${symbol}: ${error.message}` };
  }
}

export async function fetchAllTradingSymbolsAction(): Promise<FormattedSymbol[] | { error: string }> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch symbols from Binance: ${response.statusText} - ${errorData.message || 'Unknown API error'}` };
    }
    const data: any[] = await response.json();
    const topSymbols = data.filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('_')).sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)).slice(0, 50);
    return topSymbols.map(s => ({ value: s.symbol, label: `${s.symbol.replace('USDT', '')}/USDT` }));
  } catch (error: any) {
    return { error: `Network error or failed to parse symbols: ${error.message}` };
  }
}

export async function fetchTopSymbolsForTickerAction(): Promise<TickerSymbolData[] | { error: string }> {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) return { error: 'Failed to fetch symbols from Binance.' };
        const data: LiveMarketData[] = await response.json();
        const usdtPairs = data.filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('_'));
        const sortedByVolume = usdtPairs.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        return sortedByVolume.slice(0, 15).map(d => ({ symbol: d.symbol, lastPrice: d.lastPrice, priceChangePercent: d.priceChangePercent, }));
    } catch (error: any) {
        return { error: `Network error while fetching symbols: ${error.message}` };
    }
}
