'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-unified-strategy.ts'; // << NEW UNIFIED FLOW
import '@/ai/flows/generate-sarcastic-disclaimer.ts';
import '@/ai/flows/blocksmith-chat-flow.ts'; // Content updated to SHADOW chat, path kept for simplicity
import '@/ai/flows/generate-daily-greeting.ts';
import '@/ai/flows/generate-performance-review.ts';
import '@/ai/flows/generate-mission-log.ts';

import '@/ai/tools/fetch-live-market-data-tool.ts';
import '@/ai/tools/fetch-news-tool.ts';
import '@/ai/tools/fetch-coinmarketcap-data-tool.ts';
import '@/ai/tools/fetch-coingecko-data-tool.ts';
import '@/ai/tools/fetch-etherscan-data-tool.ts';
import '@/ai/tools/fetch-historical-data-tool.ts';
