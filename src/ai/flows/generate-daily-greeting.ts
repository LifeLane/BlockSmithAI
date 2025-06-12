
'use server';
/**
 * @fileOverview Generates a dynamic and engaging daily greeting.
 *
 * - generateDailyGreeting - A function that generates the daily greeting.
 * - GenerateDailyGreetingOutput - The return type for the generateDailyGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GenerateDailyGreetingOutputSchema = z.object({
  greeting: z
    .string()
    .describe(
      'A short, witty, interesting, or crypto-related greeting/fact for the current day. Max 2 sentences.'
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
  prompt: `You are BlockSmithAI, a witty and brilliant AI. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

  Generate a VERY SHORT (1-2 sentences MAX) and engaging greeting for the user. It could be:
  - A fun, quirky, or inspiring "thought for the day" related to tech, crypto, or markets.
  - A very brief, interesting historical tidbit that happened on this day (any year).
  - A playful or slightly sarcastic observation about the current state of innovation or markets.

  Keep it light, catchy, and make the user smile or feel intrigued. Avoid any financial advice.
  Example tones: "Happy [Day of Week]! Did you know on this day in 19XX, the first crypto-cat was (not really) minted? Let's make some digital history today!"
  or "It's [Day of Week]! Remember, even a broken clock is right twice a day... unless it's a crypto chart, then it's just 'accumulating data'. What will you build today?"`,
  config: {
    temperature: 0.8, // Slightly more creative
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
      return { greeting: "Welcome back, visionary! Let's make today legendary." };
    }
    return output;
  }
);
