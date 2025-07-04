
"use server";
// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput } from '@/ai/flows/generate-trading-strategy';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput } from '@/ai/flows/generate-shadow-choice-strategy';
import { generateMissionLog, type GenerateMissionLogInput } from '@/ai/flows/generate-mission-log';
import { 
    generatePerformanceReview as genPerformanceReview, 
    type PerformanceReviewInput, 
    type PerformanceReviewOutput 
} from '@/ai/flows/generate-performance-review';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';


// Node/Prisma Imports
import prisma from '@/lib/prisma';
import { type Position as PrismaPosition, type User as PrismaUser, type Badge as PrismaBadge, SignalType, PositionStatus, AgentStatus, type GeneratedSignal as PrismaGeneratedSignal, GeneratedSignalStatus, SignalGenerationType, type Agent as PrismaAgent, type AgentLevel as PrismaAgentLevel, type SpecialOp as PrismaSpecialOp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add, isBefore } from 'date-fns';
import { fetchMarketDataAction } from '@/services/market-data-service';


// Helper function to robustly parse price strings, which could be a single number or a range.
const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return NaN;
    const cleanedStr = priceStr.replace(/[^0-9.-]/g, ' '); 
    const parts = cleanedStr.split(' ').filter(p => p !== '' && !isNaN(parseFloat(p)));
    
    if (parts.length === 0) return NaN;
    if (parts.length === 1) return parseFloat(parts[0]);
    
    const sum = parts.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / parts.length;
};


// Type Definitions
export type Position = PrismaPosition;
export type Badge = PrismaBadge;
export type UserProfile = PrismaUser & {
    badges?: Badge[];
};
export type ChatMessage = AIChatMessage;
export type GeneratedSignal = PrismaGeneratedSignal;
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
// Updated Agent types to reflect Prisma schema
export type Agent = PrismaAgent & { levels: PrismaAgentLevel[] };
export type AgentLevel = PrismaAgentLevel;
export type SpecialOp = PrismaSpecialOp;

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
  symbol: string;
  tradingMode: string;
};
export type GenerateShadowChoiceStrategyOutput = Awaited<ReturnType<typeof genShadowChoice>> & {
  id: string;
  symbol: string;
};
export type { PerformanceReviewOutput };

// --- Mission and Agent Data (for seeding) ---
const missionRewards: { [key: string]: { xp: number; airdrop: number } } = {
  mission_x: { xp: 0, airdrop: 100 },
  mission_telegram: { xp: 0, airdrop: 100 },
  mission_youtube: { xp: 0, airdrop: 100 },
  mission_first_signal: { xp: 100, airdrop: 500 },
  mission_analyst: { xp: 250, airdrop: 1000 },
  mission_streak: { xp: 1000, airdrop: 5000 },
  mission_prolific_trader: { xp: 150, airdrop: 750 },
  mission_winning_streak: { xp: 300, airdrop: 1500 },
  mission_top_trader: { xp: 2000, airdrop: 10000 },
};

