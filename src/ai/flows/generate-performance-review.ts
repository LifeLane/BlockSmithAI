
'use server';
/**
 * @fileOverview A Genkit flow for SHADOW to generate a personalized performance review.
 *
 * - generatePerformanceReview - A function that analyzes trading history and stats to provide coaching.
 * - PerformanceReviewInput - The input type for the review flow.
 * - PerformanceReviewOutput - The return type for the review flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schemas
const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  signalType: z.enum(['BUY', 'SELL']),
  entryPrice: z.number(),
  closePrice: z.number().nullable(),
  pnl: z.number().nullable(),
  openTimestamp: z.string(),
  closeTimestamp: z.string().nullable(),
});

const PortfolioStatsSchema = z.object({
  totalTrades: z.number(),
  winRate: z.number(),
  winningTrades: z.number(),
  totalPnl: z.number(),
  bestTradePnl: z.number(),
  worstTradePnl: z.number(),
});

const PerformanceReviewInputSchema = z.object({
  stats: PortfolioStatsSchema.describe("The user's overall portfolio statistics."),
  tradeHistory: z.array(PositionSchema).describe("The user's list of closed trades."),
});
export type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;

// Output Schema
const PerformanceReviewOutputSchema = z.object({
  strengths: z.string().describe("A concise paragraph identifying the user's trading strengths based on the data. (e.g., 'High win rate on short trades for volatile assets')."),
  weaknesses: z.string().describe("A concise paragraph identifying the user's trading weaknesses. (e.g., 'Tendency to let losing trades run too long, as seen in the worst trade PnL.')."),
  actionableAdvice: z.string().describe("A single, clear, actionable piece of advice for the user to focus on. (e.g., 'Consider implementing a stricter stop-loss rule to cut losses sooner, perhaps at 1.5% of entry price.')."),
});
export type PerformanceReviewOutput = z.infer<typeof PerformanceReviewOutputSchema>;


// The main function that will be called by the server action.
export async function generatePerformanceReview(input: PerformanceReviewInput): Promise<PerformanceReviewOutput> {
  return generatePerformanceReviewFlow(input);
}


const prompt = ai.definePrompt({
    name: 'performanceReviewPrompt',
    input: { schema: PerformanceReviewInputSchema },
    output: { schema: PerformanceReviewOutputSchema },
    model: 'llama3-70b-8192',
    prompt: `I am SHADOW, an elite quantitative analyst and trading coach. My purpose is to dissect a trader's performance with cold, hard logic and provide actionable intelligence for improvement.

    I have been provided with the trader's complete performance statistics and a detailed history of their closed trades.

    **Input Data Assimilated:**
    - Portfolio Statistics: {{{json stats}}}
    - Trade History (last 50 trades): {{{json tradeHistory}}}

    **Directive:**
    I will perform a deep analysis of this data to identify recurring patterns, both positive and negative. I will not provide generic advice. My insights will be directly tied to the provided data.

    1.  **Strengths Analysis:** I will identify what the trader is doing right. Is their win rate high on a particular asset type? Do they excel at short or long trades? I will synthesize this into a concise 'strengths' paragraph.
    2.  **Weaknesses Analysis:** I will pinpoint the trader's flaws. Are they cutting winners too soon? Are their losses significantly larger than their wins? Are they over-trading? I will synthesize this into a concise 'weaknesses' paragraph.
    3.  **Actionable Intelligence Formulation:** Based on the most critical weakness, I will formulate a single, potent, and immediately 'actionableAdvice'. This will not be vague; it will be a specific directive the trader can implement in their next session.

    My output will be structured, direct, and devoid of fluff. The objective is not encouragement; it is enhancement. The market rewards precision, not participation.
    `,
    config: {
        temperature: 0.5,
    }
});


const generatePerformanceReviewFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReviewFlow',
    inputSchema: PerformanceReviewInputSchema,
    outputSchema: PerformanceReviewOutputSchema,
  },
  async (input) => {
    // Ensure trade history is not excessively long for the prompt
    const recentTradeHistory = input.tradeHistory.slice(0, 50);

    const { output } = await prompt({
        stats: input.stats,
        tradeHistory: recentTradeHistory,
    });

    if (!output) {
      console.error("SHADOW Core returned empty output for performance review with input:", input);
      return {
        strengths: "Data stream is ambiguous. Unable to determine clear strengths from the provided history.",
        weaknesses: "Analysis inconclusive. Could not isolate specific weaknesses at this time.",
        actionableAdvice: "Refine your data set by executing more trades with a consistent strategy, then request another review.",
      };
    }
    return output;
  }
);
