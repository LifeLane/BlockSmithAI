
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer'; // SarcasticDisclaimerInput type no longer needed here
import { shadowChat, type ShadowChatInput, type ShadowChatOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/blocksmith-chat-flow';
import { generateDailyGreeting, type GenerateDailyGreetingOutput } from '@/ai/flows/generate-daily-greeting';
import { getTokenPriceFromMoralis, type TokenPrice } from '@/services/moralis-service';
import { EvmChain } from '@moralisweb3/common-evm-utils';

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

// generateTradingStrategyAction input type updated to match simplified AI flow input
export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
  try {
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }

    if (input.marketData === '{}' || !input.marketData) {
        return {error: "Market data is missing or invalid. Cannot generate strategy."}
    }

    const coreStrategyResult = await genCoreStrategy(input); // input is already of the correct simplified type

    // Sarcastic disclaimer no longer needs riskLevel
    const disclaimerResult = await generateSarcasticDisclaimer({}); // Pass empty object

    const finalResult: GenerateTradingStrategyOutput = {
      ...coreStrategyResult,
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
    