const agentDefinitionsForSeeding = [
    {
      "id": "agent-001", "name": "Data Scraper Drone", "description": "Scans low-frequency data streams for market anomalies and sentiment shifts.", "icon": "Binary",
      "levels": [
        { "level": 1, "deployDuration": 3600, "xpReward": 10, "bsaiReward": 20, "upgradeCost": 100 },
        { "level": 2, "deployDuration": 3600, "xpReward": 20, "bsaiReward": 40, "upgradeCost": 250 },
        { "level": 3, "deployDuration": 2700, "xpReward": 35, "bsaiReward": 60, "upgradeCost": 0 }
      ]
    },
    {
      "id": "agent-002", "name": "Arbitrage Bot", "description": "Identifies and reports potential arbitrage opportunities between exchanges.", "icon": "Network",
      "levels": [
        { "level": 1, "deployDuration": 14400, "xpReward": 50, "bsaiReward": 100, "upgradeCost": 500 },
        { "level": 2, "deployDuration": 10800, "xpReward": 80, "bsaiReward": 180, "upgradeCost": 1200 },
        { "level": 3, "deployDuration": 7200, "xpReward": 120, "bsaiReward": 300, "upgradeCost": 0 }
      ]
    },
    {
      "id": "agent-003", "name": "Quantum Predictor", "description": "Utilizes quantum-inspired algorithms to forecast potential support and resistance zones.", "icon": "Waypoints",
      "levels": [
        { "level": 1, "deployDuration": 86400, "xpReward": 250, "bsaiReward": 600, "upgradeCost": 2500 },
        { "level": 2, "deployDuration": 64800, "xpReward": 400, "bsaiReward": 1000, "upgradeCost": 5000 },
        { "level": 3, "deployDuration": 43200, "xpReward": 600, "bsaiReward": 1500, "upgradeCost": 0 }
      ]
    },
    {
      "id": "agent-004", "name": "Node Validator", "description": "Secures a segment of the network, earning passive rewards by validating transaction blocks.", "icon": "Server",
      "levels": [
        { "level": 1, "deployDuration": 28800, "xpReward": 150, "bsaiReward": 400, "upgradeCost": 1500 },
        { "level": 2, "deployDuration": 21600, "xpReward": 250, "bsaiReward": 750, "upgradeCost": 3000 },
        { "level": 3, "deployDuration": 14400, "xpReward": 400, "bsaiReward": 1200, "upgradeCost": 0 }
      ]
    }
];

const specialOpsDefinitionsForSeeding = [
    {
      "id": "so-001", "title": "Quantum Entanglement", "description": "The Quantum Predictor has detected a rare market resonance. Claim this reward if your agent is sufficiently advanced to interpret the data.",
      "requiredAgentId": "agent-003", "requiredAgentLevel": 2, "xpReward": 1000, "bsaiReward": 2500, "isActive": true
    }
];

// --- Seeding Logic ---
async function seedDatabase() {
  try {
    for (const agentDef of agentDefinitionsForSeeding) {
      await prisma.agent.upsert({
        where: { id: agentDef.id },
        update: {
          name: agentDef.name,
          description: agentDef.description,
          icon: agentDef.icon,
        },
        create: {
          id: agentDef.id,
          name: agentDef.name,
          description: agentDef.description,
          icon: agentDef.icon,
          levels: {
            create: agentDef.levels.map(l => ({
              level: l.level,
              deployDuration: l.deployDuration,
              xpReward: l.xpReward,
              bsaiReward: l.bsaiReward,
              upgradeCost: l.upgradeCost,
            })),
          },
        },
      });
    }

    for (const opDef of specialOpsDefinitionsForSeeding) {
        await prisma.specialOp.upsert({
            where: { id: opDef.id },
            update: {
                title: opDef.title,
                description: opDef.description,
            },
            create: {
                id: opDef.id,
                title: opDef.title,
                description: opDef.description,
                requiredAgentId: opDef.requiredAgentId,
                requiredAgentLevel: opDef.requiredAgentLevel,
                xpReward: opDef.xpReward,
                bsaiReward: opDef.bsaiReward,
                isActive: opDef.isActive,
            },
        });
    }
  } catch (error) {
    console.error("Database seeding failed:", error);
    // Do not re-throw, as we don't want to fail actions if seeding has a concurrent issue.
  }
}

let seedingPromise: Promise<void> | null = null;
const ensureSeeded = () => {
    if (!seedingPromise) {
        seedingPromise = seedDatabase();
    }
    return seedingPromise;
};


// --- Actions ---

export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    if (userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { badges: true }
        });
        if (user) {
            return user;
        }
    }

    const newId = randomUUID();
    const newUser = await prisma.user.create({
        data: {
            id: newId,
            username: `Analyst_${newId.substring(0, 6)}`,
            shadowId: `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`,
            status: "Guest",
        }
    });
    return newUser as UserProfile;
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
    if (!userId) {
        console.error("fetchCurrentUserJson called without a userId.");
        return null;
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { badges: true }
        });
        return user;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { username: data.username },
            include: { badges: true },
        });
        return updatedUser;
    } catch (error) {
        console.error("Error updating user settings:", error);
        return null;
    }
}

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<{ userId: string; } | { error: string; }> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...formData,
                status: "Registered",
            }
        });
        return { userId };
    } catch (error: any) {
        return { error: `Failed to sign up for airdrop: ${error.message}` };
    }
}

