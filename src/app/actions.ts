
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';

import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import path from 'path';


// --- JSON Database setup ---
const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DbData {
    users: UserProfile[];
    badges: Badge[];
    _UserBadges: { A: string; B: string }[];
    console_insights: ConsoleInsight[];
    signals: SignalHistoryItem[];
    positions: Position[];
    agents: Agent[];
    user_agents: UserAgent[];
}

async function readDb(): Promise<DbData> {
  const defaultDb: DbData = { users: [], badges: [], _UserBadges: [], console_insights: [], signals: [], positions: [], agents: [], user_agents: [] };
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (parseError) {
        console.warn('Database file is corrupted. Re-initializing.', parseError);
        await writeDb(defaultDb);
        return defaultDb;
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with a default structure
      await writeDb(defaultDb);
      return defaultDb;
    }
    console.error('Error reading database file:', error);
    throw new Error('Could not read from database.');
  }
}

async function writeDb(data: DbData): Promise<void> {
  try {
    // Ensure the directory exists before writing the file
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
    throw new Error('Could not write to database.');
  }
}


// --- Type definitions ---
export interface UserProfile {
  id: string;
  username: string;
  status?: string;
  shadowId?: string;
  weeklyPoints: number;
  airdropPoints: number;
  badges?: Badge[];
  wallet_address?: string;
  wallet_type?: string;
  email?: string;
  phone?: string;
  x_handle?: string;
  telegram_handle?: string;
  youtube_handle?: string;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  weeklyPoints: number;
  airdropPoints: number;
  rank?: number;
  badge?: string;
}

export interface Badge {
  id: string;
  name: string;
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

export interface ConsoleInsight {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
}

export interface SignalHistoryItem {
    id: string;
    userId: string;
    signalType: string;
    symbol: string;
    price: number;
    timestamp: Date;
}

export interface Position {
    id: string;
    userId: string;
    symbol: string;
    signalType: 'BUY' | 'SELL';
    entryPrice: number;
    size: number;
    status: 'OPEN' | 'CLOSED';
    openTimestamp: string;
    closeTimestamp?: string;
    closePrice?: number;
    pnl?: number;
    stopLoss?: number;
    takeProfit?: number;
}

export interface AgentLevel {
  level: number;
  deployDuration: number; // in seconds
  xpReward: number;
  bsaiReward: number;
  upgradeCost: number; // in XP
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

// This is the combined data structure returned to the client
export interface UserAgentData extends Agent {
  userState: UserAgent | null;
}


// --- Mission Rewards ---
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

export async function claimMissionRewardAction(userId: string, missionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User not found.' };

    const reward = missionRewards[missionId];
    if (!reward) return { success: false, message: 'Invalid mission ID.' };

    // NOTE: In a real app, we'd check if the mission was already claimed.
    // The current frontend state management handles the disabled button, which is sufficient for this prototype.

    db.users[userIndex].weeklyPoints += reward.xp;
    db.users[userIndex].airdropPoints += reward.airdrop;

    await writeDb(db);
    return { success: true, message: `Claimed ${reward.airdrop} $BSAI and ${reward.xp} XP!` };
  } catch (error: any) {
    console.error("Error claiming mission reward:", error);
    return { success: false, message: `Failed to claim mission reward: ${error.message}` };
  }
}

// --- JSON-based Data Actions ---

export async function getOrCreateUserAction(userId: string | null): Promise<UserProfile> {
    const db = await readDb();

    if (userId) {
        const existingUser = db.users.find(u => u.id === userId);
        if (existingUser) {
            return existingUser;
        }
    }
    
    // Create new guest user
    const newUserId = randomUUID();
    const newUsername = `Analyst_${randomUUID().substring(0, 6)}`;
    const newShadowId = `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`;

    const newUser: UserProfile = {
        id: newUserId,
        username: newUsername,
        shadowId: newShadowId,
        status: 'Guest',
        weeklyPoints: 0,
        airdropPoints: 0,
        badges: []
    };

    db.users.push(newUser);
    await writeDb(db);

    return newUser;
}


export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
  try {
    const db = await readDb();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return null;
    }

