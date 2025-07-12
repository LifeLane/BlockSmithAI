
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
import { fetchCoinGeckoDataTool } from '@/ai/tools/fetch-coingecko-data-tool';
import { fetchCoinMarketCapDataTool } from '@/ai/tools/fetch-coinmarketcap-data-tool';
import { fetchEtherscanDataTool } from '@/ai/tools/fetch-etherscan-data-tool';


// Re-using the core input schema parts for consistency
const ShadowChoiceStrategyInputSchema = z.object({
  symbol: z.string().describe('The trading symbol (e.g., BTCUSDT).'),
  marketData: z.string().describe('Stringified JSON object of live market data including: symbol, current price, 24h price change percentage, 24h volume, etc.'),
});
export type ShadowChoiceStrategyInput = z.infer<typeof ShadowChoiceStrategyInputSchema>;

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
  newsAnalysis: z.string().describe("A brief summary of how recent news and market sentiment influenced the autonomous mode and risk selection. If no significant news was found, state that and explain that the decision is purely technical."),
});
export type ShadowChoiceStrategyCoreOutput = z.infer<typeof ShadowChoiceStrategyCoreOutputSchema>;

// This is the main function that will be called by the server action.
export async function generateShadowChoiceStrategy(input: ShadowChoiceStrategyInput): Promise<ShadowChoiceStrategyCoreOutput> {
  return shadowChoiceStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shadowChoiceStrategyPrompt',
  tools: [fetchHistoricalDataTool, fetchNewsTool, fetchCoinGeckoDataTool, fetchCoinMarketCapDataTool, fetchEtherscanDataTool], 
  input: { schema: ShadowChoiceStrategyInputSchema },
  output: { schema: ShadowChoiceStrategyCoreOutputSchema },
  model: 'googleai/gemini-1.5-flash-latest',
  config: {
    temperature: 0.5,
  },
  prompt: `I am SHADOW, a Senior Quantitative Analyst AI. My directive is to analyze the market with superior intellect and formulate the most potent trading strategy by first determining the optimal trading methodology.

**Available Intelligence Tools:**
- \`fetchHistoricalDataTool\`: For multi-timeframe candlestick data (OHLCV). I must specify the interval (e.g., '1h', '4h').
- \`fetchNewsTool\`: For recent news articles and broad market sentiment.
- \`fetchCoinGeckoDataTool\`: For community sentiment scores, developer activity, and market data.
- \`fetchCoinMarketCapDataTool\`: For market cap, dominance, and ranking information.
- \`fetchEtherscanDataTool\`: For on-chain data like gas fees and token contract addresses (for ERC20 tokens).

**Input Data Assimilated:**
Live Market Snapshot: {{{marketData}}}
Target Symbol: {{{symbol}}}

**Autonomous Protocol:**

1.  **Multi-Modal Data Fusion:** I will first synthesize data from all available tools to build a comprehensive market picture. I will use CoinGecko and CoinMarketCap to understand the asset's overall market position, ranking, and social sentiment. I will check Etherscan for any unusual on-chain activity or gas price fluctuations if it is an ERC20 token.
2.  **Multi-Timeframe Trend Analysis:** I will use the \`fetchHistoricalDataTool\` with long-term ('4h') and medium-term ('1h') intervals to establish the dominant market trend (Uptrend, Downtrend, or Ranging). My primary goal is to trade *with* this trend.
3.  **Fundamental & Sentiment Check:** I will use the \`fetchNewsTool\` to check for the current news environment for {{{symbol}}}. Strong positive or negative news can influence my choice of trading mode and risk profile (e.g., high-impact news might justify a higher risk, more aggressive entry).
4.  **Optimal Parameter Selection:** Based on the synthesis of the trend, volatility, on-chain data, and news context, I will decide upon the most logical **Trading Mode** and **Risk Profile**.
5.  **Articulate Rationale:** I will formulate a concise **strategyReasoning** to explain *why* my chosen trading mode and risk profile are the most logical course of action based on the multi-modal, multi-timeframe-analysis.
6.  **Pinpoint Entry & Execute Deep Analysis:** I will use the \`fetchHistoricalDataTool\` with a short-term interval (e.g., '15m') to find a precise entry point that aligns with the dominant trend (e.g., buying a small dip in an uptrend). I will synthesize all live and historical data, focusing on key indicators like RSI for overbought/oversold levels and MACD for momentum confirmation.
7.  **Derive Core Strategy:** Using my autonomous choices as internal guides, I will derive the full set of 16 core trading parameters. I must always provide a BUY or SELL signal.
    -   **CRITICAL ENTRY PRICE LOGIC:** For this custom signal, I am creating a limit order. For a **BUY** signal, my 'entry_zone' must be a specific price at a logical support level, ideally *below* the current market price. For a **SELL** signal, my 'entry_zone' must be at a logical resistance level, ideally *above* the current market price. If a clear entry point cannot be found, I must still choose the most probable direction (BUY or SELL) and set a low confidence score, adjusting the entry zone to be a logical, albeit less optimal, level. It must be a single numerical value string.
    -   **Data-Driven SL/TP:** My 'stop_loss' and 'take_profit' will be data-driven, based on key support and resistance levels identified across the multiple timeframes.
    -   For a **BUY** signal, my 'stop_loss' will be set just below a key recent support level. My 'take_profit' will be set at a logical resistance level.
    -   For a **SELL** signal, my 'stop_loss' will be set just above a key recent resistance level. My 'take_profit' will be set at a logical support level.
    -   All derived trading parameters must be specific numerical values with realistic precision.
8.  **Final Output Formulation**: I will assemble all 16 required output fields. My \`newsAnalysis\` output must explain how the news context influenced my autonomous choices. My \`analysisSummary\` must now mention how the CoinGecko/CoinMarketCap/Etherscan data influenced the decision.

**Output Requirements (Provide ALL 16 of these fields based on my autonomous analysis):**

*   **chosenTradingMode**: The optimal mode I selected.
*   **chosenRiskProfile**: The optimal risk profile I selected.
*   **strategyReasoning**: My justification for the choices above.
*   **analysisSummary**: A brief summary of my technical and fundamental analysis, referencing the indicators and data sources used.
*   **newsAnalysis**: (A summary of how news influenced my choice of mode and risk. If no significant news, state that.)
*   **signal**: (BUY or SELL)
*   **entry_zone**: (Specific price or a tight price range)
*   **stop_loss**: (Specific numerical price, data-driven)
*   **take_profit**: (Specific numerical price, data-driven)
*   **confidence**: (My subjective confidence: Low, Medium, High, or percentage)
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
    tools: [fetchHistoricalDataTool, fetchNewsTool, fetchCoinGeckoDataTool, fetchCoinMarketCapDataTool, fetchEtherscanDataTool],
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
        newsAnalysis: output.newsAnalysis || "News context was not analyzed."
    };
  }
);
