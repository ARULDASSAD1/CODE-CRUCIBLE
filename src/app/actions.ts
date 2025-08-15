'use server';

import { suggestCodeImprovements, type SuggestCodeImprovementsOutput } from '@/ai/flows/suggest-code-improvements';

export async function getAIDebuggingSuggestions(code: string): Promise<SuggestCodeImprovementsOutput> {
  if (!code) {
    throw new Error('Code cannot be empty.');
  }

  try {
    const result = await suggestCodeImprovements({ code });
    return result;
  } catch (error) {
    console.error('Error calling suggestCodeImprovements flow:', error);
    // This error will be caught by the client and displayed to the user.
    throw new Error('Failed to get suggestions from the AI service.');
  }
}
