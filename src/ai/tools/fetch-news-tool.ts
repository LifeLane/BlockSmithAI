/**
 * @fileOverview A Genkit tool to fetch recent news for a given cryptocurrency.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchRecentNews, type NewsArticle } from '@/services/news-service';

const ArticleSchema = z.object({
    source: z.object({ name: z.string() }),
    title: z.string(),
    description: z.string().nullable(),
});

const FetchNewsInputSchema = z.object({
  query: z.string().describe('The cryptocurrency name or symbol (e.g., Bitcoin, BTC).'),
});

const FetchNewsOutputSchema = z.object({
  articles: z.array(ArticleSchema).optional().describe('An array of recent news articles.'),
  error: z.string().optional().describe('An error message if fetching failed.'),
  summary: z.string().optional().describe('A concise summary of the top articles provided for convenience.'),
});

export const fetchNewsTool = ai.defineTool(
  {
    name: 'fetchNewsTool',
    description: 'Fetches recent news articles and sentiment for a given cryptocurrency symbol or name. This provides fundamental and sentiment analysis context.',
    inputSchema: FetchNewsInputSchema,
    outputSchema: FetchNewsOutputSchema,
  },
  async (input) => {
    // Check for API key at the tool level before calling the service
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey || apiKey.includes("YOUR_")) {
        return { error: 'News API key is not configured. News service is unavailable.' };
    }

    const result = await fetchRecentNews(input);

    if ('error' in result) {
      return { error: result.error };
    }

    if (!result.articles || result.articles.length === 0) {
      return { summary: 'No significant news found in the last 7 days.' };
    }

    // Create a simplified list for the AI to summarize
    const articlesForSummary = result.articles.map(a => ({
        source: a.source,
        title: a.title,
        description: a.description
    }));

    // Create a text summary for the AI to easily parse
    const summaryText = result.articles
      .slice(0, 5) // Use top 5 for the summary text
      .map(a => `Title: ${a.title}\nSource: ${a.source.name}\nDescription: ${a.description || 'N/A'}`)
      .join('\n\n---\n\n');
      
    return { articles: articlesForSummary, summary: summaryText };
  }
);
