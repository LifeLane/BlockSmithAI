
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer, type SarcasticDisclaimerInput } from '@/ai/flows/generate-sarcastic-disclaimer';
import { blocksmithChat, type BlocksmithChatInput, type BlocksmithChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';

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

// Exporting ChatMessage type for use in ChatbotPopup
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
      .slice(0, 15) // Get top 15 for the ticker
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
      return { error: `Failed to fetch market data from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data = await response.json();
    
    if (!data.symbol || !data.lastPrice || !data.priceChangePercent || !data.volume || !data.highPrice || !data.lowPrice || !data.quoteVolume) {
        return { error: "Received incomplete data from Binance API."}
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
    return { error: "An unexpected error occurred while fetching market data." };
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

    const disclaimerInput: SarcasticDisclaimerInput = { riskLevel: input.riskLevel };
    const disclaimerResult = await generateSarcasticDisclaimer(disclaimerInput);

    const finalResult: GenerateTradingStrategyOutput = {
      ...coreStrategyResult,
      disclaimer: disclaimerResult.disclaimer,
    };
    
    return finalResult;

  } catch (error: any) {
    let errorMessage = "Failed to generate trading strategy. Please check server logs or try again.";
    
    if (error.message) {
        if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
            const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
            errorMessage = `The AI model (Gemini) reported an issue: ${statusCode}. This is likely a temporary problem on Google's side. Please try again in a few moments. If the problem persists, the model might be having trouble with the request complexity or current load.`;
        } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
            errorMessage = "The AI model (Gemini) was unable to generate a response due to safety filters. This might be due to the nature of the request or specific terms used. Try rephrasing or simplifying your request."
        }
         else {
            errorMessage = `Strategy generation failed: ${error.message}`;
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
    return { error: errorMessage };
  }
}


export async function blocksmithChatAction(input: BlocksmithChatInput): Promise<BlocksmithChatOutput | { error: string }> {
  try {
    if (!input.currentUserInput || input.currentUserInput.trim() === "") {
      return { error: "Come on, at least type something. I'm not a mind reader... yet." };
    }
    const result = await blocksmithChat(input);
    return result;
  } catch (error: any) {
    let errorMessage = "BSAI is currently contemplating the mysteries of the universe (or just erroring out).";
     if (error.message) {
        if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
            const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
            errorMessage = `BSAI's connection to the digital ether (Gemini) has a glitch: ${statusCode}. Probably temporary. Try prodding it again.`;
        } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
            errorMessage = "BSAI tried to say something so profound (or so naughty) that the safety filters zapped it. Try a different angle."
        } else {
            errorMessage = `BSAI's thought process hit a snag: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}

export async function generateDailyGreetingAction(): Promise<GenerateDailyGreetingOutput | { error: string }> {
  try {
    const result = await generateDailyGreeting();
    return result;
  } catch (error: any) {
    let errorMessage = "BlockSmithAI is having a moment of digital stage fright. No greeting today!";
    if (error.message) {
      if ((error.message.includes("[500]") || error.message.includes("[503]")) && error.message.includes("GoogleGenerativeAI")) {
        const statusCode = error.message.includes("[500]") ? "500 Internal Server Error" : "503 Service Unavailable";
        errorMessage = `BSAI's muse (Gemini) is on a coffee break: ${statusCode}. Try again later.`;
      } else if (error.message.includes("Text not available. Response was blocked") || error.message.includes("SAFETY")) {
        errorMessage = "BSAI tried to greet you so profoundly its words got caught in the safety net. Standard greeting it is!";
      } else {
        errorMessage = `Daily greeting malfunction: ${error.message}`;
      }
    }
    console.error("Error in generateDailyGreetingAction:", errorMessage, error);
    return { error: errorMessage, greeting: "Welcome, Analyst! Let's decode the markets." }; // Provide a fallback greeting
  }
}
