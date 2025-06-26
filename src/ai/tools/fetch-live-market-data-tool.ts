
'use server';
/**
 * @fileOverview A Genkit tool to fetch live market data for a symbol.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchMarketDataAction, type LiveMarketData } from '@/app/actions';

const FetchMarketDataInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
});

const LiveMarketDataSchema = z.object({
  symbol: z.string(),
  lastPrice: z.string(),
  priceChangePercent: z.string(),
  volume: z.string(),
  highPrice: z.string(),
  lowPrice: z.string(),
  quoteVolume: z.string(),
});

const FetchMarketDataOutputSchema = z.object({
  marketData: LiveMarketDataSchema.optional(),
  error: z.string().optional(),
});

export const fetchLiveMarketDataTool = ai.defineTool(
  {
    name: 'fetchLiveMarketData',
    description: 'Fetches real-time 24hr ticker statistics for a given trading symbol from Binance. Useful for getting the current price, volume, and daily change.',
    inputSchema: FetchMarketDataInputSchema,
    outputSchema: FetchMarketDataOutputSchema,
  },
  async (input) => {
    const result = await fetchMarketDataAction({ symbol: input.symbol });
    if ('error' in result) {
      return { error: result.error };
    }
    return { marketData: result };
  }
);
