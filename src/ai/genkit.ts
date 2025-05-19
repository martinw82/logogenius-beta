
import {genkit} from 'genkit';
// The googleAI plugin will be imported and used directly within individual flows
// when a user-provided API key is available.

// Initialize a global Genkit instance without any default plugins.
// This instance will be used for generic definitions like ai.defineFlow, ai.definePrompt.
export const ai = genkit();
