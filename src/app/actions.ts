'use server';

import type { SuggestCodeImprovementsOutput } from '@/ai/flows/suggest-code-improvements';

export async function getAIDebuggingSuggestions(code: string): Promise<SuggestCodeImprovementsOutput> {
  if (!code) {
    throw new Error('Code cannot be empty.');
  }

  // Basic offline check for a common C error: missing semicolon after a variable declaration.
  const suggestions: string[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    // A simple regex to find variable declarations like "int x = 10" that are not part of a control structure.
    if (
      /^\s*(int|float|double|char)\s+\w+(\s*=\s*[^;]+)?\s*$/.test(trimmedLine) &&
      !trimmedLine.endsWith(';')
    ) {
      suggestions.push(`Line ${index + 1}: Missing semicolon at the end of a variable declaration.`);
    }
  });

  if (suggestions.length > 0) {
    return { suggestions: suggestions.join('\n') };
  } else {
    return { suggestions: 'No simple errors found. The code seems correct!' };
  }
}
