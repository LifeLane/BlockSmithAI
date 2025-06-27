
/**
 * @fileOverview A Genkit tool to fetch the user's current open portfolio positions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchActivePositionsAction, type Position } from '@/app/actions';

const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  signalType: z.enum(['BUY', 'SELL', 'HOLD']),
  entryPrice: z.number(),
  size: z.number(),
  status: z.enum(['OPEN', 'CLOSED']),
  openTimestamp: z.string(),
});

const FetchPortfolioInputSchema = z.object({
  userId: z.string().describe("The user's unique identifier."),
});

const FetchPortfolioOutputSchema = z.object({
  positions: z.array(PositionSchema).optional().describe('An array of open positions.'),
  error: z.string().optional().describe('An error message if fetching failed.'),
  message: z.string().optional().describe('A summary message about the portfolio.'),
});

export const fetchPortfolioTool = ai.defineTool(
  {
    name: 'fetchUserPortfolio',
    description: "Fetches the user's current open simulated trading positions. Use this if the user asks about their trades, P&L, or what they are currently holding.",
    inputSchema: FetchPortfolioInputSchema,
    outputSchema: FetchPortfolioOutputSchema,
  },
  async (input) => {
    if (!input.userId) {
      return { error: 'User ID is required to fetch portfolio.' };
    }
    try {
      const positions = await fetchActivePositionsAction(input.userId);
      if (positions.length === 0) {
        return { message: "The user has no open positions." };
      }
      return { positions, message: `User has ${positions.length} open position(s).` };
    } catch (error: any) {
      return { error: `Failed to fetch portfolio: ${error.message}` };
    }
  }
);
