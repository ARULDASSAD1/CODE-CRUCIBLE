'use server';

import { promises as fs } from 'fs';
import path from 'path';

// This file will contain server actions for handling form submissions,
// compiling code, and managing the "database" of questions and scores.

const dataPath = path.join(process.cwd(), 'data');
const instructionsPath = path.join(dataPath, 'instructions.json');
const mcqsPath = path.join(dataPath, 'round1-mcqs.json');
const participantsPath = path.join(dataPath, 'participants.json');


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

export async function deleteMcqQuestions(ids: string[]): Promise<void> {
    let questions = await getMcqQuestions();
    questions = questions.filter(q => !ids.includes(q.id));
    await fs.writeFile(mcqsPath, JSON.stringify(questions, null, 2), 'utf8');
}


// ============== PARTICIPANTS ==============

export type Participant = {
    id: string;
    name: string;
    teamName: string;
    year: string;
    dept: string;
    college: string;
    round1?: {
        score: number;
        answers: { questionId: string, answer: string }[];
        submittedAt: string; // ISO string
    };
    disqualified?: boolean;
};

export async function getParticipants(): Promise<Participant[]> {
    await ensureDbReady();
    try {
        const fileContent = await fs.readFile(participantsPath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

export async function saveParticipant(participantData: Omit<Participant, 'id'>): Promise<Participant> {
    const participants = await getParticipants();
    const newParticipant: Participant = {
        ...participantData,
        id: new Date().toISOString() + Math.random(), // Simple unique ID
    };
    participants.push(newParticipant);
    await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');
    return newParticipant;
}

export async function updateParticipant(participantData: Participant): Promise<Participant> {
    const participants = await getParticipants();
    const participantIndex = participants.findIndex(p => p.id === participantData.id);

    if (participantIndex === -1) {
        throw new Error("Participant not found");
    }

    // Preserve round-specific data that isn't part of the edit form
    const existingParticipant = participants[participantIndex];
    participants[participantIndex] = {
        ...existingParticipant, // Keep existing data like round submissions
        name: participantData.name,
        teamName: participantData.teamName,
        college: participantData.college,
        year: participantData.year,
        dept: participantData.dept,
    };

    await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');
    return participants[participantIndex];
}


export async function submitRound1Answers(participantId: string, answers: { questionId: string, answer: string }[]) {
    const questions = await getMcqQuestions();
    let score = 0;
    for (const question of questions) {
        const participantAnswer = answers.find(a => a.questionId === question.id);
        if (participantAnswer && participantAnswer.answer === question.correctAnswer) {
            score++;
        }
    }

    const participants = await getParticipants();
    const participantIndex = participants.findIndex(p => p.id === participantId);

    if (participantIndex === -1) {
        throw new Error("Participant not found");
    }

    participants[participantIndex] = {
        ...participants[participantIndex],
        round1: {
            score,
            answers,
            submittedAt: new Date().toISOString()
        }
    };

    await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');
    return { score };
}
