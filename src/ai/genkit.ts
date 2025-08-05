import { genkit } from 'genkit';
import { googleAI as googleAIPlugin } from '@genkit-ai/googleai';
import { groq } from 'genkitx-groq';

// Create a separate, named instance for the Google AI plugin
export const googleAI = genkit({
  plugins: [
    googleAIPlugin({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Create a separate, named instance for the Groq plugin
export const groqAI = genkit({
    plugins: [
        groq({ apiKey: process.env.GROQ_API_KEY }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});

// A default instance for tools that don't need a specific model
export const ai = genkit({
    plugins: [
        googleAIPlugin({ apiKey: process.env.GEMINI_API_KEY }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});
