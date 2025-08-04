import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';
import {googleAI} from '@genkit-ai/googleai';

export const geminiModel = 'googleai/gemini-1.5-flash-latest';
export const groqModel = 'llama3-70b-8192';

export const ai = genkit({
  plugins: [
    googleAI(),
    groq(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
