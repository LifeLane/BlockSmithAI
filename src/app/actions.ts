
"use server";
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Badge as PrismaBadge, Position as PrismaPosition, GeneratedSignal as PrismaSignal } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyCoreOutput } from '@/ai/flows/generate-trading-strategy';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';
import {
    generatePerformanceReview as genPerformanceReview,
    type PerformanceReviewInput,
    type PerformanceReviewOutput
} from '@/ai/flows/generate-performance-review';
import { fetchMarketDataAction } from '@/services/market-data-service';

// --- Type Definitions ---
export type Position = PrismaPosition;
export type GeneratedSignal = PrismaSignal;

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
             // Explicitly set default values here to satisfy Prisma client validation
            username: `Analyst-${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().toUpperCase()}`,
            status: 'Guest'
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

// Helper to parse the AI's price string (which can be a range) into a single number
const parsePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    // For a range like "60000 - 61000", take the average.
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
};

export async function generateTradingStrategyAction(
  input: GenerateTradingStrategyInput & { userId: string }
): Promise<{ signal: GeneratedSignal } | { error: string }> {

    try {
        const strategy = await genCoreStrategy(input);
        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };

        const signal = await prisma.generatedSignal.create({
            data: {
                userId: input.userId,
                symbol: input.symbol,
                signal: strategy.signal,
                status: 'PENDING_EXECUTION',
                entry_zone: strategy.entry_zone,
                stop_loss: strategy.stop_loss,
                take_profit: strategy.take_profit,
                confidence: strategy.confidence,
                risk_rating: strategy.risk_rating,
                gpt_confidence_score: strategy.gpt_confidence_score,
                sentiment: strategy.sentiment,
                currentThought: strategy.currentThought,
                shortTermPrediction: strategy.shortTermPrediction,
                sentimentTransition: strategy.sentimentTransition,
                chosenTradingMode: input.tradingMode,
                chosenRiskProfile: input.riskProfile,
                strategyReasoning: 'N/A for instant signal.', // Not applicable here
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
            }
        });

        if (!input.userId.startsWith('guest_')) {
            await prisma.user.update({
                where: { id: input.userId },
                data: { weeklyPoints: { increment: 25 }, airdropPoints: { increment: 50 } }
            });
        }
        
        return { signal };

    } catch (error: any) {
        console.error("Error in generateTradingStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(
  input: ShadowChoiceStrategyInput, userId: string
): Promise<{ signal: GeneratedSignal } | { error: string }> {

    try {
        const strategy = await genShadowChoice(input);
        if (!strategy) return { error: "SHADOW Core failed to generate an autonomous strategy." };
        
        const signal = await prisma.generatedSignal.create({
            data: {
                userId: userId,
                symbol: input.symbol,
                signal: strategy.signal,
                status: 'PENDING_EXECUTION',
                entry_zone: strategy.entry_zone,
                stop_loss: strategy.stop_loss,
                take_profit: strategy.take_profit,
                confidence: strategy.confidence,
                risk_rating: strategy.risk_rating,
                gpt_confidence_score: strategy.gpt_confidence_score,
                sentiment: strategy.sentiment,
                currentThought: strategy.currentThought,
                shortTermPrediction: strategy.shortTermPrediction,
                sentimentTransition: strategy.sentimentTransition,
                chosenTradingMode: strategy.chosenTradingMode,
                chosenRiskProfile: strategy.chosenRiskProfile,
                strategyReasoning: strategy.strategyReasoning,
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
            }
        });
        
        if (!userId.startsWith('guest_')) {
            await prisma.user.update({
                where: { id: userId },
                data: { airdropPoints: { increment: 10 } }
            });
        }

        return { signal };

    } catch (error: any) {
        console.error("Error in generateShadowChoiceStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's autonomous core: ${error.message}` };
    }
}

export async function fetchPositionsAndSignalsAction(userId: string): Promise<{ positions: Position[], signals: GeneratedSignal[] } | { error: string }> {
    if (!userId || userId.startsWith('guest_')) return { positions: [], signals: [] };

    try {
        const [positions, signals] = await Promise.all([
            prisma.position.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
            prisma.generatedSignal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
        ]);
        return { positions, signals };
    } catch (error: any) {
        return { error: 'Failed to fetch account data.' };
    }
}

export async function closePositionAction(positionId: string, closePrice: number, userId: string): Promise<Position | { error: string }> {
    try {
        const position = await prisma.position.findUnique({ where: { id: positionId, userId: userId }});
        if (!position || position.status !== 'OPEN') return { error: 'Position not found or not open.' };
        
        const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
          
        const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
        const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };
        const modeMultiplier = modeMultipliers[position.tradingMode] || 1.0;
        const riskMultiplier = riskMultipliers[position.riskProfile] || 1.0;
        
        const BASE_WIN_XP = 50, BASE_LOSS_XP = 10;
        const BASE_WIN_AIRDROP_BONUS = 25, BASE_LOSS_AIRDROP_BONUS = 5;

        let gainedXp = 0;
        let gainedAirdropPoints = 0;
        
        const numericPnl = Number(pnl);
        if (isFinite(numericPnl)) {
            gainedXp = numericPnl > 0 ? BASE_WIN_XP * modeMultiplier * riskMultiplier : BASE_LOSS_XP * modeMultiplier;
            gainedAirdropPoints = numericPnl > 0 ? numericPnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier) : numericPnl + BASE_LOSS_AIRDROP_BONUS;
        }

        const gasPaid = 1.25 + (riskMultiplier - 1) + (modeMultiplier - 1);
        const blocksTrained = 100 + Math.floor(Math.abs(numericPnl || 0) * 2);

        const updatedPosition = await prisma.position.update({
            where: { id: positionId },
            data: {
                status: 'CLOSED',
                closePrice,
                pnl: numericPnl,
                closeTimestamp: new Date(),
                gainedXp: Math.round(gainedXp),
                gainedAirdropPoints: Math.round(gainedAirdropPoints),
                gasPaid: parseFloat(gasPaid.toFixed(2)),
                blocksTrained
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: Math.round(gainedXp) },
                airdropPoints: { increment: Math.round(gainedAirdropPoints) },
            }
        });

        return updatedPosition;

    } catch (e: any) {
        console.error("Error closing position: ", e);
        return { error: "Failed to close position." }
    }
}

