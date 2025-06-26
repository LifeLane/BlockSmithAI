
"use server";
// AI Flow Imports
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput as CoreOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat as shadowChatFlow, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';
import { generateMissionLog, type GenerateMissionLogInput } from '@/ai/flows/generate-mission-log';

// Node/Prisma Imports
import { PrismaClient, type Position as PrismaPosition, type User as PrismaUser, type Badge as PrismaBadge } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add, isBefore } from 'date-fns';


// Initialize Prisma
const prisma = new PrismaClient();

// Type Definitions
export type Position = PrismaPosition;
export type Badge = PrismaBadge;
export type UserProfile = PrismaUser & {
    badges?: Badge[];
};
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
    totalPnl: number;
    bestTradePnl: number;
    worstTradePnl: number;
    lifetimeRewards: number;
}
export type GenerateTradingStrategyOutput = CoreOutput & {
  id?: string;
  disclaimer: string;
  symbol: string;
};
export type GenerateShadowChoiceStrategyOutput = ShadowChoiceStrategyCoreOutput & {
  id?: string;
  symbol: string;
  disclaimer: string;
};

// --- Mission and Agent Data ---
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

const agentDefinitions: Agent[] = [
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
    }
];

const specialOpsDefinitions: SpecialOp[] = [
    {
      "id": "so-001", "title": "Quantum Entanglement", "description": "The Quantum Predictor has detected a rare market resonance. Claim this reward if your agent is sufficiently advanced to interpret the data.",
      "requiredAgentId": "agent-003", "requiredAgentLevel": 2, "xpReward": 1000, "bsaiReward": 2500, "isActive": true, "claimedBy": []
    }
]

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

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
    try {
        const [strategy, disclaimer] = await Promise.all([ genCoreStrategy(input), generateSarcasticDisclaimer() ]);
        if (!strategy) return { error: "SHADOW Core failed to generate a coherent strategy." };
        return { ...strategy, symbol: input.symbol, disclaimer: disclaimer.disclaimer };
    } catch (error: any) {
        return { error: `An unexpected error occurred in SHADOW's cognitive core: ${error.message}` };
    }
}

export async function generateShadowChoiceStrategyAction(input: ShadowChoiceStrategyInput): Promise<GenerateShadowChoiceStrategyOutput | { error: string }> {
    try {
        const [strategy, disclaimer] = await Promise.all([ genShadowChoice(input), generateSarcasticDisclaimer() ]);
        if (!strategy) return { error: "SHADOW Core failed to generate an autonomous strategy." };
        return { ...strategy, symbol: input.symbol, disclaimer: disclaimer.disclaimer };
    } catch (error: any) {
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

export async function openSimulatedPositionAction(userId: string, strategy: GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput): Promise<{ position?: Position; error?: string }> {
    if (!strategy.signal || strategy.signal.toUpperCase() === 'HOLD') return { error: "Cannot open a position for a 'HOLD' signal." };
    try {
        const newPosition = await prisma.position.create({
            data: {
                id: randomUUID(), userId, symbol: strategy.symbol,
                signalType: strategy.signal === 'BUY' ? 'BUY' : 'SELL',
                entryPrice: parseFloat(strategy.entry_zone),
                size: 1, status: 'OPEN',
                openTimestamp: new Date().toISOString(),
                stopLoss: parseFloat(strategy.stop_loss),
                takeProfit: parseFloat(strategy.take_profit),
                expirationTimestamp: add(new Date(), { hours: 24 }).toISOString(),
            }
        });
        return { position: newPosition };
    } catch (error: any) {
        return { error: `Failed to open position: ${error.message}` };
    }
}

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ position?: Position; airdropPointsEarned?: number; error?: string; }> {
    try {
        const position = await prisma.position.findUnique({ where: { id: positionId } });
        if (!position || position.status === 'CLOSED') return { error: 'Position not found or already closed.' };
        const pnl = position.signalType === 'BUY' ? (closePrice - position.entryPrice) * position.size : (position.entryPrice - closePrice) * position.size;
        const airdropPointsEarned = Math.max(0, Math.floor(pnl));
        const updatedPosition = await prisma.position.update({
            where: { id: positionId },
            data: { status: 'CLOSED', closePrice: closePrice, closeTimestamp: new Date().toISOString(), pnl: pnl, }
        });
        if (airdropPointsEarned > 0) {
            await prisma.user.update({ where: { id: position.userId }, data: { airdropPoints: { increment: airdropPointsEarned } } });
        }
        return { position: updatedPosition, airdropPointsEarned };
    } catch (error: any) {
        return { error: `Failed to close position: ${error.message}` };
    }
}

export async function fetchActivePositionsAction(userId: string): Promise<Position[]> {
    if (!userId) return [];
    try {
        return await prisma.position.findMany({ where: { userId, status: 'OPEN' }, orderBy: { openTimestamp: 'desc' } });
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
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "User not found." };
        if (closedTrades.length === 0) return { totalTrades: 0, winRate: 0, totalPnl: 0, bestTradePnl: 0, worstTradePnl: 0, lifetimeRewards: user.airdropPoints };
        
        const totalTrades = closedTrades.length;
        const winningTrades = closedTrades.filter(t => t.pnl && t.pnl > 0).length;
        const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        const pnls = closedTrades.map(t => t.pnl || 0);
        return {
            totalTrades,
            winRate: (winningTrades / totalTrades) * 100,
            totalPnl,
            bestTradePnl: Math.max(...pnls),
            worstTradePnl: Math.min(...pnls),
            lifetimeRewards: user.airdropPoints || 0,
        };
    } catch (error: any) {
        return { error: `Failed to calculate portfolio stats: ${error.message}` };
    }
}

