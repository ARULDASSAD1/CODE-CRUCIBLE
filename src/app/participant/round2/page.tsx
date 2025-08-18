"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippets, Round2Snippet, runRound2Tests, TestCaseResult, submitRound2, Participant, getInstructions, getEventStatus, EventStatus } from '@/app/actions';
import { Loader2, Play, CheckCircle2, XCircle, TimerIcon, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

type PrivateTestResult = {
    passed: boolean;
};

type SubmissionState = {
    [snippetId: string]: {
        code: string;
        publicTestResults: TestCaseResult[];
        privateTestResults: PrivateTestResult[];
        isCompiling: boolean;
    };
};

const ROUND_DURATION_SECONDS = 20 * 60; // 20 minutes

function InstructionsScreen({ instructions, onStart, isRoundEnabled }: { instructions: string, onStart: () => void, isRoundEnabled: boolean }) {
    const [isAgreed, setIsAgreed] = useState(false);

    return (
         <Card>
            <CardHeader>
                <CardTitle>Round 2 Instructions</CardTitle>
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
                    Start Round 2
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function ParticipantRound2() {
    const [snippets, setSnippets] = useState<Round2Snippet[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionState>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
    const [roundStarted, setRoundStarted] = useState(false);
    const [roundInstructions, setRoundInstructions] = useState('');
    const [eventStatus, setEventStatus] = useState<EventStatus | null>(null);

    const { toast } = useToast();
    const router = useRouter();
    const handleSubmitRef = useRef<() => void>();

    useEffect(() => {
        const participantDetails = localStorage.getItem('participantDetails');
        if (participantDetails) {
            const parsedDetails: Participant = JSON.parse(participantDetails);
            setParticipant(parsedDetails);
             if (parsedDetails.round2) {
                 toast({
                    title: "Already Submitted",
                    description: "You have already completed Round 2.",
                    variant: "destructive"
                });
                router.replace('/participant');
                return;
            }
        } else {
            router.replace('/participant/register');
            return;
        }

        async function fetchInitialData() {
            try {
                const [fetchedSnippets, instructionsData, status] = await Promise.all([
                    getRound2Snippets(),
                    getInstructions(),
                    getEventStatus()
                ]);

                setSnippets(fetchedSnippets);
                setRoundInstructions(instructionsData.round2);
                setEventStatus(status);
                
                const initialSubmissions: SubmissionState = {};
                for (const snippet of fetchedSnippets) {
                    initialSubmissions[snippet.id] = {
                        code: snippet.code,
                        publicTestResults: [],
                        privateTestResults: [],
                        isCompiling: false,
                    };
                }
                setSubmissions(initialSubmissions);

            } catch {
                toast({ title: "Error", description: "Could not load round data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitialData();

    }, [router, toast]);
    
    const handleCodeChange = (snippetId: string, newCode: string) => {
        setSubmissions(prev => ({
            ...prev,
            [snippetId]: { ...prev[snippetId], code: newCode }
        }));
    };

    const handleRunTests = async (snippetId: string) => {
        const snippetSubmission = submissions[snippetId];
        if (!snippetSubmission) return;

        setSubmissions(prev => ({ ...prev, [snippetId]: { ...prev[snippetId], isCompiling: true }}));

        try {
            const results = await runRound2Tests(snippetSubmission.code, snippetId);
            setSubmissions(prev => ({
                ...prev,
                [snippetId]: {
                    ...prev[snippetId],
                    publicTestResults: results.publicResults,
                    privateTestResults: results.privateResults,
                }
            }));
            toast({ title: "Tests Finished", description: "Check the results for this snippet." });
        } catch (error) {
            console.error("Test execution failed", error);
            toast({ title: "Error", description: "Could not run your tests. There might be a compilation error.", variant: "destructive"});
        } finally {
            setSubmissions(prev => ({ ...prev, [snippetId]: { ...prev[snippetId], isCompiling: false }}));
        }
    };
    
    const handleSubmitRound = async () => {
        if (!participant || isSubmitting) return;

        setIsSubmitting(true);
        toast({ title: "Submitting Round 2...", description: "Your code is being evaluated." });

        const timeTaken = ROUND_DURATION_SECONDS - timeLeft;

        const finalSubmissions = Object.entries(submissions).map(([snippetId, state]) => ({
            snippetId,
            code: state.code
        }));

        try {
            const { score } = await submitRound2(participant.id, finalSubmissions, timeTaken);

            const updatedParticipant: Participant = { 
                ...participant,
                round2: {
                    score,
                    submissions: finalSubmissions.map(s => ({...s, passed: false})), // This part is tricky, the passed status is on server
                    submittedAt: new Date().toISOString(),
                    timeTakenSeconds: timeTaken,
                }
            };
            localStorage.setItem('participantDetails', JSON.stringify(updatedParticipant));

            toast({ title: "Round 2 Submitted!", description: `You scored ${score} points. Redirecting...`, variant: "default" });
            
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
        if (!isLoading && snippets.length > 0 && !isSubmitting && roundStarted) {
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
    }, [isLoading, snippets.length, isSubmitting, roundStarted, toast]);

     const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-[350px]">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : !roundStarted ? (
                     <InstructionsScreen instructions={roundInstructions} onStart={() => setRoundStarted(true)} isRoundEnabled={eventStatus?.round2 === 'enabled'} />
                ) : (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Round 2: Debugging Challenge</CardTitle>
                                <CardDescription>
                                    Find and fix the bugs in the C code snippets below. Your final score is based on passing all test cases.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <TimerIcon size={28} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                                <Button onClick={handleSubmitRound} disabled={isSubmitting || isLoading}>
                                    {isSubmitting && <Loader2 className='animate-spin' />}
                                    {isSubmitting ? 'Submitting...' : 'Submit Round 2'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {snippets.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">The admin has not added any debugging challenges yet.</p>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {snippets.map((snippet, index) => (
                                    <AccordionItem value={`item-${index}`} key={snippet.id}>
                                        <AccordionTrigger className="text-xl font-headline">
                                            Challenge #{index + 1}: {snippet.title}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 gap-6 p-2">
                                                <div className="space-y-4">
                                                    <Label htmlFor={`code-editor-${snippet.id}`}>Your C Code</Label>
                                                    <Textarea 
                                                        id={`code-editor-${snippet.id}`}
                                                        value={submissions[snippet.id]?.code || ''}
                                                        onChange={(e) => handleCodeChange(snippet.id, e.target.value)}
                                                        className="font-code h-[450px] bg-muted/50"
                                                        placeholder="Write your C code here..."
                                                    />
                                                </div>
                                                
                                                <div className="flex justify-between items-center border-t pt-4">
                                                    <Button onClick={() => handleRunTests(snippet.id)} disabled={submissions[snippet.id]?.isCompiling || isSubmitting}>
                                                        {submissions[snippet.id]?.isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                                                        {submissions[snippet.id]?.isCompiling ? 'Running...' : 'Run Tests'}
                                                    </Button>
                                                </div>

                                                {(submissions[snippet.id]?.publicTestResults.length > 0 || submissions[snippet.id]?.privateTestResults.length > 0) && (
                                                    <div className="border-t pt-4 space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Public Test Cases</h3>
                                                            <div className="space-y-4">
                                                                {submissions[snippet.id].publicTestResults.map((result, index) => (
                                                                    <div key={index} className="border p-4 rounded-md">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <h4 className="font-semibold">Test Case #{index + 1}</h4>
                                                                            <Badge variant={result.passed ? 'default' : 'destructive'}>
                                                                                {result.passed ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                                                                                {result.passed ? 'Passed' : 'Failed'}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-code text-sm">
                                                                            <div><Label>Input</Label><pre className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{result.input}</pre></div>
                                                                            <div><Label>Expected Output</Label><pre className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{result.expectedOutput}</pre></div>
                                                                            <div><Label>Your Output</Label><pre className={`p-2 rounded-md mt-1 whitespace-pre-wrap ${result.passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>{result.actualOutput}</pre></div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Private Test Cases</h3>
                                                            <div className="flex flex-wrap gap-4">
                                                                {submissions[snippet.id].privateTestResults.map((result, index) => (
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
                )}
            </main>
        </div>
    );
}
