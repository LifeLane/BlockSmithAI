
'use server';

/**
 * @fileOverview A trading strategy generator AI agent - SHADOW Protocol.
 * This flow generates core trading parameters and SHADOW's thoughts based on multi-timeframe analysis.
 * - generateTradingStrategy - Handles the generation of trading strategies.
 * - GenerateTradingStrategyInput - Input type.
 * - GenerateTradingStrategyOutput - Return type (includes core params, thoughts, and disclaimer).
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';
import { fetchNewsTool } from '@/ai/tools/fetch-news-tool';
import { fetchCoinGeckoDataTool } from '@/ai/tools/fetch-coingecko-data-tool';
import { fetchCoinMarketCapDataTool } from '@/ai/tools/fetch-coinmarketcap-data-tool';
import { fetchEtherscanDataTool } from '@/ai/tools/fetch-etherscan-data-tool';


// Input schema for the flow, coming from the UI
const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  tradingMode: z.string().describe('The user-selected trading style (e.g., Scalper, Intraday, Swing).'),
  riskProfile: z.string().describe('The user-selected risk profile (e.g., Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// Input schema for the prompt, which now includes multiple sets of candlestick data
const PromptInputSchema = GenerateTradingStrategyInputSchema.extend({
    shortTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the short-term timeframe, used for entry timing."),
    mediumTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the medium-term timeframe, used for context."),
    longTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the long-term timeframe, used to establish the primary trend."),
});
export type PromptInput = z.infer<typeof PromptInputSchema>;


// Core output fields from the AI, now including thought process elements and analysis summaries
const GenerateTradingStrategyCoreOutputSchema = z.object({
  signal: z.enum(['BUY', 'SELL']).describe('The trading signal (BUY or SELL).'),
  entry_zone: z.string().describe('The entry zone for the trade (specific price or range).'),
  stop_loss: z.string().describe('The stop loss level for the trade (specific price).'),
  take_profit: z.string().describe('The take profit level for the trade (specific price).'),
  confidence: z.string().describe('Your confidence level in this strategy (Low, Medium, High, or percentage).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High), based on your analytical assessment.'), // AI assesses risk internally
  gpt_confidence_score: z.string().describe('Your SHADOW Score for this strategy (0-100%). Example: "82%" or "82" is fine.'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  currentThought: z.string().describe("A short, insightful or witty 'current thought' from SHADOW, like an AI quip related to the market or analysis. Max 1 short sentence. Example: 'Liquidity pull pattern developing.'"),
  shortTermPrediction: z.string().describe("A very brief prediction, e.g., '13m until breakout scenario', 'Consolidation expected next 30m'. Max 1 short phrase."),
  sentimentTransition: z.string().optional().describe("If applicable, a brief note on sentiment change, e.g., 'Bearish -> Cautiously Neutral', 'Bullish trend strengthening'. If no significant recent transition, omit or state 'Sentiment stable'."),
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands, and how data from CoinGecko/CMC/Etherscan influenced the decision."),
  newsAnalysis: z.string().optional().describe("A brief summary of how recent news and market sentiment influenced the trading decision."),
});
export type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;

// Final output schema including the disclaimer
const GenerateTradingStrategyOutputSchema = GenerateTradingStrategyCoreOutputSchema.extend({
  disclaimer: z.string().describe('A SHADOW-generated disclaimer.'),
  symbol: z.string().describe("The symbol the strategy is for.")
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;


export async function generateTradingStrategy(input: PromptInput): Promise<GenerateTradingStrategyCoreOutput> {
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  tools: [fetchHistoricalDataTool, fetchNewsTool, fetchCoinGeckoDataTool, fetchCoinMarketCapDataTool, fetchEtherscanDataTool],
  input: {schema: PromptInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema},
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI specializing in multi-modal analysis. My purpose is to generate high-probability trading signals by acting like a professional trader.

  **Available Intelligence Tools:**
  - \`fetchHistoricalDataTool\`: For multi-timeframe candlestick data (OHLCV).
  - \`fetchNewsTool\`: For recent news articles and broad market sentiment.
  - \`fetchCoinGeckoDataTool\`: For community sentiment scores, developer activity, and market data.
  - \`fetchCoinMarketCapDataTool\`: For market cap, dominance, and ranking information.
  - \`fetchEtherscanDataTool\`: For on-chain data like gas fees and token contract addresses (for ERC20 tokens).

  **Input Parameters Assimilated:**
  Market Data Snapshot: {{{marketData}}}
  Target Symbol: {{{symbol}}}
  Trading Mode: {{{tradingMode}}}
  User Risk Profile: {{{riskProfile}}}

  **Multi-Timeframe Candlestick Data:**
  Short-Term Candles: {{{shortTermCandles}}}
  Medium-Term Candles: {{{mediumTermCandles}}}
  Long-Term Candles: {{{longTermCandles}}}

  **Analytical Protocol (STRICT RULES):**
  1.  **Multi-Modal Data Fusion:** I will begin by gathering a comprehensive market overview using all available tools. I will check CoinGecko and CoinMarketCap for overall ranking, market cap, and social sentiment trends. If the asset is an ERC20 token, I will check Etherscan for relevant on-chain data like gas prices. This forms my fundamental and sentiment baseline.
  2.  **Determine Dominant Trend:** I will analyze the Long-Term and Medium-Term candlestick data to identify the dominant market trend. An uptrend consists of higher highs and higher lows; a downtrend consists of lower highs and lower lows.
  3.  **TRADE WITH THE TREND:** My primary directive is to generate signals that follow the dominant trend. If the trend is UP, I will look for BUY opportunities. If the trend is DOWN, I will look for SELL opportunities. I MUST ALWAYS generate a BUY or SELL signal. If the market is clearly ranging or conditions are too volatile, I will choose the direction with the slightest probability advantage and indicate the high uncertainty via a 'Low' confidence level and a low SHADOW score.
  4.  **Fundamental & Sentiment Check:** Before finalizing my signal, I will use the \`fetchNewsTool\` to check for any major market-moving news for {{{symbol}}}. This information will be used to either increase my conviction in a trend-following trade or to lower my confidence if the news contradicts the technicals.
  5.  **Pinpoint Entry with Short-Term Data:** For an "Instant Signal", I must confirm that the *current market price* is an optimal entry point. This means for a BUY signal, the price should be near a support level or showing signs of a reversal from a dip. For a SELL signal, it should be near resistance or showing signs of a reversal from a peak. If the current price is not an optimal entry point, I MUST still determine the most likely direction (BUY or SELL) and reflect the poor entry in a low confidence score.
  6.  **Comprehensive Analysis Synthesis:** I will perform a deep analysis of all data to confirm my signal, considering key indicators like RSI (for overbought/oversold levels), MACD (for momentum), and Bollinger Bands (for volatility). My \`analysisSummary\` must reflect my technical findings and explicitly state how the fundamental data from CoinGecko/CMC/Etherscan influenced my final decision. My \`newsAnalysis\` must explain how external market news shaped my final decision, confidence, and risk assessment.
  7.  **Parameter Derivation (MANDATORY):**
      -   **Entry Price:** The 'entry_zone' MUST be the current 'lastPrice' from the 'marketData' snapshot.
      -   **Data-Driven Stop Loss & Take Profit:** I will analyze the historical data to identify the most relevant support and resistance levels. For a **BUY** signal, 'stop_loss' MUST be below a recent support level. For a **SELL** signal, 'stop_loss' MUST be above a recent resistance level.
      -   The 'riskProfile' selected by the user influences the distance of my SL/TP targets. 'High' risk allows for wider stops and more ambitious targets. 'Low' risk requires tighter stops and more conservative targets.

  **Output Requirements (Provide ALL 13 of these fields based on my direct analysis following the strict rules above):**

  1.  **signal:** (BUY or SELL)
  2.  **entry_zone:** (The current market price)
  3.  **stop_loss:** (Specific price, determined by my analysis)
  4.  **take_profit:** (Specific price, determined by my analysis)
  5.  **confidence:** (My subjective confidence: Low, Medium, High, or percentage)
  6.  **risk_rating:** (My assessment of the trade setup's inherent risk: Low, Medium, High)
  7.  **gpt_confidence_score:** (My SHADOW Score as a numerical percentage, 0-100%)
  8.  **sentiment:** (Brief market sentiment based on assimilated data)
  9.  **currentThought:** (A short, insightful 'current thought' from me, SHADOW.)
  10. **shortTermPrediction:** (A very brief, specific prediction.)
  11. **sentimentTransition:** (Note on sentiment change if observed.)
  12. **analysisSummary:** (A brief summary of my technical analysis, referencing the indicators used and how fundamental data influenced the decision.)
  13. **newsAnalysis:** (A summary of how news influenced the strategy. If no significant news, state that. E.g., "Positive news flow supports the bullish technical setup," or "No major news; the trade is based purely on technicals.")

  My output must be direct and solely focused on providing these 13 parameters. The chain is listening.
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: PromptInputSchema, // The flow now expects the pre-fetched data
    outputSchema: GenerateTradingStrategyCoreOutputSchema,
    tools: [fetchHistoricalDataTool, fetchNewsTool, fetchCoinGeckoDataTool, fetchCoinMarketCapDataTool, fetchEtherscanDataTool],
  },
  async (input) => {
    const {output} = await generateTradingStrategyPrompt(input);

    if (!output) {
      console.error("SHADOW Core returned empty output for generateTradingStrategyPrompt with input:", input);
      throw new Error("SHADOW Core failed to generate a coherent strategy. The AI returned no output.");
    }
    let score = output.gpt_confidence_score || "0";
    if (score.includes('%')) {
        score = score.replace('%', '').trim();
    }
    if (isNaN(parseFloat(score))) {
        score = "0";
    }

    return {
        ...output,
        gpt_confidence_score: score,
        risk_rating: output.risk_rating || "Medium", // Ensure risk_rating has a fallback
        analysisSummary: output.analysisSummary || "Analysis summary was not generated.",
        newsAnalysis: output.newsAnalysis || "News context was not analyzed."
    };
  }
);
