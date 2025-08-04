
'use server';
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Badge as PrismaBadge, Position as PrismaPosition, GeneratedSignal as PrismaSignal } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// AI Flow Imports
import { generateUnifiedStrategy, type UnifiedStrategyInput, type UnifiedStrategyOutput } from '@/ai/flows/generate-unified-strategy';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import {
    generatePerformanceReview as genPerformanceReview,
    type PerformanceReviewInput,
    type PerformanceReviewOutput
} from '@/ai/flows/generate-performance-review';
import { fetchMarketDataAction } from '@/services/market-data-service';

// --- Type Definitions ---
export type Position = Omit<PrismaPosition, 'signalType' | 'status' | 'type'> & {
    signalType: 'BUY' | 'SELL';
    status: 'PENDING' | 'OPEN' | 'CLOSED';
    type: 'INSTANT' | 'CUSTOM';
};

const generatedSignalWithPosition = Prisma.validator<Prisma.GeneratedSignalDefaultArgs>()({
    include: { position: true },
});
export type GeneratedSignal = Omit<Prisma.GeneratedSignalGetPayload<typeof generatedSignalWithPosition>, 'signal' | 'status' | 'position'> & {
    signal: 'BUY' | 'SELL';
    status: 'PENDING_EXECUTION' | 'EXECUTED' | 'DISMISSED';
    position: Position | null;
};


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
    username: string;
    email?: string;
    phone?: string;
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

    if (!userId || userId.startsWith('guest_')) {
        return {
            id: `guest_${randomUUID()}`,
            username: `Guest-${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-GUEST`,
            status: 'Guest',
            weeklyPoints: 0,
            airdropPoints: 0,
            claimedMissions: '[]',
            badges: [],
            email: null,
            phone: null,
            x_handle: null,
            telegram_handle: null,
            youtube_handle: null,
            wallet_address: null,
            wallet_type: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            subscriptionTier: null,
            subscriptionExpiresAt: null,
        };
    }

    const newUser = await prisma.user.create({
        data: {
            username: `Analyst-${randomUUID().substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().toUpperCase()}`,
            status: 'Guest', // Initial status is Guest until they register
            weeklyPoints: 0,
            airdropPoints: 0,
            claimedMissions: '[]',
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

    const isGuest = userId.startsWith('guest_');

    try {
        if (isGuest) {
            const newUser = await prisma.user.create({
                data: {
                    username: formData.username,
                    shadowId: `SHDW-${randomUUID().toUpperCase()}`,
                    status: "Registered",
                    email: formData.email,
                    phone: formData.phone,
                },
                include: { badges: true },
            });
            return newUser;
        } else {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    username: formData.username,
                    status: "Registered",
                    email: formData.email,
                    phone: formData.phone,
                },
                include: { badges: true },
            });
            return updatedUser;
        }
    } catch (e: any) {
        console.error("Error in handleAirdropSignupAction:", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                 // Check which field caused the error
                if (e.meta?.target?.includes('username')) {
                    return { error: 'This username is already taken. Please choose another one.' };
                }
                if (e.meta?.target?.includes('email')) {
                    return { error: 'This email is already registered.' };
                }
                 if (e.meta?.target?.includes('phone')) {
                    return { error: 'This phone number is already registered.' };
                }
                return { error: 'A user with these details already exists.' };
            }
        }
        return { error: 'An unexpected error occurred during signup.' };
    }
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
const parsePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' ');
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
};

