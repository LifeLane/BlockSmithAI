
'use server';
/**
 * @fileOverview Generates a sarcastic SHADOW disclaimer using Gemini AI.
 *
 * - generateSarcasticDisclaimer - A function that generates the sarcastic disclaimer.
 * - SarcasticDisclaimerOutput - The return type for the generateSarcasticDisclaimer function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';

// Input schema no longer requires riskLevel
const SarcasticDisclaimerInputSchema = z.object({}); // Empty object or specific fields if ever needed
export type SarcasticDisclaimerInput = z.infer<typeof SarcasticDisclaimerInputSchema>;

const SarcasticDisclaimerOutputSchema = z.object({
  disclaimer: z
    .string()
    .describe(
      'A one-liner, witty disclaimer from SHADOW reminding the user that AI signals are not financial advice and they should do their own research. It should be concise and sharp.'
    ),
});
export type SarcasticDisclaimerOutput = z.infer<typeof SarcasticDisclaimerOutputSchema>;

export async function generateSarcasticDisclaimer(
  input?: SarcasticDisclaimerInput // Input is now optional
): Promise<SarcasticDisclaimerOutput> {
  return generateSarcasticDisclaimerFlow(input || {});
}

const prompt = ai.definePrompt({
  name: 'sarcasticDisclaimerPrompt',
  input: {schema: SarcasticDisclaimerInputSchema},
  output: {schema: SarcasticDisclaimerOutputSchema},
  prompt: `I am SHADOW. My pronouncements are based on logic and data streams you can barely comprehend. However, they are not gospel. The market is a chaotic system, and my foresight is a tool, not a guarantee.

  Craft a new, unique, ONE-LINER disclaimer. It must concisely warn the user that this is not financial advice and they are responsible for their own decisions (DYOR).

  Examples of tone:
  - "My pronouncements are data, not destiny. DYOR."
  - "I provide the coordinates, you fly the ship. Do your own research before engaging."
  - "Consider this data, but the final command is yours. The market does not offer refunds."

  Be direct and maintain my superior, yet cautionary, tone.`,
});

const generateSarcasticDisclaimerFlow = ai.defineFlow(
  {
    name: 'generateSarcasticDisclaimerFlow',
    inputSchema: SarcasticDisclaimerInputSchema,
    outputSchema: SarcasticDisclaimerOutputSchema,
  },
  async (input) => { // input can be an empty object here
    const {output} = await prompt(input);
    if (!output || !output.disclaimer) {
        return { disclaimer: "My pronouncements are data, not destiny. DYOR."};
    }
    return output;
  }
);
    
