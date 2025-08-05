
'use server';
/**
 * @fileOverview A Genkit tool to fetch cryptocurrency data from CoinMarketCap.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCoinMarketCapData } from '@/services/market-intelligence-service';

const CoinMarketCapInputSchema = z.object({
  symbol: z.string().describe('The cryptocurrency symbol (e.g., "BTC", "ETH").'),
});

const CoinMarketCapOutputSchema = z.object({
    success: z.boolean(),
    data: z.any().optional().describe('The JSON response from the CoinMarketCap API.'),
    error: z.string().optional().describe('An error message if the API call failed.'),
    message: z.string().optional().describe('A summary of the operation.'),
});

export const fetchCoinMarketCapDataTool = ai.defineTool(
  {
    name: 'fetchCoinMarketCapDataTool',
    description: 'Fetches the latest market data for a given cryptocurrency symbol from CoinMarketCap. Provides information like market cap, rank, and volume.',
    inputSchema: CoinMarketCapInputSchema,
    outputSchema: CoinMarketCapOutputSchema,
  },
  async ({ symbol }) => {
    const result = await getCoinMarketCapData({ symbol });
    
    if (result.error) {
        return { success: false, error: result.error };
    }

    const dataForSymbol = result.data[symbol.toUpperCase()];
    const summary = `Successfully fetched CoinMarketCap data for ${symbol}. Current Rank: ${dataForSymbol?.cmc_rank}, Market Cap: $${dataForSymbol?.quote?.USD?.market_cap?.toLocaleString()}.`;

    return {
      success: true,
      data: dataForSymbol,
      message: summary,
    };
  }
);
