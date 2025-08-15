"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMcqQuestions, McqQuestion } from '@/app/actions';
import { Loader2 } from 'lucide-react';
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
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const fetchedQuestions = await getMcqQuestions();
                setQuestions(fetchedQuestions);
            } catch (error) {
                toast({ title: "Error", description: "Could not load questions.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [toast]);
    
    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prevAnswers => {
            const otherAnswers = prevAnswers.filter(a => a.questionId !== questionId);
            return [...otherAnswers, { questionId, answer }];
        });
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // In a real app, you'd save these answers to the server.
        // For now, we'll just calculate the score on the client.
        
        let score = 0;
        for (const question of questions) {
            const participantAnswer = answers.find(a => a.questionId === question.id);
            if (participantAnswer && participantAnswer.answer === question.correctAnswer) {
                score++;
            }
        }
        
        localStorage.setItem('round1Score', score.toString());
        localStorage.setItem('round1Answers', JSON.stringify(answers));

        toast({
            title: "Round 1 Submitted!",
            description: `You scored ${score} out of ${questions.length}.`,
        });

        // Simulate a delay for submission
        setTimeout(() => {
            setIsSubmitting(false);
            router.push('/participant'); // Go back to the portal
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 1: Multiple Choice Questions</CardTitle>
                        <CardDescription>Select the correct answer for each question. You cannot change your answers once submitted.</CardDescription>
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
                             <Button onClick={handleSubmit} disabled={isSubmitting || answers.length !== questions.length}>
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
