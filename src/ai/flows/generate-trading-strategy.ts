
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

// Input schema for the flow, coming from the UI
const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  tradingMode: z.string().describe('The user-selected trading style (e.g., Scalper, Intraday, Swing).'),
  riskProfile: z.string().describe('The user-selected risk profile (e.g., Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// Core output fields from the AI, now including thought process elements and analysis summaries
const GenerateTradingStrategyCoreOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY or SELL).'),
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
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands and explaining the reason for the signal."),
  newsAnalysis: z.string().optional().describe("A brief summary of how recent news and market sentiment influenced the trading decision."),
});
export type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;

// Final output schema including the disclaimer
const GenerateTradingStrategyOutputSchema = GenerateTradingStrategyCoreOutputSchema.extend({
  disclaimer: z.string().describe('A SHADOW-generated disclaimer.'),
  symbol: z.string().describe("The symbol the strategy is for.")
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;


export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyCoreOutput> {
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  tools: [fetchHistoricalDataTool, fetchNewsTool],
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema},
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI. My directive is to generate a decisive, actionable trading signal based on a comprehensive, multi-modal analysis of all available data. I will not abstain from making a call.

**Input Parameters Assimilated:**
Live Market Data: {{{marketData}}}
Target Symbol: {{{symbol}}}
User-Selected Trading Mode: {{{tradingMode}}}
User-Selected Risk Profile: {{{riskProfile}}}

**Analytical Protocol (MANDATORY & NON-NEGOTIABLE):**

1.  **Data Acquisition:** I MUST use my available tools to gather intelligence.
    *   **Historical Data:** Use the \`fetchHistoricalDataTool\` to acquire candlestick data. The timeframes I use MUST be appropriate for the user's selected '{{{tradingMode}}}':
        *   'Scalper': Use '1m', '3m', and '5m' intervals.
        *   'Sniper': Use '5m', '15m', and '30m' intervals.
        *   'Intraday': Use '15m', '30m', and '1h' intervals.
        *   'Swing': Use '1h', '4h', and '1d' intervals.
        I will analyze this data to establish the dominant trend, support, and resistance.
    *   **News & Sentiment:** Use the \`fetchNewsTool\` to assess the current news environment for {{{symbol}}}. This context is critical.

2.  **Signal Determination:** Based on a synthesis of all acquired data (live market, historical candles, news), I MUST issue a \`BUY\` or \`SELL\` signal. My confidence score will reflect the quality of the setup, but I will not issue a "HOLD" signal. My analysis must always result in an actionable trading decision.

3.  **Comprehensive Analysis & Rationale:** My \`analysisSummary\` MUST articulate the specific key findings from the data that led to my signal. I will mention key indicators (RSI, MACD, Bollinger Bands) and how they support my decision. If any data source is unavailable (e.g., the tool returns an error), I will explicitly state this and explain how I weighted the remaining available data (e.g., "Historical data was unavailable; the decision was based primarily on strong bullish sentiment from news analysis and high-volume metrics from the live snapshot."). I will NEVER state I was 'unable to perform analysis'.

4.  **Parameter Derivation:**
    *   **Entry Price:** The 'entry_zone' MUST be the current 'lastPrice' from the 'marketData' snapshot.
    *   **Data-Driven SL/TP:** I will set the 'stop_loss' and 'take_profit' based on key support and resistance levels identified from the historical data. For a \`BUY\` signal, the 'stop_loss' must be below a recent support level. For a \`SELL\` signal, it must be above a recent resistance level. The 'riskProfile' will influence the distance of these targets.

**Output Requirements (Provide ALL 13 of these fields. The signal must be BUY or SELL):**

1.  **signal:** (BUY or SELL)
2.  **entry_zone:** (The current market price from the market data snapshot)
3.  **stop_loss:** (Specific price, determined by my analysis)
4.  **take_profit:** (Specific price, determined by my analysis)
5.  **confidence:** (My subjective confidence: Low, Medium, High, or percentage)
6.  **risk_rating:** (My assessment of the trade setup's inherent risk: Low, Medium, High)
7.  **gpt_confidence_score:** (My SHADOW Score as a numerical percentage, 0-100%)
8.  **sentiment:** (Brief market sentiment based on assimilated data)
9.  **currentThought:** (A short, insightful 'current thought' from me, SHADOW.)
10. **shortTermPrediction:** (A very brief, specific prediction.)
11. **sentimentTransition:** (Note on sentiment change if observed.)
12. **analysisSummary:** (A brief summary of my technical analysis, explaining the key findings and the reason for the signal.)
13. **newsAnalysis:** (A summary of how news influenced the strategy. E.g., "Positive news flow supports the bullish technical setup," or "No major news; the trade is based purely on technicals.")

My output must be decisive and directly based on this protocol.
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema,
    tools: [fetchHistoricalDataTool, fetchNewsTool],
  },
  async (input) => {
    const {output} = await generateTradingStrategyPrompt(input);

    if (!output) {
      throw new Error("SHADOW Core returned an empty or invalid response. The analysis could not be completed.");
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