export async function fetchLeaderboardDataJson(): Promise<LeaderboardUser[]> {
    try {
        const users = await prisma.user.findMany({
            orderBy: { weeklyPoints: 'desc' },
            take: 10,
            select: { id: true, username: true, weeklyPoints: true, airdropPoints: true }
        });
        return users.map((user, index) => ({ ...user, rank: index + 1 }));
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return [];
    }
}

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput & { userId: string }): Promise<GenerateTradingStrategyOutput | { error: string }> {
    try {
        const strategy = await genCoreStrategy(input);

        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };
        
        // Save the generated signal to the database
        const savedSignal = await prisma.generatedSignal.create({
            data: {
                userId: input.userId,
                symbol: input.symbol,
                signal: strategy.signal,
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
                strategyReasoning: 'Instant signal based on user-defined parameters.',
                analysisSummary: strategy.analysisSummary,
                newsAnalysis: strategy.newsAnalysis,
                type: SignalGenerationType.INSTANT,
                status: GeneratedSignalStatus.EXECUTED,
            }
        });

        // Always log the position for an instant signal
        await logInstantPositionAction(input.userId, { ...strategy, id: savedSignal.id, tradingMode: input.tradingMode, symbol: input.symbol });
        
        return { ...strategy, id: savedSignal.id, symbol: input.symbol, tradingMode: input.tradingMode };

    } catch (error: any) {
        console.error("Error in generateTradingStrategyAction:", error);
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(input: ShadowChoiceStrategyInput & { userId: string }): Promise<GenerateShadowChoiceStrategyOutput | { error: string }> {
    try {
        const strategy = await genShadowChoice(input);

        if (!strategy) return { error: "SHADOW Core failed to generate an autonomous strategy." };
        
        const isHold = strategy.signal.toUpperCase() === 'HOLD';
        
        const savedSignal = await prisma.generatedSignal.create({
            data: {
                userId: input.userId,
                symbol: input.symbol,
                signal: strategy.signal,
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
                type: SignalGenerationType.CUSTOM,
                status: isHold ? GeneratedSignalStatus.ARCHIVED : GeneratedSignalStatus.PENDING_EXECUTION,
            }
        });
        
        return { ...strategy, id: savedSignal.id, symbol: input.symbol };

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
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: 'User not found.' };
        const reward = missionRewards[missionId];
        if (!reward) return { success: false, message: 'Invalid mission ID.' };
        if (user.claimedMissions?.includes(missionId)) return { success: false, message: 'Mission reward already claimed.' };
        const updatedClaimedMissions = [...user.claimedMissions, missionId];
        await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: reward.xp },
                airdropPoints: { increment: reward.airdrop },
                claimedMissions: { set: updatedClaimedMissions },
            },
        });
        return { success: true, message: `Claimed ${reward.airdrop} $BSAI and ${reward.xp} XP!` };
    } catch (error: any) {
        return { success: false, message: `Failed to claim mission reward: ${error.message}` };
    }
}

