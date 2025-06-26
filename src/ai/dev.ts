
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trading-strategy.ts';
import '@/ai/flows/generate-sarcastic-disclaimer.ts';
import '@/ai/flows/blocksmith-chat-flow.ts'; // Content updated to SHADOW chat, path kept for simplicity
import '@/ai/flows/generate-daily-greeting.ts';
import '@/ai/tools/fetch-historical-data-tool.ts';
import '@/ai/tools/fetch-portfolio-tool.ts';
import '@/ai/tools/fetch-live-market-data-tool.ts';
