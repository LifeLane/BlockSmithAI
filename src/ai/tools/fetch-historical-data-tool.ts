
/**
 * @fileOverview A Genkit tool to fetch historical candlestick data using Polygon.io.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchCandlestickData, type Candlestick } from '@/services/polygon-service';
import { format, subDays, subHours, subMinutes } from 'date-fns';

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

const FetchHistoricalDataInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT, ETHUSDT).'),
  // App's interval format: "1m", "15m", "1h", "4h", "1d". We'll parse this.
  appInterval: z.string().describe('The chart interval string from the app (e.g., "1m", "5m", "1h", "1d").'),
});
export type FetchHistoricalDataInput = z.infer<typeof FetchHistoricalDataInputSchema>;

const FetchHistoricalDataOutputSchema = z.object({
  candles: z.array(CandlestickSchema).optional().describe('An array of candlestick data (OHLCV).'),
  error: z.string().optional().describe('An error message if fetching failed.'),
  message: z.string().optional().describe('A message providing context about the data, e.g., number of candles fetched.'),
});
export type FetchHistoricalDataOutput = z.infer<typeof FetchHistoricalDataOutputSchema>;


function mapAppIntervalToPolygonParams(appInterval: string): {
    multiplier: number;
    timespan: 'minute' | 'hour' | 'day';
    error?: string;
  } {
  const match = appInterval.match(/^(\d+)([mhd])$/); // m for minute, h for hour, d for day
  if (!match) {
    return { multiplier: 0, timespan: 'minute', error: `Invalid appInterval format: ${appInterval}. Expected format like '1m', '15m', '1h', '1d'.` };
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'm') {
    if (value < 1 ) return {multiplier: 0, timespan: 'minute', error: "Minute interval must be 1 or greater."};
    return { multiplier: value, timespan: 'minute' };
  } else if (unit === 'h') {
     if (value < 1 ) return {multiplier: 0, timespan: 'hour', error: "Hour interval must be 1 or greater."};
    return { multiplier: value, timespan: 'hour' };
  } else if (unit === 'd') {
     if (value < 1 ) return {multiplier: 0, timespan: 'day', error: "Day interval must be 1 or greater."};
    return { multiplier: value, timespan: 'day' };
  }
  return { multiplier: 0, timespan: 'minute', error: `Unsupported unit in appInterval: ${unit}` };
}

function calculateDateRange(
    appInterval: string,
    candleCount: number
  ): { from: string; to: string; error?: string } {
  const toDate = new Date();
  let fromDate: Date;

  const { multiplier, timespan, error: intervalError } = mapAppIntervalToPolygonParams(appInterval);
  if (intervalError) return { from: '', to: '', error: intervalError};

  if (timespan === 'minute') {
    fromDate = subMinutes(toDate, multiplier * candleCount);
  } else if (timespan === 'hour') {
    fromDate = subHours(toDate, multiplier * candleCount);
  } else if (timespan === 'day') {
    fromDate = subDays(toDate, multiplier * candleCount);
  } else {
    return { from: '', to: '', error: `Unhandled timespan: ${timespan}` };
  }
   // Polygon free tier often has a delay, so fetching up to "yesterday" might be more reliable for some tickers
   // For crypto, "today" is usually fine.
  return {
    from: format(fromDate, 'yyyy-MM-dd'),
    to: format(toDate, 'yyyy-MM-dd'),
  };
}


export const fetchHistoricalDataTool = ai.defineTool(
  {
    name: 'fetchHistoricalDataTool',
    description: 'Fetches recent historical candlestick (OHLCV) data for a given trading symbol and interval. This data can be used to identify recent chart patterns, support, and resistance.',
    inputSchema: FetchHistoricalDataInputSchema,
    outputSchema: FetchHistoricalDataOutputSchema,
  },
  async (input) => {
    const { multiplier, timespan, error: intervalMappingError } = mapAppIntervalToPolygonParams(input.appInterval);
    if (intervalMappingError) {
      return { error: intervalMappingError };
    }

    const { from, to, error: dateRangeError } = calculateDateRange(input.appInterval, CANDLE_COUNT_TARGET);
    if (dateRangeError) {
      return { error: dateRangeError };
    }

    const result = await fetchCandlestickData({
      symbol: input.symbol,
      multiplier,
      timespan,
      from,
      to,
      limit: CANDLE_COUNT_TARGET + 10, // Fetch a bit more to ensure we get enough after any gaps
    });

    if ('error' in result) {
      return { error: result.error };
    }
    if (!result || result.length === 0) {
        return { error: `No candlestick data returned from Polygon for ${input.symbol} on ${input.appInterval} interval from ${from} to ${to}.`};
    }

    return { candles: result, message: `Fetched ${result.length} candles for ${input.symbol} on ${input.appInterval} interval from ${from} to ${to}.` };
  }
);

    