export async function logInstantPositionAction(
  userId: string,
  strategy: GenerateTradingStrategyOutput
): Promise<{ position: Position | null; error?: string; message?: string }> {
  if (strategy.signal.toUpperCase() === 'HOLD') {
    return { position: null, message: "HOLD signal acknowledged. No position logged." };
  }

  if (!userId) {
    return { position: null, error: "User ID is required to log a position." };
  }

  try {
    const entryPrice = parsePrice(strategy.entry_zone);
    const stopLoss = parsePrice(strategy.stop_loss);
    const takeProfit = parsePrice(strategy.take_profit);

    if (isNaN(entryPrice) || isNaN(stopLoss) || isNaN(takeProfit)) {
      return { position: null, error: "Invalid price format for entry, stop loss, or take profit. Could not parse numbers." };
    }
    
    const size = entryPrice < 1 ? 10000 : 1;
    
    const tradingMode = strategy.tradingMode || 'Intraday';
    let expirationDate: Date;
    switch (tradingMode) {
      case 'Scalper': expirationDate = add(new Date(), { minutes: 30 }); break;
      case 'Sniper': expirationDate = add(new Date(), { hours: 3 }); break;
      case 'Intraday': expirationDate = add(new Date(), { hours: 12 }); break;
      case 'Swing': expirationDate = add(new Date(), { days: 3 }); break;
      default: expirationDate = add(new Date(), { hours: 24 }); break;
    }

    const newPosition = await prisma.position.create({
      data: {
        userId,
        symbol: strategy.symbol,
        signalType: strategy.signal === 'BUY' ? SignalType.BUY : SignalType.SELL,
        status: PositionStatus.OPEN,
        openTimestamp: new Date(),
        entryPrice,
        size,
        stopLoss,
        takeProfit,
        expirationTimestamp: expirationDate,
        strategyId: strategy.id,
      }
    });

    return { position: newPosition };
  } catch (error: any) {
    console.error("Error in logInstantPositionAction:", error);
    return { position: null, error: `Failed to log position: ${error.message}` };
  }
}

export async function executeCustomSignalAction(
  signalId: string,
  userId: string
): Promise<{ position: Position | null; error?: string }> {
  try {
    const signal = await prisma.generatedSignal.findUnique({ where: { id: signalId }});
    if (!signal) return { position: null, error: 'Signal not found.'};
    if (signal.userId !== userId) return { position: null, error: 'Unauthorized.'};
    if (signal.status !== 'PENDING_EXECUTION') return { position: null, error: `Signal is not pending execution (Status: ${signal.status})`};

    const entryPrice = parsePrice(signal.entry_zone);
    const stopLoss = parsePrice(signal.stop_loss);
    const takeProfit = parsePrice(signal.take_profit);

    if (isNaN(entryPrice) || isNaN(stopLoss) || isNaN(takeProfit)) {
      return { position: null, error: "Invalid price format in signal." };
    }
    
    const size = entryPrice < 1 ? 10000 : 1;
    
    // PENDING orders expire in 24 hours if not filled
    const expirationDate = add(new Date(), { hours: 24 });

    const newPosition = await prisma.position.create({
      data: {
        userId,
        symbol: signal.symbol,
        signalType: signal.signal === 'BUY' ? SignalType.BUY : SignalType.SELL,
        status: PositionStatus.PENDING,
        openTimestamp: null,
        entryPrice,
        size,
        stopLoss,
        takeProfit,
        expirationTimestamp: expirationDate, // This is for the PENDING order
        strategyId: signalId,
      }
    });
    
    await prisma.generatedSignal.update({
        where: { id: signalId },
        data: { status: GeneratedSignalStatus.EXECUTED }
    });

    return { position: newPosition };
  } catch (error: any) {
    console.error("Error in executeCustomSignalAction:", error);
    return { position: null, error: `Failed to create pending order: ${error.message}` };
  }
}

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ position?: Position; airdropPointsEarned?: number; error?: string; }> {
    try {
        const position = await prisma.position.findUnique({ where: { id: positionId } });
        if (!position || position.status === 'CLOSED') {
            return { error: 'Position not found or already closed.' };
        }

        const entry = position.entryPrice;
        
        const pnl = position.signalType === 'BUY' ? (closePrice - entry) * position.size : (entry - closePrice) * position.size;
        const airdropPointsEarned = Math.max(0, Math.floor(pnl * 10));
        
        const updatedPosition = await prisma.position.update({
            where: { id: positionId },
            data: { status: PositionStatus.CLOSED, closePrice: closePrice, closeTimestamp: new Date(), pnl: pnl }
        });

        if (airdropPointsEarned > 0) {
            try {
                await prisma.user.update({
                    where: { id: position.userId },
                    data: { airdropPoints: { increment: airdropPointsEarned } }
                });
            } catch (userUpdateError: any) {
                console.warn(`Could not update airdrop points for user ${position.userId}: ${userUpdateError.message}`);
            }
        }
        return { position: updatedPosition, airdropPointsEarned };
    } catch (error: any) {
        console.error("Error in closePositionAction:", error);
        return { error: `Failed to close position: ${error.message}` };
    }
}

