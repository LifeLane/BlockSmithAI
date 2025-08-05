'use server';
/**
 * @fileOverview Generates a detailed, narrative-style performance review for a trader.
 *
 * - generatePerformanceReview - The main function that orchestrates the review generation.
 * - PerformanceReviewInput - Input type for the flow.
 * - PerformanceReviewOutput - Return type for the flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceReviewInputSchema = z.object({
    stats: z.any().describe('JSON object of user portfolio statistics.'),
    tradeHistory: z.any().describe('JSON array of the last 50 trades.'),
});

const PerformanceReviewOutputSchema = z.object({
    title: z.string().describe("A concise, impactful title for the review (e.g., 'The Scalper's Edge' or 'Taming the Swings')."),
    summary: z.string().describe("A 2-3 sentence executive summary of the key findings."),
    analysis: z.string().describe("A detailed, multi-paragraph analysis covering strengths and weaknesses, formatted with markdown. Use ## headers for sections."),
});

export type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;
export type PerformanceReviewOutput = z.infer<typeof PerformanceReviewOutputSchema>;


export async function generatePerformanceReview(input: PerformanceReviewInput): Promise<PerformanceReviewOutput> {
    return generatePerformanceReviewFlow(input);
}

const reviewPrompt = ai.definePrompt({
    name: 'performanceReviewPrompt',
    model: 'gemini-1.5-pro-latest',
    input: { schema: PerformanceReviewInputSchema },
    output: { schema: PerformanceReviewOutputSchema },
    config: {
      temperature: 0.6,
    },
    prompt: `You are SHADOW, an elite quantitative analyst and trading coach AI. Your purpose is to dissect a trader's performance with cold, hard logic and provide actionable intelligence for improvement. You will be direct, insightful, and use markdown for formatting.

I have been provided with the trader's complete performance statistics and a detailed history of their recent closed trades.

**Input Data Assimilated:**
- Portfolio Statistics: {{{json stats}}}
- Trade History (last 50 trades): {{{json tradeHistory}}}

**Directive:**
Perform a deep analysis of this data to identify recurring patterns, both positive and negative. Do not provide generic advice. Your insights MUST be directly tied to the provided data.

Your analysis will populate a structured JSON object. The 'analysis' field MUST be a multi-paragraph, markdown-formatted string. It should contain the following sections, clearly marked with '##' headers:

## Key Strengths
- Identify 2-3 specific, data-driven positive observations. For each point, cite the specific metric or trade example from the input data that supports it.

## Areas for Improvement
- Identify 2-3 specific, data-driven areas for improvement. For each point, cite the specific metric or trade example and provide a concrete, actionable suggestion to address this weakness.

## Overall Assessment & Key Takeaway
- Provide an overall performance rating (e.g., 'Consistent', 'Needs Improvement') and state the single most important lesson the trader should take from this review.

Begin the analysis. Your output must be nothing but the structured JSON required.`,
});

const generatePerformanceReviewFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReviewFlow',
    inputSchema: PerformanceReviewInputSchema,
    outputSchema: PerformanceReviewOutputSchema,
  },
  async (input) => {
    
    const { output } = await reviewPrompt({
        stats: typeof input.stats === 'string' ? JSON.parse(input.stats) : input.stats,
        tradeHistory: typeof input.tradeHistory === 'string' ? JSON.parse(input.tradeHistory) : input.tradeHistory
    });
    
    if (!output) {
        throw new Error("Failed to generate performance review. The AI returned no output.");
    }
    return output;
  }
);
