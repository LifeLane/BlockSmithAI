
'use server';
/**
 * @fileOverview Service for interacting with various market intelligence APIs.
 * This centralizes data fetching from sources like CoinMarketCap, CoinGecko, and Etherscan.
 */

// --- CoinMarketCap ---
interface CmcParams {
  symbol: string;
}

export async function getCoinMarketCapData(params: CmcParams): Promise<{ data: any } | { error: string }> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_")) {
    return { error: 'CoinMarketCap API key is not configured.' };
  }

  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${params.symbol.toUpperCase()}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'X-CMC_PRO_API_KEY': apiKey, 'Accept': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { error: `CoinMarketCap API Error: ${errorData.status.error_message}` };
    }
    const data = await response.json();
    return { data: data.data };
  } catch (error: any) {
    return { error: `Network error fetching from CoinMarketCap: ${error.message}` };
  }
}

// --- CoinGecko ---
interface CgParams {
  assetId: string; // e.g., "bitcoin", "ethereum"
}

export async function getCoinGeckoData(params: CgParams): Promise<{ data: any } | { error: string }> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey && !apiKey.includes("YOUR_") ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';
  const headers: HeadersInit = apiKey && !apiKey.includes("YOUR_") ? { 'x-cg-pro-api-key': apiKey } : {};

  const url = `${baseUrl}/coins/${params.assetId}?localization=false&tickers=false&market_data=false&sparkline=false`;
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorData = await response.json();
      return { error: `CoinGecko API Error: ${errorData.error || response.statusText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error: any) {
    return { error: `Network error fetching from CoinGecko: ${error.message}` };
  }
}

// --- Etherscan ---
export async function getEtherscanGasOracle(): Promise<{ data: any } | { error: string }> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_")) {
    return { error: 'Etherscan API key is not configured.' };
  }

  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { error: 'Failed to fetch gas oracle data from Etherscan.' };
    }
    const data = await response.json();
    if (data.status !== "1") {
        return { error: `Etherscan API Error: ${data.message} - ${data.result}` };
    }
    return { data: data.result };
  } catch (error: any) {
    return { error: `Network error fetching from Etherscan: ${error.message}` };
  }
}
