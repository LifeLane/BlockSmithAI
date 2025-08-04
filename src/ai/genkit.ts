import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    groq(),
  ],
  // By defining the models here, we can reference them in our flows.
  // Genkit will automatically use the next model in the list as a fallback
  // if the first one is unavailable or overloaded.
  models: [
    {
      name: 'llama3-70b-8192', 
      path: 'groq/llama3-70b-8192',
    },
    {
      name: 'gemma-7b-it',
      path: 'groq/gemma-7b-it',
    }
  ],
});
