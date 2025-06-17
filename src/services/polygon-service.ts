
'use server';
/**
 * @fileOverview Service for interacting with the Polygon.io API.
 */

import { format } from 'date-fns';

const POLYGON_BASE_URL = 'https://api.polygon.io';

export interface Candlestick {
  o: number; // Open
  h: number; // High
  l: number; // Low
  c: number; // Close
  v: number; // Volume
  t: number; // Timestamp (Unix MS)
  vw?: number; // Volume Weighted Average Price
  n?: number; // Number of transactions
}

interface PolygonError {
  status?: string;
  request_id?: string;
  message?: string;
}

interface FetchCandlestickDataParams {
  symbol: string;
  multiplier: number;
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  limit?: number;
}

/**
 * Fetches candlestick (aggregate) data from Polygon.io.
 */
export async function fetchCandlestickData(
  params: FetchCandlestickDataParams
): Promise<Candlestick[] | { error: string }> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey || apiKey === "YOUR_POLYGON_API_KEY_REPLACE_ME" || apiKey === "Oy3AY6oE7Iu6xMw7jJKYnPllvondCPmN_INVALID") { // Added check for invalid placeholder
    console.error('Polygon API key is not configured or is invalid on the server.');
    return { error: 'Polygon API key is not configured or is invalid on the server. Historical data cannot be fetched.' };
  }

  // Transform symbol for Polygon (e.g., BTCUSDT -> X:BTCUSD)
  let polygonTicker = params.symbol.toUpperCase();
  if (polygonTicker.endsWith('USDT')) {
    polygonTicker = `X:${polygonTicker.replace('USDT', 'USD')}`;
  } else if (polygonTicker.endsWith('USD')) { // Handle symbols that might already be just ...USD
    polygonTicker = `X:${polygonTicker}`;
  }
  // Add more transformations if other asset classes are needed, e.g., for stocks or forex
  // For example, for a stock like AAPL: polygonTicker = 'AAPL'; (no prefix needed for US equities)
  // For forex like EUR/USD: polygonTicker = 'C:EURUSD';

  const queryParams = new URLSearchParams({
    adjusted: 'true',
    sort: 'asc', // Get data in ascending order of time
    limit: (params.limit || 500).toString(), // Max 5000 for free tier, 500 is usually enough for recent patterns
    apiKey: apiKey,
  });

  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${polygonTicker}/range/${params.multiplier}/${params.timespan}/${params.from}/${params.to}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData: PolygonError = await response.json().catch(() => ({}));
      console.error(`Polygon API Error (${response.status}) for ${polygonTicker} using URL ${url}:`, errorData);
      return {
        error: `Failed to fetch data from Polygon for ${params.symbol} (as ${polygonTicker}): ${response.statusText} - ${errorData.message || 'Unknown Polygon API error'} (Status: ${errorData.status || response.status})`,
      };
    }

    const data = await response.json();

    if (data.resultsCount === 0 || !data.results) {
       console.warn(`No candlestick data found for ${params.symbol} (as ${polygonTicker}) in range ${params.from}-${params.to} on Polygon. URL: ${url}`);
      return { error: `No candlestick data found for ${params.symbol} (as ${polygonTicker}) in the specified range on Polygon.` };
    }

    return data.results as Candlestick[];
  } catch (error) {
    console.error(`Network or parsing error fetching data from Polygon for ${params.symbol} (as ${polygonTicker}). URL: ${url}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { error: `Error connecting to Polygon API for ${params.symbol}: ${errorMessage}` };
  }
}
