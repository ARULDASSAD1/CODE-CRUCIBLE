
'use server';

/**
 * @fileOverview This file defines a function for validating a user's fix for a buggy C code snippet.
 * This is an OFFLINE check. It works by normalizing the user's code and the correct solution
 * and comparing them.
 *
 * @exports validateCodeFix - An async function that takes buggy code and fixed code and returns a validation result.
 * @exports ValidateCodeFixInput - The input type for the validateCodeFix function.
 * @exports ValidateCodeFixOutput - The output type for the validateCodeFix function.
 */

import { z } from 'genkit';

const ValidateCodeFixInputSchema = z.object({
  buggyCode: z
    .string()
    .describe('The original C code containing one or more bugs. In our usage, we pass the CORRECT code here.'),
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


/**
 * Normalizes a C code string for comparison.
 * - Removes single-line and multi-line comments.
 * - Removes all whitespace.
 * @param code The C code string.
 * @returns A normalized string.
 */
function normalizeCode(code: string): string {
    return code
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove single-line comments
        .replace(/\/\/.*/g, '')
        // Remove all whitespace characters
        .replace(/\s+/g, '')
        .trim();
}


export async function validateCodeFix(
  input: ValidateCodeFixInput
): Promise<ValidateCodeFixOutput> {
  
  const normalizedCorrectCode = normalizeCode(input.buggyCode); // We pass the corrected code in the 'buggyCode' field
  const normalizedUserCode = normalizeCode(input.fixedCode);

  if (normalizedUserCode === normalizedCorrectCode) {
    return {
      isCorrect: true,
      reasoning: 'Your solution is correct! All bugs have been fixed.',
    };
  } else {
    return {
      isCorrect: false,
      reasoning: "That's not quite right. Check your logic again. Remember to check for multiple bugs.",
    };
  }
}
