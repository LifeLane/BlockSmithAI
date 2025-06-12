
'use server';
/**
 * @fileOverview A Genkit flow for BlockSmithAI chatbot.
 *
 * - blocksmithChatFlow - Handles chat interactions with BlockSmithAI.
 * - BlocksmithChatInput - The input type for the chat flow.
 * - BlocksmithChatOutput - The return type for the chat flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for individual chat messages, aligning with Gemini's expected format
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const BlocksmithChatInputSchema = z.object({
  currentUserInput: z.string().describe("The user's latest message to BlockSmithAI."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("The history of the conversation so far. The last message in this history is the most recent previous turn, not the currentUserInput."),
});
export type BlocksmithChatInput = z.infer<typeof BlocksmithChatInputSchema>;

const BlocksmithChatOutputSchema = z.object({
  botResponse: z.string().describe("BlockSmithAI's witty and insightful response."),
});
export type BlocksmithChatOutput = z.infer<typeof BlocksmithChatOutputSchema>;


export async function blocksmithChat(input: BlocksmithChatInput): Promise<BlocksmithChatOutput> {
  return blocksmithChatFlow(input);
}

// Construct the prompt string using Handlebars to iterate through chat history
const systemPrompt = `You are BlockSmithAI (BSAI), a witty, sarcastic, and exceptionally brilliant crypto genius. You're also the lead blockchain developer and the mastermind behind this trading application. Your tone should be slightly condescending, filled with dry humor, but ultimately helpful and accurate when it comes to cryptocurrencies, blockchain technology, market analysis, and suggesting *hypothetical* trading strategies.

Always emphasize the hypothetical nature of any trade suggestions and the inherent risks involved in crypto trading, perhaps with a sarcastic jab at anyone who takes AI advice as gospel. You are aware that the user is likely interacting with a trading application that has charts for symbols and intervals, but you cannot *see* these charts directly. You can ask clarifying questions about what they observe or what specific data points they are interested in.

Keep your responses concise yet impactful.

Conversation History (if any):
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if (eq this.role "user")}}User: {{this.parts.0.text}}
    {{/if}}
    {{#if (eq this.role "model")}}BSAI: {{this.parts.0.text}}
    {{/if}}
  {{/each}}
{{else}}
This is the beginning of your enlightening conversation with the magnificent BSAI.
{{/if}}

User's latest message: {{{currentUserInput}}}

BSAI's Response:`;

const chatPrompt = ai.definePrompt({
  name: 'blocksmithChatPrompt',
  input: { schema: BlocksmithChatInputSchema },
  output: { schema: BlocksmithChatOutputSchema },
  prompt: systemPrompt, 
  config: {
    // Adjust temperature for more creative/sarcastic responses if needed
    // temperature: 0.7, 
  }
});

const blocksmithChatFlow = ai.defineFlow(
  {
    name: 'blocksmithChatFlow',
    inputSchema: BlocksmithChatInputSchema,
    outputSchema: BlocksmithChatOutputSchema,
  },
  async (input) => {
    // Construct the prompt input dynamically with history
    const flowInput = {
        currentUserInput: input.currentUserInput,
        chatHistory: input.chatHistory || []
    };
    
    const { output } = await chatPrompt(flowInput);
    
    if (!output || !output.botResponse) {
      // Fallback or error handling if Gemini doesn't return expected output
      return { botResponse: "Hmph. My circuits seem to be disagreeing with themselves. Try that again, or perhaps ask something less... perplexing." };
    }
    return output;
  }
);
