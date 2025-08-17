
'use server';

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const tempDir = path.join(process.cwd(), 'temp');

/**
 * Compiles and runs a C code string.
 * This function is intended to be run on a server where a C compiler (gcc) is installed.
 * It writes the code to a temporary file, compiles it, runs it, and cleans up.
 *
 * @param code The C code to execute.
 * @returns A promise that resolves with the stdout and stderr of the execution.
 */
export async function compileAndRunC(code: string): Promise<{ stdout: string, stderr: string, error?: any }> {
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const cFilePath = path.join(tempDir, `code_${timestamp}.c`);
    const exeFilePath = path.join(tempDir, `program_${timestamp}`);

    try {
        // Write the C code to a temporary file
        await fs.writeFile(cFilePath, code, 'utf8');

        // Compile the C code using gcc
        try {
             await execAsync(`gcc ${cFilePath} -o ${exeFilePath}`);
        } catch(compilationError: any) {
            // If compilation fails, return the compiler error
             return { stdout: '', stderr: compilationError.stderr, error: compilationError };
        }

        // Execute the compiled program
        try {
            const { stdout, stderr } = await execAsync(exeFilePath);
            return { stdout, stderr };
        } catch(runtimeError: any) {
            // If execution fails, return the runtime error
            return { stdout: '', stderr: runtimeError.stderr, error: runtimeError };
        }

    } finally {
        // Cleanup: delete the temporary files
        await Promise.all([
            fs.unlink(cFilePath).catch(() => {}), // Ignore errors if file doesn't exist
            fs.unlink(exeFilePath).catch(() => {})
        ]);
    }
}
