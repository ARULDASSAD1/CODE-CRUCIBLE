
"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippet, Round2Snippet, runRound2Tests, TestCaseResult } from '@/app/actions';
import { Loader2, Play, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type PrivateTestResult = {
    passed: boolean;
}

export default function ParticipantRound2() {
    const [snippet, setSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    
    const [publicTestResults, setPublicTestResults] = useState<TestCaseResult[]>([]);
    const [privateTestResults, setPrivateTestResults] = useState<PrivateTestResult[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCompiling, setIsCompiling] = useState(false);
    
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const participantDetails = localStorage.getItem('participantDetails');
        if (!participantDetails) {
            router.replace('/participant/register');
        }

        async function fetchSnippet() {
            try {
                const fetchedSnippet = await getRound2Snippet();
                if (fetchedSnippet) {
                    setSnippet(fetchedSnippet);
                    setCode(fetchedSnippet.code);
                } else {
                    setCode('// No debugging snippets have been added by the admin yet.');
                }
            } catch {
                toast({ title: "Error", description: "Could not load debugging snippet.", variant: "destructive" });
                setCode('// Error loading snippet');
            } finally {
                setIsLoading(false);
            }
        }
        fetchSnippet();

    }, [router, toast]);
    
    const handleRunTests = async () => {
        if (!snippet) {
            toast({ title: "No Snippet Loaded", description: "Cannot run your code right now.", variant: "destructive" });
            return;
        }

        setIsCompiling(true);
        setPublicTestResults([]);
        setPrivateTestResults([]);

        try {
            const results = await runRound2Tests(code, snippet.id);
            setPublicTestResults(results.publicResults);
            setPrivateTestResults(results.privateResults);
            toast({
                title: "Tests Finished",
                description: "Check the results below.",
            });
        } catch (error) {
            console.error("Test execution failed", error);
            toast({ title: "Error", description: "Could not run your tests. There might be a compilation error in your code.", variant: "destructive"});
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 2: Debugging Challenge - {snippet?.title || 'Loading...'}</CardTitle>
                        <CardDescription>
                            Find and fix the bug(s) in the C code. Your code will be tested against public and private test cases.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[350px]">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                             <div className="space-y-4">
                                <Label htmlFor="code-editor">Your C Code</Label>
                                <Textarea 
                                    id="code-editor"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="font-code h-[450px] bg-muted/50"
                                    placeholder="Write your C code here..."
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className='border-t pt-6 flex justify-between'>
                        <Button onClick={handleRunTests} disabled={isCompiling || isLoading || !snippet}>
                            {isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                            {isCompiling ? 'Running Tests...' : 'Run Tests'}
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/participant">Back to Portal</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {(publicTestResults.length > 0 || privateTestResults.length > 0) && (
                     <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Test Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Public Test Cases</h3>
                                <div className="space-y-4">
                                    {publicTestResults.map((result, index) => (
                                        <div key={index} className="border p-4 rounded-md">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold">Test Case #{index + 1}</h4>
                                                <Badge variant={result.passed ? 'default' : 'destructive'}>
                                                    {result.passed ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                                                    {result.passed ? 'Passed' : 'Failed'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-code text-sm">
                                                <div>
                                                    <Label>Input</Label>
                                                    <pre className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{result.input}</pre>
                                                </div>
                                                <div>
                                                    <Label>Expected Output</Label>
                                                    <pre className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{result.expectedOutput}</pre>
                                                </div>
                                                <div>
                                                    <Label>Your Output</Label>
                                                    <pre className={`p-2 rounded-md mt-1 whitespace-pre-wrap ${result.passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>{result.actualOutput}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                             <div>
                                <h3 className="text-lg font-semibold mb-4">Private Test Cases</h3>
                                <div className="flex flex-wrap gap-4">
                                    {privateTestResults.map((result, index) => (
                                        <Badge key={index} variant={result.passed ? 'default' : 'destructive'}>
                                             {result.passed ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                                            Test Case #{index + 1}: {result.passed ? 'Passed' : 'Failed'}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </main>
        </div>
    );
}
