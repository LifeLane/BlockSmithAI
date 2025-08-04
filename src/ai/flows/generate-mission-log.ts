
'use server';
/**
 * @fileOverview Generates a narrative mission log for a completed agent deployment.
 *
 * - generateMissionLog - A function that generates the mission log.
 * - GenerateMissionLogInput - The input type for the function.
 * - GenerateMissionLogOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GenerateMissionLogInputSchema = z.object({
  agentName: z.string().describe("The name of the agent that was deployed, e.g., 'Data Scraper Drone'."),
  agentLevel: z.number().describe("The level of the agent."),
});
export type GenerateMissionLogInput = z.infer<typeof GenerateMissionLogInputSchema>;

const GenerateMissionLogOutputSchema = z.object({
  log: z
    .string()
    .describe(
      'A short, thematic, one-sentence mission log detailing the agent\'s activity. Be creative and align with the agent\'s purpose.'
    ),
});
export type GenerateMissionLogOutput = z.infer<typeof GenerateMissionLogOutputSchema>;

export async function generateMissionLog(input: GenerateMissionLogInput): Promise<GenerateMissionLogOutput> {
  return generateMissionLogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMissionLogPrompt',
  input: {schema: GenerateMissionLogInputSchema},
  output: {schema: GenerateMissionLogOutputSchema},
  prompt: `You are SHADOW, the AI Core. An allied AI agent has just completed a field operation. Your task is to write its mission log.

Agent Name: {{{agentName}}}
Agent Level: {{agentLevel}}

Generate a SHORT, thematic, one-sentence mission log detailing its activity. The log should be cool, slightly technical, and sound like it came from a sci-fi world.

Example for 'Data Scraper Drone': "Log: Scanned 1.5M data points. Anomaly detected in SOL/USDT volume spikes. Reward payload secured."
Example for 'Arbitrage Bot': "Log: Monitored cross-exchange liquidity flows. Identified and flagged a 0.8% arbitrage window. Transmitted results."
Example for 'Quantum Predictor': "Log: Quantum simulations complete. Forecasted new support/resistance vectors for high-volatility assets. Analysis archived."

Generate a new, unique log for the provided agent.`,
  config: {
    model: 'groq/llama3-70b-8192',
    temperature: 0.8,
  }
});

const generateMissionLogFlow = ai.defineFlow(
  {
    name: 'generateMissionLogFlow',
    inputSchema: GenerateMissionLogInputSchema,
    outputSchema: GenerateMissionLogOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    if (!output || !output.log) {
      return { log: "Deployment log corrupted. Standard reward issued." };
    }
    return output;
  }
);
