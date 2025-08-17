
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

export default function ParticipantRound2() {
    const [snippet, setSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [consoleContent, setConsoleContent] = useState('');
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
                    // Pre-fill the console with sample input for the user
                    setConsoleContent('5\n10\n20\n30\n40\n50\n'); 
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
        // Append a 'compiling' message to the console
        setConsoleContent(prev => prev + "\n> Compiling and running...\n");

        try {
            const result = await compileAndRunCode(code, consoleContent);
            
            // Append the actual output from the compiler/program
            setConsoleContent(prev => prev + result.output);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Code compiled and ran successfully.",
                });
            } else {
                 toast({
                    title: "Finished",
                    description: "Execution finished. Check the console for output or errors.",
                    variant: "destructive",
                });
            }

        } catch (error) {
            console.error("Code execution failed", error);
            const errorMessage = "\n> An unexpected error occurred. Please try again.\n";
            setConsoleContent(prev => prev + errorMessage);
            toast({ title: "Error", description: "Could not run your code.", variant: "destructive"});
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
                            Find and fix the bug(s) in the C code below. Provide input in the console if needed, then compile and run to check your solution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[350px]">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="space-y-4">
                                    <Label htmlFor="console-area">Console (Input / Output)</Label>
                                    <Textarea 
                                        id="console-area"
                                        value={consoleContent}
                                        onChange={(e) => setConsoleContent(e.target.value)}
                                        className="font-code h-[450px] bg-muted/50 text-foreground"
                                        placeholder="Enter input for your program here... output will also appear here."
                                    />
                                </div>
                            </div>
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
