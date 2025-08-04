import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    groq({
      models: [
        {
          name: 'llama3-70b-8192',
          path: 'groq/llama3-70b-8192',
        },
        {
          name: 'gemma-7b-it',
          path: 'groq/gemma-7b-it',
        }
      ]
    }),
  ],
});