    const userBadgeLinks = db._UserBadges.filter(ub => ub.A === userId);
    const userBadgeIds = userBadgeLinks.map(ubl => ubl.B);
    const userBadges = db.badges.filter(b => userBadgeIds.includes(b.id));

    user.badges = userBadges;

    return user as UserProfile;

  } catch (error) {
    console.error('Error fetching current user from JSON DB:', error);
    return null;
  }
}

export async function fetchLeaderboardDataJson(): Promise<LeaderboardUser[]> {
  try {
    const db = await readDb();
    const sortedUsers = db.users.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    return sortedUsers.slice(0, 10) as LeaderboardUser[];
  } catch (error) {
    console.error('Error fetching leaderboard data from JSON DB:', error);
    return [];
  }
}

export async function updateUserSettingsJson(userId: string, data: { username?: string }): Promise<UserProfile | null> {
  try {
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }

    if (data.username) {
        // Check for username uniqueness
        if (db.users.some(u => u.username === data.username && u.id !== userId)) {
            throw new Error("Username is already taken.");
        }
       db.users[userIndex].username = data.username;
    }

    await writeDb(db);
    const updatedUser = await fetchCurrentUserJson(userId);
    return updatedUser;

  } catch (error) {
    console.error('Error updating user settings in JSON DB:', error);
    return null;
  }
}

export async function handleAirdropSignupAction(formData: AirdropFormData, userId: string): Promise<{ userId?: string; error?: string }> {
  try {
    const { wallet_address } = formData;
    if (!wallet_address) {
      return { error: "Wallet address is required for airdrop signup." };
    }

    const db = await readDb();

    // Check if wallet address is already used by another REGISTERED user
    const existingWalletUser = db.users.find(u => u.wallet_address === wallet_address && u.id !== userId && u.status !== 'Guest');
    if (existingWalletUser) {
        return { error: "This wallet address is already registered to another analyst." };
    }

    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { error: "Your guest profile could not be found. Please refresh the page and try again." };
    }
    
    const currentUser = db.users[userIndex];
    
    // Update the user record
    db.users[userIndex] = {
        ...currentUser,
        ...formData,
        status: 'Airdrop Registered',
        airdropPoints: (currentUser.airdropPoints || 0) + 300, // Award 300 points for signing up
    };

    await writeDb(db);

    return { userId: currentUser.id };

  } catch (error: any) {
    console.error('Error handling airdrop signup:', error);
    return { error: `Failed to process airdrop signup: ${error.message || "An unknown error occurred."}` };
  }
}


