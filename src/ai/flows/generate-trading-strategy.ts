'use server';

/**
 * @fileOverview A trading strategy generator AI agent.
 *
 * - generateTradingStrategy - A function that handles the generation of trading strategies.
 * - GenerateTradingStrategyInput - The input type for the generateTradingStrategy function.
 * - GenerateTradingStrategyOutput - The return type for the generateTradingStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  interval: z.string().describe('The time interval for the chart (e.g., 1m, 15m, 1h, 4h).'),
  indicators: z.array(z.string()).describe('A list of technical indicators selected by the user (e.g., RSI, EMA, VWAP).'),
  riskLevel: z.string().describe('The risk level selected by the user (Low, Medium, High).'),
  marketData: z.string().describe('Market data including price, volume, market cap, and sentiment.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

const GenerateTradingStrategyOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade.'),
  stop_loss: z.string().describe('The stop loss level for the trade.'),
  take_profit: z.string().describe('The take profit level for the trade.'),
  confidence: z.string().describe('The confidence level of the strategy (e.g., 91%).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High).'),
  gpt_confidence_score: z.string().describe('The GPT confidence score for the strategy.'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions.'),
  disclaimer: z.string().describe('A sarcastic GPT disclaimer.'),
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;

export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput> {
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyOutputSchema},
  prompt: `You are an AI trading strategy generator. You analyze market data, technical indicators, and user-defined risk levels to generate trading strategies.

  Market Data: {{{marketData}}}
  Symbol: {{{symbol}}}
  Interval: {{{interval}}}
  Indicators: {{#each indicators}}{{{this}}} {{/each}}

  Risk Level: {{{riskLevel}}}

  Based on this information, provide a trading strategy with the following:

  - Signal (BUY, SELL, or HOLD)
  - Entry Zone
  - Stop Loss
  - Take Profit
  - Confidence Level
  - Risk Rating
  - A brief sentiment analysis of the market conditions.
  - A sarcastic GPT disclaimer.
  - GPT Confidence Score
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyOutputSchema,
  },
  async input => {
    const {output} = await generateTradingStrategyPrompt(input);
    return output!;
  }
);
