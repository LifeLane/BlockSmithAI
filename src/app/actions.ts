
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { getTokenPriceFromMoralis, type TokenPrice } from '@/services/moralis-service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import path from 'path';


// --- JSON Database setup ---
const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DbData {
    users: any[];
    badges: any[];
    _UserBadges: any[];
    console_insights: any[];
    signals: any[];
    positions: Position[];
}

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with a default structure
      const defaultDb: DbData = { users: [], badges: [], _UserBadges: [], console_insights: [], signals: [], positions: [] };
      await writeDb(defaultDb);
      return defaultDb;
    }
    console.error('Error reading database file:', error);
    throw new Error('Could not read from database.');
  }
}

async function writeDb(data: DbData): Promise<void> {
  try {
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


// --- JSON-based Data Actions ---

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
    return fetchCurrentUserJson(userId);

  } catch (error) {
    console.error('Error updating user settings in JSON DB:', error);
    return null;
  }
}

export async function handleAirdropSignupAction(formData: AirdropFormData): Promise<{ userId?: string; shadowId?: string; error?: string }> {
  try {
    const { wallet_address, wallet_type, email, phone, x_handle, telegram_handle, youtube_handle } = formData;

    if (!wallet_address) {
      return { error: "Wallet address is required for airdrop signup." };
    }

    const db = await readDb();

    const existingUser = db.users.find(u => u.wallet_address === wallet_address);
    if (existingUser) {
      console.log('Existing user found:', existingUser.id);
      return { userId: existingUser.id, shadowId: existingUser.shadowId };
    }

    const newUsername = `User_${randomUUID().substring(0, 7)}`;
    const newShadowId = `SHDW-${randomUUID().substring(0, 7).toUpperCase()}`;

    const newUser = {
        id: randomUUID(),
        username: newUsername,
        shadowId: newShadowId,
        wallet_address,
        wallet_type,
        email,
        phone,
        x_handle,
        telegram_handle,
        youtube_handle,
        status: 'Airdrop Registered',
        weeklyPoints: 0,
        airdropPoints: 300, // Initial points for signing up
        badges: []
    };

    db.users.push(newUser);
    await writeDb(db);

    console.log('New user created:', newUser.id);
    return { userId: newUser.id, shadowId: newUser.shadowId };

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
            { "id": "ci1", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "content": "Market showing bullish signs for BTC.", "timestamp": new Date(Date.now() - 3600000 * 2).toISOString() },
            { "id": "ci2", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "content": "Noticed increased volume on ETH.", "timestamp": new Date(Date.now() - 3600000).toISOString() },
            { "id": "ci3", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "content": "SOL seems to be consolidating.", "timestamp": new Date().toISOString() }
          ],
          "signals": [
            { "id": "s1", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "signalType": "buy", "symbol": "BTCUSDT", "price": 107000, "timestamp": new Date(Date.now() - 1800000 * 3).toISOString() },
            { "id": "s2", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "signalType": "sell", "symbol": "ETHUSDT", "price": 2400, "timestamp": new Date(Date.now() - 1800000 * 2).toISOString() },
            { "id": "s3", "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "signalType": "hold", "symbol": "SOLUSDT", "price": 150, "timestamp": new Date(Date.now() - 1800000).toISOString() }
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
          ]
        };
        await writeDb(sampleDb);
        console.log('Sample data populated successfully.');
    } catch (error) {
        console.error('Error populating sample data:', error);
        throw error;
    }
}


// --- New Portfolio Actions ---

export async function openSimulatedPositionAction(userId: string, strategy: GenerateTradingStrategyOutput): Promise<{ position?: Position, error?: string }> {
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

export async function closePositionAction(positionId: string, closePrice: number): Promise<{ success: boolean; pnl?: number, error?: string }> {
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

    position.status = 'CLOSED';
    position.closePrice = closePrice;
    position.closeTimestamp = new Date().toISOString();
    position.pnl = pnl;

    await writeDb(db);
    return { success: true, pnl };

  } catch (error: any) {
    console.error('Error closing position:', error);
    return { success: false, error: `Failed to close position: ${error.message || "An unknown error occurred."}` };
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


export async function shadowChatAction(input: ShadowChatInput): Promise<ShadowChatOutput | { error: string }> {
  try {
    if (!input.currentUserInput || input.currentUserInput.trim() === "") {
      return { error: "A query is required. My time is not for trivialities." };
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

export async function fetchTokenPriceAction(params: { tokenAddress: string, chain: string }): Promise<TokenPrice | { error: string }> {
    const { tokenAddress, chain } = params;

    let evmChain: EvmChain;
    switch(chain.toLowerCase()) {
        case 'eth':
        case 'ethereum':
            evmChain = EvmChain.ETHEREUM;
            break;
        case 'bsc':
        case 'binance':
            evmChain = EvmChain.BSC;
            break;
        case 'polygon':
            evmChain = EvmChain.POLYGON;
            break;
        case 'avalanche':
            evmChain = EvmChain.AVALANCHE;
            break;
        default:
            return { error: `Unsupported chain: ${chain}. Supported chains: ethereum, bsc, polygon, avalanche.`};
    }

    if (!tokenAddress) {
        return { error: 'Token address is required.' };
    }

    try {
        const result = await getTokenPriceFromMoralis(tokenAddress, evmChain);
        return result;
    } catch (error: any) {
        const errorMessage = `Failed to fetch token price from Moralis: ${error.message || "An unknown error occurred."}`;
        console.error(errorMessage, error);
        return { error: errorMessage };
    }
}
    

    