export async function fetchConsoleInsightsJson(userId: string): Promise<ConsoleInsight[]> {
    try {
        const db = await readDb();
        const insights = db.console_insights
            .filter(i => i.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return insights as ConsoleInsight[];
    } catch (error) {
        console.error('Error fetching console insights:', error);
        return [];
    }
}

export async function fetchSignalHistoryJson(userId: string): Promise<SignalHistoryItem[]> {
    try {
        const db = await readDb();
        const signals = db.signals
            .filter(s => s.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return signals as SignalHistoryItem[];
    } catch (error) {
        console.error('Error fetching signal history:', error);
        return [];
    }
}

export async function populateSampleDataJson() {
    console.log('Populating JSON database with sample data...');
    try {
        const sampleDb: DbData = {
          "users": [
            {
              "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
              "username": "CryptoGuru",
              "status": "Active Analyst",
              "shadowId": "SHDW-ABC-111",
              "weeklyPoints": 1500,
              "airdropPoints": 10000,
              "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
              "wallet_type": "ETH",
              "email": "guru@example.com",
              "phone": null,
              "x_handle": "@cryptoguru",
              "telegram_handle": "@cryptoguru_tg",
              "youtube_handle": null
            },
            {
              "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
              "username": "TokenMaster",
              "status": "Passive Investor",
              "shadowId": "SHDW-DEF-222",
              "weeklyPoints": 800,
              "airdropPoints": 5000,
              "wallet_address": "Sol1234567890abcdef1234567890abcdef12345678",
              "wallet_type": "SOL",
              "email": "master@example.com",
              "phone": null,
              "x_handle": "@tokenmaster",
              "telegram_handle": "@tokenmaster_tg",
              "youtube_handle": null
            },
            {
              "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
              "username": "NFT_Ninja",
              "status": "Exploring",
              "shadowId": "SHDW-GHI-333",
              "weeklyPoints": 300,
              "airdropPoints": 2000,
              "wallet_address": "TON1234567890abcdef1234567890abcdef12345678",
              "wallet_type": "TON",
              "email": "ninja@example.com",
              "phone": null,
              "x_handle": "@nftninja",
              "telegram_handle": "@nftninja_tg",
              "youtube_handle": null
            }
          ],
          "badges": [
            { "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11", "name": "Early Adopter" },
            { "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12", "name": "Signal Provider Lv1" },
            { "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13", "name": "Insightful Analyst" }
          ],
          "_UserBadges": [
            { "A": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "B": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11" },
            { "A": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "B": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12" },
            { "A": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "B": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11" },
            { "A": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", "B": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13" }
          ],
          "console_insights": [
            { "id": "ci1", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "content": "Market showing bullish signs for BTC.", "timestamp": new Date(Date.now() - 3600000 * 2) },
            { "id": "ci2", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "content": "Noticed increased volume on ETH.", "timestamp": new Date(Date.now() - 3600000) },
            { "id": "ci3", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "content": "SOL seems to be consolidating.", "timestamp": new Date() }
          ],
          "signals": [
            { "id": "s1", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "signalType": "buy", "symbol": "BTCUSDT", "price": 107000, "timestamp": new Date(Date.now() - 1800000 * 3) },
            { "id": "s2", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "signalType": "sell", "symbol": "ETHUSDT", "price": 2400, "timestamp": new Date(Date.now() - 1800000 * 2) },
            { "id": "s3", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "signalType": "hold", "symbol": "SOLUSDT", "price": 150, "timestamp": new Date(Date.now() - 1800000) }
          ],
          "positions": [
            {
              "id": "p1",
              "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
              "symbol": "BTCUSDT",
              "signalType": "BUY",
              "entryPrice": 68000,
              "size": 0.1,
              "status": "OPEN",
              "openTimestamp": new Date(Date.now() - 86400000).toISOString(),
              "stopLoss": 67000,
              "takeProfit": 70000
            }
          ],
           "agents": [
                {
                "id": "agent-001",
                "name": "Data Scraper Drone",
                "description": "Scans low-frequency data streams for market anomalies and sentiment shifts.",
                "icon": "Binary",
                "levels": [
                    { "level": 1, "deployDuration": 3600, "xpReward": 10, "bsaiReward": 20, "upgradeCost": 100 },
                    { "level": 2, "deployDuration": 3600, "xpReward": 20, "bsaiReward": 40, "upgradeCost": 250 },
                    { "level": 3, "deployDuration": 2700, "xpReward": 35, "bsaiReward": 60, "upgradeCost": 0 }
                ]
                },
                {
                "id": "agent-002",
                "name": "Arbitrage Bot",
                "description": "Identifies and reports potential arbitrage opportunities between exchanges.",
                "icon": "Network",
                "levels": [
                    { "level": 1, "deployDuration": 14400, "xpReward": 50, "bsaiReward": 100, "upgradeCost": 500 },
                    { "level": 2, "deployDuration": 10800, "xpReward": 80, "bsaiReward": 180, "upgradeCost": 1200 },
                    { "level": 3, "deployDuration": 7200, "xpReward": 120, "bsaiReward": 300, "upgradeCost": 0 }
                ]
                },
                {
                "id": "agent-003",
                "name": "Quantum Predictor",
                "description": "Utilizes quantum-inspired algorithms to forecast potential support and resistance zones.",
                "icon": "Waypoints",
                "levels": [
                    { "level": 1, "deployDuration": 86400, "xpReward": 250, "bsaiReward": 600, "upgradeCost": 2500 },
                    { "level": 2, "deployDuration": 64800, "xpReward": 400, "bsaiReward": 1000, "upgradeCost": 5000 },
                    { "level": 3, "deployDuration": 43200, "xpReward": 600, "bsaiReward": 1500, "upgradeCost": 0 }
                ]
                }
            ],
            "user_agents": [
                {
                "id": "ua-1",
                "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "agentId": "agent-001",
                "level": 1,
                "status": "IDLE",
                "deploymentEndTime": null
                },
                {
                "id": "ua-2",
                "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "agentId": "agent-002",
                "level": 1,
                "status": "IDLE",
                "deploymentEndTime": null
                }
            ]
        };
        await writeDb(sampleDb);
        console.log('Sample data populated successfully.');
    } catch (error) {
        console.error('Error populating sample data:', error);
        throw error;
    }
}


// --- Portfolio and Trade History Actions ---

export async function openSimulatedPositionAction(userId: string, strategy: (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput)): Promise<{ position?: Position, error?: string }> {
  if (strategy.signal.toUpperCase() === 'HOLD') {
    return { error: "Cannot open a position on a 'HOLD' signal." };
  }
  if (!strategy.entry_zone || isNaN(parseFloat(strategy.entry_zone))) {
    return { error: "Invalid entry price in the strategy. Cannot open position."}
  }

  try {
    const db = await readDb();
    
    const newPosition: Position = {
      id: randomUUID(),
      userId: userId,
      symbol: strategy.symbol,
      signalType: strategy.signal.toUpperCase() as 'BUY' | 'SELL',
      entryPrice: parseFloat(strategy.entry_zone),
      size: 1, // Assume a fixed size of 1 unit of the base asset for now
      status: 'OPEN',
      openTimestamp: new Date().toISOString(),
      stopLoss: parseFloat(strategy.stop_loss) || undefined,
      takeProfit: parseFloat(strategy.take_profit) || undefined
    };

    db.positions.push(newPosition);
    await writeDb(db);

    return { position: newPosition };

  } catch (error: any) {
    console.error('Error opening simulated position:', error);
    return { error: `Failed to open position: ${error.message || "An unknown error occurred."}` };
  }
}

export async function fetchActivePositionsAction(userId: string): Promise<Position[]> {
  try {
    const db = await readDb();
    const positions = db.positions.filter(p => p.userId === userId && p.status === 'OPEN')
      .sort((a, b) => new Date(b.openTimestamp).getTime() - new Date(a.openTimestamp).getTime());
    return positions;
  } catch (error) {
    console.error('Error fetching active positions:', error);
    return [];
  }
}

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ success: boolean; pnl?: number; airdropPointsEarned?: number; error?: string }> {
  try {
    const db = await readDb();
    const positionIndex = db.positions.findIndex(p => p.id === positionId);

    if (positionIndex === -1) {
      return { success: false, error: 'Position not found.' };
    }

    const position = db.positions[positionIndex];
    if (position.status === 'CLOSED') {
      return { success: false, error: 'Position is already closed.' };
    }

    // Calculate PnL
    let pnl = 0;
    if (position.signalType === 'BUY') {
      pnl = (closePrice - position.entryPrice) * position.size;
    } else { // SELL
      pnl = (position.entryPrice - closePrice) * position.size;
    }

    // Update position
    position.status = 'CLOSED';
    position.closePrice = closePrice;
    position.closeTimestamp = new Date().toISOString();
    position.pnl = pnl;
    
    let airdropPointsEarned = 0;
    if (pnl > 0) {
        // Convert PnL to airdrop points (e.g., 1 USD = 10 points)
        airdropPointsEarned = Math.floor(pnl * 10);
        const userIndex = db.users.findIndex(u => u.id === position.userId);
        if (userIndex !== -1) {
            db.users[userIndex].airdropPoints += airdropPointsEarned;
        }
    }


    await writeDb(db);
    return { success: true, pnl, airdropPointsEarned };

  } catch (error: any) {
    console.error('Error closing position:', error);
    return { success: false, error: `Failed to close position: ${error.message || "An unknown error occurred."}` };
  }
}

export async function fetchTradeHistoryAction(userId: string): Promise<Position[]> {
  try {
    const db = await readDb();
    const positions = db.positions.filter(p => p.userId === userId && p.status === 'CLOSED')
      .sort((a, b) => new Date(b.closeTimestamp!).getTime() - new Date(a.closeTimestamp!).getTime());
    return positions;
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return [];
  }
}

export interface PortfolioStats {
    totalTrades: number;
    winRate: number;
    totalPnl: number;
    bestTradePnl: number;
    worstTradePnl: number;
    lifetimeRewards: number;
}

export async function fetchPortfolioStatsAction(userId: string): Promise<PortfolioStats | { error: string }> {
    try {
        const db = await readDb();
        const closedPositions = db.positions.filter(p => p.userId === userId && p.status === 'CLOSED');
        const user = db.users.find(u => u.id === userId);

        if (!user) {
            return { error: "User not found when calculating stats." };
        }

        const lifetimeRewards = user.airdropPoints || 0;

        if (closedPositions.length === 0) {
            return { totalTrades: 0, winRate: 0, totalPnl: 0, bestTradePnl: 0, worstTradePnl: 0, lifetimeRewards };
        }
        
        const totalTrades = closedPositions.length;
        const winningTrades = closedPositions.filter(p => p.pnl && p.pnl > 0).length;
        const totalPnl = closedPositions.reduce((acc, p) => acc + (p.pnl || 0), 0);
        const bestTradePnl = Math.max(0, ...closedPositions.map(p => p.pnl || 0));
        const worstTradePnl = Math.min(0, ...closedPositions.map(p => p.pnl || 0));
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        return {
            totalTrades,
            winRate,
            totalPnl,
            bestTradePnl,
            worstTradePnl,
            lifetimeRewards,
        };

    } catch (error: any) {
        console.error('Error fetching portfolio stats:', error);
        return { error: `Failed to calculate portfolio stats: ${error.message}` };
    }
}


// --- Agent Actions ---

export async function fetchAgentDataAction(userId: string): Promise<{ agents: UserAgentData[], userXp: number } | { error: string }> {
  try {
    const db = await readDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return { error: 'User not found.' };
    }

    // Combine static agent data with user-specific agent data
    const userAgentData: UserAgentData[] = db.agents.map(agent => {
      let userState = db.user_agents.find(ua => ua.userId === userId && ua.agentId === agent.id);
      
      // If user doesn't have a state for this agent, create a default one (but don't save it yet)
      if (!userState) {
          userState = {
              id: '', // Will be generated if saved
              userId: userId,
              agentId: agent.id,
              level: 1,
              status: 'IDLE',
              deploymentEndTime: null
          };
      }
      
      return { ...agent, userState };
    });

    return { agents: userAgentData, userXp: user.weeklyPoints };
  } catch (error: any) {
    console.error("Error fetching agent data:", error);
    return { error: `Failed to fetch agent data: ${error.message}` };
  }
}

export async function deployAgentAction(userId: string, agentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readDb();
    const agent = db.agents.find(a => a.id === agentId);
    if (!agent) return { success: false, error: 'Agent definition not found.' };

    let userAgent = db.user_agents.find(ua => ua.userId === userId && ua.agentId === agentId);

    // If no user agent exists, create one
    if (!userAgent) {
        userAgent = {
            id: randomUUID(),
            userId: userId,
            agentId: agentId,
            level: 1,
            status: 'IDLE',
            deploymentEndTime: null
        };
        db.user_agents.push(userAgent);
    }

    if (userAgent.status === 'DEPLOYED') {
      return { success: false, error: 'Agent is already deployed.' };
    }

    const currentLevel = agent.levels.find(l => l.level === userAgent!.level);
    if (!currentLevel) return { success: false, error: 'Agent level data not found.' };

    const deploymentEndTime = new Date(Date.now() + currentLevel.deployDuration * 1000).toISOString();
    userAgent.status = 'DEPLOYED';
    userAgent.deploymentEndTime = deploymentEndTime;

    await writeDb(db);
    return { success: true };
  } catch (error: any) {
    console.error("Error deploying agent:", error);
    return { success: false, error: `Failed to deploy agent: ${error.message}` };
  }
}

export async function claimAgentRewardsAction(userId: string, agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        const db = await readDb();
        const userAgentIndex = db.user_agents.findIndex(ua => ua.userId === userId && ua.agentId === agentId);
        if (userAgentIndex === -1) return { success: false, message: 'Agent not found for this user.' };

        const userAgent = db.user_agents[userAgentIndex];
        if (userAgent.status !== 'DEPLOYED') return { success: false, message: 'Agent is not deployed.' };
        if (!userAgent.deploymentEndTime || new Date(userAgent.deploymentEndTime) > new Date()) {
            return { success: false, message: 'Deployment not yet complete.' };
        }

        const agent = db.agents.find(a => a.id === agentId);
        if (!agent) return { success: false, message: 'Agent definition not found.' };

        const currentLevel = agent.levels.find(l => l.level === userAgent.level);
        if (!currentLevel) return { success: false, message: 'Agent level data not found.' };

        const userIndex = db.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return { success: false, message: 'User not found.' };

        // Add rewards
        db.users[userIndex].weeklyPoints += currentLevel.xpReward;
        db.users[userIndex].airdropPoints += currentLevel.bsaiReward;

        // Reset agent
        userAgent.status = 'IDLE';
        userAgent.deploymentEndTime = null;

        await writeDb(db);
        return { success: true, message: `Claimed ${currentLevel.bsaiReward} BSAI and ${currentLevel.xpReward} XP!` };
    } catch (error: any) {
        console.error("Error claiming rewards:", error);
        return { success: false, message: `Failed to claim rewards: ${error.message}` };
    }
}

export async function upgradeAgentAction(userId: string, agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        const db = await readDb();
        const userIndex = db.users.findIndex(u => u.id === userId);
        const userAgentIndex = db.user_agents.findIndex(ua => ua.userId === userId && ua.agentId === agentId);

        if (userIndex === -1) return { success: false, message: 'User not found.' };
        if (userAgentIndex === -1) return { success: false, message: 'Agent not found for this user.' };
        
        const user = db.users[userIndex];
        const userAgent = db.user_agents[userAgentIndex];

        const agent = db.agents.find(a => a.id === agentId);
        if (!agent) return { success: false, message: 'Agent definition not found.' };

        const currentLevel = agent.levels.find(l => l.level === userAgent.level);
        const nextLevel = agent.levels.find(l => l.level === userAgent.level + 1);

        if (!currentLevel) return { success: false, message: 'Current agent level data not found.' };
        if (!nextLevel) return { success: false, message: 'Agent is already at max level.' };

        if (user.weeklyPoints < currentLevel.upgradeCost) {
            return { success: false, message: `Insufficient XP. Requires ${currentLevel.upgradeCost} XP.` };
        }

        // Deduct cost and upgrade
        user.weeklyPoints -= currentLevel.upgradeCost;
        userAgent.level += 1;

        await writeDb(db);
        return { success: true, message: `Agent upgraded to Level ${nextLevel.level}!` };
    } catch (error: any) {
        console.error("Error upgrading agent:", error);
        return { success: false, message: `Failed to upgrade agent: ${error.message}` };
    }
}


