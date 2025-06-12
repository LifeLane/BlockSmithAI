
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trading-strategy.ts';
import '@/ai/flows/generate-sarcastic-disclaimer.ts';
import '@/ai/flows/blocksmith-chat-flow.ts'; // Added new chat flow
import '@/ai/flows/generate-daily-greeting.ts'; // Added new daily greeting flow

