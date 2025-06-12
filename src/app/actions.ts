// @ts-nocheck
// remove-ts-nocheck-next-line
"use server";
import { generateTradingStrategy as genStrategy, type GenerateTradingStrategyInput, type GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';

export async function generateTradingStrategyAction(input: GenerateTradingStrategyInput): Promise<GenerateTradingStrategyOutput | { error: string }> {
  try {
    // Ensure marketData is a string as expected by the AI flow
    if (typeof input.marketData !== 'string') {
        // Attempt to stringify if it's an object, otherwise default to an empty object string
        input.marketData = typeof input.marketData === 'object' ? JSON.stringify(input.marketData) : '{}';
    }
    const result = await genStrategy(input);
    return result;
  } catch (error) {
    console.error("Error generating trading strategy:", error);
    return { error: "Failed to generate trading strategy. Please try again." };
  }
}
