
// @ts-nocheck
// remove-ts-nocheck-next-line
"use server";
import { generateTradingStrategy as genStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';

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
  console.log('Attempting to read BINANCE_API_KEY from .env. Value currently loaded by server:', process.env.BINANCE_API_KEY);
  const apiKey = process.env.BINANCE_API_KEY;

  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    console.error('Binance API Key check failed. Loaded apiKey was:', apiKey);
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

    const result = await genStrategy(input);
    return result;
  } catch (error) {
    console.error("Error generating trading strategy:", error);
    // Consider making this error more specific if possible, or logging more details
    return { error: "Failed to generate trading strategy. Please check server logs or try again." };
  }
}
