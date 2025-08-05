

import {genkit} from 'genkit';
import {googleAI as googleAIPlugin} from '@genkit-ai/googleai';

// Create a single, unified AI instance for the application
export const ai = genkit({
  plugins: [googleAIPlugin({apiKey: process.env.GEMINI_API_KEY})],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
