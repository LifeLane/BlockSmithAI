
'use server';
/**
 * @fileOverview A Genkit tool to fetch historical candlestick data using Binance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CANDLE_COUNT_TARGET = 100; // Number of candles we aim to fetch

// Define Zod schema for individual candlesticks
const CandlestickSchema = z.object({
  o: z.number().describe('Open price'),
  h: z.number().describe('High price'),
  l: z.number().describe('Low price'),
  c: z.number().describe('Close price'),
  v: z.number().describe('Volume'),
  t: z.number().describe('Timestamp (Unix MS)'),
  vw: z.number().optional().describe('Volume Weighted Average Price'),
  n: z.number().optional().describe('Number of transactions'),
});
type Candlestick = z.infer<typeof CandlestickSchema>;

const FetchHistoricalDataInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT, ETHUSDT).'),
  appInterval: z.string().describe('The chart interval string from the app (e.g., "1m", "5m", "1h", "1d").'),
});
export type FetchHistoricalDataInput = z.infer<typeof FetchHistoricalDataInputSchema>;

const FetchHistoricalDataOutputSchema = z.object({
  candles: z.array(CandlestickSchema).optional().describe('An array of candlestick data (OHLCV).'),
  error: z.string().optional().describe('An error message if fetching failed.'),
  message: z.string().optional().describe('A message providing context about the data, e.g., number of candles fetched.'),
});
export type FetchHistoricalDataOutput = z.infer<typeof FetchHistoricalDataOutputSchema>;

export const fetchHistoricalDataTool = ai.defineTool(
  {
    name: 'fetchHistoricalDataTool',
    description: 'Fetches recent historical candlestick (OHLCV) data for a given trading symbol and interval from Binance. This data can be used to identify recent chart patterns, support, and resistance.',
    inputSchema: FetchHistoricalDataInputSchema,
    outputSchema: FetchHistoricalDataOutputSchema,
  },
  async (input) => {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${input.symbol.toUpperCase()}&interval=${input.appInterval}&limit=${CANDLE_COUNT_TARGET}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: `Failed to fetch candlestick data for ${input.symbol} from Binance: ${response.statusText} - ${errorData.msg || 'Unknown API error'}` };
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            return { error: `Unexpected data format from Binance klines API for ${input.symbol}.` };
        }
        if (data.length === 0) {
            return { error: `No candlestick data returned from Binance for ${input.symbol} on ${input.appInterval} interval.`};
        }

        const candles: Candlestick[] = data.map((k: any[]) => ({
            t: k[0],
            o: parseFloat(k[1]),
            h: parseFloat(k[2]),
            l: parseFloat(k[3]),
            c: parseFloat(k[4]),
            v: parseFloat(k[5]),
        }));

        return { candles: candles, message: `Fetched ${candles.length} candles for ${input.symbol} on ${input.appInterval} interval from Binance.` };

    } catch (error: any) {
        console.error(`Error in fetchHistoricalDataTool for ${input.symbol}:`, error);
        return { error: `Network error or failed to parse candlestick data for ${input.symbol}: ${error.message}` };
    }
  }
);
