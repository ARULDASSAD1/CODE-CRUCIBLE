
"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound3Problems, Round3Problem, runRound3Tests, TestCaseResult, submitRound3, Participant } from '@/app/actions';
import { Loader2, Play, CheckCircle2, XCircle, TimerIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type PrivateTestResult = {
    passed: boolean;
};

type SubmissionState = {
    [problemId: string]: {
        code: string;
        publicTestResults: TestCaseResult[];
        privateTestResults: PrivateTestResult[];
        isCompiling: boolean;
    };
};

const DEFAULT_CODE_SNIPPET = `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`;
const ROUND_DURATION_SECONDS = 20 * 60; // 20 minutes

export default function ParticipantRound3() {
    const [problems, setProblems] = useState<Round3Problem[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionState>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);

    const { toast } = useToast();
    const router = useRouter();
    const handleSubmitRef = useRef<() => void>();

    useEffect(() => {
        const participantDetails = localStorage.getItem('participantDetails');
        if (participantDetails) {
            const parsedDetails: Participant = JSON.parse(participantDetails);
            setParticipant(parsedDetails);
             if (parsedDetails.round3) {
                 toast({
                    title: "Already Submitted",
                    description: "You have already completed Round 3.",
                    variant: "destructive"
                });
                router.replace('/participant');
            }
        } else {
            router.replace('/participant/register');
        }

        async function fetchProblems() {
            try {
                const fetchedProblems = await getRound3Problems();
                setProblems(fetchedProblems);
                
                const initialSubmissions: SubmissionState = {};
                for (const problem of fetchedProblems) {
                    initialSubmissions[problem.id] = {
                        code: DEFAULT_CODE_SNIPPET,
                        publicTestResults: [],
                        privateTestResults: [],
                        isCompiling: false,
                    };
                }
                setSubmissions(initialSubmissions);

            } catch {
                toast({ title: "Error", description: "Could not load coding problems.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchProblems();

    }, [router, toast]);
    
    const handleCodeChange = (problemId: string, newCode: string) => {
        setSubmissions(prev => ({
            ...prev,
            [problemId]: { ...prev[problemId], code: newCode }
        }));
    };

    const handleRunTests = async (problemId: string) => {
        const problemSubmission = submissions[problemId];
        if (!problemSubmission) return;

        setSubmissions(prev => ({ ...prev, [problemId]: { ...prev[problemId], isCompiling: true }}));

        try {
            const results = await runRound3Tests(problemSubmission.code, problemId);
            setSubmissions(prev => ({
                ...prev,
                [problemId]: {
                    ...prev[problemId],
                    publicTestResults: results.publicResults,
                    privateTestResults: results.privateResults,
                }
            }));
            toast({ title: "Tests Finished", description: "Check the results for this problem." });
        } catch (error) {
            console.error("Test execution failed", error);
            toast({ title: "Error", description: "Could not run your tests. There might be a compilation error.", variant: "destructive"});
        } finally {
            setSubmissions(prev => ({ ...prev, [problemId]: { ...prev[problemId], isCompiling: false }}));
        }
    };
    
    const handleSubmitRound = async () => {
        if (!participant || isSubmitting) return;

        setIsSubmitting(true);
        toast({ title: "Submitting Round 3...", description: "Your code is being evaluated." });
        
        const timeTaken = ROUND_DURATION_SECONDS - timeLeft;

        const finalSubmissions = Object.entries(submissions).map(([problemId, state]) => ({
            problemId,
            code: state.code
        }));

        try {
            const { score } = await submitRound3(participant.id, finalSubmissions, timeTaken);

            const updatedParticipant: Participant = { 
                ...participant,
                round3: {
                    score,
                    submissions: finalSubmissions.map(s => ({...s, passed: false})), // This part is tricky, the passed status is on server
                    submittedAt: new Date().toISOString(),
                    timeTakenSeconds: timeTaken,
                }
            };
            localStorage.setItem('participantDetails', JSON.stringify(updatedParticipant));

            toast({ title: "Round 3 Submitted!", description: `You scored ${score} points. Redirecting...`, variant: "default" });
            
            setTimeout(() => {
                router.push('/participant');
            }, 2000);

        } catch (error) {
            toast({ title: "Submission Failed", description: "Could not submit your answers.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };
    handleSubmitRef.current = handleSubmitRound;
    
    useEffect(() => {
        if (!isLoading && problems.length > 0 && !isSubmitting) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        toast({ title: "Time's Up!", description: "Auto-submitting your answers." });
                        handleSubmitRef.current?.();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLoading, problems.length, isSubmitting, toast]);

     const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Round 3: Coding Challenge</CardTitle>
                                <CardDescription>
                                    Write C code from scratch to solve the problems below. Your final score is based on passing all test cases.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <TimerIcon size={28} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                                <Button onClick={handleSubmitRound} disabled={isSubmitting || isLoading}>
                                    {isSubmitting && <Loader2 className='animate-spin' />}
                                    {isSubmitting ? 'Submitting...' : 'Submit Round 3'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[350px]">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : problems.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">The admin has not added any coding problems yet.</p>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {problems.map((problem, index) => (
                                    <AccordionItem value={`item-${index}`} key={problem.id}>
                                        <AccordionTrigger className="text-xl font-headline">
                                            Problem #{index + 1}: {problem.title}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                                {/* Problem Description & Public Test Cases */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">Problem Description</h3>
                                                        <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap font-code text-sm">{problem.description}</pre>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">Public Test Cases</h3>
                                                        <div className="space-y-2">
                                                        {problem.publicTestCases.map((tc, i) => (
                                                            <div key={i} className="border p-2 rounded-md font-code text-sm">
                                                                <p><span className="font-semibold">Input:</span> {tc.input}</p>
                                                                <p><span className="font-semibold">Expected Output:</span> {tc.expectedOutput}</p>
                                                            </div>
                                                        ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Code Editor and Test Results */}
                                                <div className="space-y-4">
                                                    <Label htmlFor={`code-editor-${problem.id}`}>Your C Code</Label>
                                                    <Textarea 
                                                        id={`code-editor-${problem.id}`}
                                                        value={submissions[problem.id]?.code || ''}
                                                        onChange={(e) => handleCodeChange(problem.id, e.target.value)}
                                                        className="font-code h-[450px] bg-muted/50"
                                                        placeholder="Write your C code here..."
                                                    />
                                                
                                                    <div className="flex justify-between items-center border-t pt-4">
                                                        <Button onClick={() => handleRunTests(problem.id)} disabled={submissions[problem.id]?.isCompiling || isSubmitting}>
                                                            {submissions[problem.id]?.isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                                                            {submissions[problem.id]?.isCompiling ? 'Running...' : 'Run Tests'}
                                                        </Button>
                                                    </div>

                                                    {(submissions[problem.id]?.publicTestResults.length > 0 || submissions[problem.id]?.privateTestResults.length > 0) && (
                                                        <div className="border-t pt-4 space-y-6">
                                                            <div>
                                                                <h3 className="text-lg font-semibold mb-4">Public Test Results</h3>
                                                                <div className="space-y-4">
                                                                    {submissions[problem.id].publicTestResults.map((result, index) => (
                                                                        <div key={index} className="border p-4 rounded-md">
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <h4 className="font-semibold">Test Case #{index + 1}</h4>
                                                                                <Badge variant={result.passed ? 'default' : 'destructive'}>
                                                                                    {result.passed ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                                                                                    {result.passed ? 'Passed' : 'Failed'}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-code text-sm">
                                                                                <div><Label>Your Output</Label><pre className={`p-2 rounded-md mt-1 whitespace-pre-wrap ${result.passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>{result.actualOutput}</pre></div>
                                                                                <div><Label>Expected Output</Label><pre className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{result.expectedOutput}</pre></div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <Separator />
                                                            <div>
                                                                <h3 className="text-lg font-semibold mb-4">Private Test Results</h3>
                                                                <div className="flex flex-wrap gap-4">
                                                                    {submissions[problem.id].privateTestResults.map((result, index) => (
                                                                        <Badge key={index} variant={result.passed ? 'default' : 'destructive'}>
                                                                            {result.passed ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                                                                            Private Case #{index + 1}: {result.passed ? 'Passed' : 'Failed'}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                    <CardFooter className='border-t pt-6 flex justify-end'>
                         <Button variant="outline" asChild>
                           <Link href="/participant">Back to Portal</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
