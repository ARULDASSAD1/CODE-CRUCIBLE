'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting code improvements in C code.
 *
 * It takes C code as input and returns suggestions for potential errors or improvements.
 *
 * @exports suggestCodeImprovements - An async function that takes C code as input and returns suggestions.
 * @exports SuggestCodeImprovementsInput - The input type for the suggestCodeImprovements function.
 * @exports SuggestCodeImprovementsOutput - The output type for the suggestCodeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeImprovementsInputSchema = z.object({
  code: z
    .string()
    .describe('The C code to be analyzed for potential improvements.'),
});
export type SuggestCodeImprovementsInput = z.infer<typeof SuggestCodeImprovementsInputSchema>;

const SuggestCodeImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Suggestions for potential errors or improvements in the C code.'),
});
export type SuggestCodeImprovementsOutput = z.infer<typeof SuggestCodeImprovementsOutputSchema>;

export async function suggestCodeImprovements(
  input: SuggestCodeImprovementsInput
): Promise<SuggestCodeImprovementsOutput> {
  return suggestCodeImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCodeImprovementsPrompt',
  input: {schema: SuggestCodeImprovementsInputSchema},
  output: {schema: SuggestCodeImprovementsOutputSchema},
  prompt: `You are a C code debugging assistant. Review the following C code and provide suggestions for potential errors or improvements. Be specific and provide the line number where the error occurs. 

C Code:
{{code}}`,
});

const suggestCodeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestCodeImprovementsFlow',
    inputSchema: SuggestCodeImprovementsInputSchema,
    outputSchema: SuggestCodeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
