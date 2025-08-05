
'use server';
/**
 * @fileOverview A Genkit tool to fetch market and sentiment data from CoinGecko.
 */

import { googleAI } from '@/ai/genkit';
import { z } from 'genkit';
import { getCoinGeckoData } from '@/services/market-intelligence-service';

const CoinGeckoInputSchema = z.object({
  assetId: z.string().describe('The CoinGecko asset ID (e.g., "bitcoin", "ethereum"). This is NOT the symbol (e.g., BTC).'),
});

const CoinGeckoOutputSchema = z.object({
  success: z.boolean(),
  data: z.any().optional().describe('The JSON response from the CoinGecko API.'),
  error: z.string().optional().describe('An error message if the API call failed.'),
  message: z.string().optional().describe('A summary of the operation.'),
});

export const fetchCoinGeckoDataTool = googleAI.defineTool(
  {
    name: 'fetchCoinGeckoDataTool',
    description: 'Fetches comprehensive market and sentiment data for a given cryptocurrency asset ID from CoinGecko. Provides public interest scores, developer data, community data, and market data. Use this for fundamental analysis.',
    inputSchema: CoinGeckoInputSchema,
    outputSchema: CoinGeckoOutputSchema,
  },
  async ({ assetId }) => {
    const result = await getCoinGeckoData({ assetId });

    if (result.error) {
      return { success: false, error: result.error };
    }

    const summary = `Successfully fetched CoinGecko data for ${assetId}. Public interest score: ${result.data?.public_interest_score}, Liquidity score: ${result.data?.liquidity_score}.`;
    
    // We only return a subset of the data to avoid overwhelming the prompt.
    const filteredData = {
        name: result.data.name,
        symbol: result.data.symbol,
        hashing_algorithm: result.data.hashing_algorithm,
        market_cap_rank: result.data.market_cap_rank,
        coingecko_rank: result.data.coingecko_rank,
        coingecko_score: result.data.coingecko_score,
        developer_score: result.data.developer_score,
        community_score: result.data.community_score,
        liquidity_score: result.data.liquidity_score,
        public_interest_score: result.data.public_interest_score,
        sentiment_votes_up_percentage: result.data.sentiment_votes_up_percentage,
        sentiment_votes_down_percentage: result.data.sentiment_votes_down_percentage,
    };

    return {
      success: true,
      data: filteredData,
      message: summary,
    };
  }
);
