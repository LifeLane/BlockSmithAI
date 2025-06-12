
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

export async function fetchMarketDataAction(params: { symbol: string; apiKey: string }): Promise<LiveMarketData | FetchMarketDataError> {
  const { symbol, apiKey } = params; // Corrected this line
  
  if (!apiKey) {
    return { error: "API Key is required." };
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
    
    // Validate that necessary fields are present
    if (!data.symbol || !data.lastPrice || !data.priceChangePercent || !data.volume || !data.highPrice || !data.lowPrice || !data.quoteVolume) {
        return { error: "Received incomplete data from Binance API."}
    }

    return {
      symbol: data.symbol,
      lastPrice: data.lastPrice,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume, // This is base asset volume
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
    // Ensure marketData is a string as expected by the AI flow
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }
    if (input.marketData === '{}' && !input.symbol) { // Prevent calling AI with no data
        return {error: "Market data or symbol is missing for strategy generation."}
    }
    const result = await genStrategy(input);
    return result;
  } catch (error) {
    console.error("Error generating trading strategy:", error);
    return { error: "Failed to generate trading strategy. Please try again." };
  }
}

