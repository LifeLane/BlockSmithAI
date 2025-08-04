import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';
import {googleAI} from '@genkit-ai/googleai';

export const geminiModel = 'googleai/gemini-1.5-flash-latest';
export const groqModel = 'llama3-70b-8192';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
    groq({apiKey: process.env.GROQ_API_KEY}),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
