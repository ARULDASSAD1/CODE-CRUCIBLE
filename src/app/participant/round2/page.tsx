
"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippet, Round2Snippet, compileAndRunCode } from '@/app/actions';
import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function ParticipantRound2() {
    const [snippet, setSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [manualInput, setManualInput] = useState('');
    const [output, setOutput] = useState('// Compiler output will appear here...');
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
                    setManualInput('5\n10\n20\n30\n40\n50'); // Default input for the sample problem
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
    
    const handleRunCode = async () => {
        if (!snippet) {
            toast({ title: "No Snippet Loaded", description: "Cannot run your code right now.", variant: "destructive" });
            return;
        }

        setIsCompiling(true);
        setOutput('Compiling...');
        try {
            const result = await compileAndRunCode(code, manualInput);
            setOutput(result.output);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Code compiled and ran successfully.",
                });
            } else {
                 toast({
                    title: "Finished",
                    description: "Code execution finished, check output for errors.",
                    variant: "destructive",
                });
            }

        } catch (error) {
            console.error("Code execution failed", error);
            toast({ title: "Error", description: "Could not run your code. Please try again.", variant: "destructive"});
            setOutput('An unexpected error occurred.');
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
                            Find and fix the bug(s) in the C code below. Provide input if needed, then compile and run to check your solution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[350px]">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label htmlFor="code-editor">Your C Code</Label>
                                        <Textarea 
                                            id="code-editor"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="font-code h-[350px] bg-muted/50"
                                            placeholder="Write your C code here..."
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="input-area">Input (for scanf)</Label>
                                        <Textarea 
                                            id="input-area"
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            className="font-code h-[350px] bg-muted/50"
                                            placeholder="Enter input for your program, one value per line..."
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <Label htmlFor="output-area">Output</Label>
                                     <pre id="output-area" className="whitespace-pre-wrap font-code text-sm bg-muted p-4 rounded-md h-[200px] overflow-auto">
                                        <code>
                                            {output}
                                        </code>
                                    </pre>
                                </div>
                             </>
                        )}
                    </CardContent>
                    <CardFooter className='border-t pt-6 flex justify-between'>
                        <Button onClick={handleRunCode} disabled={isCompiling || isLoading || !snippet}>
                            {isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                            {isCompiling ? 'Compiling...' : 'Compile & Run'}
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/participant">Back to Portal</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