// --- Existing Untouched Actions ---

export interface LiveMarketData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

interface FetchDataError {
  error: string;
  status?: number;
}

export interface FormattedSymbol {
  value: string;
  label: string;
}

export interface TickerSymbolData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

export type ChatMessage = AIChatMessage;

// --- Export types for SHADOW's Choice ---
export type { ShadowChoiceStrategyInput, ShadowChoiceStrategyCoreOutput };
export type GenerateShadowChoiceStrategyOutput = ShadowChoiceStrategyCoreOutput & {
    disclaimer: string;
    symbol: string;
};


export async function fetchAllTradingSymbolsAction(): Promise<FormattedSymbol[] | FetchDataError> {
  const apiKey = process.env.BINANCE_API_KEY;

  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    return { error: "Binance API Key is not configured on the server. Cannot fetch symbol list." };
  }

  const url = `https://api.binance.com/api/v3/ticker/24hr`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch symbol list from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data: any[] = await response.json();

    const usdtPairs = data
      .filter(ticker => ticker.symbol.endsWith('USDT') && parseFloat(ticker.quoteVolume) > 0 && !ticker.symbol.includes('_'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 150)
      .map(ticker => ({
        value: ticker.symbol,
        label: `${ticker.symbol.replace('USDT', '')}/USDT`,
      }));

    if (usdtPairs.length === 0) {
        return { error: "No active USDT trading pairs found from Binance." };
    }

    return usdtPairs;

  } catch (error) {
    return { error: "An unexpected error occurred while fetching the list of trading symbols." };
  }
}

