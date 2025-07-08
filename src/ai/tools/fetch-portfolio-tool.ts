
/**
 * @fileOverview A Genkit tool to fetch the user's current open portfolio positions.
 * NOTE: This tool is stubbed to work without a database connection.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { prisma } from '@/lib/prisma';

// Corrected schema to match the data model for a Position.
const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  signalType: z.enum(['BUY', 'SELL']),
  entryPrice: z.number(),
  size: z.number(),
  status: z.enum(['PENDING', 'OPEN', 'CLOSED']),
  openTimestamp: z.date().nullable(),
  closeTimestamp: z.date().nullable(),
  expirationTimestamp: z.date().nullable(),
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
        const positions = await prisma.position.findMany({
            where: {
                userId: input.userId,
                status: {
                    in: ['PENDING', 'OPEN']
                }
            }
        });
        
        if (positions.length === 0) {
            return { message: "The user has no open or pending positions." };
        }

        // The schema expects float for pnl, but prisma might return Decimal. Ensure conversion if necessary.
        // For now, schema aligns with Float so direct return is okay.
        return { positions };

    } catch (error: any) {
        console.error("Error in fetchPortfolioTool:", error);
        return { error: `Database error when fetching portfolio: ${error.message}` };
    }
  }
);