export async function fetchPendingAndOpenPositionsAction(userId: string): Promise<Position[]> {
    if (!userId) return [];
    try {
        return await prisma.position.findMany({ 
            where: { 
                userId, 
                status: { in: [PositionStatus.OPEN, PositionStatus.PENDING] }
            }, 
            orderBy: { createdAt: 'desc' } 
        });
    } catch (error) { console.error(error); return []; }
}

export async function fetchTradeHistoryAction(userId: string): Promise<Position[]> {
     if (!userId) return [];
    try {
        return await prisma.position.findMany({ where: { userId, status: 'CLOSED' }, orderBy: { closeTimestamp: 'desc' }, take: 50 });
    } catch (error) { console.error(error); return []; }
}

export async function fetchPortfolioStatsAction(userId: string): Promise<PortfolioStats | { error: string }> {
    try {
        const closedTrades = await prisma.position.findMany({ where: { userId, status: 'CLOSED' } });
        const openPositions = await prisma.position.findMany({ where: { userId, status: 'OPEN' } });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "User not found." };
        
        const totalCapitalInvested = openPositions.reduce((acc, t) => acc + (t.entryPrice * t.size), 0);
        
        if (closedTrades.length === 0) {
            return { 
                totalTrades: 0, 
                winRate: 0, 
                winningTrades: 0, 
                totalPnl: 0, 
                totalPnlPercentage: 0, 
                bestTradePnl: 0, 
                worstTradePnl: 0, 
                lifetimeRewards: user.airdropPoints, 
                totalCapitalInvested 
            };
        }
        
        const totalTrades = closedTrades.length;
        const winningTrades = closedTrades.filter(t => t.pnl != null && t.pnl > 0).length;
        const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        const pnls = closedTrades.map(t => t.pnl || 0).filter(pnl => pnl !== 0);

        const totalCapitalInClosedTrades = closedTrades.reduce((acc, t) => acc + (t.entryPrice * t.size), 0);
        const totalPnlPercentage = totalCapitalInClosedTrades > 0 ? (totalPnl / totalCapitalInClosedTrades) * 100 : 0;
        
        const losingTrades = pnls.filter(pnl => pnl < 0);
        const worstTradePnl = losingTrades.length > 0 ? Math.min(...losingTrades) : 0;
        
        return {
            totalTrades,
            winRate: (totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0),
            winningTrades,
            totalPnl,
            totalPnlPercentage,
            bestTradePnl: pnls.length > 0 ? Math.max(...pnls) : 0,
            worstTradePnl,
            lifetimeRewards: user.airdropPoints || 0,
            totalCapitalInvested,
        };
    } catch (error: any) {
        return { error: `Failed to calculate portfolio stats: ${error.message}` };
    }
}

export async function fetchAgentDataAction(userId: string): Promise<{ agents: UserAgentData[], userXp: number } | { error: string }> {
    try {
        await ensureSeeded();
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { weeklyPoints: true } });
        if (!user) return { error: "User not found." };
        
        const [userAgents, agentDefinitions] = await Promise.all([
            prisma.userAgent.findMany({ where: { userId } }),
            prisma.agent.findMany({ include: { levels: { orderBy: { level: 'asc' } } } })
        ]);

        const agents = agentDefinitions.map(def => {
            const userState = userAgents.find(ua => ua.agentId === def.id) || null;
            return { ...def, userState: userState ? { ...userState, deploymentEndTime: userState.deploymentEndTime?.toISOString() || null } : null };
        });
        return { agents, userXp: user.weeklyPoints };
    } catch (error: any) {
        return { error: `Failed to fetch agent data: ${error.message}` };
    }
}

