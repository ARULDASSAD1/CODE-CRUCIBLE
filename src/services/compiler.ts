
'use server';

import { exec, spawn } from 'child_process';
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
 * @param input The manual input string to pass to the program's stdin.
 * @returns A promise that resolves with the stdout and stderr of the execution.
 */
export async function compileAndRunC(code: string, input: string = ''): Promise<{ stdout: string, stderr: string, error?: any }> {
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const cFilePath = path.join(tempDir, `code_${timestamp}.c`);
    const exeFilePath = path.join(tempDir, `program_${timestamp}`);
    // On Windows, the executable will have a .exe extension
    const finalExePath = process.platform === 'win32' ? `${exeFilePath}.exe` : exeFilePath;

    try {
        // Write the C code to a temporary file
        await fs.writeFile(cFilePath, code, 'utf8');

        // Compile the C code using gcc
        try {
             // Use -o flag to specify output file
             await execAsync(`gcc "${cFilePath}" -o "${finalExePath}"`);
        } catch(compilationError: any) {
            // If compilation fails, return the compiler error and clean up the C file
            await fs.unlink(cFilePath).catch(() => {});
            return { stdout: '', stderr: compilationError.stderr, error: compilationError };
        }

        // Execute the compiled program
        return new Promise((resolve) => {
            const child = spawn(finalExePath);
            let stdout = '';
            let stderr = '';

            // Set a timeout to prevent hanging forever (e.g., from an infinite loop)
            const timeout = setTimeout(() => {
                child.kill(); 
                // The process was killed, so we resolve with an error message in stderr
                resolve({ stdout, stderr: stderr + '\nError: Process timed out after 5 seconds.'});
            }, 5000); 

            // Write the provided manual input to the program's stdin
            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end(); // Close stdin to signal that no more input will be sent

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                clearTimeout(timeout);
                // The process finished on its own
                resolve({ stdout, stderr });
            });
            
            child.on('error', (err) => {
                clearTimeout(timeout);
                // An error occurred spawning or running the process
                resolve({ stdout: '', stderr: err.message, error: err });
            });
        });

    } finally {
        // Cleanup: delete the temporary files
        // Use a slight delay to ensure the process has released file handles
        setTimeout(() => {
             fs.unlink(cFilePath).catch(() => {}); // Ignore errors if file doesn't exist
             fs.unlink(finalExePath).catch(() => {});
        }, 100);
    }
}
