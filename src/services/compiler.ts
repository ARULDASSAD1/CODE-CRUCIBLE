
'use server';

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const tempDir = path.join(process.cwd(), 'temp');

/**
 * Compiles and runs a C code string.
 * This function is intended to be run on a server where a C compiler (gcc) is installed.
 * It writes the code to a temporary file, compiles it, runs it with the provided input, and cleans up.
 *
 * @param code The C code to execute.
 * @param input The entire input string to pass to the program's stdin.
 * @returns A promise that resolves with the stdout and stderr of the execution.
 */
export async function compileAndRunC(code: string, input: string = ''): Promise<{ stdout: string, stderr: string, error?: any }> {
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const cFilePath = path.join(tempDir, `code_${timestamp}.c`);
    const exeFilePath = path.join(tempDir, `program_${timestamp}`);
    const finalExePath = process.platform === 'win32' ? `${exeFilePath}.exe` : exeFilePath;

    try {
        await fs.writeFile(cFilePath, code, 'utf8');

        // Compile the C code using gcc with a timeout
        const compileProcess = spawn('gcc', [cFilePath, '-o', finalExePath]);
        
        let compileStdout = '';
        let compileStderr = '';

        const compilePromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                compileProcess.kill();
                reject(new Error('Compilation timed out after 5 seconds.'));
            }, 5000);

            compileProcess.stdout.on('data', (data) => compileStdout += data.toString());
            compileProcess.stderr.on('data', (data) => compileStderr += data.toString());

            compileProcess.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(compileStderr || 'Compilation failed.'));
                }
            });
             compileProcess.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        await compilePromise;
        
        // Execute the compiled program
        return new Promise((resolve) => {
            const child = spawn(finalExePath);
            let stdout = '';
            let stderr = '';

            const timeout = setTimeout(() => {
                child.kill();
                resolve({ stdout, stderr: stderr + '\nError: Process timed out after 5 seconds (possible infinite loop).' });
            }, 5000);

            child.stdout.on('data', (data) => stdout += data.toString());
            child.stderr.on('data', (data) => stderr += data.toString());
            
            child.on('close', () => {
                clearTimeout(timeout);
                resolve({ stdout, stderr });
            });
            
            child.on('error', (err) => {
                clearTimeout(timeout);
                resolve({ stdout: '', stderr: err.message, error: err });
            });

            // Write the provided manual input to the program's stdin
            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end(); // Close stdin
        });

    } catch (error: any) {
        return { stdout: '', stderr: error.message, error };
    } finally {
        // Cleanup: delete the temporary files
        setTimeout(() => {
             fs.unlink(cFilePath).catch(() => {});
             fs.unlink(finalExePath).catch(() => {});
        }, 200);
    }
}
