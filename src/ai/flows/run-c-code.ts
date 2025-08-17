
'use server';

/**
 * @fileOverview A flow for compiling and running C code on the server.
 * This flow acts as a safe wrapper around a compiler service that uses
 * a locally installed C compiler (like gcc).
 *
 * @exports runCCode - An async function that takes C code and returns the compiler/program output.
 * @exports RunCCodeInput - The input type for the runCCode function.
 * @exports RunCCodeOutput - The output type for the runCCode function.
 */

import { ai } from '@/ai/genkit';
import { compileAndRunC } from '@/services/compiler';
import { z } from 'genkit';

const RunCCodeInputSchema = z.object({
  code: z.string().describe('The C code to compile and run.'),
});
export type RunCCodeInput = z.infer<typeof RunCCodeInputSchema>;

const RunCCodeOutputSchema = z.object({
  output: z.string().describe('The output from the compiler or the program, including errors.'),
  success: z.boolean().describe('Whether the compilation and execution were successful.')
});
export type RunCCodeOutput = z.infer<typeof RunCCodeOutputSchema>;

// This is the main function the UI will call.
export async function runCCode(input: RunCCodeInput): Promise<RunCCodeOutput> {
  return runCCodeFlow(input);
}

const runCCodeFlow = ai.defineFlow(
  {
    name: 'runCCodeFlow',
    inputSchema: RunCCodeInputSchema,
    outputSchema: RunCCodeOutputSchema,
  },
  async ({ code }) => {
    try {
      const result = await compileAndRunC(code);
      return {
        output: result.stdout || result.stderr,
        success: !result.error,
      };
    } catch (error: any) {
      // This will catch errors from the compiler service itself (e.g., if gcc is not installed)
      return {
        output: error.stderr || 'An unexpected error occurred during compilation.',
        success: false,
      };
    }
  }
);
