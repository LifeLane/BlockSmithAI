
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer, type SarcasticDisclaimerInput } from '@/ai/flows/generate-sarcastic-disclaimer';

export interface LiveMarketData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string; // Raw from API, e.g., "-0.34"
  volume: string; // Base asset volume
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

interface FetchMarketDataError {
  error: string;
  status?: number;
}

export async function fetchMarketDataAction(params: { symbol: string }): Promise<LiveMarketData | FetchMarketDataError> {
  const { symbol } = params;
  // console.log('Attempting to read BINANCE_API_KEY from .env. Value currently loaded by server:', process.env.BINANCE_API_KEY);
  const apiKey = process.env.BINANCE_API_KEY;

  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    // console.error('Binance API Key check failed. Loaded apiKey was:', apiKey);
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
      console.error(`Binance API error: ${response.status} - ${response.statusText}`, errorData);
      return { error: `Failed to fetch market data from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data = await response.json();
    
    if (!data.symbol || !data.lastPrice || !data.priceChangePercent || !data.volume || !data.highPrice || !data.lowPrice || !data.quoteVolume) {
        console.error("Received incomplete data from Binance API:", data);
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
    console.error("Error fetching market data from Binance:", error);
    return { error: "An unexpected error occurred while fetching market data." };
  }
}

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
  try {
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }
    
    if (input.marketData === '{}' || !input.marketData) {
        console.error("Market data is missing or invalid for generateTradingStrategyAction. marketData:", input.marketData);
        return {error: "Market data is missing or invalid. Cannot generate strategy."}
    }

    // Generate the core strategy (without disclaimer)
    const coreStrategyResult = await genCoreStrategy(input);

    // Generate the sarcastic disclaimer
    const disclaimerInput: SarcasticDisclaimerInput = { riskLevel: input.riskLevel };
    const disclaimerResult = await generateSarcasticDisclaimer(disclaimerInput);

    // Combine the core strategy with the disclaimer
    const finalResult: GenerateTradingStrategyOutput = {
      ...coreStrategyResult,
      disclaimer: disclaimerResult.disclaimer,
    };
    
    return finalResult;

  } catch (error: any) {
    console.error("Error in generateTradingStrategyAction:", error);
    let errorMessage = "Failed to generate trading strategy. Please check server logs or try again.";
    
    if (error.message) {
      if (error.message.includes("[500]") && error.message.includes("GoogleGenerativeAI")) {
        errorMessage = "The AI model (Gemini) reported an internal server error (500). This is likely a temporary issue on Google's side. Please try again in a few moments. If the problem persists, the model might be having trouble with the request complexity or current load.";
      } else {
        errorMessage = `Strategy generation failed: ${error.message}`;
      }
    }
    
    if (error.details) {
         console.error("Error details:", error.details);
         errorMessage += ` Details: ${typeof error.details === 'object' ? JSON.stringify(error.details) : error.details}`;
    } else if (error.cause) {
        console.error("Error cause:", error.cause);
        const causeDetails = typeof error.cause === 'object' ? JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause)) : error.cause;
        errorMessage += ` Cause: ${causeDetails}`;
    }
    
    if (typeof error === 'object' && error !== null && !error.details && !error.cause) {
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    return { error: errorMessage };
  }
}
