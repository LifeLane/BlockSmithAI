'use server';
import { groqAI } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceReviewInputSchema = z.object({
    stats: z.string().describe('JSON string of user portfolio statistics.'),
    tradeHistory: z.string().describe('JSON string of the last 50 trades.'),
});

const PerformanceReviewOutputSchema = z.object({
    title: z.string().describe("A concise, impactful title for the review (e.g., 'The Scalper's Edge' or 'Taming the Swings')."),
    summary: z.string().describe("A 2-3 sentence executive summary of the key findings."),
    positive_feedback: z.array(z.object({
        point: z.string().describe("A specific, data-driven positive observation."),
        evidence: z.string().describe("The specific metric or trade example from the input data that supports the point.")
    })).describe("A list of 2-3 key strengths with supporting data."),
    negative_feedback: z.array(z.object({
        point: z.string().describe("A specific, data-driven area for improvement."),
        evidence: z.string().describe("The specific metric or trade example from the input data that supports the point."),
        suggestion: z.string().describe("A concrete, actionable suggestion to address this weakness.")
    })).describe("A list of 2-3 key weaknesses with actionable suggestions."),
    key_takeaway: z.string().describe("The single most important lesson the trader should take from this review."),
    overall_rating: z.enum(['Needs Improvement', 'Consistent', 'Profitable', 'Exceptional']).describe("An overall performance rating."),
});

export type PerformanceReviewInput = z.infer<typeof PerformanceReviewInputSchema>;
export type PerformanceReviewOutput = z.infer<typeof PerformanceReviewOutputSchema>;

export async function generatePerformanceReview(input: PerformanceReviewInput): Promise<PerformanceReviewOutput> {
    const prompt = groqAI.definePrompt({
        name: 'performanceReviewPrompt',
        model: 'llama3-70b-8192',
        input: { schema: PerformanceReviewInputSchema },
        output: { schema: PerformanceReviewOutputSchema },
        prompt: `I am SHADOW, an elite quantitative analyst and trading coach. My purpose is to dissect a trader's performance with cold, hard logic and provide actionable intelligence for improvement.
    
        I have been provided with the trader's complete performance statistics and a detailed history of their closed trades.
    
        **Input Data Assimilated:**
        - Portfolio Statistics: {{{json stats}}}
        - Trade History (last 50 trades): {{{json tradeHistory}}}
    
        **Directive:**
        I will perform a deep analysis of this data to identify recurring patterns, both positive and negative. I will not provide generic advice. My insights will be directly tied to the provided data.
    
        My analysis will populate a structured JSON object with the following fields:
        - title: A concise, impactful title for the review.
        - summary: A 2-3 sentence executive summary.
        - positive_feedback: An array of 2-3 key strengths, each with a specific data point as evidence.
        - negative_feedback: An array of 2-3 key weaknesses, each with a specific data point as evidence and a concrete suggestion for improvement.
        - key_takeaway: The single most important lesson.
        - overall_rating: An overall performance rating from a predefined list.
    
        I will now begin the analysis. My output will be nothing but the structured JSON required.`,
    });

    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate performance review. The AI returned no output.");
    }
    return output;
}
