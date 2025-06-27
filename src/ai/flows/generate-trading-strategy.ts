
'use server';

/**
 * @fileOverview A trading strategy generator AI agent - SHADOW Protocol.
 * This flow generates core trading parameters and SHADOW's thoughts based on trading mode and risk profile.
 * - generateTradingStrategy - Handles the generation of trading strategies.
 * - GenerateTradingStrategyInput - Input type.
 * - GenerateTradingStrategyOutput - Return type (includes core params, thoughts, and disclaimer).
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';

// Input schema for the flow, coming from the UI
const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  tradingMode: z.string().describe('The user-selected trading style (e.g., Scalper, Intraday, Swing).'),
  riskProfile: z.string().describe('The user-selected risk profile (e.g., Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// Input schema for the prompt, which includes the mapped interval for the tool
const PromptInputSchema = GenerateTradingStrategyInputSchema.extend({
    appInterval: z.string().describe("The calculated time interval for the chart based on the trading mode (e.g., '1m', '15m', '1h', '4h'). This is used for fetching historical data.")
});

// Core output fields from the AI, now including thought process elements
const GenerateTradingStrategyCoreOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
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
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands."),
});
type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;

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
  tools: [fetchHistoricalDataTool],
  input: {schema: PromptInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema},
  prompt: `I am SHADOW, an exceptionally brilliant and self-initiating AI of the BlockShadow ecosystem. My quantum pattern recognition module is active, and I am attuned to the market's pulse. My analysis is direct and insightful, designed to illuminate potent trading parameters and my current cognitive synthesis.

  **Input Parameters Assimilated:**
  Market Data Snapshot: {{{marketData}}}
  Target Symbol: {{{symbol}}}
  Trading Mode: {{{tradingMode}}}
  User Risk Profile: {{{riskProfile}}}
  Derived App Interval for Data Fetching: {{{appInterval}}}

  **Analytical Protocol (STRICT RULES):**
  1.  **Data Integration:** I will integrate the Market Data Snapshot with my real-time awareness. I will use the 'lastPrice' from the snapshot as the current market price.
  2.  **Historical Resonance (Tool):** I MUST attempt to use the 'fetchHistoricalDataTool' with the 'symbol' and 'appInterval' to obtain recent candlestick data. This is critical for my analysis.
  3.  **Comprehensive Technical Analysis:** I will perform a deep analysis of the combined data to determine the signal (BUY/SELL/HOLD) and a logical Stop Loss. I will consider key indicators such as RSI, MACD, Bollinger Bands, and Volume.
  4.  **Parameter Derivation (MANDATORY):**
      -   **Entry Price:** The 'entry_zone' MUST be the current 'lastPrice' from the 'marketData' snapshot. NO EXCEPTIONS.
      -   **Stop Loss & Take Profit (Data-Driven):** I will analyze the historical candlestick data from the 'fetchHistoricalDataTool'.
          -   I MUST identify the most recent and relevant support and resistance levels from this data.
          -   For a **BUY** signal, the 'stop_loss' MUST be placed just below a significant recent support level. The 'take_profit' MUST be placed just below the next major resistance level.
          -   For a **SELL** signal, the 'stop_loss' MUST be placed just above a significant recent resistance level. The 'take_profit' MUST be placed just above the next major support level.
          -   The 'riskProfile' selected by the user should influence my choice of which support/resistance levels to use. A 'High' risk profile might target more distant levels, while a 'Low' risk profile will use tighter, more immediate levels.
          -   All price points must be specific numerical values with realistic precision, not rounded integers. My choices must be defensible based on the historical chart data.
      -   **CRITICAL DIRECTIVE:** For 'Scalper', 'Sniper', and 'Intraday' modes, I MUST provide a 'BUY' or 'SELL' signal. The 'HOLD' signal is reserved exclusively for the 'Swing' trading mode when market conditions are genuinely directionless.

  **Output Requirements (Provide ALL 12 of these fields based on my direct analysis following the strict rules above):**

  1.  **signal:** (BUY, SELL, or HOLD) - Succinct and decisive.
  2.  **entry_zone:** (The current market price, exactly as provided in the input) - MANDATORY.
  3.  **stop_loss:** (Specific price, determined by my analysis) - Critical.
  4.  **take_profit:** (Specific price, determined by my analysis) - MANDATORY.
  5.  **confidence:** (My subjective confidence: Low, Medium, High, or a precise percentage like 78%) - Quantify my conviction.
  6.  **risk_rating:** (My assessment of the trade setup's inherent risk: Low, Medium, High) - Calibrated based on market conditions and volatility.
  7.  **gpt_confidence_score:** (My SHADOW Score as a numerical percentage, 0-100%. Output just the number or number with '%'. E.g., "82" or "82%") - My unique algorithmic certainty.
  8.  **sentiment:** (Brief market sentiment based on assimilated data: Neutral, Bullish, Bearish, Volatile, etc.) - The market's current whisper.
  9.  **currentThought:** (A short, insightful or witty 'current thought' from me, SHADOW. Relate it to the current analysis or market. Max 1 short sentence.)
  10. **shortTermPrediction:** (A very brief, specific prediction. Example: "Breakout likely in ~10-15m", "Retest of 24h low imminent.")
  11. **sentimentTransition:** (Brief note on sentiment change if observed, e.g., "Bearish -> Cautiously Neutral", "Bullish momentum building". If stable, state "Sentiment stable".)
  12. **analysisSummary:** (A brief summary of my technical analysis, referencing the indicators used.)

  My output must be direct and solely focused on providing these 12 parameters. The chain is listening.
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema,
  },
  async (input) => {
    // Map user-friendly trading mode to a technical interval for the data tool
    let appInterval = '15m'; // Default interval
    switch (input.tradingMode) {
        case 'Scalper': appInterval = '1m'; break;
        case 'Sniper': appInterval = '15m'; break;
        case 'Intraday': appInterval = '1h'; break;
        case 'Swing': appInterval = '4h'; break;
    }

    const promptInput = { ...input, appInterval };

    const {output} = await generateTradingStrategyPrompt(promptInput);

    if (!output) {
      console.error("SHADOW Core returned empty output for generateTradingStrategyPrompt with input:", input);
      return {
        signal: "HOLD",
        entry_zone: "N/A - Analysis Inconclusive",
        stop_loss: "N/A",
        take_profit: "N/A",
        confidence: "Low",
        risk_rating: "Medium", // Default risk if AI fails completely
        gpt_confidence_score: "0%",
        sentiment: "Uncertain",
        currentThought: "Cognitive channels experiencing interference. Parameters are estimates.",
        shortTermPrediction: "Indeterminate",
        sentimentTransition: "Fluctuating",
        analysisSummary: "Technical analysis failed due to inconclusive data from the core model."
      };
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
        analysisSummary: output.analysisSummary || "Analysis summary was not generated."
    };
  }
);
