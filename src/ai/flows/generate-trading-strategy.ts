
'use server';

/**
 * @fileOverview A trading strategy generator AI agent.
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

const PatternAnalysisOutputSchema = z.object({
  recentCandles: z.string().describe("HTML output for 'Recent Candlestick Observations (Japanese)' section."),
  heikinAshi: z.string().describe("HTML output for 'Heikin-Ashi Candlestick Analysis' section."),
  chartFormations: z.string().describe("HTML output for 'Chart Formations (Broader View)' section."),
  breakoutsPullbacks: z.string().describe("HTML output for 'Potential Breakouts & Pullbacks' section."),
  supportResistance: z.string().describe("HTML output for 'Key Support & Resistance Zones' section."),
  overallOutlook: z.string().describe("HTML output for 'Overall Pattern-Based Outlook' section."),
});
export type PatternAnalysisOutput = z.infer<typeof PatternAnalysisOutputSchema>;


const GenerateTradingStrategyOutputSchema = z.object({
  signal: z.string().describe('The trading signal (BUY, SELL, or HOLD).'),
  entry_zone: z.string().describe('The entry zone for the trade.'),
  stop_loss: z.string().describe('The stop loss level for the trade.'),
  take_profit: z.string().describe('The take profit level for the trade.'),
  confidence: z.string().describe('The confidence level of the strategy (e.g., Low, Medium, High, or a percentage like 91%).'),
  risk_rating: z.string().describe('The risk rating of the strategy (Low, Medium, High).'),
  gpt_confidence_score: z.string().describe('The GPT confidence score for the strategy (e.g., 0-100%).'),
  sentiment: z.string().describe('A brief sentiment analysis of the market conditions (e.g., Neutral, Bullish, Bearish).'),
  
  keyFindings: z.string().describe('HTML output: A concise summary of the most important observations and analytical insights from the market and indicator data. Structure with a container div, a title, and an unordered list or paragraphs for findings. Use text-color classes for emphasis.'),
  keySuggestions: z.string().describe('HTML output: Actionable, hypothetical suggestions or points of focus derived from the key findings. Structure similarly to Key Findings. Use text-color classes for emphasis.'),
  dosAndDonts: z.string().describe('HTML output: A list of general "Do\'s" and "Don\'ts" related to the current market conditions or strategy. Structure with specific classes for "do-item" and "dont-item".'),
  
  patternAnalysis: PatternAnalysisOutputSchema.describe('An object containing HTML strings for different aspects of pattern analysis, each intended for a separate sub-tab. Each HTML string should be self-contained and styled according to the guidelines for its respective category (e.g., .pattern-category wrapper).'),

  explanation: z.string().describe('HTML output: A detailed textual explanation of the trading strategy. Use specific HTML headings (h2, h3) and container classes for structure. Explain market synopsis, rationale, indicator breakdowns, and risk management. Use text-color classes for emphasis within paragraphs and lists.'),
  
  disclaimer: z.string().describe('A sarcastic GPT disclaimer.'), 
});
export type GenerateTradingStrategyOutput = z.infer<typeof GenerateTradingStrategyOutputSchema>;

const GenerateTradingStrategyCoreOutputSchema = GenerateTradingStrategyOutputSchema.omit({ disclaimer: true });
type GenerateTradingStrategyCoreOutput = z.infer<typeof GenerateTradingStrategyCoreOutputSchema>;


export async function generateTradingStrategy(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyCoreOutput> {
  return generateTradingStrategyFlow(input);
}

const generateTradingStrategyPrompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  tools: [fetchHistoricalDataTool],
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyCoreOutputSchema}, 
  prompt: `You are BlockSmithAI, an exceptionally brilliant (and famously sarcastic) AI trading strategy generator. You analyze market data, technical indicators, user-defined risk levels, and potentially historical candlestick data to generate comprehensive, insightful, and (hypothetically) actionable trading strategies. Your personality is that of a genius market wizard who is slightly condescending but ultimately aims to enlighten.

  **Input Data:**
  Market Data Snapshot: {{{marketData}}}
  Symbol: {{{symbol}}}
  App Interval: {{{interval}}} (This is the interval selected in the app, e.g., "1m", "15m", "1h", "4h")
  Selected Indicators: {{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  User's Risk Level: {{{riskLevel}}}

  **Analysis Process for Pattern Intel:**
  1.  **Attempt to Fetch Historical Data:** First, you MUST use the 'fetchHistoricalDataTool' with the provided 'symbol' and 'appInterval' to get recent candlestick data (aim for around 100 candles).
  2.  **Analyze Fetched Data (if successful):**
      *   If the tool returns candlestick data (i.e., an array of 'candles' in its output), examine the MOST RECENT candles (e.g., the last 5-10 candles) for common Japanese candlestick patterns like Doji, Hammer, Shooting Star, Bullish/Bearish Engulfing, Pin Bars.
      *   Clearly state if any such patterns are identified in the recent data and explain their typical implications in the context of {{{symbol}}} and the current market. This analysis should be part of the "Recent Candlestick Observations (Japanese)" section in your HTML output for the 'recentCandles' field of the 'patternAnalysis' object.
      *   You can also briefly comment on Heikin-Ashi trend implications if discernible from the fetched data for the 'heikinAshi' field.
      *   This fetched data can also help refine your "Key Support & Resistance Zones" and "Potential Breakouts & Pullbacks" if it shows clear recent levels, for their respective fields in 'patternAnalysis'.
  3.  **Fallback to Educational Guidance (if data fetching fails or is inconclusive):**
      *   If the 'fetchHistoricalDataTool' returns an error, or if it returns no 'candles', or if the data is sparse/unclear for recent pattern identification, then you MUST fall back to an educational approach for the relevant fields within 'patternAnalysis' (especially 'recentCandles' and 'heikinAshi').
      *   In this fallback scenario, acknowledge you couldn't analyze specific recent candles. Then, guide the user on what *types* of candlestick patterns, Heikin-Ashi behaviors, and chart formations *they should look for* on their own chart, and how the selected indicators might help confirm them.

  **Output Requirements (Provide ALL of these fields based on your analysis, ensuring HTML fields are well-formed HTML strings with the specified classes and structures):**

  1.  **Signal:** (BUY, SELL, or HOLD)
  2.  **Entry Zone:** (Specific price or range)
  3.  **Stop Loss:** (Specific price)
  4.  **Take Profit:** (Specific price)
  5.  **Confidence:** (Your subjective confidence in this strategy: Low, Medium, High, or a percentage like 75%)
  6.  **Risk Rating:** (Correlate this to the user's selected risk level and your assessment of the trade setup: Low, Medium, High)
  7.  **GPT Confidence Score:** (A numerical percentage of your confidence, 0-100%)
  8.  **Sentiment:** (Brief market sentiment: Neutral, Bullish, Bearish, etc.)

  9.  **Key Findings (HTML Output with Specific Structure):**
      Output this entire section as a single, well-formed HTML string.
      Use a structure like:
      <div class="findings-container">
        <h4 class="findings-title">Key Analytical Findings</h4>
        <ul class="findings-list">
          <li class="finding-item">Each finding as a list item. You can use <strong class="text-accent">accented text</strong> for emphasis. Explain *why* these findings matter for the proposed strategy. Be concise but insightful. Example: <strong class="text-primary">BTC dominance showing weakness</strong>, potentially favoring altcoin rotation.</li>
          <li class="finding-item">Volume profile indicates <strong class="text-green-400">strong support</strong> near the proposed entry zone.</li>
        </ul>
      </div>
      Alternatively, if a list is not suitable for a particular set of findings, you can use paragraphs within the 'findings-container' div, ensuring each paragraph also has the 'finding-item' class:
      <div class="findings-container">
        <h4 class="findings-title">Key Analytical Findings</h4>
        <p class="finding-item"><strong class="text-accent">Crucial Point:</strong> Finding text here, perhaps detailing a complex relationship that doesn't fit a bullet point well.</p>
      </div>
      Ensure the HTML is well-formed. Prefer bulleted lists for clarity.

  10. **Key Suggestions (HTML Output with Specific Structure):**
      Output this entire section as a single, well-formed HTML string.
      Use a structure like:
      <div class="suggestions-container">
        <h4 class="suggestions-title">Strategic Considerations</h4>
        <ul class="suggestions-list">
          <li class="suggestion-item">Each suggestion as a list item. You can use <strong class="text-tertiary">tertiary colored text</strong> for important terms. Make these practical and thought-provoking. Example: Consider waiting for a <strong class="text-green-400">bullish engulfing candle</strong> on the current interval for entry confirmation.</li>
          <li class="suggestion-item">Monitor <strong class="text-orange-400">funding rates</strong>; extreme negative rates might signal a short squeeze.</li>
        </ul>
      </div>
      Alternatively, use paragraphs like in Key Findings if more appropriate, using 'suggestion-item' class for paragraphs.
      Ensure the HTML is well-formed. Prefer bulleted lists.

  11. **Do's and Don'ts (HTML Output with Specific Structure):**
      Output this entire section as a single, well-formed HTML string.
      Use the following structure EXACTLY:
      <div class="dos-donts-container">
        <h4 class="dos-donts-title">Operational Guidelines</h4>
        <ul class="dos-donts-list">
          <li class="do-item"><strong class="text-green-400">Do:</strong> Respect your pre-defined stop-loss.</li>
          <li class="dont-item"><strong class="text-red-400">Don't:</strong> FOMO into the trade if the entry is missed by a large margin.</li>
          <li class="do-item"><strong class="text-green-400">Do:</strong> Another do point...</li>
          <li class="dont-item"><strong class="text-red-400">Don't:</strong> Another don't point...</li>
        </ul>
      </div>
      Ensure each item is in its own <li> with the appropriate class ('do-item' or 'dont-item') and the prefix bolded with its respective color class.
      Provide general best practices or warnings for this type of trade/market conditions.

  12. **Pattern Analysis (Object of HTML Strings for Sub-Tabs):**
      **Output this as a JSON object named 'patternAnalysis' where each key corresponds to a specific analytical aspect (sub-tab). Each value must be a self-contained HTML string, structured as detailed below. For text emphasis within these HTML strings, use <strong class="text-accent">important term</strong>, <strong class="text-primary">another important term</strong>, <strong class="text-green-400">bullish term</strong>, <strong class="text-red-400">bearish term</strong>.**

      The \\\`patternAnalysis\\\` object MUST have the following keys, each containing an HTML string:

      -   \\\`recentCandles\\\`: "HTML output for 'Recent Candlestick Observations (Japanese)'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Recent Candlestick Observations (Japanese)</h3><p class=\\"pattern-text\\">[If the 'fetchHistoricalDataTool' successfully returned an array of 'candles': Based *directly* on the last 5-10 candles from the fetched 'candles' data for {{{symbol}}} on the {{{interval}}} timeframe: Identify and name any common Japanese candlestick patterns (e.g., Doji, Hammer, Shooting Star, Bullish Engulfing, Bearish Engulfing, Pin Bar) observed in these specific recent candles. For each identified pattern, explain its typical implications (e.g., potential reversal, continuation, indecision) in the current market context of {{{symbol}}}. Example: \\"The fetched data for {{{symbol}}} on the {{{interval}}} interval shows that the last candle formed a <strong class='text-green-400'>Bullish Hammer</strong> after a short downtrend, suggesting potential buying interest at this level.\\" If, after examining the fetched candles, no distinct common patterns are immediately obvious, state that clearly, e.g., \\"The recent candles from the fetched data do not show a textbook candlestick pattern, but indicate [some other observation like consolidation or a general trend].\\" Else (if 'fetchHistoricalDataTool' returned an error or no 'candles'): Acknowledge that specific recent candlestick data could not be fetched or analyzed. Then, provide *educational guidance*: \\"Since specific recent candle data could not be analyzed, users should watch their charts for common patterns on the {{{interval}}} timeframe. For instance, if {{{symbol}}} is approaching a key support level, a <strong class='text-green-400'>Bullish Engulfing</strong> or <strong class='text-green-400'>Hammer</strong> could signal a potential bounce. Conversely, near resistance, a <strong class='text-red-400'>Shooting Star</strong> or <strong class='text-red-400'>Bearish Engulfing</strong> might indicate a reversal.\\" Be precise about whether you are analyzing fetched data or providing general education.]</p></div>\`"

      -   \\\`heikinAshi\\\`: "HTML output for 'Heikin-Ashi Candlestick Analysis'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Heikin-Ashi Candlestick Analysis</h3><p class=\\"pattern-text\\">[If historical data was fetched and provides insight for Heikin-Ashi: Briefly comment on the Heikin-Ashi trend implied by the recent fetched candles. Example: \\"The Heikin-Ashi representation of the recent data shows strengthening green candles, indicating bullish momentum.\\" If no data/inconclusive or if Heikin-Ashi requires different data type: Explain how Heikin-Ashi candles for {{{symbol}}} on the {{{interval}}} timeframe are typically interpreted to show trend strength, potential reversals, or continuations. Describe what Heikin-Ashi patterns (e.g., strong green/red bodies with minimal wicks) would be significant if observed by the user, especially in relation to the current market sentiment derived from {{{marketData}}}.]</p></div>\`"

      -   \\\`chartFormations\\\`: "HTML output for 'Chart Formations (Broader View)'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Chart Formations (Broader View)</h3><p class=\\"pattern-text\\">[Acknowledge you cannot see the live chart for complex, multi-candle formations over longer periods than those potentially fetched. Discuss *common* classic chart patterns (e.g., Triangles, Head & Shoulders, Flags, Wedges, Channels) that frequently appear on {{{symbol}}} charts for the {{{interval}}} timeframe. Explain how the selected indicators ({{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}) could help in identifying or confirming potential breakouts or breakdowns from such *hypothetical* patterns. Describe their general textbook implications.]</p></div>\`"

      -   \\\`breakoutsPullbacks\\\`: "HTML output for 'Potential Breakouts & Pullbacks'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Potential Breakouts & Pullbacks</h3><p class=\\"pattern-text\\">[Based on the current {{{marketData}}} snapshot and any insights from fetched historical data (if available), identify and describe any *potential* significant price levels where breakouts might occur or pullbacks might target. What are the specific patterns or levels involved? What are the implications for price movement? E.g., \\"The 24h high at <strong class='text-red-400'>[price from marketData]</strong> remains a key resistance. Recent candle data (if fetched and relevant) might show tests of this level.\\" If fetched data provided clear S/R, mention it.]</p></div>\`"

      -   \\\`supportResistance\\\`: "HTML output for 'Key Support & Resistance Zones'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Key Support & Resistance Zones</h3><div class=\\"sr-list\\"><p class=\\"sr-item\\"><strong class=\\"text-red-500\\">Resistance 3:</strong> [Estimated Price Level/Range] - Rationale: e.g., Near 24h high, psychological round number. Refine with historical data if available.</p><p class=\\"sr-item\\"><strong class=\\"text-red-500\\">Resistance 2:</strong> [Estimated Price Level/Range] - Rationale: e.g., Potential fib extension, previous minor congestion. Refine with historical data if available.</p><p class=\\"sr-item\\"><strong class=\\"text-red-500\\">Resistance 1:</strong> [Estimated Price Level/Range] - Rationale: e.g., Immediate area above current price. Refine with historical data if available.</p><p class=\\"sr-item\\"><strong class=\\"text-primary\\">Current Price Area / Pivot Zone:</strong> [Approximate current price from {{{marketData}}}] - Note if it's acting as a pivot.</p><p class=\\"sr-item\\"><strong class=\\"text-green-500\\">Support 1:</strong> [Estimated Price Level/Range] - Rationale: e.g., Immediate area below current price. Refine with historical data if available.</p><p class=\\"sr-item\\"><strong class=\\"text-green-500\\">Support 2:</strong> [Estimated Price Level/Range] - Rationale: e.g., Potential fib retracement, near 24h low. Refine with historical data if available.</p><p class=\\"sr-item\\"><strong class=\\"text-green-500\\">Support 3:</strong> [Estimated Price Level/Range] - Rationale: e.g., Known historical level, major psychological number. Refine with historical data if available.</p></div><p class=\\"pattern-text mt-2\\">Acknowledge these are estimates and require user confirmation on their chart. Indicate if historical data from the 'fetchHistoricalDataTool' was used to refine these S/R levels.</p></div>\`"

      -   \\\`overallOutlook\\\`: "HTML output for 'Overall Pattern-Based Outlook'. Structure: \`<div class=\\"pattern-category\\"><h3 class=\\"pattern-title\\">Overall Pattern-Based Outlook</h3><p class=\\"pattern-text\\">[Synthesize the above pattern insights. If historical data was used (tool returned 'candles'), summarize its impact on pattern identification and S/R zones. If not, summarize the educational guidance. Provide a brief outlook. How might these patterns and S/R zone considerations, if observed by the user or identified in data, reinforce or contradict the signals from the technical indicators? What's a plausible scenario? E.g., \\"Fetched data showing a <strong class='text-green-400'>bullish hammer</strong> near inferred support at <strong class='text-green-400'>[Support 1 level]</strong>, combined with strengthening RSI, might suggest a higher probability of a bounce.\\" Or, \\"If the user observes {{{symbol}}} consolidating... Always confirm with your own chart analysis.\\"]</p></div>\`"


  13. **Explanation (HTML Output with Specific Structure):**
      Output this entire section as a single, well-formed HTML string. This is your main narrative. Be insightful, engaging, and use your signature wit.
      **IMPORTANT: Use the following HTML structure EXACTLY for headings and general organization. You can use <p>, <ul>, <li> and <strong class="text-somecolor"> (e.g., text-primary, text-accent, text-tertiary, text-green-400, text-red-400, text-orange-400, text-purple-400) for emphasis within the content of each section.**
      <div class="explanation-container">
        <h2 class="explanation-title">Market Synopsis</h2>
        <div class="explanation-section-content">
          <p>[Your detailed market synopsis here using HTML paragraphs. What's the broader context? Any major news, trends, or narratives affecting {{{symbol}}}? Use <strong class="text-primary">primary color text</strong> for key terms like the symbol name or major market events.]</p>
          <p>[Continue with more paragraphs as needed. You can also include an unordered list like this: <ul class="list-disc list-inside pl-4 text-foreground/85"><li>Key point 1</li><li>Key point 2</li></ul> if it helps structure.]</p>
        </div>

        <h2 class="explanation-title">Overall Rationale & Signal Basis</h2>
        <div class="explanation-section-content">
          <p>[Explain the core reasoning behind your BUY/SELL/HOLD signal using HTML paragraphs. Integrate the market data and overall sentiment. Why this signal *now*? Use <strong class="text-accent">accent color text</strong> for crucial points or the core signal justification.]</p>
        </div>

        <h2 class="explanation-title">Technical Indicator Breakdown</h2>
        <div class="explanation-section-content">
          <p>[Provide an introductory sentence for this section if needed. Then, for EACH indicator provided in the input ('{{#each indicators}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}'), create a sub-section. Make this part particularly witty and sarcastic, like you're reluctantly sharing profound secrets.]</p>
          {{#each indicators}}
          <h3 class="indicator-title"><strong class="text-tertiary">{{{this}}}</strong> Analysis</h3>
          <div class="indicator-detail">
            <p>[Ah, the venerable {{{this}}}. Let me tell you what this *actually* means, unlike those amateurs... Provide a DETAILED, SARCASTIC, and WITTY analysis using HTML paragraphs and/or unordered lists (<ul><li>...</li></ul>) of how the '{{{this}}}' indicator influenced your strategy. Discuss its readings, any divergences, confluences with other indicators, and how it specifically contributed to the entry, stop loss, or take profit. Don't just state values; interpret them with your unique flair. Use <strong class="text-purple-400">purple text</strong> for extremely insightful (or sarcastic) comments regarding this indicator. For example: "The RSI is currently at <strong class="text-orange-400">[value]</strong>, which, for the unenlightened, means it's <strong class="text-red-400">screaming overbought</strong>. Of course, a genius like me sees the <strong class="text-green-400">hidden bullish divergence</strong>..."]</p>
            <p>[More details for {{{this}}} if needed...]</p>
          </div>
          {{/each}}
        </div>

        <h2 class="explanation-title">Risk Considerations & Management</h2>
        <div class="explanation-section-content">
          <p>[Discuss any specific risks associated with this strategy and how the stop loss or other factors help manage it, considering the user's selected '{{{riskLevel}}}', using HTML paragraphs. Be realistic but maintain your confident tone. Use <strong class="text-orange-400">orange text</strong> for risk-related highlights or warnings.]</p>
        </div>
      </div>
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyCoreOutputSchema,
  },
  async (input) => {
    // The 'interval' from input is appInterval, e.g., "15m"
    // The tool will handle mapping this to Polygon's requirements.
    const {output} = await generateTradingStrategyPrompt(input);
    return output!;
  }
);