export async function executeSignalAction(signalId: string, userId: string): Promise<Position | { error: string }> {
    try {
        const signal = await prisma.generatedSignal.findUnique({ where: { id: signalId, userId: userId }});
        if (!signal || signal.status !== 'PENDING_EXECUTION') return { error: 'Signal not found or already processed.'};
        
        await prisma.generatedSignal.update({ where: { id: signalId }, data: { status: 'EXECUTED' }});

        const position = await prisma.position.create({
            data: {
                userId: userId,
                symbol: signal.symbol,
                signalType: signal.signal,
                status: 'PENDING',
                entryPrice: parsePrice(signal.entry_zone),
                stopLoss: parsePrice(signal.stop_loss),
                takeProfit: parsePrice(signal.take_profit),
                tradingMode: signal.chosenTradingMode,
                riskProfile: signal.chosenRiskProfile,
                type: signal.chosenTradingMode === 'Custom' ? 'CUSTOM' : 'INSTANT',
                sentiment: signal.sentiment,
                gpt_confidence_score: signal.gpt_confidence_score,
                openTimestamp: null,
                size: 1, // Default size
                strategyId: signal.id,
                sentimentTransition: signal.sentimentTransition,
                analysisSummary: signal.analysisSummary,
                newsAnalysis: signal.newsAnalysis,
                strategyReasoning: signal.strategyReasoning,
            }
        });

        return position;
    } catch(e: any) {
        console.error(e);
        return { error: 'Failed to execute signal.'}
    }
}

