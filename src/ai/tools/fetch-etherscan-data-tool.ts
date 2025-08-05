
'use server';
/**
 * @fileOverview A Genkit tool to interact with the Etherscan API.
 */

import { googleAI } from '@/ai/genkit';
import { z } from 'genkit';
import { getEtherscanGasOracle } from '@/services/market-intelligence-service';

const EtherscanGasOracleInputSchema = z.object({});

const EtherscanGasOracleOutputSchema = z.object({
  success: z.boolean(),
  data: z.any().optional().describe('The JSON response from the Etherscan API.'),
  error: z.string().optional().describe('An error message if the API call failed.'),
  message: z.string().optional().describe('A summary of the operation.'),
});

export const fetchEtherscanDataTool = googleAI.defineTool(
  {
    name: 'fetchEtherscanDataTool',
    description: 'Fetches the current recommended gas prices from Etherscan. Useful for understanding current Ethereum network congestion and transaction costs.',
    inputSchema: EtherscanGasOracleInputSchema,
    outputSchema: EtherscanGasOracleOutputSchema,
  },
  async () => {
    const result = await getEtherscanGasOracle();
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    const summary = `Successfully fetched gas oracle data from Etherscan. Recommended safe gas price: ${result.data.SafeGasPrice} Gwei.`;
    
    return {
      success: true,
      data: result.data,
      message: summary,
    };
  }
);
