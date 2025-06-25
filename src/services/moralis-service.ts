'use server';
/**
 * @fileOverview Service for interacting with the Moralis API.
 */

import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

interface MoralisError {
  name: string;
  message: string;
}

export interface TokenPrice {
  usdPrice: number;
  usdPriceFormatted: string;
  exchangeName: string;
  exchangeAddress: string;
}

// Helper to start Moralis SDK
async function startMoralis() {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey || apiKey === "YOUR_MORALIS_API_KEY_REPLACE_ME") {
    throw new Error('Moralis API key is not configured on the server.');
  }
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey });
  }
}

/**
 * Fetches the price of an ERC20 token from a DEX using Moralis.
 * @param tokenAddress The contract address of the ERC20 token.
 * @param chain The EVM chain to query.
 * @returns The token price information or an error object.
 */
export async function getTokenPriceFromMoralis(
  tokenAddress: string,
  chain: EvmChain
): Promise<TokenPrice | { error: string }> {
  try {
    await startMoralis();

    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: tokenAddress,
      chain: chain,
    });

    const result = response.toJSON();
    
    if (!result.usdPrice) {
        return { error: `Could not fetch USD price for token ${tokenAddress} on chain ${chain.name}.` };
    }

    return {
        usdPrice: result.usdPrice,
        usdPriceFormatted: result.usdPriceFormatted,
        exchangeName: result.exchangeName || 'Unknown Exchange',
        exchangeAddress: result.exchangeAddress || 'N/A',
    };

  } catch (error) {
    console.error("Moralis API Error fetching token price:", error);
    const moralisError = error as MoralisError;
    return { error: `Moralis API Error: ${moralisError.message || 'An unknown error occurred.'}` };
  }
}
