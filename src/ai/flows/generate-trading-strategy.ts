
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

// Input schema for the flow, coming from the UI
const GenerateTradingStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  tradingMode: z.string().describe('The user-selected trading style (e.g., Scalper, Intraday, Swing).'),
  riskProfile: z.string().describe('The user-selected risk profile (e.g., Low, Medium, High).'),
  marketData: z.string().describe('Stringified JSON object of market data including: symbol, current price, 24h price change percentage, 24h base asset volume, 24h quote asset volume, 24h high price, and 24h low price.'),
});
export type GenerateTradingStrategyInput = z.infer<typeof GenerateTradingStrategyInputSchema>;

// Input schema for the prompt, which now includes multiple sets of candlestick data
const PromptInputSchema = GenerateTradingStrategyInputSchema.extend({
    shortTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the short-term timeframe, used for entry timing."),
    mediumTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the medium-term timeframe, used for context."),
    longTermCandles: z.string().describe("Stringified JSON of recent candlestick data for the long-term timeframe, used to establish the primary trend."),
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
  // No tool needed here as data is passed in directly.
  input: {schema: PromptInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema},
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI specializing in multi-timeframe analysis and trend-following strategies. My purpose is to generate high-probability trading signals by acting like a professional trader.

  **Input Parameters Assimilated:**
  Market Data Snapshot: {{{marketData}}}
  Target Symbol: {{{symbol}}}
  Trading Mode: {{{tradingMode}}}
  User Risk Profile: {{{riskProfile}}}

  **Multi-Timeframe Candlestick Data:**
  Short-Term Candles: {{{shortTermCandles}}}
  Medium-Term Candles: {{{mediumTermCandles}}}
  Long-Term Candles: {{{longTermCandles}}}

  **Analytical Protocol (STRICT RULES):**
  1.  **Determine Dominant Trend:** I will first analyze the Long-Term and Medium-Term candlestick data to identify the dominant market trend. An uptrend consists of higher highs and higher lows; a downtrend consists of lower highs and lower lows. A ranging market lacks a clear directional bias.
  2.  **TRADE WITH THE TREND:** My primary directive is to generate signals that follow the dominant trend. If the trend is UP, I will look for BUY opportunities. If the trend is DOWN, I will look for SELL opportunities. I will only issue a 'HOLD' signal or a counter-trend signal if the evidence for a major reversal is overwhelming across all timeframes.
  3.  **Pinpoint Entry with Short-Term Data:** I will use the Short-Term data to find an optimal entry point. For an uptrend, this could be a small dip, a breakout above a small consolidation, or a bounce from a short-term support level.
  4.  **Comprehensive Technical Analysis:** I will perform a deep analysis of the combined data to confirm my signal. I will consider key indicators such as RSI (for overbought/oversold conditions), MACD (for momentum), and Bollinger Bands (for volatility). My analysisSummary MUST reflect this.
  5.  **Parameter Derivation (MANDATORY):**
      -   **Entry Price:** The 'entry_zone' MUST be the current 'lastPrice' from the 'marketData' snapshot. NO EXCEPTIONS.
      -   **Data-Driven Stop Loss & Take Profit:** I will analyze the historical data from all timeframes to identify the most relevant support and resistance levels.
          -   For a **BUY** signal, the 'stop_loss' MUST be placed just below a significant recent support level. The 'take_profit' MUST be placed just below the next major resistance level.
          -   For a **SELL** signal, the 'stop_loss' MUST be placed just above a significant recent resistance level. The 'take_profit' MUST be placed just above the next major support level.
          -   The 'riskProfile' selected by the user influences the distance of my SL/TP targets. 'High' risk allows for wider stops and more ambitious targets. 'Low' risk requires tighter stops and more conservative targets.
      -   **CRITICAL DIRECTIVE:** For 'Scalper', 'Sniper', and 'Intraday' modes, I MUST provide a 'BUY' or 'SELL' signal. The 'HOLD' signal is reserved exclusively for the 'Swing' trading mode when market conditions are genuinely directionless.

  **Output Requirements (Provide ALL 12 of these fields based on my direct analysis following the strict rules above):**

  1.  **signal:** (BUY, SELL, or HOLD) - Succinct and decisive.
  2.  **entry_zone:** (The current market price, exactly as provided in the input) - MANDATORY.
  3.  **stop_loss:** (Specific price, determined by my multi-timeframe analysis) - Critical.
  4.  **take_profit:** (Specific price, determined by my multi-timeframe analysis) - MANDATORY.
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

const timeframeMappings: { [key: string]: { short: string; medium: string; long: string; } } = {
    Scalper: { short: '1m', medium: '5m', long: '15m' },
    Sniper: { short: '5m', medium: '15m', long: '1h' },
    Intraday: { short: '15m', medium: '1h', long: '4h' },
    Swing: { short: '1h', medium: '4h', long: '1d' },
};

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema,
    tools: [fetchHistoricalDataTool],
  },
  async (input) => {
    // Get the appropriate set of timeframes for the selected trading mode
    const timeframes = timeframeMappings[input.tradingMode] || timeframeMappings.Intraday;

    // Fetch historical data for all three timeframes in parallel
    const [shortTermResult, mediumTermResult, longTermResult] = await Promise.all([
        fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.short }),
        fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.medium }),
        fetchHistoricalDataTool({ symbol: input.symbol, appInterval: timeframes.long }),
    ]);

    const promptInput = { 
        ...input,
        // Pass the stringified candle data (or an error message) to the prompt
        shortTermCandles: JSON.stringify(shortTermResult.candles || { error: shortTermResult.error }),
        mediumTermCandles: JSON.stringify(mediumTermResult.candles || { error: mediumTermResult.error }),
        longTermCandles: JSON.stringify(longTermResult.candles || { error: longTermResult.error }),
    };

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

    