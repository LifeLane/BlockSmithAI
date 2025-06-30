
/**
 * @fileOverview A Genkit tool to fetch the user's current open portfolio positions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// Corrected the import to use the existing 'fetchPendingAndOpenPositionsAction'
import { fetchPendingAndOpenPositionsAction, type Position } from '@/app/actions';

// Corrected schema to match the data model for a Position.
const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  signalType: z.enum(['BUY', 'SELL']),
  entryPrice: z.number(),
  size: z.number(),
  status: z.enum(['PENDING', 'OPEN', 'CLOSED']), // The full enum from the DB schema
  openTimestamp: z.date().nullable(), // Correct type
  closeTimestamp: z.date().nullable(), // Correct type
  expirationTimestamp: z.date().nullable(), // Correct type
  stopLoss: z.number().nullable(),
  takeProfit: z.number().nullable(),
  pnl: z.number().nullable(),
  strategyId: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const FetchPortfolioInputSchema = z.object({
  userId: z.string().describe("The user's unique identifier."),
});

const FetchPortfolioOutputSchema = z.object({
  positions: z.array(PositionSchema).optional().describe('An array of pending or open positions.'),
  error: z.string().optional().describe('An error message if fetching failed.'),
  message: z.string().optional().describe('A summary message about the portfolio.'),
});

export const fetchPortfolioTool = ai.defineTool(
  {
    name: 'fetchUserPortfolio',
    description: "Fetches the user's current pending and open simulated trading positions. Use this if the user asks about their trades, P&L, or what they are currently holding.",
    inputSchema: FetchPortfolioInputSchema,
    outputSchema: FetchPortfolioOutputSchema,
  },
  async (input) => {
    if (!input.userId) {
      return { error: 'User ID is required to fetch portfolio.' };
    }
    try {
      // Corrected the function call
      const positions = await fetchPendingAndOpenPositionsAction(input.userId);
      if (positions.length === 0) {
        return { message: "The user has no open or pending positions." };
      }
      return { positions, message: `User has ${positions.length} active position(s).` };
    } catch (error: any) {
      return { error: `Failed to fetch portfolio: ${error.message}` };
    }
  }
);

    