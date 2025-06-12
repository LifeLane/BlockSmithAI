
"use server";
import { generateTradingStrategy as genCoreStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { generateSarcasticDisclaimer, type SarcasticDisclaimerInput } from '@/ai/flows/generate-sarcastic-disclaimer';

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

export async function fetchAllTradingSymbolsAction(): Promise<FormattedSymbol[] | FetchDataError> {
  const apiKey = process.env.BINANCE_API_KEY;
  // console.log('fetchAllTradingSymbolsAction: Attempting to read BINANCE_API_KEY. Loaded:', apiKey ? 'Exists' : 'Missing or Placeholder');

  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    // console.error('fetchAllTradingSymbolsAction: Binance API Key check failed. Loaded apiKey was:', apiKey);
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
      // console.error(`fetchAllTradingSymbolsAction: Binance API error: ${response.status} - ${response.statusText}`, errorData);
      return { error: `Failed to fetch symbol list from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data: any[] = await response.json();
    
    const usdtPairs = data
      .filter(ticker => ticker.symbol.endsWith('USDT') && parseFloat(ticker.quoteVolume) > 0 && !ticker.symbol.includes('_'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)) // Sort by quoteVolume (USDT volume)
      .slice(0, 150) // Take top 150 to provide a good selection
      .map(ticker => ({
        value: ticker.symbol,
        label: `${ticker.symbol.replace('USDT', '')}/USDT`,
      }));

    if (usdtPairs.length === 0) {
        // console.warn("fetchAllTradingSymbolsAction: No USDT pairs found or filtered out.");
        return { error: "No active USDT trading pairs found from Binance." };
    }
    
    return usdtPairs;

  } catch (error) {
    // console.error("fetchAllTradingSymbolsAction: Error fetching all symbols from Binance:", error);
    return { error: "An unexpected error occurred while fetching the list of trading symbols." };
  }
}


export async function fetchMarketDataAction(params: { symbol: string }): Promise<LiveMarketData | FetchDataError> {
  const { symbol } = params;
  const apiKey = process.env.BINANCE_API_KEY;
  // console.log(`fetchMarketDataAction for ${symbol}: Attempting to read BINANCE_API_KEY. Loaded:`, apiKey ? 'Exists' : 'Missing or Placeholder');


  if (!apiKey || apiKey === "YOUR_BINANCE_API_KEY_REPLACE_ME") {
    // console.error(`fetchMarketDataAction for ${symbol}: Binance API Key check failed. Loaded apiKey was:`, apiKey);
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
      // console.error(`fetchMarketDataAction for ${symbol}: Binance API error: ${response.status} - ${response.statusText}`, errorData);
      return { error: `Failed to fetch market data from Binance: ${response.statusText} - ${errorData.msg || 'Unknown error'}`, status: response.status };
    }

    const data = await response.json();
    
    if (!data.symbol || !data.lastPrice || !data.priceChangePercent || !data.volume || !data.highPrice || !data.lowPrice || !data.quoteVolume) {
        // console.error(`fetchMarketDataAction for ${symbol}: Received incomplete data from Binance API:`, data);
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
    // console.error(`fetchMarketDataAction for ${symbol}: Error fetching market data from Binance:`, error);
    return { error: "An unexpected error occurred while fetching market data." };
  }
}

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
  try {
    if (typeof input.marketData !== 'string') {
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }
    
    if (input.marketData === '{}' || !input.marketData) {
        // console.error("Market data is missing or invalid for generateTradingStrategyAction. marketData:", input.marketData);
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
    // console.error("Error in generateTradingStrategyAction:", error);
    let errorMessage = "Failed to generate trading strategy. Please check server logs or try again.";
    
    // Check for GoogleGenerativeAI specific errors (like 500 or 503)
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
        //  console.error("Error details:", error.details);
         errorMessage += ` Details: ${typeof error.details === 'object' ? JSON.stringify(error.details) : error.details}`;
    } else if (error.cause && typeof error.cause === 'object') {
        // console.error("Error cause:", error.cause);
        const causeDetails = JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause));
        errorMessage += ` Cause: ${causeDetails}`;
    }  else if (error.cause && typeof error.cause !== 'object') {
        errorMessage += ` Cause: ${error.cause}`;
    }
    
    if (typeof error === 'object' && error !== null && !error.message && !error.details && !error.cause) {
        // console.error("Full error object (unhandled structure):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        errorMessage += ` Additional info: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
    }
    return { error: errorMessage };
  }
}