async function unifiedSignalGenerationAction(
  input: UnifiedStrategyInput, userId: string, isInstant: boolean
): Promise<{ signal: GeneratedSignal } | { error: string }> {

    try {
        const strategy: UnifiedStrategyOutput = await generateUnifiedStrategy(input);
        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };

        if (userId.startsWith('guest_')) {
            const tempSignal: GeneratedSignal = {
                id: `guest_sig_${randomUUID()}`,
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
                chosenTradingMode: strategy.chosenTradingMode,
                chosenRiskProfile: strategy.chosenRiskProfile,
                strategyReasoning: strategy.strategyReasoning,
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
                createdAt: new Date(),
                position: null,
            };
            return { signal: tempSignal };
        }

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
                chosenTradingMode: strategy.chosenTradingMode,
                chosenRiskProfile: strategy.chosenRiskProfile,
                strategyReasoning: strategy.strategyReasoning,
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
            },
            include: { position: true },
        });

        if (!userId.startsWith('guest_')) {
            const xpIncrement = isInstant ? 25 : 0;
            const airdropIncrement = isInstant ? 50 : 10;
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    weeklyPoints: { increment: xpIncrement }, 
                    airdropPoints: { increment: airdropIncrement } 
                }
            });
        }
        
        return { signal: signal as GeneratedSignal };

    } catch (error: any) {
        console.error(`Error in ${isInstant ? 'Instant' : 'SHADOW Choice'} Signal Generation:`, error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}


export async function generateTradingStrategyAction(
  input: { symbol: string; tradingMode: string; riskProfile: string; marketData: string; userId: string }
): Promise<{ signal: GeneratedSignal } | { error: string }> {
    const unifiedInput: UnifiedStrategyInput = {
        symbol: input.symbol,
        marketData: input.marketData,
        tradingMode: input.tradingMode,
        riskProfile: input.riskProfile,
    };
    return unifiedSignalGenerationAction(unifiedInput, input.userId, true);
}

export async function generateShadowChoiceStrategyAction(
  input: { symbol: string; marketData: string }, userId: string
): Promise<{ signal: GeneratedSignal } | { error: string }> {
     const unifiedInput: UnifiedStrategyInput = {
        symbol: input.symbol,
        marketData: input.marketData,
        tradingMode: null, // Pass null to trigger autonomous mode
        riskProfile: null, // Pass null to trigger autonomous mode
    };
    return unifiedSignalGenerationAction(unifiedInput, userId, false);
}


export async function fetchPositionsAndSignalsAction(userId: string): Promise<{ positions: Position[], signals: GeneratedSignal[] } | { error: string }> {
    if (!userId || userId.startsWith('guest_')) return { positions: [], signals: [] };

    try {
        const [positions, signals] = await Promise.all([
            prisma.position.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
            prisma.generatedSignal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50, include: { position: true } }),
        ]);
        return { positions: positions as Position[], signals: signals as GeneratedSignal[] };
    } catch (error: any) {
        return { error: 'Failed to fetch account data.' };
    }
}

export async function closePositionAction(positionId: string, closePrice: number, userId: string): Promise<Position | { error: string }> {
    try {
        const position = await prisma.position.findUnique({ where: { id: positionId, userId: userId }});
        if (!position || position.status !== 'OPEN') return { error: 'Position not found or not open.' };
        
        const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
        
        const numericPnl = Number(pnl);
        let gainedXp = 0;
        let gainedAirdropPoints = 0;

        if (isFinite(numericPnl)) {
            const modeMultipliers: { [key: string]: number } = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
            const riskMultipliers: { [key: string]: number } = { Low: 0.8, Medium: 1.0, High: 1.3 };
            const modeMultiplier = modeMultipliers[position.tradingMode] || 1.0;
            const riskMultiplier = riskMultipliers[position.riskProfile] || 1.0;
            
            const BASE_WIN_XP = 50, BASE_LOSS_XP = 10;
            const BASE_WIN_AIRDROP_BONUS = 25, BASE_LOSS_AIRDROP_BONUS = 5;

            gainedXp = numericPnl > 0 ? BASE_WIN_XP * modeMultiplier * riskMultiplier : BASE_LOSS_XP * modeMultiplier;
            gainedAirdropPoints = numericPnl > 0 ? numericPnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier) : BASE_LOSS_AIRDROP_BONUS;
        }

        const gasPaid = 1.25;
        const blocksTrained = 100 + Math.floor(Math.abs(pnl || 0) * 2);

        const roundedGainedXp = Math.round(gainedXp);
        const roundedAirdropPoints = Math.round(gainedAirdropPoints);

        const updatedPosition = await prisma.position.update({
            where: { id: positionId },
            data: {
                status: 'CLOSED',
                closePrice,
                pnl: numericPnl,
                closeTimestamp: new Date(),
                gainedXp: roundedGainedXp,
                gainedAirdropPoints: roundedAirdropPoints,
                gasPaid: parseFloat(gasPaid.toFixed(2)),
                blocksTrained,
                strategyReasoning: position.strategyReasoning,
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: roundedGainedXp },
                airdropPoints: { increment: roundedAirdropPoints },
            }
        });

        return updatedPosition as Position;

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
                analysisSummary: signal.analysisSummary,
                newsAnalysis: signal.newsAnalysis,
                strategyReasoning: signal.strategyReasoning,
            }
        });

        return position as Position;
    } catch(e: any) {
        console.error(e);
        return { error: 'Failed to execute signal.'}
    }
}

export async function dismissSignalAction(signalId: string, userId: string): Promise<GeneratedSignal | { error: string }> {
    try {
        const signal = await prisma.generatedSignal.findUnique({ where: { id: signalId, userId: userId }});
        if (!signal) return { error: "Signal not found." };
        const updatedSignal = await prisma.generatedSignal.update({
            where: { id: signalId },
            data: { status: 'DISMISSED' },
            include: { position: true }
        });
        return updatedSignal as GeneratedSignal;
    } catch (e) {
        return { error: "Failed to dismiss signal." };
    }
}

