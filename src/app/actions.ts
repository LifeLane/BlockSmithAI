
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { shadowChat, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { getTokenPriceFromMoralis, type TokenPrice } from '@/services/moralis-service';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { neon, NeonQueryCapable } from "@neondatabase/serverless";

// Define types for the data we expect
export interface UserProfile {
  id: string;
  username: string;
  status?: string;
  shadowId?: string;
  weeklyPoints: number;
  airdropPoints: number;
  badges?: Badge[]; // Assuming we can fetch badges along or separately
}

export interface LeaderboardUser {
  id: string;
  username: string;
  weeklyPoints: number;
  airdropPoints: number;
  rank?: number; // Will be added on the frontend
  badge?: string; // Displaying one badge for simplicity in the table
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
    // Add other insight-specific fields
}

export interface SignalHistoryItem {
    id: string;
    userId: string;
    signalType: string; // e.g., 'buy', 'sell', 'hold'
    symbol: string;
    price: number;
    timestamp: Date;
    // Add other signal-specific fields
}

const sql: NeonQueryCapable = neon(process.env.DATABASE_URL!);

export async function fetchCurrentUserNeon(userId: string): Promise<UserProfile | null> {
  try {
    const users = await sql`
      SELECT id, username, status, "shadowId", "weeklyPoints", "airdropPoints"
      FROM users
      WHERE id = ${userId}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // Fetch badges for the user
    const userBadges = await sql`
      SELECT b.id, b.name
      FROM badges b
      JOIN "_UserBadges" ub ON b.id = ub."B"
      WHERE ub."A" = ${userId};
    `;
    // Attach badges to the user object
    user.badges = userBadges;

    return user as UserProfile;

  } catch (error) {
    console.error('Error fetching current user from Neon:', error);
    return null;
  }
}

export async function fetchLeaderboardDataNeon(): Promise<LeaderboardUser[]> {
  try {
    const leaderboard = await sql`
      SELECT id, username, "weeklyPoints", "airdropPoints"
      FROM users
      ORDER BY "weeklyPoints" DESC
      LIMIT 10;
    `;
    // For simplicity, we are not fetching badges for the entire leaderboard here.
    // If needed, you would perform a similar join or separate query for each user.
    return leaderboard as LeaderboardUser[];

  } catch (error) {
    console.error('Error fetching leaderboard data from Neon:', error);
    return [];
  }
}

export async function updateUserSettingsNeon(userId: string, data: { username?: string }): Promise<UserProfile | null> {
  try {
    if (data.username) {
       await sql`
        UPDATE users
        SET username = ${data.username}
        WHERE id = ${userId};
      `;
    }
    return fetchCurrentUserNeon(userId);

  } catch (error) {
    console.error('Error updating user settings in Neon:', error);
    return null;
  }
}

export async function handleAirdropSignupAction(formData: AirdropFormData): Promise<{ userId?: string; shadowId?: string; error?: string }> {
  try {
    const { wallet_address, wallet_type, email, phone, x_handle, telegram_handle, youtube_handle } = formData;

    if (!wallet_address) {
      return { error: "Wallet address is required for airdrop signup." };
    }

    // Check if user already exists with this wallet address
    const existingUsers = await sql`
      SELECT id, "shadowId" FROM users WHERE wallet_address = ${wallet_address} LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('Existing user found:', existingUser.id);
      return { userId: existingUser.id as string, shadowId: existingUser.shadowId as string };
    }

    // If user does not exist, create a new one
    // Generate a simple unique username and shadowId (you might want more sophisticated generation)
    const newUsername = `User_${Math.random().toString(36).substring(7)}`;
    const newShadowId = `SHDW-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const newUser = await sql`
      INSERT INTO users (username, "shadowId", wallet_address, wallet_type, email, phone, x_handle, telegram_handle, youtube_handle)
      VALUES (${newUsername}, ${newShadowId}, ${wallet_address}, ${wallet_type}, ${email}, ${phone}, ${x_handle}, ${telegram_handle}, ${youtube_handle})
      RETURNING id, "shadowId";
    `;

    console.log('New user created:', newUser[0].id);
    return { userId: newUser[0].id as string, shadowId: newUser[0].shadowId as string };

  } catch (error: any) {
    console.error('Error handling airdrop signup:', error);
    // Check for unique constraint violation on wallet_address or username
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
         if (error.message.includes('users_wallet_address_key')){
             return { error: "A user with this wallet address already exists." };
         }
          if (error.message.includes('users_username_key')){
             // This might happen with the random username generation, though less likely with a good generator
             return { error: "Could not generate a unique username. Please try again." };
         }
    }
    return { error: `Failed to process airdrop signup: ${error.message || "An unknown error occurred."}` };
  }
}

export async function fetchConsoleInsightsNeon(userId: string): Promise<ConsoleInsight[]> {
    try {
        const insights = await sql`
            SELECT id, "userId", content, timestamp
            FROM console_insights
            WHERE "userId" = ${userId}
            ORDER BY timestamp DESC;
        `;
        return insights as ConsoleInsight[];
    } catch (error) {
        console.error('Error fetching console insights:', error);
        return [];
    }
}

export async function fetchSignalHistoryNeon(userId: string): Promise<SignalHistoryItem[]> {
    try {
        const signals = await sql`
            SELECT id, "userId", "signalType", symbol, price, timestamp
            FROM signals
            WHERE "userId" = ${userId}
            ORDER BY timestamp DESC;
        `;
        return signals as SignalHistoryItem[];
    } catch (error) {
        console.error('Error fetching signal history:', error);
        return [];
    }
}

// Function to populate the database with sample data (DEVELOPMENT ONLY)
export async function populateSampleDataNeon() {
    console.log('Populating database with sample data...');
    try {
        // Clear existing data for a clean slate on each run
        await sql`DELETE FROM "_UserBadges"`;
        await sql`DELETE FROM console_insights`;
        await sql`DELETE FROM signals`;
        await sql`DELETE FROM users`;
        await sql`DELETE FROM badges`;

        // Insert sample users
        const user1Id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Sample UUID
        const user2Id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'; // Sample UUID
        const user3Id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'; // Sample UUID

        await sql`
            INSERT INTO users (id, username, status, "shadowId", "weeklyPoints", "airdropPoints", wallet_address, wallet_type)
            VALUES
            (${user1Id}, 'CryptoGuru', 'Active Analyst', 'SHDW-ABC-111', 1500, 10000, '0x1234567890abcdef1234567890abcdef12345678', 'ETH'),
            (${user2Id}, 'TokenMaster', 'Passive Investor', 'SHDW-DEF-222', 800, 5000, 'Sol1234567890abcdef1234567890abcdef12345678', 'SOL'),
            (${user3Id}, 'NFT_Ninja', 'Exploring', 'SHDW-GHI-333', 300, 2000, 'TON1234567890abcdef1234567890abcdef12345678', 'TON');
        `;

        // Insert sample badges
        const badge1Id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11'; // Sample UUID
        const badge2Id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12'; // Sample UUID
        const badge3Id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'; // Sample UUID

        await sql`
            INSERT INTO badges (id, name)
            VALUES
            (${badge1Id}, 'Early Adopter'),
            (${badge2Id}, 'Signal Provider Lv1'),
            (${badge3Id}, 'Insightful Analyst');
        `;

        // Link users and badges in the join table (_UserBadges) - replace with your actual join table name if different
         await sql`
             INSERT INTO "_UserBadges" ("A", "B")
             VALUES
             (${user1Id}, ${badge1Id}),
             (${user1Id}, ${badge2Id}),
             (${user2Id}, ${badge1Id}),
             (${user3Id}, ${badge3Id});
         `;

        // Insert sample console insights
        await sql`
            INSERT INTO console_insights ("userId", content, timestamp)
            VALUES
            (${user1Id}, 'Market showing bullish signs for BTC.', NOW()),
            (${user1Id}, 'Noticed increased volume on ETH.', NOW() - INTERVAL '1 hour'),
            (${user2Id}, 'SOL seems to be consolidating.', NOW() - INTERVAL '2 hours');
        `;

        // Insert sample signal history
        await sql`
            INSERT INTO signals ("userId", "signalType", symbol, price, timestamp)
            VALUES
            (${user1Id}, 'buy', 'BTCUSDT', 107000, NOW()),
            (${user1Id}, 'sell', 'ETHUSDT', 2400, NOW() - INTERVAL '30 minutes'),
            (${user2Id}, 'hold', 'SOLUSDT', 150, NOW() - INTERVAL '1 hour 30 minutes');
        `;

        console.log('Sample data populated successfully.');
    } catch (error) {
        console.error('Error populating sample data:', error);
        throw error; // Re-throw the error so the frontend can catch it
    }
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
    
