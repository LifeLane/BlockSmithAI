
"use server";
import {promises as fs} from 'fs';
import path from 'path';

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


// Node/Prisma Imports
import { randomUUID } from 'crypto';
import { add, isBefore } from 'date-fns';
import { fetchMarketDataAction } from '@/services/market-data-service';

// --- MOCK DATABASE (db.json) ---
const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

async function readDb(): Promise<any> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading from db.json:", error);
        // In case of error (e.g., file not found), return a default structure
        return { users: [], positions: [], signals: [] };
    }
}

async function writeDb(data: any): Promise<void> {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to db.json:", error);
    }
}


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
    // Enriched data from signal
    type: 'INSTANT' | 'CUSTOM';
    tradingMode: string;
    riskProfile: string;
    gpt_confidence_score: string;
    sentiment: string;
    // Reward data
    gainedAirdropPoints?: number | null;
    gainedXp?: number | null;
    gasPaid?: number | null;
    blocksTrained?: number | null;
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

// --- ---

export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    const db = await readDb();
    if (userId) {
        const existingUser = db.users.find((u: UserProfile) => u.id === userId);
        if(existingUser) return existingUser;
    }

    const newId = userId || randomUUID();
    const newUser: UserProfile = {
        id: newId,
        username: `Analyst_${newId.substring(0, 6)}`,
        shadowId: `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`,
        status: "Guest",
        weeklyPoints: 100,
        airdropPoints: 50,
        badges: [],
        claimedMissions: [],
        claimedSpecialOps: [],
    };
    
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === newId);
    if (userIndex !== -1) {
        db.users[userIndex] = newUser;
    } else {
        db.users.push(newUser);
    }

    await writeDb(db);
    return newUser;
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    const db = await readDb();
    return db.users.find((u: UserProfile) => u.id === userId) || null;
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
    const db = await readDb();
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === userId);
    if(userIndex === -1) return null;

    if(data.username) {
        db.users[userIndex].username = data.username;
    }
    await writeDb(db);
    return db.users[userIndex];
}

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<{ userId: string; } | { error: string; }> {
    const db = await readDb();
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === userId);
    if(userIndex === -1) return { error: "User not found." };
    
    db.users[userIndex] = {
        ...db.users[userIndex],
        status: "Registered",
        wallet_address: formData.wallet_address,
        wallet_type: formData.wallet_type,
        email: formData.email,
        phone: formData.phone,
        x_handle: formData.x_handle,
        telegram_handle: formData.telegram_handle,
        youtube_handle: formData.youtube_handle,
    };
    
    await writeDb(db);
    return { userId };
}

