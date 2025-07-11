
"use server";
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Badge as PrismaBadge } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type PromptInput as TradingStrategyPromptInput, type GenerateTradingStrategyCoreOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer as genSarcasticDisclaimer, type SarcasticDisclaimerOutput } from '@/ai/flows/generate-sarcastic-disclaimer';
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

    if (userId && !userId.startsWith('guest_')) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId }, ...userQuery });
        if(existingUser) return existingUser;
    }

    // If no valid userId or user not found, create a new one.
    // The data property is required, but can be empty to use schema defaults.
    const newUser = await prisma.user.create({
        data: {
             // Explicitly set default values here to satisfy Prisma client validation
            username: `Analyst-${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().toUpperCase()}`
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

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<UserProfile | { error: string; }> {
    if (!userId) return { error: "User not found." };
    const updatedUser = await prisma.user.update({
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
        },
        include: { badges: true },
    });
    return updatedUser;
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
        if (!input.userId.startsWith('guest_')) {
            await prisma.user.update({
                where: { id: input.userId },
                data: { weeklyPoints: { increment: 25 }, airdropPoints: { increment: 50 } }
            });
        }
        
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
        if (!userId.startsWith('guest_')) {
            await prisma.user.update({
                where: { id: userId },
                data: { airdropPoints: { increment: 10 } }
            });
        }

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
  if (userId.startsWith('guest_')) {
    return { success: true }; // Don't update points for guests
  }
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

// --- Syncing Action ---
export async function syncClientStateAction(userId: string, data: { positions: any[], signals: any[] }): Promise<{ success: true } | { error:string }> {
  if (!userId || !data || userId.startsWith('guest_')) return { error: "Invalid data for sync." };

  try {
      // Syncing logic is now disabled since the models are removed.
      // This function can be re-enabled if server-side persistence is restored.
      console.log('Client state sync requested, but is currently a client-only feature.');
      return { success: true };
  } catch (e:any) {
      console.error("Sync error:", e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
           return { error: `Database error during sync: ${e.code}` };
      }
      return { error: "An unexpected error occurred during sync." };
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

export async function generateSarcasticDisclaimer(): Promise<SarcasticDisclaimerOutput> {
    return genSarcasticDisclaimer();
}

export async function getDailyGreeting(): Promise<GenerateDailyGreetingOutput> {
    return generateDailyGreeting();
}

export async function claimMissionRewardAction(userId: string, missionId: string): Promise<{ success: boolean; message: string }> {
    if (userId.startsWith('guest_')) return { success: false, message: 'Guests cannot claim mission rewards. Please register first.'}
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
