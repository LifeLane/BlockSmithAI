
"use server";
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Badge as PrismaBadge } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type PromptInput as TradingStrategyPromptInput, type GenerateTradingStrategyCoreOutput } from '@/ai/flows/generate-trading-strategy';
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

// --- Type Definitions ---
// Note: Position and GeneratedSignal are now primarily client-side types,
// defined in use-client-state.ts and passed to components.
export type { Position, GeneratedSignal } from '@/hooks/use-client-state';

const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { badges: true },
});
export type UserProfile = Prisma.UserGetPayload<typeof userWithRelations>;
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

export async function generateTradingStrategyAction(
  input: Omit<TradingStrategyPromptInput, 'shortTermCandles' | 'mediumTermCandles' | 'longTermCandles'> & { userId: string }
): Promise<{ strategy: GenerateTradingStrategyCoreOutput } | { error: string }> {
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

        // Only update user points, do not create a position in the DB
        await prisma.user.update({
            where: { id: input.userId },
            data: { weeklyPoints: { increment: 25 }, airdropPoints: { increment: 50 } }
        });
        
        return { strategy };

    } catch (error: any) {
        console.error("Error in generateTradingStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(
  input: ShadowChoiceStrategyInput, userId: string
): Promise<{ strategy: ShadowChoiceStrategyCoreOutput } | { error: string }> {
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
        
        // Only update user points, do not create a signal in the DB
        await prisma.user.update({
            where: { id: userId },
            data: { airdropPoints: { increment: 10 } }
        });

        return { strategy };

    } catch (error: any) {
        console.error("Error in generateShadowChoiceStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's autonomous core: ${error.message}` };
    }
}

// Note: Functions for fetching/manipulating positions and signals (e.g., fetchPositionsAction, closePositionAction)
// are removed from here. Their logic is now handled on the client-side by the `useClientState` hook.

export async function updateUserPointsForClosedTradeAction(
  userId: string,
  pnl: number,
  tradingMode: string,
  riskProfile: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
    const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };
    const modeMultiplier = modeMultipliers[tradingMode] || 1.0;
    const riskMultiplier = riskMultipliers[riskProfile] || 1.0;
    
    const BASE_WIN_XP = 50, BASE_LOSS_XP = 10;
    const BASE_WIN_AIRDROP_BONUS = 25, BASE_LOSS_AIRDROP_BONUS = 5;

    const gainedXp = pnl > 0 ? BASE_WIN_XP * modeMultiplier * riskMultiplier : BASE_LOSS_XP * modeMultiplier;
    const gainedAirdropPoints = pnl > 0 ? pnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier) : pnl + BASE_LOSS_AIRDROP_BONUS;

    await prisma.user.update({
      where: { id: userId },
      data: {
        airdropPoints: { increment: Math.round(gainedAirdropPoints) },
        weeklyPoints: { increment: Math.round(gainedXp) }
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user points:", error);
    return { success: false, error: "Database error while updating points." };
  }
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

    