export async function fetchLeaderboardDataJson(): Promise<LeaderboardUser[]> {
    const db = await readDb();
    const sortedUsers = [...db.users].sort((a,b) => b.weeklyPoints - a.weeklyPoints);
    return sortedUsers.slice(0, 10).map((user, index) => ({
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

async function saveSignalToDb(signalData: Omit<GeneratedSignal, 'createdAt' | 'updatedAt'>) {
    const db = await readDb();
    const newSignal: GeneratedSignal = {
        ...signalData,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    if (!db.signals) db.signals = [];
    db.signals.push(newSignal);

    // --- Gamification: Reward for generating a signal ---
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === signalData.userId);
    if (userIndex !== -1) {
        const NODE_TRAINING_REWARD = 10; // $BSAI
        db.users[userIndex].airdropPoints += NODE_TRAINING_REWARD;
    }
    // ---

    await writeDb(db);
}

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
        
        // --- Create and log the position directly in this action ---
        const db = await readDb();
        const newPosition: Position = {
            id: randomUUID(),
            userId: input.userId,
            symbol: fullResult.symbol,
            signalType: fullResult.signal as 'BUY' | 'SELL',
            status: 'OPEN',
            entryPrice: parsePrice(fullResult.entry_zone),
            closePrice: null,
            size: 1, // Default size for now
            stopLoss: parsePrice(fullResult.stop_loss),
            takeProfit: parsePrice(fullResult.take_profit),
            pnl: null,
            openTimestamp: new Date(),
            closeTimestamp: null,
            expirationTimestamp: null,
            strategyId: fullResult.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Enriched Data
            type: 'INSTANT',
            tradingMode: fullResult.tradingMode,
            riskProfile: fullResult.risk_rating,
            gpt_confidence_score: fullResult.gpt_confidence_score,
            sentiment: fullResult.sentiment,
        };
        if (!db.positions) db.positions = [];
        db.positions.push(newPosition);

        // --- Gamification: Reward for simulating a trade ---
        const userIndex = db.users.findIndex((u: UserProfile) => u.id === input.userId);
        if (userIndex !== -1) {
            const SIMULATION_XP_REWARD = 25;
            const SIMULATION_AIRDROP_REWARD = 50;
            db.users[userIndex].weeklyPoints += SIMULATION_XP_REWARD;
            db.users[userIndex].airdropPoints += SIMULATION_AIRDROP_REWARD;
        }
        // ---

        await writeDb(db);
        // --- End of position logging ---

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

        const resultId = randomUUID();
        const fullResult = { ...strategy, id: resultId, symbol: input.symbol, disclaimer: disclaimer.disclaimer, type: 'CUSTOM' as const };
        
        await saveSignalToDb({ ...fullResult, userId, status: 'PENDING_EXECUTION' });

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
    const db = await readDb();
    const user = db.users.find((u: UserProfile) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    user.claimedMissions.push(missionId);
    await writeDb(db);
    return { success: true, message: `Mission reward claimed.` };
}

export async function executeCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const db = await readDb();
    const signal = db.signals.find((s: GeneratedSignal) => s.id === signalId && s.userId === userId);
    if (!signal) return { success: false, error: 'Signal not found.' };

    const newPosition: Position = {
        id: randomUUID(),
        userId,
        symbol: signal.symbol,
        signalType: signal.signal as 'BUY' | 'SELL',
        status: 'PENDING',
        entryPrice: parsePrice(signal.entry_zone),
        closePrice: null,
        size: 1, // Default size for now
        stopLoss: parsePrice(signal.stop_loss),
        takeProfit: parsePrice(signal.take_profit),
        pnl: null,
        openTimestamp: null,
        closeTimestamp: null,
        expirationTimestamp: add(new Date(), { hours: 24 }),
        strategyId: signal.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Enriched Data
        type: 'CUSTOM',
        tradingMode: signal.chosenTradingMode || 'Custom',
        riskProfile: signal.chosenRiskProfile,
        gpt_confidence_score: signal.gpt_confidence_score,
        sentiment: signal.sentiment,
    };
    if (!db.positions) db.positions = [];
    db.positions.push(newPosition);

    const signalIndex = db.signals.findIndex((s: GeneratedSignal) => s.id === signalId);
    if(signalIndex > -1) {
        db.signals[signalIndex].status = 'EXECUTED';
        db.signals[signalIndex].updatedAt = new Date();
    }
    
    // --- Gamification: Reward for simulating a trade ---
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === userId);
    if (userIndex !== -1) {
        const SIMULATION_XP_REWARD = 25;
        const SIMULATION_AIRDROP_REWARD = 50;
        db.users[userIndex].weeklyPoints += SIMULATION_XP_REWARD;
        db.users[userIndex].airdropPoints += SIMULATION_AIRDROP_REWARD;
    }
    // ---
    
    await writeDb(db);
    return { success: true };
}

const calculateTradeRewards = (pnl: number, tradingMode: string, riskProfile: string) => {
    // Define base rewards
    const BASE_WIN_XP = 50;
    const BASE_LOSS_XP = 10;
    const BASE_WIN_AIRDROP_BONUS = 25;
    const BASE_LOSS_AIRDROP_BONUS = 5;

    // Define multipliers
    const modeMultipliers = { Scalper: 1.0, Sniper: 1.1, Intraday: 1.2, Swing: 1.5, Custom: 1.2 };
    const riskMultipliers = { Low: 0.8, Medium: 1.0, High: 1.3 };

    const modeMultiplier = modeMultipliers[tradingMode as keyof typeof modeMultipliers] || 1.0;
    const riskMultiplier = riskMultipliers[riskProfile as keyof typeof riskMultipliers] || 1.0;

    let gainedXp: number;
    let gainedAirdropPoints: number;

    if (pnl > 0) {
        gainedXp = BASE_WIN_XP * modeMultiplier * riskMultiplier;
        gainedAirdropPoints = pnl + (BASE_WIN_AIRDROP_BONUS * modeMultiplier * riskMultiplier);
    } else {
        gainedXp = BASE_LOSS_XP * modeMultiplier; // Less penalty on XP for losses
        gainedAirdropPoints = pnl + BASE_LOSS_AIRDROP_BONUS; // PnL is negative, so this is a smaller loss + small bonus
    }

    // Deterministic values instead of mock random data
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
    const db = await readDb();
    const positionIndex = db.positions.findIndex((p: Position) => p.id === positionId);
    if (positionIndex === -1) return { error: 'Position not found.' };

    const position = db.positions[positionIndex];
    if (position.status !== 'OPEN') return { error: 'Position is not open.' };

    // Calculate PnL
    const pnl = (position.signalType === 'BUY'
        ? (closePrice - position.entryPrice)
        : (position.entryPrice - closePrice)) * position.size;
    
    // Calculate Rewards
    const rewards = calculateTradeRewards(pnl, position.tradingMode, position.riskProfile);

    // Update Position
    position.status = 'CLOSED';
    position.closePrice = closePrice;
    position.closeTimestamp = new Date();
    position.pnl = pnl;
    position.gainedXp = rewards.gainedXp;
    position.gainedAirdropPoints = rewards.gainedAirdropPoints;
    position.gasPaid = rewards.gasPaid;
    position.blocksTrained = rewards.blocksTrained;

    // Update User's total points
    const userIndex = db.users.findIndex((u: UserProfile) => u.id === position.userId);
    if (userIndex !== -1) {
        db.users[userIndex].airdropPoints += rewards.gainedAirdropPoints;
        db.users[userIndex].weeklyPoints += rewards.gainedXp;
    }
    
    await writeDb(db);
    return { position };
}

export async function fetchPendingAndOpenPositionsAction(userId: string): Promise<Position[]> {
    const db = await readDb();
    if (!db.positions) return [];
    return db.positions.filter((p: Position) => p.userId === userId && (p.status === 'PENDING' || p.status === 'OPEN'));
}

export async function fetchTradeHistoryAction(userId: string): Promise<Position[]> {
    const db = await readDb();
    if (!db.positions) return [];
    return db.positions.filter((p: Position) => p.userId === userId && p.status === 'CLOSED');
}

export async function fetchPortfolioStatsAction(userId: string): Promise<PortfolioStats | { error: string }> {
    const db = await readDb();
    const user = db.users.find((u: UserProfile) => u.id === userId);
    if (!user) return { error: 'User not found' };

    const closedTrades = (db.positions || []).filter((p: Position) => p.userId === userId && p.status === 'CLOSED');
    const signals = (db.signals || []).filter((s: GeneratedSignal) => s.userId === userId);
    
    const totalTrades = closedTrades.length;
    const nodesTrained = signals.length;
    const xpGained = user.weeklyPoints;
    
    if (totalTrades === 0) {
        return {
            totalTrades: 0, winRate: 0, winningTrades: 0, totalPnl: 0,
            totalPnlPercentage: 0, bestTradePnl: 0, worstTradePnl: 0,
            lifetimeRewards: user.airdropPoints,
            nodesTrained, xpGained,
        };
    }

    const winningTrades = closedTrades.filter((t: Position) => t.pnl && t.pnl > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    const totalPnl = closedTrades.reduce((acc: number, t: Position) => acc + (t.pnl || 0), 0);
    const bestTradePnl = Math.max(...closedTrades.map((t: Position) => t.pnl || 0), 0);
    const worstTradePnl = Math.min(...closedTrades.map((t: Position) => t.pnl || 0), 0);
    
    return {
        totalTrades, winRate, winningTrades, totalPnl,
        totalPnlPercentage: 0, // Simplified for now
        bestTradePnl, worstTradePnl,
        lifetimeRewards: user.airdropPoints,
        nodesTrained, xpGained
    };
}

export async function generatePerformanceReviewAction(userId: string): Promise<PerformanceReviewOutput | { error: string }> {
    const db = await readDb();
    const user = db.users.find((u: UserProfile) => u.id === userId);
    if (!user) return { error: 'User not found' };
    
    const tradeHistory = (db.positions || []).filter((p: Position) => p.userId === userId && p.status === 'CLOSED');
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
            ...t,
            openTimestamp: t.openTimestamp?.toString() || "",
            closeTimestamp: t.closeTimestamp?.toString() || null,
        }))
    }
    
    return genPerformanceReview(reviewInput);
}