export async function dismissSignalAction(signalId: string, userId: string): Promise<GeneratedSignal | { error: string }> {
    try {
        const signal = await prisma.generatedSignal.findUnique({ where: { id: signalId, userId: userId }});
        if (!signal) return { error: "Signal not found." };
        return prisma.generatedSignal.update({
            where: { id: signalId },
            data: { status: 'DISMISSED' },
        });
    } catch (e) {
        return { error: "Failed to dismiss signal." };
    }
}

export async function activatePositionAction(positionId: string, userId: string): Promise<Position | { error: string }> {
     try {
        const position = await prisma.position.findUnique({ where: { id: positionId, userId: userId }});
        if (!position || position.status !== 'PENDING') return { error: 'Position not found or not pending.' };

        return prisma.position.update({
            where: { id: positionId },
            data: { status: 'OPEN', openTimestamp: new Date() },
        });
    } catch (e) {
        return { error: "Failed to activate position." };
    }
}

export async function closeAllPositionsAction(userId: string): Promise<{ closedCount: number } | { error: string }> {
    if (!userId || userId.startsWith('guest_')) return { error: 'User not found.' };
    
    try {
        const openPositions = await prisma.position.findMany({ where: { userId, status: 'OPEN' }});
        if (openPositions.length === 0) return { closedCount: 0 };
        
        const symbolsToFetch = [...new Set(openPositions.map(p => p.symbol))];
        const pricePromises = symbolsToFetch.map(symbol => fetchMarketDataAction({ symbol }));
        const priceResults = await Promise.all(pricePromises);
        
        const prices: Record<string, number> = {};
        for(const result of priceResults) {
            if(!('error' in result)) {
                prices[result.symbol] = parseFloat(result.lastPrice);
            }
        }

        let totalAirdropPointsGained = 0;
        const updates = [];

        for (const position of openPositions) {
            const closePrice = prices[position.symbol];
            if (isFinite(closePrice)) {
                const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
                const numericPnl = Number(pnl);
                let airdropPointsForTrade = 0;
                if(isFinite(numericPnl) && numericPnl > 0) {
                     airdropPointsForTrade = numericPnl;
                }
                
                totalAirdropPointsGained += airdropPointsForTrade;

                const updatePositionPromise = prisma.position.update({
                    where: { id: position.id },
                    data: { 
                        status: 'CLOSED', 
                        closePrice, 
                        pnl: numericPnl, 
                        closeTimestamp: new Date(),
                        gainedAirdropPoints: Math.round(airdropPointsForTrade)
                    }
                });

                updates.push(updatePositionPromise);
            }
        }
        
        if (updates.length > 0) {
            // First, update all the positions
            await prisma.$transaction(updates);

            // Then, update the user's points in a single operation
            await prisma.user.update({
                where: { id: userId },
                data: {
                    weeklyPoints: { increment: 10 * updates.length },
                    airdropPoints: { increment: Math.round(totalAirdropPointsGained) }
                }
            });
        }

        return { closedCount: updates.length };

    } catch (error: any) {
        console.error("Error in closeAllPositionsAction:", error);
        return { error: 'Failed to close all positions.' };
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
    if (userId.startsWith('guest_')) return { success: false, message: 'Guests cannot claim mission rewards. Please register first.'}
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'User not found.' };

    await prisma.user.update({
        where: { id: userId },
        data: { claimedMissions: { push: missionId } }
    });
    return { success: true, message: `Reward claimed for mission.` };
}

export async function generatePerformanceReviewAction(userId: string, input: PerformanceReviewInput): Promise<PerformanceReviewOutput | { error: string }> {
    if (input.tradeHistory.length < 3) return { error: 'Insufficient trade history for analysis. Complete at least 3 trades.' };
    
    const result = await genPerformanceReview(input);
    if (!result || 'error' in result) {
      return { error: (result as any)?.error || 'The AI failed to generate a review.' };
    }
    return result;
}

    
