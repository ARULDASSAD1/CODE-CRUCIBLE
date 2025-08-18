"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMcqQuestions, McqQuestion, Participant, submitRound1Answers, getInstructions, getEventStatus, EventStatus, getParticipant } from '@/app/actions';
import { Loader2, TimerIcon, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Answer = {
    questionId: string;
    answer: string;
};

const ROUND_DURATION_SECONDS = 20 * 60; // 20 minutes

function InstructionsScreen({ instructions, onStart, isRoundEnabled }: { instructions: string, onStart: () => void, isRoundEnabled: boolean }) {
    const [isAgreed, setIsAgreed] = useState(false);

    return (
         <Card>
            <CardHeader>
                <CardTitle>Round 1 Instructions</CardTitle>
                <CardDescription>Please read the instructions carefully before you begin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isRoundEnabled && (
                    <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                        <ShieldAlert className="inline w-4 h-4 mr-2" />
                        <span className="font-medium">Round Not Started:</span> The admin has not enabled this round yet. Please wait.
                    </div>
                )}
                <ScrollArea className="h-60 w-full rounded-md border p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                        {instructions || "No instructions have been provided for this round."}
                    </pre>
                </ScrollArea>
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={isAgreed} onCheckedChange={(checked) => setIsAgreed(checked as boolean)} disabled={!isRoundEnabled} />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I have read and understood the instructions.
                    </label>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onStart} disabled={!isAgreed || !isRoundEnabled}>
                    Start Round 1
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function ParticipantRound1() {
    const [questions, setQuestions] = useState<McqQuestion[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
    const [roundStarted, setRoundStarted] = useState(false);
    const [roundInstructions, setRoundInstructions] = useState('');
    const [eventStatus, setEventStatus] = useState<EventStatus | null>(null);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [resultData, setResultData] = useState({ score: 0, total: 0, passed: false });

    const { toast } = useToast();
    const router = useRouter();

    const handleSubmitRef = useRef<() => void>();

    useEffect(() => {
        const participantId = sessionStorage.getItem('participantId');
        if (participantId) {
            getParticipant(participantId).then(p => {
                setParticipant(p);
                if (p?.round1) {
                    toast({
                        title: "Already Submitted",
                        description: "You have already completed Round 1.",
                        variant: "destructive"
                    });
                    router.replace('/participant');
                    return;
                }
            });
        } else {
            router.replace('/participant/login');
            return;
        }

        async function fetchInitialData() {
            setIsLoading(true);
            try {
                const [fetchedQuestions, instructionsData, status] = await Promise.all([
                    getMcqQuestions(),
                    getInstructions(),
                    getEventStatus()
                ]);

                setQuestions(fetchedQuestions);
                setAnswers(fetchedQuestions.map(q => ({ questionId: q.id, answer: '' })));
                setRoundInstructions(instructionsData.round1);
                setEventStatus(status);

            } catch (error) {
                toast({ title: "Error", description: "Could not load round data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [toast, router]);

    const handleSubmit = async () => {
        if (!participant || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        toast({
            title: "Submitting...",
            description: "Your answers are being submitted.",
        });

        const timeTaken = ROUND_DURATION_SECONDS - timeLeft;

        try {
            const { score, total, passed } = await submitRound1Answers(participant.id, answers, timeTaken);
            setResultData({ score, total, passed });
            setShowResultDialog(true);
        } catch (error) {
             toast({
                title: "Submission Failed",
                description: "There was an error submitting your answers.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };
    
    handleSubmitRef.current = handleSubmit;

    useEffect(() => {
        if (!isLoading && questions.length > 0 && !isSubmitting && roundStarted) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleSubmitRef.current?.();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLoading, questions, isSubmitting, roundStarted, toast]);
    
    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prevAnswers => {
            const otherAnswers = prevAnswers.filter(a => a.questionId !== questionId);
            return [...otherAnswers, { questionId, answer }];
        });
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const answeredQuestions = answers.filter(a => a.answer !== '').length;

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : !roundStarted ? (
                    <InstructionsScreen instructions={roundInstructions} onStart={() => setRoundStarted(true)} isRoundEnabled={eventStatus?.round1 === 'enabled'} />
                ) : (
                    <Card>
                        <CardHeader className="sticky top-[80px] bg-background z-10 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Round 1: Multiple Choice Questions</CardTitle>
                                    <CardDescription>Select the correct answer for each question. You cannot change your answers once submitted.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <TimerIcon size={28} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {questions.length === 0 ? (
                                <p className="pt-6">The admin has not added any questions for this round yet. Please wait.</p>
                            ) : (
                                <div className="space-y-8 pt-6">
                                    {questions.map((q, index) => (
                                        <div key={q.id}>
                                            <p className="font-semibold mb-4">{index + 1}. {q.question}</p>
                                            <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)}>
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`${q.id}-opt-${i}`} />
                                                        <Label htmlFor={`${q.id}-opt-${i}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {questions.length > 0 && (
                                <Button onClick={handleSubmit} disabled={isSubmitting || answeredQuestions !== questions.length}>
                                    {isSubmitting && <Loader2 className="animate-spin" />}
                                    {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )}
            </main>
             <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{resultData.passed ? "Congratulations!" : "Better Luck Next Time"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            You scored {resultData.score} out of {resultData.total}.
                            {resultData.passed
                                ? " You have qualified for Round 2!"
                                : " You have not met the 60% requirement to advance to the next round."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => router.push('/participant')}>
                            Back to Portal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
