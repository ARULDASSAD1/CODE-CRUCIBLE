"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMcqQuestions, McqQuestion, Participant, submitRound1Answers } from '@/app/actions';
import { Loader2, TimerIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Answer = {
    questionId: string;
    answer: string;
};

export default function ParticipantRound1() {
    const [questions, setQuestions] = useState<McqQuestion[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmitRef = useRef<() => void>();

    useEffect(() => {
        const participantDetails = localStorage.getItem('participantDetails');
        if (participantDetails) {
            const parsedDetails = JSON.parse(participantDetails);
            setParticipant(parsedDetails);
            // Check if this participant has already submitted for round 1
            if (parsedDetails.round1) {
                 toast({
                    title: "Already Submitted",
                    description: "You have already completed Round 1.",
                    variant: "destructive"
                });
                router.replace('/participant');
            }
        } else {
            router.replace('/participant/register');
        }

        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const fetchedQuestions = await getMcqQuestions();
                setQuestions(fetchedQuestions);
                setAnswers(fetchedQuestions.map(q => ({ questionId: q.id, answer: '' })));
            } catch (error) {
                toast({ title: "Error", description: "Could not load questions.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
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

        try {
            const { score } = await submitRound1Answers(participant.id, answers);
            
            // Update local storage to mark round 1 as complete
            const updatedParticipant: Participant = {
                ...participant, 
                round1: { 
                    score, 
                    answers, 
                    submittedAt: new Date().toISOString()
                }
            };
            localStorage.setItem('participantDetails', JSON.stringify(updatedParticipant));
            
            toast({
                title: "Round 1 Submitted!",
                description: `You scored ${score} out of ${questions.length}.`,
            });

            setTimeout(() => {
                router.push('/participant');
            }, 1500);

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
        if (!isLoading && questions.length > 0 && !isSubmitting) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        toast({
                            title: "Time's Up!",
                            description: "Auto-submitting your answers.",
                        });
                        handleSubmitRef.current?.();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLoading, questions, isSubmitting, toast]);
    
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
                <Card>
                    <CardHeader>
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
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : questions.length === 0 ? (
                            <p>The admin has not added any questions for this round yet. Please wait.</p>
                        ) : (
                            <div className="space-y-8">
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
            </main>
        </div>
    )
}
