
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { generateShadowChoiceStrategy as genShadowChoice, type ShadowChoiceStrategyInput, type ShadowChoiceStrategyCoreOutput } from '@/ai/flows/generate-shadow-choice-strategy';
import { generateMissionLog, GenerateMissionLogInput } from '@/ai/flows/generate-mission-log';

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';


const prisma = new PrismaClient();

// --- Type definitions (kept for client-side interfaces, but data fetched via Prisma) ---
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
  claimedMissions?: string[];
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
    expirationTimestamp?: string;
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

export interface SpecialOp {
    id: string;
    title: string;
    description: string;
    requiredAgentId: string;
    requiredAgentLevel: number;
    xpReward: number;
    bsaiReward: number;
    isActive: boolean;
    claimedBy: string[]; // Array of user IDs who have claimed it
}

export interface FormattedSymbol {
  value: string;
  label: string;
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, weeklyPoints: true, airdropPoints: true, claimedMissions: true }
    });

    if (!user) return { success: false, message: 'User not found.' };

    const reward = missionRewards[missionId];
    if (!reward) return { success: false, message: 'Invalid mission ID.' };

    if (user.claimedMissions?.includes(missionId)) {
        return { success: false, message: 'Mission reward already claimed.' };
    }

    const updatedClaimedMissions = user.claimedMissions ? [...user.claimedMissions, missionId] : [missionId];

    await prisma.user.update({
      where: { id: userId },
      data: {
        weeklyPoints: user.weeklyPoints + reward.xp,
        airdropPoints: user.airdropPoints + reward.airdrop,
        claimedMissions: updatedClaimedMissions,
      },
    });
    return { success: true, message: `Claimed ${reward.airdrop} $BSAI and ${reward.xp} XP!` };
  } catch (error: any) {
    console.error("Error claiming mission reward:", error);
    return { success: false, message: `Failed to claim mission reward: ${error.message}` };
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

    const topSymbols = data
      .filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('_'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50);

    if (topSymbols.length === 0) {
      return { error: 'No top USDT trading symbols found on Binance.' };
    }

    const formattedSymbols: FormattedSymbol[] = topSymbols.map(s => ({
      value: s.symbol,
      label: `${s.symbol.replace('USDT', '')}/USDT`,
    }));

    return formattedSymbols;

  } catch (error: any) {
    console.error("Error in fetchAllTradingSymbolsAction:", error);
    return { error: `Network error or failed to parse symbols: ${error.message}` };
  }
}

export async function fetchCurrentUserJson(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.error("fetchCurrentUserJson called without a userId.");
    return null;
  }
  try {
    // The user model from Prisma should be compatible with UserProfile.
    // The `badges` property is optional on UserProfile, so if it's not included here,
    // the calling code should handle it gracefully.
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user as UserProfile | null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
