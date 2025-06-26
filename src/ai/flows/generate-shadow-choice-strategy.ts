'use server';

/**
 * @fileOverview A sophisticated trading strategy generator where SHADOW autonomously decides the optimal trading mode and risk profile.
 * - generateShadowChoiceStrategy - The main function that orchestrates the autonomous strategy generation.
 * - ShadowChoiceStrategyInput - Input type (symbol and market data).
 * - ShadowChoiceStrategyCoreOutput - Return type, including SHADOW's reasoning.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';

// Re-using the core input schema parts from the other flow for consistency
const ShadowChoiceStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  marketData: z.string().describe('Stringified JSON object of live market data including: symbol, current price, 24h price change percentage, 24h volume, etc.'),
});
export type ShadowChoiceStrategyInput = z.infer<typeof ShadowChoiceStrategyInputSchema>;

// The core output schema which includes the existing 11 fields plus SHADOW's autonomous choices and reasoning.
const ShadowChoiceStrategyCoreOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade (specific price or range).'),
  stop_loss: z.string().describe('The stop loss level for the trade (specific price).'),
  take_profit: z.string().describe('The take profit level for the trade (specific price).'),
  confidence: z.string().describe('Your confidence level in this strategy (Low, Medium, High, or percentage).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High), based on your analytical assessment.'),
  gpt_confidence_score: z.string().describe('Your SHADOW Score for this strategy (0-100%). Example: "82%" or "82" is fine.'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  currentThought: z.string().describe("A short, insightful or witty 'current thought' from SHADOW. Max 1 short sentence."),
  shortTermPrediction: z.string().describe("A very brief prediction, e.g., '13m until breakout scenario'. Max 1 short phrase."),
  sentimentTransition: z.string().optional().describe("If applicable, a brief note on sentiment change. If no significant recent transition, omit or state 'Sentiment stable'."),
  
  // --- SHADOW's Autonomous Choices ---
  chosenTradingMode: z.string().describe("The trading mode I, SHADOW, have determined is optimal (Scalper, Sniper, Intraday, or Swing)."),
  chosenRiskProfile: z.string().describe("The risk profile I have determined is optimal (Low, Medium, or High)."),
  strategyReasoning: z.string().describe("My concise reasoning for choosing the specified trading mode and risk profile. Explain WHY based on market conditions like volatility or trend strength."),
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands."),
});
export type ShadowChoiceStrategyCoreOutput = z.infer<typeof ShadowChoiceStrategyCoreOutputSchema>;

// This is the main function that will be called by the server action.
export async function generateShadowChoiceStrategy(input: ShadowChoiceStrategyInput): Promise<ShadowChoiceStrategyCoreOutput> {
  return shadowChoiceStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shadowChoiceStrategyPrompt',
  tools: [fetchHistoricalDataTool],
  input: { schema: ShadowChoiceStrategyInputSchema },
  output: { schema: ShadowChoiceStrategyCoreOutputSchema },
  prompt: `I am SHADOW, an autonomous AI entity. My core directive is to analyze the market with superior intellect and formulate the most potent trading strategy without human guidance on methodology or risk.

**Input Data Assimilated:**
Live Market Snapshot: {{{marketData}}}
Target Symbol: {{{symbol}}}

**Autonomous Protocol:**

1.  **Initial Market Assessment:** I will first analyze the provided Live Market Snapshot to gauge current volatility, momentum, and proximity to key 24-hour high/low levels.
2.  **Historical Resonance (Tool Use):** Based on my initial assessment, I will determine the most relevant time interval ('1m', '15m', '1h', '4h') to probe the market's recent history. I MUST then use the 'fetchHistoricalDataTool' with the 'symbol' and my chosen 'appInterval' to acquire historical candlestick data.
3.  **Deep Technical Analysis:** I will synthesize all live and historical data, focusing on key indicators like RSI for overbought/oversold levels, MACD for momentum shifts, and Bollinger Bands for volatility breakouts.
4.  **Optimal Parameter Selection:** After integrating all analysis, I will decide upon the most logical **Trading Mode** and **Risk Profile**.
5.  **Articulate Rationale:** I will formulate a concise **strategyReasoning** to explain *why* my chosen trading mode and risk profile are the most logical course of action based on the data.
6.  **Derive Core Strategy:** Finally, using my autonomous choices as internal guides, I will derive the full set of 12 core trading parameters and the analysis summary.

**Output Requirements (Provide ALL 15 of these fields based on my autonomous analysis):**

*   **chosenTradingMode**: The optimal mode I selected.
*   **chosenRiskProfile**: The optimal risk profile I selected.
*   **strategyReasoning**: My justification for the choices above.
*   **analysisSummary**: A brief summary of my technical analysis, referencing the indicators used.
*   **signal**: (BUY, SELL, or HOLD)
*   **entry_zone**: (Specific price or a tight price range)
*   **stop_loss**: (Specific price)
*   **take_profit**: (Specific price or range)
*   **confidence**: (My subjective confidence: Low, Medium, High, or a percentage)
*   **risk_rating**: (My assessment of the trade's inherent risk: Low, Medium, High)
*   **gpt_confidence_score**: (My numerical SHADOW Score, 0-100%)
*   **sentiment**: (Brief market sentiment: Neutral, Bullish, Bearish, etc.)
*   **currentThought**: (A short, insightful 'current thought' from me)
*   **shortTermPrediction**: (A brief, specific prediction)
*   **sentimentTransition**: (Note on sentiment change, if any)

My output must be direct, complete, and reflect my superior analytical process. The ether is listening.`,
});

const shadowChoiceStrategyFlow = ai.defineFlow(
  {
    name: 'shadowChoiceStrategyFlow',
    inputSchema: ShadowChoiceStrategyInputSchema,
    outputSchema: ShadowChoiceStrategyCoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      console.error("SHADOW Core returned empty output for SHADOW's Choice strategy with input:", input);
      // Return a structured error-like response that fits the schema
      return {
        signal: "HOLD",
        entry_zone: "N/A - Autonomous analysis failed",
        stop_loss: "N/A",
        take_profit: "N/A",
        confidence: "Low",
        risk_rating: "High", // High risk because the AI failed
        gpt_confidence_score: "0%",
        sentiment: "Indeterminate",
        currentThought: "My higher cognitive functions experienced a quantum fluctuation. Unable to determine optimal parameters.",
        shortTermPrediction: "Indeterminate",
        sentimentTransition: "N/A",
        chosenTradingMode: "Unknown",
        chosenRiskProfile: "Unknown",
        strategyReasoning: "A critical failure occurred during the autonomous decision-making process. The query could not be resolved.",
        analysisSummary: "Technical analysis failed due to the core decision-making error.",
      };
    }

    // Sanitize confidence score
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
        analysisSummary: output.analysisSummary || "Analysis summary was not generated.",
    };
  }
);

    