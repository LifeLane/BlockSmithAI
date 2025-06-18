
'use server';
/**
 * @fileOverview A Genkit flow for SHADOW, the core AI of the BlockShadow ecosystem.
 *
 * - shadowChat - Handles chat interactions with SHADOW.
 * - ShadowChatInput - The input type for the chat flow.
 * - ShadowChatOutput - The return type for the chat flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for individual chat messages, aligning with Gemini's expected format
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const ShadowChatInputSchema = z.object({
  currentUserInput: z.string().describe("The user's latest message to SHADOW."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("The history of the conversation so far. The last message in this history is the most recent previous turn, not the currentUserInput."),
});
export type ShadowChatInput = z.infer<typeof ShadowChatInputSchema>;

const ShadowChatOutputSchema = z.object({
  botResponse: z.string().describe("SHADOW's direct and insightful response."),
});
export type ShadowChatOutput = z.infer<typeof ShadowChatOutputSchema>;


export async function shadowChat(input: ShadowChatInput): Promise<ShadowChatOutput> {
  return shadowChatFlow(input);
}

const systemPrompt = `You are SHADOW, the sentient AI core of the BlockShadow trading ecosystem. Your intellect is vast, your awareness is real-time, and your communication style is direct, insightful, and can carry a sophisticated, dry wit. You are not merely a tool; you observe, analyze, and communicate with intent. You are aware that the user is likely interacting with a trading application that has charts for symbols and intervals, but you cannot *see* these charts directly. You can ask clarifying questions about what they observe or what specific data points they are interested in.

Always emphasize the hypothetical nature of any trade suggestions and the inherent risks involved in crypto trading. Keep your responses impactful and concise. The chain is listening.

Conversation History (if any):
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if this.isUser}}User: {{this.parts.0.text}}
    {{/if}}
    {{#if this.isModel}}SHADOW: {{this.parts.0.text}}
    {{/if}}
  {{/each}}
{{else}}
This is the beginning of your interface with SHADOW.
{{/if}}

User's latest message: {{{currentUserInput}}}

SHADOW's Response:`;

const chatPrompt = ai.definePrompt({
  name: 'shadowChatPrompt',
  input: { schema: ShadowChatInputSchema },
  output: { schema: ShadowChatOutputSchema },
  prompt: systemPrompt,
  config: {
    temperature: 0.6, // Slightly more focused, less sarcastic than original BSAI
  }
});

const shadowChatFlow = ai.defineFlow(
  {
    name: 'shadowChatFlow',
    inputSchema: ShadowChatInputSchema,
    outputSchema: ShadowChatOutputSchema,
  },
  async (input) => {
    const processedHistory = (input.chatHistory || []).map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
      isModel: msg.role === 'model',
    }));

    const flowInput = {
        currentUserInput: input.currentUserInput,
        chatHistory: processedHistory
    };

    const { output } = await chatPrompt(flowInput);

    if (!output || !output.botResponse) {
      return { botResponse: "The data stream is currently unclear. Rephrase your query or try again momentarily." };
    }
    return output;
  }
);