export async function killSwitchAction(userId: string): Promise<{ success: boolean; message: string; }> {
    const db = await readDb();
    if (!db.positions) return { success: true, message: 'No active positions to close.' };
    
    const openPositions = db.positions.filter((p: Position) => p.userId === userId && p.status === 'OPEN');
    if(openPositions.length === 0) return { success: true, message: 'No active positions to close.' };

    // This is a mock, so we just mark them as closed. A real implementation would need live prices.
    let closedCount = 0;
    openPositions.forEach((p: Position) => {
        p.status = 'CLOSED';
        p.closePrice = p.entryPrice; // Mock closing at entry
        p.pnl = 0;
        p.closeTimestamp = new Date();
        const rewards = calculateTradeRewards(0, p.tradingMode, p.riskProfile);
        p.gainedXp = rewards.gainedXp;
        p.gainedAirdropPoints = rewards.gainedAirdropPoints;
        p.gasPaid = rewards.gasPaid;
        p.blocksTrained = rewards.blocksTrained;
        closedCount++;
    });
    
    await writeDb(db);
    return { success: true, message: `Successfully closed ${closedCount} open positions.` };
}

export async function activatePendingPositionAction(positionId: string): Promise<{ position?: Position; error?: string; }> {
    const db = await readDb();
    const positionIndex = db.positions.findIndex((p: Position) => p.id === positionId);
    if (positionIndex === -1) return { error: 'Position not found.' };
    
    const position = db.positions[positionIndex];

    if (position.status !== 'PENDING') return { error: 'Position is not pending.' };

    position.status = 'OPEN';
    position.openTimestamp = new Date();
    await writeDb(db);
    return { position };
}

export async function cancelPendingPositionAction(positionId: string): Promise<{ success: boolean; error?: string; }> {
    const db = await readDb();
    const positionIndex = db.positions.findIndex((p: Position) => p.id === positionId);
    if (positionIndex === -1) return { success: false, error: 'Position not found.' };

    if(db.positions[positionIndex].status !== 'PENDING') return { success: false, error: 'Position is not pending.' };

    db.positions.splice(positionIndex, 1);
    await writeDb(db);
    return { success: true };
}

export async function fetchAllGeneratedSignalsAction(userId: string): Promise<GeneratedSignal[] | { error: string }> {
    if (!userId) return { error: 'User ID is required' };
    const db = await readDb();
    if (!db.signals) return [];
    return (db.signals as GeneratedSignal[])
        .filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function dismissCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean, error?: string }> {
    const db = await readDb();
    const signalIndex = db.signals.findIndex((s: GeneratedSignal) => s.id === signalId && s.userId === userId);
    if (signalIndex === -1) return { success: false, error: 'Signal not found' };

    db.signals[signalIndex].status = 'DISMISSED';
    db.signals[signalIndex].updatedAt = new Date();
    await writeDb(db);
    return { success: true };
}
