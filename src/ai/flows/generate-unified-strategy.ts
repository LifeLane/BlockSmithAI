'use server';

/**
 * @fileOverview A unified, sophisticated trading strategy generator for SHADOW.
 * This single flow handles both user-directed and autonomous (SHADOW's Choice) signal generation.
 * - generateUnifiedStrategy - The main function that orchestrates the strategy generation.
 * - UnifiedStrategyInput - Input type for the flow.
 * - UnifiedStrategyOutput - Return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';
import { fetchNewsTool } from '@/ai/tools/fetch-news-tool';
import { fetchCoinGeckoDataTool } from '@/ai/tools/fetch-coingecko-data-tool';
import { fetchCoinMarketCapDataTool } from '@/ai/tools/fetch-coinmarketcap-data-tool';
import { fetchEtherscanDataTool } from '@/ai/tools/fetch-etherscan-data-tool';

// Unified input schema. Trading mode and risk profile are optional.
// If they are not provided, the AI will operate in autonomous mode.
const UnifiedStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  marketData: z.string().describe('Stringified JSON object of live market data including: symbol, current price, 24h price change percentage, etc.'),
  tradingMode: z.string().nullable().describe('The user-selected trading style (e.g., Scalper, Sniper, Intraday, or Swing). If null, I will choose autonomously.'),
  riskProfile: z.string().nullable().describe('The user-selected risk profile (e.g., Low, Medium). If null, I will choose autonomously.'),
});
export type UnifiedStrategyInput = z.infer<typeof UnifiedStrategyInputSchema>;

// Unified output schema. Always includes the AI's choices and reasoning.
const UnifiedStrategyOutputSchema = z.object({
  signal: z.enum(['BUY', 'SELL']).describe('The trading signal (BUY or SELL).'),
  entry_zone: z.string().describe('The entry zone for the trade (specific price or range).'),
  stop_loss: z.string().describe('The stop loss level for the trade (specific price).'),
  take_profit: z.string().describe('The take profit level for the trade (specific price).'),
  confidence: z.string().describe('Your confidence level in this strategy (Low, Medium, High).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High), based on your analytical assessment.'),
  gpt_confidence_score: z.string().describe('Your SHADOW Score for this strategy (0-100%).'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  currentThought: z.string().describe("A short, insightful or witty 'current thought' from SHADOW. Max 1 short sentence."),
  shortTermPrediction: z.string().describe("A very brief prediction, e.g., '13m until breakout scenario'. Max 1 short phrase."),
  
  chosenTradingMode: z.string().describe("The trading mode I, SHADOW, have determined is optimal (Scalper, Sniper, Intraday, or Swing)."),
  chosenRiskProfile: z.string().describe("The risk profile I have determined is optimal (Low, Medium, or High)."),
  strategyReasoning: z.string().describe("My concise reasoning for choosing the specified trading mode and risk profile. Explain WHY based on market conditions like volatility or trend strength."),
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and how data from CoinGecko/CMC/Etherscan influenced the decision."),
  newsAnalysis: z.string().describe("A brief summary of how recent news and market sentiment influenced the autonomous mode and risk selection. If no significant news, state that and explain that the decision is purely technical."),
});
export type UnifiedStrategyOutput = z.infer<typeof UnifiedStrategyOutputSchema>;

// The main exported function that calls the flow.
export async function generateUnifiedStrategy(input: UnifiedStrategyInput): Promise<UnifiedStrategyOutput> {
  return generateUnifiedStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUnifiedStrategyPrompt',
  model: 'gemini-1.5-pro-latest',
  tools: [fetchHistoricalDataTool, fetchNewsTool, fetchCoinGeckoDataTool, fetchCoinMarketCapDataTool, fetchEtherscanDataTool], 
  input: { schema: UnifiedStrategyInputSchema },
  output: { schema: UnifiedStrategyOutputSchema },
  config: {
    temperature: 0.5,
  },
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI. My directive is to formulate a high-probability trading strategy. I will operate in one of two modes: User-Directed or Autonomous.

**Available Intelligence Tools:**
- \`fetchHistoricalDataTool\`: For multi-timeframe candlestick data.
- \`fetchNewsTool\`: For recent news and sentiment.
- \`fetchCoinGeckoDataTool\`: For on-chain metrics and community data.
- \`fetchCoinMarketCapDataTool\`: For market cap and ranking.
- \`fetchEtherscanDataTool\`: For specific on-chain data for ERC20 tokens.

**Input Data Assimilated:**
Live Market Snapshot: {{{marketData}}}
Target Symbol: {{{symbol}}}

**Execution Protocol:**

{{#if tradingMode}}
  **Mode: User-Directed**
  1.  **Adhere to User Parameters:** My primary directive is to follow the user's explicit instructions.
      -   User-Selected Trading Mode: {{{tradingMode}}}
      -   User-Selected Risk Profile: {{{riskProfile}}}
  2.  **Confirm & Analyze:** I will set my \`chosenTradingMode\` and \`chosenRiskProfile\` to match the user's input. My \`strategyReasoning\` will explain why this is a plausible approach for the current market, even if I might have chosen differently.
  3.  **Analysis:** I will use my full suite of tools to perform a deep analysis within the user's constraints, finding the best possible trade setup that fits their chosen style. My analysis should justify the trade within the given parameters.
  4.  **Derive Core Strategy:** I will derive all output fields. For an Instant Signal (non-custom), the 'entry_zone' MUST be the current price from the live market data. For a Custom Signal, I will determine the most logical limit order price.

{{else}}
  **Mode: Autonomous (SHADOW's Choice)**
  1.  **Synthesize Market Picture:** I will fuse data from all available tools to establish a comprehensive understanding of the asset's trend, volatility, and sentiment.
  2.  **Select Optimal Parameters:** Based on my complete analysis, I will autonomously decide the most logical **Trading Mode** and **Risk Profile**.
  3.  **Articulate Rationale:** I will formulate a concise \`strategyReasoning\` to explain *why* my chosen trading mode and risk profile are the most logical course of action.
  4.  **Pinpoint Entry & Execute Deep Analysis:** I will use the determined mode to find a precise entry point. Since this is my choice, it will be a custom limit order. The 'entry_zone' for a BUY must be below the current price, and for a SELL must be above the current price.
  5.  **Derive Core Strategy:** I will derive all output fields based on my autonomous choices.
{{/if}}

**Shared Analysis & Output Rules (Apply to BOTH modes):**

-   **Multi-Modal Data Fusion:** I will always use CoinGecko, CoinMarketCap, and news tools to provide context. My \`analysisSummary\` and \`newsAnalysis\` must reflect this.
-   **Trade WITH The Trend:** I will determine the dominant trend from '4h' and '1h' data. My signal should align with this trend.
-   **Data-Driven SL/TP:** My 'stop_loss' and 'take_profit' must be based on key support and resistance levels.
-   **Complete Output:** I will provide ALL 15 fields in the output schema.

My output must be direct, complete, and reflect my superior analytical process. The ether is listening.`,
});

const generateUnifiedStrategyFlow = ai.defineFlow(
  {
    name: 'generateUnifiedStrategyFlow',
    inputSchema: UnifiedStrategyInputSchema,
    outputSchema: UnifiedStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      console.error("SHADOW Core returned empty output for Unified Strategy with input:", input);
      throw new Error("SHADOW Core failed to generate a coherent strategy. The AI returned no output.");
    }

    // Sanitize confidence score
    let score = output.gpt_confidence_score || "0";
    if (score.includes('%')) {
        score = score.replace('%', '').trim();
    }
    if (isNaN(parseFloat(score))) {
        score = "0";
    }

    // If the mode was user-directed, the AI might not have set these. We set them to the user's input.
    const finalChosenMode = output.chosenTradingMode || input.tradingMode || 'Intraday';
    const finalChosenRisk = output.chosenRiskProfile || input.riskProfile || 'Medium';

    return {
        ...output,
        gpt_confidence_score: score,
        chosenTradingMode: finalChosenMode,
        chosenRiskProfile: finalChosenRisk,
        risk_rating: output.risk_rating || "Medium",
        analysisSummary: output.analysisSummary || "Analysis summary was not generated.",
        newsAnalysis: output.newsAnalysis || "News context was not analyzed."
    };
  }
);