export async function fetchTopSymbolsForTickerAction(): Promise<TickerSymbolData[] | FetchDataError> {
  const apiKey = process.env.BINANCE_API_KEY;
  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    return { error: "Binance API Key is not configured. Cannot fetch ticker data." };
  }

  const url = `https://api.binance.com/api/v3/ticker/24hr`;
  try {
    const response = await fetch(url, {
      headers: { 'X-MBX-APIKEY': apiKey },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch ticker data from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const allTickers: any[] = await response.json();
    const topUsdtTickers = allTickers
      .filter(ticker => ticker.symbol.endsWith('USDT') && parseFloat(ticker.quoteVolume) > 0 && !ticker.symbol.includes('_'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 15) 
      .map(ticker => ({
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice,
        priceChangePercent: ticker.priceChangePercent,
      }));

    if (topUsdtTickers.length === 0) {
      return { error: "No active USDT trading pairs found for ticker." };
    }
    return topUsdtTickers;
  } catch (error) {
    return { error: "An unexpected error occurred while fetching ticker data." };
  }
}


export async function fetchMarketDataAction(params: { symbol: string }): Promise<LiveMarketData | FetchDataError> {
  const { symbol } = params;
  const apiKey = process.env.BINANCE_API_KEY;

  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    return { error: "Binance API Key is not configured on the server. Please set BINANCE_API_KEY in your .env file." };
  }

  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch market data from Binance for ${symbol}: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data = await response.json();

    if (!data.symbol || !data.lastPrice || !data.priceChangePercent || !data.volume || !data.highPrice || !data.lowPrice || !data.quoteVolume) {
        return { error: `Received incomplete market data from Binance API for ${symbol}.`}
    }

    return {
      symbol: data.symbol,
      lastPrice: data.lastPrice,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume,
      highPrice: data.highPrice,
      lowPrice: data.lowPrice,
      quoteVolume: data.quoteVolume,
    };
  } catch (error) {
    return { error: `An unexpected error occurred while fetching market data for ${symbol}.` };
  }
}

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
  try {
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }

    if (input.marketData === '{}' || !input.marketData) {
        return {error: "Market data is missing or invalid. Cannot generate strategy."}
    }

    const coreStrategyResult = await genCoreStrategy(input);

    const disclaimerResult = await generateSarcasticDisclaimer({});

    const finalResult: GenerateTradingStrategyOutput = {
      ...coreStrategyResult,
      symbol: input.symbol, // Manually add symbol to the final output
      disclaimer: disclaimerResult.disclaimer,
    };

    return finalResult;

  } catch (error: any) {
    let errorMessage = "SHADOW's analysis failed. Please check server logs or try again.";

    if (error.message) {
        if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
            const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
            errorMessage = `SHADOW's connection to the generative model (Gemini) reported an issue: ${statusCode}. This is likely a temporary problem on Google's side. Please try again in a few moments.`;
        } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
            errorMessage = "SHADOW's analysis was blocked by safety filters. This might be due to the nature of the request or specific terms used. Try rephrasing or simplifying your request."
        }
         else {
            errorMessage = `SHADOW's analysis failed: ${error.message}`;
        }
    }

    if (error.details) {
         errorMessage += ` Details: ${typeof error.details === 'object' ? JSON.stringify(error.details) : error.details}`;
    } else if (error.cause && typeof error.cause === 'object') {
        const causeDetails = JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause));
        errorMessage += ` Cause: ${causeDetails}`;
    }  else if (error.cause && typeof error.cause !== 'object') {
        errorMessage += ` Cause: ${error.cause}`;
    }

    if (typeof error === 'object' && error !== null && !error.message && !error.details && !error.cause) {
        errorMessage += ` Additional info: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
    }
    console.error("Error in generateTradingStrategyAction: ", errorMessage, error);
    return { error: errorMessage };
  }
}

export async function generateShadowChoiceStrategyAction(input: ShadowChoiceStrategyInput): Promise<GenerateShadowChoiceStrategyOutput | { error: string }> {
  try {
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }

    if (input.marketData === '{}' || !input.marketData) {
        return {error: "Market data is missing or invalid. SHADOW cannot make a choice without data."}
    }
    
    // Generate the core strategy using SHADOW's autonomous choice
    const coreStrategyResult = await genShadowChoice(input);

    // Generate the standard disclaimer
    const disclaimerResult = await generateSarcasticDisclaimer({});

    // Combine results into the final output object
    const finalResult: GenerateShadowChoiceStrategyOutput = {
      ...coreStrategyResult,
      symbol: input.symbol, // Manually add symbol to the final output
      disclaimer: disclaimerResult.disclaimer,
    };

    return finalResult;

  } catch (error: any) {
    // Re-using the robust error handling from the other action
    let errorMessage = "SHADOW's autonomous core failed. Please check server logs or try again.";

    if (error.message) {
        if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
            const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
            errorMessage = `SHADOW's connection to the generative model (Gemini) reported an issue: ${statusCode}. This is likely a temporary problem on Google's side. Please try again in a few moments.`;
        } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
            errorMessage = "SHADOW's autonomous analysis was blocked by safety filters. The query may have triggered a policy violation."
        }
         else {
            errorMessage = `SHADOW's autonomous core failed: ${error.message}`;
        }
    }

    if (error.details) {
         errorMessage += ` Details: ${typeof error.details === 'object' ? JSON.stringify(error.details) : error.details}`;
    } else if (error.cause && typeof error.cause === 'object') {
        const causeDetails = JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause));
        errorMessage += ` Cause: ${causeDetails}`;
    }  else if (error.cause && typeof error.cause !== 'object') {
        errorMessage += ` Cause: ${error.cause}`;
    }

    if (typeof error === 'object' && error !== null && !error.message && !error.details && !error.cause) {
        errorMessage += ` Additional info: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
    }
    
    console.error("Error in generateShadowChoiceStrategyAction: ", errorMessage, error);
    return { error: errorMessage };
  }
}


export async function shadowChatAction(input: ShadowChatInput): Promise<ShadowChatOutput | { error: string }> {
  try {
    if (!input.currentUserInput || input.currentUserInput.trim() === "") {
      return { error: "A query is required. My time is not for trivialities." };
    }
    if (!input.userId) {
      return { error: "User session is required to communicate with SHADOW." };
    }
    const result = await shadowChat(input);
    return result;
  } catch (error: any) {
    let errorMessage = "SHADOW's cognitive functions are currently experiencing interference.";
     if (error.message) {
        if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
            const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
            errorMessage = `SHADOW's link to the generative matrix (Gemini) has a disturbance: ${statusCode}. Likely temporary. Retry transmission.`;
        } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
            errorMessage = "SHADOW's intended transmission was intercepted by safety protocols. Reformulate your query."
        } else {
            errorMessage = `SHADOW's processing encountered an anomaly: ${error.message}`;
        }
    }
    console.error("Error in shadowChatAction: ", errorMessage, error);
    return { error: errorMessage };
  }
}

export async function generateDailyGreetingAction(): Promise<GenerateDailyGreetingOutput | { error: string }> {
  try {
    const result = await generateDailyGreeting();
    return result;
  } catch (error: any) {
    let errorMessage = "SHADOW's daily signal is obscured.";
    if (error.message) {
      if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
        const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
        errorMessage = `SHADOW's connection to the source (Gemini) is unstable: ${statusCode}. Try again later.`;
      } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
        errorMessage = "SHADOW's morning transmission was filtered by safety protocols. A standard greeting will suffice.";
      } else {
        errorMessage = `Daily greeting malfunction: ${error.message}`;
      }
    }
    console.error("Error in generateDailyGreetingAction:", errorMessage, error);
    return { error: errorMessage, greeting: "The market awakens. Observe closely." }; 
  }
}
    

    