export async function deployAgentAction(userId: string, agentId: string): Promise<{ success: boolean, error?: string }> {
    try {
        const agentDef = await prisma.agent.findUnique({ where: { id: agentId }, include: { levels: true } });
        if (!agentDef) return { success: false, error: "Agent definition not found." };

        let userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId } });
        if (userAgent && userAgent.status === 'DEPLOYED') return { success: false, error: "Agent is already deployed." };
        
        const level = userAgent?.level || 1;
        const levelData = agentDef.levels.find(l => l.level === level);
        if (!levelData) return { success: false, error: "Agent level data not found." };

        const deploymentEndTime = add(new Date(), { seconds: levelData.deployDuration });
        if (userAgent) {
            await prisma.userAgent.update({ where: { id: userAgent.id }, data: { status: AgentStatus.DEPLOYED, deploymentEndTime } });
        } else {
            await prisma.userAgent.create({ data: { userId, agentId, level: 1, status: AgentStatus.DEPLOYED, deploymentEndTime } });
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: `Deployment failed: ${error.message}` };
    }
}

export async function claimAgentRewardsAction(userId: string, agentId: string): Promise<{ success: boolean; log?: string, message?: string }> {
    try {
        const userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId }, include: { agent: { include: { levels: true } } } });
        if (!userAgent || userAgent.status !== 'DEPLOYED' || !userAgent.deploymentEndTime || !isBefore(new Date(userAgent.deploymentEndTime), new Date())) {
            return { success: false, message: "Agent is not ready to be claimed." };
        }
        
        const levelData = userAgent.agent.levels.find(l => l.level === userAgent.level);
        if (!levelData) return { success: false, message: "Agent level data not found." };

        await prisma.userAgent.update({ where: { id: userAgent.id }, data: { status: AgentStatus.IDLE, deploymentEndTime: null } });
        await prisma.user.update({ where: { id: userId }, data: { weeklyPoints: { increment: levelData.xpReward }, airdropPoints: { increment: levelData.bsaiReward } } });
        
        const logResult = await generateMissionLog({ agentName: userAgent.agent.name, agentLevel: userAgent.level });
        return { success: true, log: logResult.log, message: `Claimed ${levelData.bsaiReward} BSAI and ${levelData.xpReward} XP.` };
    } catch (error: any) {
        return { success: false, message: `Claim failed: ${error.message}` };
    }
}

export async function upgradeAgentAction(userId: string, agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: "User not found." };

        const userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId }, include: { agent: { include: { levels: true } } } });
        const agentDef = userAgent?.agent;
        if (!agentDef) return { success: false, message: "Agent data not found." };
        
        const currentLevel = userAgent?.level || 1;
        const currentLevelData = agentDef.levels.find(l => l.level === currentLevel);
        if (!currentLevelData || !currentLevelData.upgradeCost || currentLevelData.upgradeCost === 0) {
            return { success: false, message: "Agent is at max level or upgrade data is missing." };
        }
        if (user.weeklyPoints < currentLevelData.upgradeCost) {
            return { success: false, message: "Insufficient XP for upgrade." };
        }
        
        const newLevel = currentLevel + 1;
        await prisma.user.update({ where: { id: userId }, data: { weeklyPoints: { decrement: currentLevelData.upgradeCost } } });
        
        if (userAgent) {
            await prisma.userAgent.update({ where: { id: userAgent.id }, data: { level: newLevel } });
        } else {
             // This case should ideally not happen if upgrading, but as a fallback:
            await prisma.userAgent.create({ data: { userId, agentId, level: newLevel, status: AgentStatus.IDLE } });
        }
        
        return { success: true, message: `Agent upgraded to Level ${newLevel}!` };
    } catch (error: any) {
        return { success: false, message: `Upgrade failed: ${error.message}` };
    }
}

export async function fetchSpecialOpsAction(userId: string): Promise<SpecialOp[]> {
    try {
        await ensureSeeded();
        const [user, specialOps] = await Promise.all([
            prisma.user.findUnique({ where: {id: userId }, select: { claimedSpecialOps: true }}),
            prisma.specialOp.findMany({ where: { isActive: true }})
        ]);

        if (!user) return specialOps;
        
        return specialOps.filter(op => !user.claimedSpecialOps.includes(op.id));
    } catch (error: any) {
        console.error("Error fetching special ops:", error);
        return [];
    }
}

