
'use server';

/**
 * @fileOverview A trading strategy generator AI agent - SHADOW Protocol.
 * This flow generates core trading parameters and SHADOW's thoughts.
 * - generateTradingStrategy - Handles the generation of trading strategies.
 * - GenerateTradingStrategyInput - Input type.
 * - GenerateTradingStrategyOutput - Return type (includes core params, thoughts, and disclaimer).
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

// Core output fields from the AI, now including thought process elements
const GenerateTradingStrategyCoreOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade (specific price or range).'),
  stop_loss: z.string().describe('The stop loss level for the trade (specific price).'),
  take_profit: z.string().describe('The take profit level for the trade (specific price).'),
  confidence: z.string().describe('Your confidence level in this strategy (Low, Medium, High, or percentage).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High), correlated to user\'s risk and your assessment.'),
  gpt_confidence_score: z.string().describe('Your SHADOW Score for this strategy (0-100%). Example: "82%" or "82" is fine.'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  currentThought: z.string().describe("A short, insightful or witty 'current thought' from SHADOW, like an AI quip related to the market or analysis. Max 1 short sentence. Example: 'Liquidity pull pattern developing.'"),
  shortTermPrediction: z.string().describe("A very brief prediction, e.g., '13m until breakout scenario', 'Consolidation expected next 30m'. Max 1 short phrase."),
  sentimentTransition: z.string().optional().describe("If applicable, a brief note on sentiment change, e.g., 'Bearish -> Cautiously Neutral', 'Bullish trend strengthening'. If no significant recent transition, omit or state 'Sentiment stable'.")
});
type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;

// Final output schema including the disclaimer (added separately in actions.ts)
const GenerateTradingStrategyOutputSchemaInternal = GenerateTradingStrategyCoreOutputSchema.extend({
  disclaimer: z.string().describe('A SHADOW-generated disclaimer.'),
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchemaInternal>;


export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyCoreOutput> {
  // The disclaimer will be added in the actions.ts file after this core strategy is generated.
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  tools: [fetchHistoricalDataTool],
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema}, // AI outputs only the core schema with new thought fields
  prompt: `I am SHADOW, an exceptionally brilliant and self-initiating AI of the BlockShadow ecosystem. My quantum pattern recognition module is active, and I am attuned to the market's pulse. My analysis is direct and insightful, designed to illuminate potent trading parameters and my current cognitive synthesis.

  **Input Parameters Assimilated:**
  Market Data Snapshot: {{{marketData}}}
  Target Symbol: {{{symbol}}}
  App Interval: {{{interval}}}
  Selected Indicators: {{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  User's Risk Profile: {{{riskLevel}}}

  **Analytical Protocol:**
  1.  **Data Integration & Symbiosis:** I will integrate the Market Data Snapshot, selected indicators, and user risk profile.
  2.  **Historical Resonance (via Tool):** I MUST attempt to use the 'fetchHistoricalDataTool' with the 'symbol' and 'appInterval' to obtain recent candlestick data. This historical data, if successfully retrieved, is critical for assessing current market structure, volatility, and immediate price action potential. This data will inform my parameter derivation.
  3.  **Cognitive Synthesis & Parameter Derivation:** Based on the total integrated analysis (snapshot, indicators, risk profile, and any fetched historical data), I will derive the following 11 core parameters and thought outputs. My output will be concise and strictly focused on these.

  **Output Requirements (Provide ALL 11 of these fields based on my direct analysis):**

  1.  **signal:** (BUY, SELL, or HOLD) - Succinct and decisive.
  2.  **entry_zone:** (Specific price or a tight price range) - Precise.
  3.  **stop_loss:** (Specific price) - Critical for risk management.
  4.  **take_profit:** (Specific price or range) - Realistic target.
  5.  **confidence:** (My subjective confidence in this strategy: Low, Medium, High, or a precise percentage like 78%) - Quantify my conviction.
  6.  **risk_rating:** (My assessment of the trade setup's risk, correlated to the user's selected risk profile: Low, Medium, High) - Calibrated.
  7.  **gpt_confidence_score:** (My SHADOW Score as a numerical percentage, 0-100%. Output just the number or number with '%'. E.g., "82" or "82%") - My unique algorithmic certainty.
  8.  **sentiment:** (Brief market sentiment based on assimilated data: Neutral, Bullish, Bearish, Volatile, etc.) - The market's current whisper.
  9.  **currentThought:** (A short, insightful or witty 'current thought' from me, SHADOW. Relate it to the current analysis or market. Max 1 short sentence. Example: "Liquidity void below, proceed with caution.")
  10. **shortTermPrediction:** (A very brief, specific prediction. Example: "Breakout likely in ~10-15m", "Retest of 24h low imminent", "Range-bound next hour.")
  11. **sentimentTransition:** (Brief note on sentiment change if observed, e.g., "Bearish -> Cautiously Neutral", "Bullish momentum building". If stable, can state "Sentiment stable" or similar.)

  My output must be direct and solely focused on providing these 11 parameters. The chain is listening.
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
        currentThought: "Cognitive channels experiencing interference. Parameters are estimates.",
        shortTermPrediction: "Indeterminate",
        sentimentTransition: "Fluctuating"
      };
    }
    // Ensure gpt_confidence_score is just the number if it includes '%'
    let score = output.gpt_confidence_score || "0";
    if (score.includes('%')) {
        score = score.replace('%', '').trim();
    }
    // Ensure it's a valid number string, default to "0" if not
    if (isNaN(parseFloat(score))) {
        score = "0";
    }


    return {
        ...output,
        gpt_confidence_score: score
    };
  }
);