export async function activatePositionAction(positionId: string, userId: string): Promise<Position | { error: string }> {
     try {
        const position = await prisma.position.findUnique({ where: { id: positionId, userId: userId }});
        if (!position || position.status !== 'PENDING') return { error: 'Position not found or not pending.' };

        const updatedPosition = await prisma.position.update({
            where: { id: positionId },
            data: { status: 'OPEN', openTimestamp: new Date() },
        });
        return updatedPosition as Position;
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
        let totalXpGained = 0;
        const updates = [];

        for (const position of openPositions) {
            const closePrice = prices[position.symbol];
            if (isFinite(closePrice)) {
                const pnl = (position.signalType === 'BUY' ? closePrice - position.entryPrice : position.entryPrice - closePrice) * position.size;
                const numericPnl = Number(pnl);

                let airdropPointsForTrade = 0;
                let xpForTrade = 0;
                
                if(isFinite(numericPnl)) {
                    if (numericPnl > 0) {
                        airdropPointsForTrade = numericPnl;
                        xpForTrade = 50;
                    } else {
                        xpForTrade = 10;
                    }
                }
                
                totalAirdropPointsGained += airdropPointsForTrade;
                totalXpGained += xpForTrade;

                const updatePositionPromise = prisma.position.update({
                    where: { id: position.id },
                    data: { 
                        status: 'CLOSED', 
                        closePrice, 
                        pnl: numericPnl, 
                        closeTimestamp: new Date(),
                        gainedAirdropPoints: Math.round(airdropPointsForTrade),
                        gainedXp: Math.round(xpForTrade)
                    }
                });

                updates.push(updatePositionPromise);
            }
        }
        
        if (updates.length > 0) {
            await prisma.$transaction(updates);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    weeklyPoints: { increment: Math.round(totalXpGained) },
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

export async function confirmShadowSubscriptionAction(
    userId: string,
    tierName: string,
    duration: 'Trial' | 'Monthly' | 'Yearly' | 'Lifetime',
    txSignature: string
): Promise<{ success: boolean; error?: string }> {
    if (!userId || userId.startsWith('guest_')) {
        return { success: false, error: 'User must be registered.' };
    }

    // NOTE: In a real production app, you would have a robust system here to:
    // 1. Verify the transaction signature on-chain to confirm its validity and details (amount, recipient).
    // 2. Ensure this transaction signature has not been used before to prevent replay attacks.
    // For this prototype, we will trust the client and proceed with the database update.
    console.log(`Confirming subscription for user ${userId} with tx: ${txSignature}`);

    try {
        const now = new Date();
        let expiresAt: Date | null = null;
        
        if (duration === 'Trial') {
            expiresAt = new Date(now.setDate(now.getDate() + 3));
        } else if (duration === 'Monthly') {
            expiresAt = new Date(now.setMonth(now.getMonth() + 1));
        } else if (duration === 'Yearly') {
            expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        } else if (duration === 'Lifetime') {
            expiresAt = null; // Lifetime subscription does not expire
        }

        const tierRewards = {
            'Trial Subscription': { xp: 100, airdrop: 1000 },
            'Operator Monthly': { xp: 1000, airdrop: 120000 }, // 1.2x of 100k
            'Analyst Yearly': { xp: 10000, airdrop: 1500000 }, // 1.5x of 1M
            'Architect Lifetime': { xp: 50000, airdrop: 20000000 } // 2x of 10M
        };
        
        const rewards = tierRewards[tierName as keyof typeof tierRewards] || { xp: 0, airdrop: 0 };
        
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'Premium',
                subscriptionTier: tierName,
                subscriptionExpiresAt: expiresAt,
                weeklyPoints: { increment: rewards.xp },
                airdropPoints: { increment: rewards.airdrop },
            },
        });

        return { success: true };

    } catch (error: any) {
        console.error("Error confirming subscription:", error);
        return { success: false, error: "Failed to update user subscription status in the database." };
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

    let claimedMissions: string[] = [];
    try {
        claimedMissions = JSON.parse(user.claimedMissions);
    } catch (e) {
        console.error("Failed to parse claimedMissions JSON", e);
        // If parsing fails, we can assume it's an empty list or handle the error as needed.
        claimedMissions = [];
    }

    if (claimedMissions.includes(missionId)) {
        return { success: false, message: "Mission already claimed." };
    }

    claimedMissions.push(missionId);
    
    await prisma.user.update({
        where: { id: userId },
        data: { claimedMissions: JSON.stringify(claimedMissions) }
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
