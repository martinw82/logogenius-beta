
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Register the googleAI plugin without a default API key.
// This allows flows to dynamically configure it with a user's key at runtime.
// It also allows flow/prompt definitions that reference googleAI models.
export const ai = genkit({
  plugins: [googleAI()],
  // Default model specification can be removed from here if it's always specified in calls,
  // or kept if there's a desired fallback for prompt definitions (though execution will need a key).
  // For clarity and to ensure no accidental key-less calls, let's remove it.
  // model: 'googleai/gemini-2.0-flash',
});