export async function fetchAgentDataAction(userId: string): Promise<{ agents: UserAgentData[], userXp: number } | { error: string }> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { weeklyPoints: true } });
        if (!user) return { error: "User not found." };
        
        const userAgents = await prisma.userAgent.findMany({ where: { userId } });
        const agents = agentDefinitions.map(def => {
            const userState = userAgents.find(ua => ua.agentId === def.id) || null;
            return { ...def, userState };
        });
        return { agents, userXp: user.weeklyPoints };
    } catch (error: any) {
        return { error: `Failed to fetch agent data: ${error.message}` };
    }
}

export async function deployAgentAction(userId: string, agentId: string): Promise<{ success: boolean, error?: string }> {
    try {
        const agentDef = agentDefinitions.find(a => a.id === agentId);
        if (!agentDef) return { success: false, error: "Agent definition not found." };

        let userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId } });
        if (userAgent && userAgent.status === 'DEPLOYED') return { success: false, error: "Agent is already deployed." };
        
        const level = userAgent?.level || 1;
        const levelData = agentDef.levels.find(l => l.level === level);
        if (!levelData) return { success: false, error: "Agent level data not found." };

        const deploymentEndTime = add(new Date(), { seconds: levelData.deployDuration }).toISOString();
        if (userAgent) {
            await prisma.userAgent.update({ where: { id: userAgent.id }, data: { status: 'DEPLOYED', deploymentEndTime } });
        } else {
            await prisma.userAgent.create({ data: { id: randomUUID(), userId, agentId, level: 1, status: 'DEPLOYED', deploymentEndTime } });
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: `Deployment failed: ${error.message}` };
    }
}

export async function claimAgentRewardsAction(userId: string, agentId: string): Promise<{ success: boolean; log?: string, message?: string }> {
    try {
        const userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId } });
        if (!userAgent || userAgent.status !== 'DEPLOYED' || !userAgent.deploymentEndTime || !isBefore(new Date(userAgent.deploymentEndTime), new Date())) {
            return { success: false, message: "Agent is not ready to be claimed." };
        }
        const agentDef = agentDefinitions.find(a => a.id === agentId);
        const levelData = agentDef?.levels.find(l => l.level === userAgent.level);
        if (!agentDef || !levelData) return { success: false, message: "Agent data not found." };

        await prisma.userAgent.update({ where: { id: userAgent.id }, data: { status: 'IDLE', deploymentEndTime: null } });
        await prisma.user.update({ where: { id: userId }, data: { weeklyPoints: { increment: levelData.xpReward }, airdropPoints: { increment: levelData.bsaiReward } } });
        
        const logResult = await generateMissionLog({ agentName: agentDef.name, agentLevel: userAgent.level });
        return { success: true, log: logResult.log, message: `Claimed ${levelData.bsaiReward} BSAI and ${levelData.xpReward} XP.` };
    } catch (error: any) {
        return { success: false, message: `Claim failed: ${error.message}` };
    }
}

export async function upgradeAgentAction(userId: string, agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userAgent = await prisma.userAgent.findFirst({ where: { userId, agentId } });
        const agentDef = agentDefinitions.find(a => a.id === agentId);
        if (!user || !agentDef) return { success: false, message: "Data not found." };
        
        const currentLevel = userAgent?.level || 1;
        const currentLevelData = agentDef.levels.find(l => l.level === currentLevel);
        if (!currentLevelData || !currentLevelData.upgradeCost) return { success: false, message: "Agent is at max level or upgrade data is missing." };
        if (user.weeklyPoints < currentLevelData.upgradeCost) return { success: false, message: "Insufficient XP for upgrade." };
        
        const newLevel = currentLevel + 1;
        if (userAgent) {
            await prisma.userAgent.update({ where: { id: userAgent.id }, data: { level: newLevel } });
        } else {
            await prisma.userAgent.create({ data: { id: randomUUID(), userId, agentId, level: newLevel, status: 'IDLE' } });
        }
        await prisma.user.update({ where: { id: userId }, data: { weeklyPoints: { decrement: currentLevelData.upgradeCost } } });
        return { success: true, message: `Agent upgraded to Level ${newLevel}!` };
    } catch (error: any) {
        return { success: false, message: `Upgrade failed: ${error.message}` };
    }
}

export async function fetchSpecialOpsAction(userId: string): Promise<SpecialOp[]> {
    try {
        const user = await prisma.user.findUnique({ where: {id: userId }, select: { claimedSpecialOps: true }});
        return specialOpsDefinitions.filter(op => !user?.claimedSpecialOps.includes(op.id));
    } catch (error: any) {
        return [];
    }
}

export async function claimSpecialOpAction(userId: string, opId: string): Promise<{ success: boolean; message: string; }> {
    try {
        const op = specialOpsDefinitions.find(o => o.id === opId);
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

    
