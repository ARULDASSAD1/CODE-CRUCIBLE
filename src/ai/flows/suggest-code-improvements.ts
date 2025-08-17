'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating a user's fix for a buggy C code snippet.
 *
 * It takes the original buggy code and the user's proposed fix, and determines if the fix is correct.
 *
 * @exports validateCodeFix - An async function that takes buggy code and fixed code and returns a validation result.
 * @exports ValidateCodeFixInput - The input type for the validateCodeFix function.
 * @exports ValidateCodeFixOutput - The output type for the validateCodeFix function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateCodeFixInputSchema = z.object({
  buggyCode: z
    .string()
    .describe('The original C code containing one or more bugs.'),
  fixedCode: z
    .string()
    .describe("The user's proposed solution to fix the buggy code."),
});
export type ValidateCodeFixInput = z.infer<typeof ValidateCodeFixInputSchema>;

const ValidateCodeFixOutputSchema = z.object({
  isCorrect: z
    .boolean()
    .describe('Whether the provided code correctly fixes the bugs in the original code.'),
  reasoning: z
    .string()
    .describe('A brief explanation of why the solution is correct or incorrect.'),
});
export type ValidateCodeFixOutput = z.infer<typeof ValidateCodeFixOutputSchema>;

export async function validateCodeFix(
  input: ValidateCodeFixInput
): Promise<ValidateCodeFixOutput> {
  return validateCodeFixFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateCodeFixPrompt',
  input: {schema: ValidateCodeFixInputSchema},
  output: {schema: ValidateCodeFixOutputSchema},
  prompt: `You are an expert C programmer and automated code judge. Your task is to determine if the "Fixed Code" is a correct solution for the "Buggy Code".

The "Fixed Code" is considered correct if it logically resolves the bugs from the "Buggy Code". The solution doesn't have to be a character-for-character match with a single ideal answer. Be flexible with variable names, whitespace, and slightly different but functionally equivalent logic.

Analyze the following code snippets:

Buggy Code:
\`\`\`c
{{{buggyCode}}}
\`\`\`

Proposed Fixed Code:
\`\`\`c
{{{fixedCode}}}
\`\`\`

Does the "Proposed Fixed Code" correctly fix the bugs from the "Buggy Code"? Set the isCorrect field and provide a brief reasoning.`,
});

const validateCodeFixFlow = ai.defineFlow(
  {
    name: 'validateCodeFixFlow',
    inputSchema: ValidateCodeFixInputSchema,
    outputSchema: ValidateCodeFixOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