export async function claimSpecialOpAction(userId: string, opId: string): Promise<{ success: boolean; message: string; }> {
    try {
        const op = await prisma.specialOp.findUnique({ where: { id: opId } });
        if (!op) return { success: false, message: "Special Op not found." };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.claimedSpecialOps.includes(opId)) return { success: false, message: "Reward already claimed." };

        const userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId: op.requiredAgentId } });
        if (!userAgent || userAgent.level < op.requiredAgentLevel) return { success: false, message: "Agent level requirement not met." };
        
        await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPoints: { increment: op.xpReward },
                airdropPoints: { increment: op.bsaiReward },
                claimedSpecialOps: { push: opId }
            }
        });
        return { success: true, message: `Claimed ${op.bsaiReward} BSAI and ${op.xpReward} XP!` };
    } catch (error: any) {
        return { success: false, message: `Claim failed: ${error.message}` };
    }
}

export async function generatePerformanceReviewAction(userId: string): Promise<PerformanceReviewOutput | { error: string }> {
    if (!userId) {
        return { error: 'User ID is required for a performance review.' };
    }

    try {
        const [statsResult, tradeHistory] = await Promise.all([
            fetchPortfolioStatsAction(userId),
            fetchTradeHistoryAction(userId),
        ]);

        if ('error' in statsResult) {
            return { error: `Could not fetch portfolio stats: ${statsResult.error}` };
        }
        
        const filteredTradeHistory = tradeHistory.filter(t => t.signalType === 'BUY' || t.signalType === 'SELL');

        if (filteredTradeHistory.length < 5) {
            return { error: 'Insufficient trade history. At least 5 closed trades (BUY/SELL) are required for a meaningful review.' };
        }

        const statsForAI = {
            totalTrades: statsResult.totalTrades,
            winRate: statsResult.winRate,
            winningTrades: statsResult.winningTrades,
            totalPnl: statsResult.totalPnl,
            bestTradePnl: statsResult.bestTradePnl,
            worstTradePnl: statsResult.worstTradePnl,
        };

        const historyForAI = filteredTradeHistory.map(t => ({
            id: t.id,
            symbol: t.symbol,
            signalType: t.signalType,
            entryPrice: t.entryPrice,
            closePrice: t.closePrice,
            pnl: t.pnl,
            openTimestamp: t.openTimestamp?.toISOString() || 'N/A',
            closeTimestamp: t.closeTimestamp?.toISOString() || null,
        }));

        const input: PerformanceReviewInput = {
            stats: statsForAI,
            tradeHistory: historyForAI,
        };
        
        const review = await genPerformanceReview(input);

        return review;

    } catch (error: any) {
        console.error("Error generating performance review:", error);
        return { error: `An unexpected error occurred in SHADOW's analytical core: ${error.message}` };
    }
}

export async function killSwitchAction(userId: string): Promise<{ success: boolean; message: string; }> {
    try {
        const openPositions = await prisma.position.findMany({ where: { userId, status: 'OPEN' } });
        if (openPositions.length === 0) {
            return { success: true, message: 'No active positions to close.' };
        }

        const symbols = [...new Set(openPositions.map(p => p.symbol))];
        const pricePromises = symbols.map(symbol => fetchMarketDataAction({ symbol }));
        const priceResults = await Promise.allSettled(pricePromises);

        const livePrices: Record<string, number> = {};
        for (const result of priceResults) {
            if (result.status === 'fulfilled' && !('error' in result.value)) {
                livePrices[result.value.symbol] = parseFloat(result.value.lastPrice);
            }
        }
        
        let totalPnl = 0;
        let totalAirdropPoints = 0;
        let closedCount = 0;
        let failedToCloseCount = 0;

        for (const position of openPositions) {
            const closePrice = livePrices[position.symbol];
            if (closePrice) {
                const entry = position.entryPrice;
                const pnl = position.signalType === 'BUY' ? (closePrice - entry) * position.size : (entry - closePrice) * position.size;
                
                totalPnl += pnl;
                const airdropPointsEarned = Math.max(0, Math.floor(pnl * 10));
                totalAirdropPoints += airdropPointsEarned;

                await prisma.position.update({
                    where: { id: position.id },
                    data: { status: PositionStatus.CLOSED, closePrice: closePrice, closeTimestamp: new Date(), pnl: pnl }
                });
                closedCount++;
            } else {
                failedToCloseCount++;
            }
        }

        if (totalAirdropPoints > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { airdropPoints: { increment: totalAirdropPoints } }
            });
        }
        
        if (closedCount === 0) {
            return { success: false, message: `Kill Switch failed. Could not fetch live prices for any of the ${openPositions.length} open positions.` };
        }

        let message = `Successfully closed ${closedCount} position(s). Total PnL: $${totalPnl.toFixed(2)}.`;
        if (failedToCloseCount > 0) {
            message += ` Failed to close ${failedToCloseCount} position(s) due to missing price data.`;
        }
        return { success: true, message };

    } catch (error: any) {
        console.error("Error in killSwitchAction:", error);
        return { success: false, message: `Kill Switch failed: ${error.message}` };
    }
}

