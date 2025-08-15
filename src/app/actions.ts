'use server';

import { promises as fs } from 'fs';
import path from 'path';

// This file will contain server actions for handling form submissions,
// compiling code, and managing the "database" of questions and scores.

const dataPath = path.join(process.cwd(), 'data');
const instructionsPath = path.join(dataPath, 'instructions.json');
const mcqsPath = path.join(dataPath, 'round1-mcqs.json');


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

// ============== ROUND 1: MCQs ==============

export type McqQuestion = {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string; // Will store the value of the correct option
};

export async function getMcqQuestions(): Promise<McqQuestion[]> {
    await ensureDbReady();
    try {
        const fileContent = await fs.readFile(mcqsPath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

export async function saveMcqQuestion(question: Omit<McqQuestion, 'id'>): Promise<void> {
    const questions = await getMcqQuestions();
    const newQuestion: McqQuestion = {
        ...question,
        id: new Date().toISOString() + Math.random(), // Simple unique ID
    };
    questions.push(newQuestion);
    await fs.writeFile(mcqsPath, JSON.stringify(questions, null, 2), 'utf8');
}


export async function saveMcqQuestions(newQuestions: Omit<McqQuestion, 'id'>[]): Promise<void> {
    const existingQuestions = await getMcqQuestions();
    const questionsToSave: McqQuestion[] = [
        ...existingQuestions,
        ...newQuestions.map(q => ({...q, id: new Date().toISOString() + Math.random()}))
    ];
    await fs.writeFile(mcqsPath, JSON.stringify(questionsToSave, null, 2), 'utf8');
}


export async function deleteMcqQuestion(id: string): Promise<void> {
    let questions = await getMcqQuestions();
    questions = questions.filter(q => q.id !== id);
    await fs.writeFile(mcqsPath, JSON.stringify(questions, null, 2), 'utf8');
}
