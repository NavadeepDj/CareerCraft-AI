import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // Ensure API key is set in environment variables
    }),
  ],
  // Use a more capable model like 1.5 flash
  model: 'googleai/gemini-1.5-flash-latest',
});