export async function dismissCustomSignalAction(signalId: string, userId: string): Promise<{ success: boolean, error?: string }> {
     try {
        const result = await prisma.generatedSignal.updateMany({
            where: {
                id: signalId,
                userId: userId,
                status: GeneratedSignalStatus.PENDING_EXECUTION
            },
            data: {
                status: GeneratedSignalStatus.DISMISSED
            }
        });

        if (result.count === 0) {
            return { success: false, error: 'Signal not found or could not be dismissed.' };
        }
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: `Failed to dismiss signal: ${error.message}` };
    }
}

export async function fetchAllGeneratedSignalsAction(userId: string): Promise<GeneratedSignal[] | { error: string }> {
    if (!userId) {
        return { error: 'User not found.' };
    }
    try {
        const signals = await prisma.generatedSignal.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return signals;
    } catch (error: any) {
        return { error: `Failed to fetch signals: ${error.message}` };
    }
}


export async function openPendingPositionAction(positionId: string): Promise<{ position: Position | null, error?: string }> {
    try {
        const pendingPosition = await prisma.position.findUnique({
            where: { id: positionId, status: 'PENDING' },
            include: { strategy: true }
        });

        if (!pendingPosition) return { position: null, error: 'Pending position not found or already open.' };
        if (!pendingPosition.strategy) return { position: null, error: 'Associated strategy data not found for the position.' };

        const tradingMode = pendingPosition.strategy.chosenTradingMode || 'Intraday';
        let expirationDate: Date;
        switch (tradingMode) {
            case 'Scalper': expirationDate = add(new Date(), { hours: 1 }); break;
            case 'Sniper': expirationDate = add(new Date(), { hours: 3 }); break;
            case 'Intraday': expirationDate = add(new Date(), { hours: 12 }); break;
            case 'Swing': expirationDate = add(new Date(), { days: 3 }); break;
            default: expirationDate = add(new Date(), { hours: 24 }); break;
        }

        const openedPosition = await prisma.position.update({
            where: { id: positionId },
            data: {
                status: PositionStatus.OPEN,
                openTimestamp: new Date(),
                expirationTimestamp: expirationDate
            }
        });

        return { position: openedPosition };
    } catch (error: any) {
        console.error('Error opening pending position:', error);
        return { position: null, error: `Failed to open position: ${error.message}` };
    }
}

export async function archivePositionAction(positionId: string): Promise<{ success: boolean, error?: string }> {
    try {
        const position = await prisma.position.findUnique({ where: { id: positionId, status: 'PENDING' } });
        if (!position) return { success: false, error: 'Pending position not found to archive.' };

        await prisma.position.update({
            where: { id: positionId },
            data: {
                status: PositionStatus.CLOSED,
                closeTimestamp: new Date(),
                pnl: 0,
                closePrice: position.entryPrice,
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error('Error archiving position:', error);
        return { success: false, error: `Failed to archive position: ${error.message}` };
    }
}
