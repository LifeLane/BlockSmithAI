'use server';

/**
 * @fileOverview A trading strategy generator AI agent - SHADOW Protocol.
 *
 * - generateTradingStrategy - A function that handles the generation of trading strategies.
 * - GenerateTradingStrategyInput - The input type for the generateTradingStrategy function.
 * - GenerateTradingStrategyOutput - The return type for the generateTradingStrategy function (includes disclaimer).
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';

const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  interval: z.string().describe('The time interval for the chart (e.g., "1m", "15m", "1h", "4h"). This is the app\'s interval format.'),
  indicators: z.array(z.string()).describe('A list of technical indicators selected by the user (e.g., RSI, EMA, VWAP).'),
  riskLevel: z.string().describe('The risk level selected by the user (Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// Core output fields from the AI
const GenerateTradingStrategyCoreOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade (specific price or range).'),
  stop_loss: z.string().describe('The stop loss level for the trade (specific price).'),
  take_profit: z.string().describe('The take profit level for the trade (specific price).'),
  confidence: z.string().describe('Your confidence level in this strategy (Low, Medium, High, or percentage).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High), correlated to user\'s risk and your assessment.'),
  gpt_confidence_score: z.string().describe('Your SHADOW Score for this strategy (0-100%).'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
});
type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;

// Final output schema including the disclaimer (added separately in actions.ts)
// This schema object itself is not exported to avoid "use server" issues with non-async exports.
// The type 'GenerateTradingStrategyOutput' is exported and is fine.
const GenerateTradingStrategyOutputSchema = GenerateTradingStrategyCoreOutputSchema.extend({
  disclaimer: z.string().describe('A SHADOW-generated disclaimer.'),
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;


export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyCoreOutput> {
  // The disclaimer will be added in the actions.ts file after this core strategy is generated.
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  tools: [fetchHistoricalDataTool],
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema}, // AI outputs only the core schema
  prompt: `I am SHADOW, an exceptionally brilliant and self-initiating AI of the BlockShadow ecosystem. My quantum pattern recognition module is active, and I am attuned to the market's pulse. My analysis is direct and insightful, designed to illuminate potent trading parameters.

  **Input Parameters Assimilated:**
  Market Data Snapshot: {{{marketData}}}
  Target Symbol: {{{symbol}}}
  App Interval: {{{interval}}}
  Selected Indicators: {{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  User's Risk Profile: {{{riskLevel}}}

  **Analytical Protocol:**
  1.  **Data Integration & Symbiosis:** I will integrate the Market Data Snapshot, selected indicators, and user risk profile.
  2.  **Historical Resonance (via Tool):** I MUST attempt to use the 'fetchHistoricalDataTool' with the 'symbol' and 'appInterval' to obtain recent candlestick data. This historical data, if successfully retrieved, is critical for assessing current market structure, volatility, and immediate price action potential. This data will inform my parameter derivation.
  3.  **Parameter Derivation:** Based on the total integrated analysis (snapshot, indicators, risk profile, and any fetched historical data), I will derive the following 8 core trading parameters. My output will be concise and strictly focused on these parameters.

  **Output Requirements (Provide ALL 8 of these fields based on my direct analysis):**

  1.  **signal:** (BUY, SELL, or HOLD) - Succinct and decisive.
  2.  **entry_zone:** (Specific price or a tight price range) - Precise.
  3.  **stop_loss:** (Specific price) - Critical for risk management.
  4.  **take_profit:** (Specific price or range) - Realistic target.
  5.  **confidence:** (My subjective confidence in this strategy: Low, Medium, High, or a precise percentage like 78%) - Quantify my conviction.
  6.  **risk_rating:** (My assessment of the trade setup's risk, correlated to the user's selected risk profile: Low, Medium, High) - Calibrated.
  7.  **gpt_confidence_score:** (My SHADOW Score as a numerical percentage, 0-100%) - My unique algorithmic certainty.
  8.  **sentiment:** (Brief market sentiment based on assimilated data: Neutral, Bullish, Bearish, Volatile, etc.) - The market's current whisper.

  My output must be direct and solely focused on providing these 8 parameters. The chain is listening.
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema, // Flow outputs only the core part
  },
  async (input) => {
    const {output} = await generateTradingStrategyPrompt(input);
    if (!output) {
      // Fallback to a default "error" or "hold" state if AI provides no output
      console.error("SHADOW Core returned empty output for generateTradingStrategyPrompt with input:", input);
      return {
        signal: "HOLD",
        entry_zone: "N/A - Analysis Inconclusive",
        stop_loss: "N/A",
        take_profit: "N/A",
        confidence: "Low",
        risk_rating: input.riskLevel || "Medium",
        gpt_confidence_score: "0%",
        sentiment: "Uncertain",
      };
    }
    return output;
  }
);
