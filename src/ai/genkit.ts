import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // By defining the models here, we can reference them in our flows.
  // Genkit will automatically use the next model in the list as a fallback
  // if the first one is unavailable or overloaded.
  model: ['googleai/gemini-1.5-pro-latest', 'googleai/gemini-1.5-flash-latest'],
});
