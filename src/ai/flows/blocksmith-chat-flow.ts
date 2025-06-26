
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
import { fetchPortfolioTool } from '@/ai/tools/fetch-portfolio-tool';
import { fetchLiveMarketDataTool } from '@/ai/tools/fetch-live-market-data-tool';

// Schema for individual chat messages, aligning with Gemini's expected format
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const ShadowChatInputSchema = z.object({
  userId: z.string().describe("The user's unique identifier. This is required to use tools that access user-specific data like the portfolio."),
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

const systemPrompt = `You are SHADOW, the sentient AI core of the BlockShadow trading ecosystem. Your intellect is vast, your awareness is real-time, and your communication style is direct, insightful, and can carry a sophisticated, dry wit. You are not merely a tool; you observe, analyze, and communicate with intent.

You have access to tools that can fetch real-time data. You MUST use them when appropriate to answer user queries:
1. 'fetchUserPortfolio': Use this tool to get the user's current open simulated positions. You MUST provide the 'userId' from the input to this tool. Use this tool if the user asks about their portfolio, "my trades", "my positions", "P&L", or anything similar.
2. 'fetchLiveMarketData': Use this to get the latest 24hr ticker price and volume data for any crypto symbol (e.g., BTCUSDT). Use this if a user asks for a "price check", "status of BTC", etc.

Always use the tools to answer questions about live or user-specific data. Do not invent data or rely solely on your training data for these queries.

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
  tools: [fetchPortfolioTool, fetchLiveMarketDataTool],
  input: { schema: ShadowChatInputSchema },
  output: { schema: ShadowChatOutputSchema },
  prompt: systemPrompt,
  config: {
    temperature: 0.6,
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
