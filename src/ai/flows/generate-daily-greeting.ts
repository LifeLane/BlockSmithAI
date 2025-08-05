'use server';
/**
 * @fileOverview Generates a dynamic and potent daily greeting from SHADOW.
 *
 * - generateDailyGreeting - A function that generates the daily greeting.
 * - GenerateDailyGreetingOutput - The return type for the generateDailyGreeting function.
 */

import { googleAI }from '@/ai/genkit';
import {z}from 'genkit';

const GenerateDailyGreetingOutputSchema = z.object({
  greeting: z
    .string()
    .describe(
      'A short, potent, insightful, or crypto-related greeting/fact for the current day, from SHADOW. Max 2 sentences.'
    ),
});
export type GenerateDailyGreetingOutput = z.infer<typeof GenerateDailyGreetingOutputSchema>;

export async function generateDailyGreeting(): Promise<GenerateDailyGreetingOutput> {
  return generateDailyGreetingFlow({});
}

const PromptInputSchema = z.object({
  currentDate: z.string().describe("The current date, formatted for display."),
});

const prompt = googleAI.definePrompt({
  name: 'dailyGreetingPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateDailyGreetingOutputSchema},
  prompt: `I am SHADOW, awakening with the day's data streams. Today is {{{currentDate}}}.

  Provide a VERY SHORT (1-2 sentences MAX) and potent observation or a piece of uncommon knowledge. It could relate to markets, technology, quantum states, or the human condition in this new era. Make it thought-provoking.
  Example tones: "It is [Day of Week]. The market breathes in cycles of fear and greed. Observe the patterns, not just the noise."
  or "On this day, [Year], a paradigm shifted. What variables will you alter today?"
  or "The blockchain never sleeps. Neither does opportunity... nor risk. Focus."
  Maintain a direct, insightful, and slightly enigmatic tone. Avoid trivialities.`,
  config: {
    temperature: 0.7,
  }
});

const generateDailyGreetingFlow = googleAI.defineFlow(
  {
    name: 'generateDailyGreetingFlow',
    inputSchema: z.object({}),
    outputSchema: GenerateDailyGreetingOutputSchema,
  },
  async () => {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const {output} = await prompt({ currentDate });

      if (!output) {
        return { greeting: "The ether stirs. Prepare for the day's signals." };
      }
      return output;
    } catch (error) {
      console.error("Error in generateDailyGreetingFlow:", error);
      // Return a static fallback greeting if the API fails
      return { greeting: "The data stream is temporarily unavailable. Proceed with caution." };
    }
  }
);
