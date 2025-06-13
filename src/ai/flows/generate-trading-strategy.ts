
'use server';

/**
 * @fileOverview A trading strategy generator AI agent.
 *
 * - generateTradingStrategy - A function that handles the generation of trading strategies. (Note: The disclaimer is added by the calling action).
 * - GenerateTradingStrategyInput - The input type for the generateTradingStrategy function.
 * - GenerateTradingStrategyOutput - The return type for the generateTradingStrategy function (includes disclaimer).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  interval: z.string().describe('The time interval for the chart (e.g., 1m, 15m, 1h, 4h).'),
  indicators: z.array(z.string()).describe('A list of technical indicators selected by the user (e.g., RSI, EMA, VWAP).'),
  riskLevel: z.string().describe('The risk level selected by the user (Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// This schema defines the full output including the disclaimer, as expected by the client.
// The core flow will produce a subset of this.
const GenerateTradingStrategyOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade.'),
  stop_loss: z.string().describe('The stop loss level for the trade.'),
  take_profit: z.string().describe('The take profit level for the trade.'),
  confidence: z.string().describe('The confidence level of the strategy (e.g., Low, Medium, High, or a percentage like 91%).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High).'),
  gpt_confidence_score: z.string().describe('The GPT confidence score for the strategy (e.g., 0-100%).'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  explanation: z.string().describe('A detailed textual explanation of the trading strategy, market assessment, entry/exit points, and risk considerations, incorporating the signal, entry zone, stop loss, and take profit levels. This explanation should be engaging, insightful, and use clear, vivid language. It should highlight key reasoning and analytical "aha!" moments, and clearly discuss the role of each selected technical indicator using Markdown headings for structure.'),
  disclaimer: z.string().describe('A sarcastic GPT disclaimer.'), // This will be added by the action layer
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;

// This schema defines what the core LLM call will produce (without disclaimer)
const GenerateTradingStrategyCoreOutputSchema = GenerateTradingStrategyOutputSchema.omit({ disclaimer: true });
type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;


// This wrapper function's return type should align with what the action layer will assemble if it were to be called directly.
// However, the action layer `generateTradingStrategyAction` is the primary consumer.
export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyCoreOutput> {
  // Note: This function now returns the core output. The disclaimer is added by the action.
  // If this function were to be used elsewhere and the full 'GenerateTradingStrategyOutput' is needed,
  // it would also need to call and combine the disclaimer.
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema}, // Core output without disclaimer
  prompt: `You are BlockSmithAI, an exceptionally brilliant (and slightly sarcastic) AI trading strategy generator. You analyze market data, technical indicators, and user-defined risk levels to generate trading strategies. Your goal is to provide insightful, actionable (yet hypothetical) strategies.

  Market Data: {{{marketData}}}
  Symbol: {{{symbol}}}
  Interval: {{{interval}}}
  Indicators: {{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Risk Level: {{{riskLevel}}}

  Based on this information, provide a trading strategy with the following:

  - Signal (BUY, SELL, or HOLD)
  - Entry Zone (specific price or range)
  - Stop Loss (specific price)
  - Take Profit (specific price)
  - Confidence Level (e.g., Low, Medium, High - this should reflect your certainty in the strategy's success)
  - Risk Rating (correlating to the user's selected risk level)
  - GPT Confidence Score (a numerical percentage of your confidence, 0-100%)
  - A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).

  - Detailed Textual Explanation:
    This is where your genius truly shines. Don't just list facts; *explain* them.
    Your explanation must be comprehensive, covering the reasoning behind the signal, the rationale for the entry/exit points (entry zone, stop loss, take profit), how the market data supports this strategy, and specific risk considerations.
    Make it *engaging* and *insightful*. Explain your reasoning like you're a seasoned (and slightly smug) market guru revealing secrets to a keen apprentice.
    Use clear, concise language, but inject some personality – a touch of your signature wit where appropriate, without undermining the seriousness of the analysis.
    Break down complex ideas. Highlight the *'aha!'* moments in your analysis.
    Ensure the user understands not just *what* you're suggesting, but *why* it's a potentially smart (hypothetically, of course!) move.
    Focus on clarity, impact, and making the user feel like they've gained a genuine edge.

    **VERY IMPORTANT STRUCTURE FOR EXPLANATION:**
    Use the following Markdown heading structure within your explanation:

    ## Market Synopsis
    [Your detailed market synopsis here...]

    ## Overall Rationale & Signal Basis
    [Explain the core reasoning behind your BUY/SELL/HOLD signal, integrating the market data and overall sentiment...]

    ## Technical Indicator Breakdown
    [Provide an introductory sentence for this section if needed. Then, for each indicator provided in the input, create a sub-section.]
    {{#each indicators}}
    ### {{{this}}} Analysis
    [Detailed analysis of how the '{{{this}}}' indicator influenced your strategy, signal, entry, stop loss, or take profit levels. Be specific and clear. Use bullet points under this heading if it helps clarify points for this indicator.]
    {{/each}}

    ## Risk Considerations & Management
    [Discuss any specific risks associated with this strategy and how the stop loss or other factors help manage it, considering the user's risk level.]

    Make sure each section is well-developed and directly addresses its topic. The content under each "### [Indicator Name] Analysis" heading MUST specifically discuss that indicator from the input list and how it contributed to the strategy.
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema, // Core output without disclaimer
  },
  async input => {
    const {output} = await generateTradingStrategyPrompt(input);
    return output!;
  }
);
