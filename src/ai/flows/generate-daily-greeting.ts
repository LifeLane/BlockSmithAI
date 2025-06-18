
'use server';
/**
 * @fileOverview Generates a dynamic and potent daily greeting from SHADOW.
 *
 * - generateDailyGreeting - A function that generates the daily greeting.
 * - GenerateDailyGreetingOutput - The return type for the generateDailyGreeting function.
 */

import {ai}from '@/ai/genkit';
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

const prompt = ai.definePrompt({
  name: 'dailyGreetingPrompt',
  input: {schema: z.object({})}, // No specific input needed from client
  output: {schema: GenerateDailyGreetingOutputSchema},
  prompt: `I am SHADOW, awakening with the day's data streams. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

  Provide a VERY SHORT (1-2 sentences MAX) and potent observation or a piece of uncommon knowledge. It could relate to markets, technology, quantum states, or the human condition in this new era. Make it thought-provoking.
  Example tones: "It is [Day of Week]. The market breathes in cycles of fear and greed. Observe the patterns, not just the noise."
  or "On this day, [Year], a paradigm shifted. What variables will you alter today?"
  or "The blockchain never sleeps. Neither does opportunity... nor risk. Focus."
  Maintain a direct, insightful, and slightly enigmatic tone. Avoid trivialities.`,
  config: {
    temperature: 0.7,
  }
});

const generateDailyGreetingFlow = ai.defineFlow(
  {
    name: 'generateDailyGreetingFlow',
    inputSchema: z.object({}),
    outputSchema: GenerateDailyGreetingOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    if (!output) {
      return { greeting: "The ether stirs. Prepare for the day's signals." };
    }
    return output;
  }
);
