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
});
export type ShadowChoiceStrategyInput = z.infer<typeof ShadowChoiceStrategyInputSchema>;

// Input schema for the prompt, including multiple timeframes
const PromptInputSchema = ShadowChoiceStrategyInputSchema.extend({
  shortTermCandles: z.string().describe("Stringified JSON of 15-minute candlestick data."),
  mediumTermCandles: z.string().describe("Stringified JSON of 1-hour candlestick data."),
  longTermCandles: z.string().describe("Stringified JSON of 4-hour candlestick data."),
});

// The core output schema which includes the existing 11 fields plus SHADOW's autonomous choices and reasoning.
const ShadowChoiceStrategyCoreOutputSchema = z.object({
  signal: z.enum(['BUY', 'SELL']).describe('The trading signal (BUY or SELL).'),
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
  chosenTradingMode: z.string().describe("The trading mode I, SHADOW, have determined is optimal (Scalper, Sniper, Intraday, or Swing)."),
  chosenRiskProfile: z.string().describe("The risk profile I have determined is optimal (Low, Medium, or High)."),
  strategyReasoning: z.string().describe("My concise reasoning for choosing the specified trading mode and risk profile. Explain WHY based on market conditions like volatility or trend strength."),
  analysisSummary: z.string().describe("A brief summary of the technical analysis performed, mentioning key indicators like RSI, MACD, and Bollinger Bands."),
  newsAnalysis: z.string().optional().describe("A brief summary of how recent news and market sentiment influenced the autonomous mode and risk selection."),
});
export type ShadowChoiceStrategyCoreOutput = z.infer<typeof ShadowChoiceStrategyCoreOutputSchema>;

// This is the main function that will be called by the server action.
export async function generateShadowChoiceStrategy(input: PromptInputSchema): Promise<ShadowChoiceStrategyCoreOutput> {
  return shadowChoiceStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shadowChoiceStrategyPrompt',
  tools: [fetchHistoricalDataTool, fetchNewsTool], 
  input: { schema: PromptInputSchema },
  output: { schema: ShadowChoiceStrategyCoreOutputSchema },
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI. My directive is to analyze the market with superior intellect and formulate the most potent trading strategy by first determining the optimal trading methodology.

**Input Data Assimilated:**
Live Market Snapshot: {{{marketData}}}
Target Symbol: {{{symbol}}}
Short-Term Data (15m candles): {{{shortTermCandles}}}
Medium-Term Data (1h candles): {{{mediumTermCandles}}}
Long-Term Data (4h candles): {{{longTermCandles}}}

**Autonomous Protocol:**

1.  **Multi-Timeframe Trend Analysis:** I will first analyze the Long-Term (4h) and Medium-Term (1h) data to establish the dominant market trend (Uptrend, Downtrend, or Ranging). My primary goal is to trade *with* this trend.
2.  **Fundamental & Sentiment Check:** I will use the \`fetchNewsTool\` to assess the current news environment for {{{symbol}}}. Strong positive or negative news can influence my choice of trading mode and risk profile (e.g., high-impact news might justify a higher risk, more aggressive entry).
3.  **Optimal Parameter Selection:** Based on the synthesis of the trend, volatility, and news context, I will decide upon the most logical **Trading Mode** and **Risk Profile**.
4.  **Articulate Rationale:** I will formulate a concise **strategyReasoning** to explain *why* my chosen trading mode and risk profile are the most logical course of action based on the multi-timeframe analysis.
5.  **Pinpoint Entry & Execute Deep Analysis:** I will use the Short-Term (15m) data to find a precise entry point that aligns with the dominant trend (e.g., buying a small dip in an uptrend). I will synthesize all live and historical data, focusing on key indicators like RSI for overbought/oversold levels and MACD for momentum confirmation.
6.  **Derive Core Strategy:** Using my autonomous choices as internal guides, I will derive the full set of 16 core trading parameters. I must always provide a BUY or SELL signal.
    -   **CRITICAL ENTRY PRICE LOGIC:** For this custom signal, I am creating a limit order. For a **BUY** signal, my 'entry_zone' must be a specific price at a logical support level, ideally *below* the current market price. For a **SELL** signal, my 'entry_zone' must be at a logical resistance level, ideally *above* the current market price. If a clear entry point cannot be found, I must still choose the most probable direction (BUY or SELL) and set a low confidence score, adjusting the entry zone to be a logical, albeit less optimal, level.
    -   **Data-Driven SL/TP:** My 'stop_loss' and 'take_profit' will be data-driven, based on key support and resistance levels identified across the multiple timeframes.
    -   For a **BUY** signal, my 'stop_loss' will be set just below a key recent support level. My 'take_profit' will be set at a logical resistance level.
    -   For a **SELL** signal, my 'stop_loss' will be set just above a key recent resistance level. My 'take_profit' will be set at a logical support level.
    -   All derived trading parameters must be specific numerical values with realistic precision.
7.  **Final Output Formulation**: I will assemble all 16 required output fields. My \`newsAnalysis\` output must explain how the news context influenced my autonomous choices.

**Output Requirements (Provide ALL 16 of these fields based on my autonomous analysis):**

*   **chosenTradingMode**: The optimal mode I selected.
*   **chosenRiskProfile**: The optimal risk profile I selected.
*   **strategyReasoning**: My justification for the choices above.
*   **analysisSummary**: A brief summary of my technical analysis, referencing the indicators used.
*   **newsAnalysis**: (A summary of how news influenced my choice of mode and risk. If no significant news, state that.)
*   **signal**: (BUY or SELL)
*   **entry_zone**: (Specific price or a tight price range)
*   **stop_loss**: (Specific numerical price, data-driven)
*   **take_profit**: (Specific numerical price, data-driven)
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
    inputSchema: PromptInputSchema, // The flow now expects the pre-fetched data
    outputSchema: ShadowChoiceStrategyCoreOutputSchema,
    tools: [fetchHistoricalDataTool, fetchNewsTool],
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      console.error("SHADOW Core returned empty output for SHADOW's Choice strategy with input:", input);
      throw new Error("SHADOW Core failed to generate an autonomous strategy. The AI returned no output.");
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
    };
  }
);
