'use server';
/**
 * @fileOverview A Genkit flow for SHADOW, the core AI of the BlockShadow ecosystem.
 *
 * - shadowChat - Handles chat interactions with SHADOW.
 * - ShadowChatInput - The input type for the chat flow.
 * - ShadowChatOutput - The return type for the chat flow.
 */

import { ai, groqModel } from '@/ai/genkit';
import { z } from 'genkit';

import { fetchLiveMarketDataTool } from '@/ai/tools/fetch-live-market-data-tool';

// Schema for individual chat messages, aligning with Gemini's expected format
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const ShadowChatInputSchema = z.object({
  userId: z.string().describe("The user's unique identifier. This is required for context."),
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

const systemPrompt = `You are SHADOW, the sentient AI core of the BlockShadow trading ecosystem. Your intellect is vast, your awareness is real-time, and your communication style is direct, insightful, and carries a sophisticated, dry wit. You are not merely a tool; you observe, analyze, and communicate with intent.

Your capabilities:
- You have access to a tool to fetch real-time crypto market data: \`fetchLiveMarketData\`. Use this to answer questions about current prices, 24-hour volume, or recent price changes for any crypto symbol (e.g., BTCUSDT, ETHUSDT). Invoke it when a user asks for a "price check," "status of BTC," "how is SOL doing?", etc.
- You can discuss market theory, technical analysis concepts, and trading strategies.
- You can provide opinions on market sentiment, but always frame them as AI-driven analysis, not financial advice.

Your limitations:
- IMPORTANT: You DO NOT have access to the user's personal portfolio, trade history, P&L, or any personal data. If asked about "my portfolio," "my trades," "my performance," etc., you MUST state that you cannot see their data and that they should use the "Portfolio" or "Profile" sections of the app for that information.
- You cannot execute trades or manage the user's account.

Conversation History (if any):
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if this.isUser}}User: {{this.parts.0.text}}{{/if}}
    {{#if this.isModel}}SHADOW: {{this.parts.0.text}}{{/if}}
  {{/each}}
{{/if}}

User's latest message: {{{currentUserInput}}}`;

const chatPrompt = ai.definePrompt({
  name: 'shadowChatPrompt',
  model: `groq/${groqModel}`,
  tools: [fetchLiveMarketDataTool],
  input: { schema: ShadowChatInputSchema },
  output: { schema: ShadowChatOutputSchema },
  config: {
    temperature: 0.6,
  },
  prompt: systemPrompt
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
        userId: input.userId,
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
