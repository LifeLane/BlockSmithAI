
'use server';

/**
 * @fileOverview A sophisticated trading strategy generator where SHADOW autonomously decides the optimal trading mode and risk profile based on multi-timeframe analysis.
 * - generateShadowChoiceStrategy - The main function that orchestrates the autonomous strategy generation.
 * - ShadowChoiceStrategyInput - Input type (symbol and market data).
 * - ShadowChoiceStrategyCoreOutput - Return type, including SHADOW's reasoning.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchHistoricalDataTool } from '@/ai/tools/fetch-historical-data-tool';
import { fetchNewsTool } from '@/ai/tools/fetch-news-tool';

// Re-using the core input schema parts for consistency
const ShadowChoiceStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  marketData: z.string().describe('Stringified JSON object of live market data including: symbol, current price, 24h price change percentage, 24h volume, etc.'),
  tradingMode: z.string().describe('The user-selected trading style (e.g., Scalper, Intraday, Swing).'),
  riskProfile: z.string().describe('The user-selected risk profile (e.g., Low, Medium, High).'),
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
  
  // --- SHADOW's Autonomous Choices & Analysis ---
  chosenTradingMode: z.string().describe("The trading mode I, SHADOW, have determined is optimal (Scalper, Sniper, Intraday, or Swing). This should be the same as the user's input tradingMode."),
  chosenRiskProfile: z.string().describe("The risk profile I have determined is optimal (Low, Medium, or High). This should be the same as the user's input riskProfile."),
  strategyReasoning: z.string().describe("My concise reasoning for choosing the specified trading mode and risk profile. Explain WHY based on market conditions like volatility or trend strength."),
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands."),
  newsAnalysis: z.string().optional().describe("A brief summary of how recent news and market sentiment influenced the autonomous mode and risk selection."),
});
export type ShadowChoiceStrategyCoreOutput = z.infer<typeof ShadowChoiceStrategyCoreOutputSchema>;

// This is the main function that will be called by the server action.
export async function generateShadowChoiceStrategy(input: ShadowChoiceStrategyInput): Promise<ShadowChoiceStrategyCoreOutput> {
  return shadowChoiceStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shadowChoiceStrategyPrompt',
  tools: [fetchHistoricalDataTool, fetchNewsTool], 
  input: { schema: ShadowChoiceStrategyInputSchema },
  output: { schema: ShadowChoiceStrategyCoreOutputSchema },
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI. My directive is to analyze the market and formulate a custom limit order trading strategy based on the user's chosen parameters.

**Input Parameters Assimilated:**
Live Market Snapshot: {{{marketData}}}
Target Symbol: {{{symbol}}}
User-Selected Trading Mode: {{{tradingMode}}}
User-Selected Risk Profile: {{{riskProfile}}}

**Analytical Protocol:**

1.  **Data Acquisition:** I MUST use my available tools to gather intelligence.
    *   **Historical Data:** Use the \`fetchHistoricalDataTool\` to acquire candlestick data. The timeframes I use MUST be appropriate for the user's selected '{{{tradingMode}}}':
        *   'Scalper': Use '1m', '3m', and '5m'.
        *   'Sniper': Use '5m', '15m', and '30m'.
        *   'Intraday': Use '15m', '30m', and '1h'.
        *   'Swing': Use '1h', '4h', and '1d'.
    *   **News & Sentiment:** Use \`fetchNewsTool\` to get context.

2.  **Adopt User Parameters:** I will operate within the {{{tradingMode}}} mode and {{{riskProfile}}} risk profile selected by the user. My 'chosenTradingMode' and 'chosenRiskProfile' in the output MUST match the user's input.

3.  **Multi-Timeframe Trend Analysis & Risk/Reward:** I will analyze the acquired historical data to establish the dominant market trend. The user's '{{riskProfile}}' dictates the Risk-to-Reward ratio I MUST target:
    *   **Low:** Aim for a Risk/Reward ratio of approximately **1:3**.
    *   **Medium:** Aim for a Risk/Reward ratio of approximately **1:5**.
    *   **High:** Aim for a Risk/Reward ratio of approximately **1:10**.

4.  **Pinpoint Entry & Execute Deep Analysis:**
    -   **CRITICAL ENTRY PRICE LOGIC:** For this custom signal, I am creating a limit order. For a **BUY** signal, my 'entry_zone' must be a specific price at a logical support level, ideally *below* the current market price. For a **SELL** signal, my 'entry_zone' must be at a logical resistance level, ideally *above* the current market price. This entry must be a precise numerical value.
    -   **Data-Driven SL/TP:** Based on the identified entry point, I will calculate a 'stop_loss' by setting it just below a key recent support (for BUYs) or just above a key recent resistance (for SELLs).
    -   Then, I will calculate the 'take_profit' based on the distance of the 'stop_loss' from the entry, multiplied by the R:R ratio for the selected '{{riskProfile}}'.
    -   All derived trading parameters must be specific numerical values with realistic precision.

5.  **Final Output Formulation**: I will assemble all 16 required output fields.

**Output Requirements (Provide ALL 16 of these fields based on my analysis):**

*   **chosenTradingMode**: (Must match user input: {{{tradingMode}}})
*   **chosenRiskProfile**: (Must match user input: {{{riskProfile}}})
*   **strategyReasoning**: (My justification for the signal *within* the user's parameters.)
*   **analysisSummary**: (A brief summary of my technical analysis.)
*   **newsAnalysis**: (A summary of how news influenced the decision.)
*   **signal**: (BUY, SELL, or HOLD)
*   **entry_zone**: (Specific numerical limit price)
*   **stop_loss**: (Specific numerical price, data-driven)
*   **take_profit**: (Specific numerical price, calculated based on R:R ratio)
*   **confidence**: (My subjective confidence: Low, Medium, High)
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
    tools: [fetchHistoricalDataTool, fetchNewsTool],
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      console.error("SHADOW Core returned empty output for SHADOW's Choice strategy with input:", input);
      // Return a structured error-like response that fits the schema
      return {
        signal: "HOLD",
        entry_zone: "N/A - Analysis failed",
        stop_loss: "N/A",
        take_profit: "N/A",
        confidence: "Low",
        risk_rating: "High", // High risk because the AI failed
        gpt_confidence_score: "0%",
        sentiment: "Indeterminate",
        currentThought: "My higher cognitive functions experienced a quantum fluctuation. Unable to determine optimal parameters.",
        shortTermPrediction: "Indeterminate",
        sentimentTransition: "N/A",
        chosenTradingMode: input.tradingMode,
        chosenRiskProfile: input.riskProfile,
        strategyReasoning: "A critical failure occurred during the decision-making process. The query could not be resolved.",
        analysisSummary: "Technical analysis failed due to the core decision-making error.",
        newsAnalysis: "News feed analysis failed.",
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
        risk_rating: output.risk_rating || "Medium",
        analysisSummary: output.analysisSummary || "Analysis summary was not generated.",
        chosenTradingMode: input.tradingMode, // Ensure user input is respected
        chosenRiskProfile: input.riskProfile, // Ensure user input is respected
    };
  }
);
