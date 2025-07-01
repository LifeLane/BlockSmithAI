"use server";

import type { LiveMarketData, FormattedSymbol, TickerSymbolData } from "@/app/actions";

export async function fetchMarketDataAction({ symbol }: { symbol: string }): Promise<LiveMarketData | { error: string }> {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch market data for ${symbol} from Binance: ${response.statusText} - ${errorData.msg || 'Unknown API error'}` };
    }
    const data = await response.json();
    return {
      symbol: data.symbol,
      lastPrice: data.lastPrice,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume,
      highPrice: data.highPrice,
      lowPrice: data.lowPrice,
      quoteVolume: data.quoteVolume,
    };
  } catch (error: any) {
    console.error(`Error in fetchMarketDataAction for ${symbol}:`, error);
    return { error: `Network error or failed to parse market data for ${symbol}: ${error.message}` };
  }
}

export async function fetchAllTradingSymbolsAction(): Promise<FormattedSymbol[] | { error: string }> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Failed to fetch symbols from Binance: ${response.statusText} - ${errorData.message || 'Unknown API error'}` };
    }
    const data: any[] = await response.json();
    const topSymbols = data.filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('_')).sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)).slice(0, 50);
    return topSymbols.map(s => ({ value: s.symbol, label: `${s.symbol.replace('USDT', '')}/USDT` }));
  } catch (error: any) {
    return { error: `Network error or failed to parse symbols: ${error.message}` };
  }
}

export async function fetchTopSymbolsForTickerAction(): Promise<TickerSymbolData[] | { error: string }> {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) return { error: 'Failed to fetch symbols from Binance.' };
        const data: LiveMarketData[] = await response.json();
        const usdtPairs = data.filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('_'));
        const sortedByVolume = usdtPairs.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        return sortedByVolume.slice(0, 15).map(d => ({ symbol: d.symbol, lastPrice: d.lastPrice, priceChangePercent: d.priceChangePercent, }));
    } catch (error: any) {
        return { error: `Network error while fetching symbols: ${error.message}` };
    }
}
