
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
 * @returns A promise that resolves with the stdout and stderr of the execution.
 */
export async function compileAndRunC(code: string): Promise<{ stdout: string, stderr: string, error?: any }> {
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
             await execAsync(`gcc ${cFilePath} -o ${finalExePath}`);
        } catch(compilationError: any) {
            // If compilation fails, return the compiler error
             return { stdout: '', stderr: compilationError.stderr, error: compilationError };
        }

        // Execute the compiled program
        return new Promise((resolve) => {
            const child = spawn(finalExePath);
            let stdout = '';
            let stderr = '';

            // Provide some default input to satisfy scanf
            // This is a simple example for the default buggy code.
            // 5 numbers: 10, 20, 30, 40, 50
            child.stdin.write('5\n10\n20\n30\n40\n50\n');
            child.stdin.end();

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({ stdout, stderr });
            });
            
            child.on('error', (err) => {
                resolve({ stdout: '', stderr: err.message, error: err });
            });

            // Set a timeout to prevent hanging forever
            setTimeout(() => {
                child.kill(); 
                resolve({ stdout, stderr: stderr + '\nError: Process timed out after 5 seconds.'});
            }, 5000); 
        });

    } finally {
        // Cleanup: delete the temporary files
        await Promise.all([
            fs.unlink(cFilePath).catch(() => {}), // Ignore errors if file doesn't exist
            fs.unlink(finalExePath).catch(() => {})
        ]);
    }
}
