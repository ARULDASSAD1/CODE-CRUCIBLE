'use server';

import { promises as fs } from 'fs';
import path from 'path';

// This file will contain server actions for handling form submissions,
// compiling code, and managing the "database" of questions and scores.

const dataPath = path.join(process.cwd(), 'data');
const instructionsPath = path.join(dataPath, 'instructions.json');

async function ensureDbReady() {
    try {
        await fs.access(dataPath);
    } catch {
        await fs.mkdir(dataPath);
    }
}

// ============== INSTRUCTIONS ==============

type Instructions = {
    instructions: string;
}

export async function saveInstructions(data: Instructions) {
    await ensureDbReady();
    await fs.writeFile(instructionsPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getInstructions(): Promise<Instructions> {
    await ensureDbReady();
    try {
        const fileContent = await fs.readFile(instructionsPath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist, return empty instructions
        return { instructions: '' };
    }
}
