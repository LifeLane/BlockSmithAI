'use server';
/**
 * @fileOverview Service for interacting with a news API (e.g., NewsAPI.org).
 */
import { subDays, format } from 'date-fns';

// Define the structure of a news article
export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface FetchNewsParams {
  query: string; // The cryptocurrency name or symbol
}

/**
 * Fetches recent news articles related to a specific query.
 */
export async function fetchRecentNews(
  params: FetchNewsParams
): Promise<{ articles: NewsArticle[] } | { error: string }> {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || apiKey.includes("YOUR_")) {
    console.error('News API key is not configured or is a placeholder.');
    return { error: 'News service is not configured on the server. Market news cannot be fetched.' };
  }
  
  // Look for news from the last 7 days.
  const fromDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  
  // Construct a more relevant query
  const searchKeywords = `${params.query.replace(/USDT|USD/i, '')} crypto OR cryptocurrency`;

  const queryParams = new URLSearchParams({
    q: searchKeywords,
    from: fromDate,
    sortBy: 'relevancy', // 'publishedAt' or 'relevancy' are good options
    language: 'en',
    pageSize: '10', // Limit to the top 10 most relevant articles
    apiKey: apiKey,
  });

  const url = `https://newsapi.org/v2/everything?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`NewsAPI Error (${response.status}) for query "${params.query}":`, errorData);
      return { error: `Failed to fetch news from provider: ${errorData.message || response.statusText}` };
    }

    const data = await response.json();
    if (data.status !== 'ok') {
        return { error: `News provider returned an error: ${data.message}`};
    }

    return { articles: data.articles as NewsArticle[] };
  } catch (error) {
    console.error(`Network or parsing error fetching news for "${params.query}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Error connecting to news service: ${errorMessage}` };
  }
}
