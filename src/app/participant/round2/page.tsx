
"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippet, Round2Snippet } from '@/app/actions';
import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

declare global {
  interface Window {
    TCC: any;
  }
}

export default function ParticipantRound2() {
    const [snippet, setSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('Compiler not yet loaded. Please wait...');
    const [isLoading, setIsLoading] = useState(true);
    const [isCompiling, setIsCompiling] = useState(false);
    const [isCompilerReady, setIsCompilerReady] = useState(false);
    const tcc = useRef<any>(null);
    
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

        const script = document.createElement('script');
        script.src = '/tcc-bundle.js';
        script.async = true;
        
        script.onload = () => {
            if (window.TCC && typeof window.TCC.init === 'function') {
                window.TCC.init({
                    wasm_path: '/tcc.wasm'
                }).then((loadedTcc: any) => {
                    tcc.current = loadedTcc;
                    setIsCompilerReady(true);
                    setOutput('Compiler loaded. Ready to run code.');
                    toast({ title: "Compiler Ready", description: "The C compiler has loaded successfully." });
                }).catch((err: any) => {
                    console.error("TCC initialization failed:", err);
                    setOutput('Error: Could not initialize the C compiler.');
                    toast({ title: "Compiler Error", description: "Failed to load the C compiler.", variant: "destructive" });
                });
            } else {
                 console.error("TCC script loaded, but window.TCC.init is not a function.");
                 setOutput('Error: TCC script loaded incorrectly.');
            }
        };

        script.onerror = () => {
            setOutput('Fatal Error: Could not load tcc-bundle.js. Check network connection or file path.');
            toast({ title: "Fatal Error", description: "Could not load tcc-bundle.js.", variant: "destructive" });
        };
        
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

    }, [router, toast]);
    
    const handleRunCode = () => {
        if (!tcc.current) {
            toast({ title: "Compiler Not Ready", description: "Please wait for the compiler to finish loading.", variant: "destructive" });
            return;
        }

        setIsCompiling(true);
        setOutput('Compiling and running...');
        let captured_stdout = "";
        let captured_stderr = "";

        try {
            tcc.current.set_stdout(function(c: number) { captured_stdout += String.fromCharCode(c) });
            tcc.current.set_stderr(function(c: number) { captured_stderr += String.fromCharCode(c) });

            const exit_code = tcc.current.compile(code);
            
            if (exit_code !== 0) {
                setOutput(`Compilation failed:\n${captured_stderr || "Check code for errors."}`);
            } else {
                 tcc.current.run("main");
                 const finalOutput = captured_stdout || captured_stderr || "Program executed without output.";
                 setOutput(`Program exited.\nOutput:\n-------\n${finalOutput}`);
            }
        } catch (e: any) {
            console.error("Compilation/Execution error:", e);
            setOutput(`An unexpected error occurred: ${e.message}`);
            toast({ title: "Error", description: "An unexpected error occurred during execution.", variant: "destructive" });
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
                            Find and fix the bug(s) in the C code below, then compile and run it to verify your solution.
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
                                    className="font-code h-[350px] bg-muted/50"
                                    placeholder="Write your C code here..."
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <Label htmlFor="output">Output</Label>
                            <Card id="output" className='bg-black h-[200px] text-white font-code p-4 overflow-auto'>
                                <pre className="whitespace-pre-wrap">
                                    {output}
                                </pre>
                            </Card>
                        </div>
                    </CardContent>
                    <CardFooter className='border-t pt-6 flex justify-between'>
                        <Button onClick={handleRunCode} disabled={isCompiling || !isCompilerReady || isLoading}>
                            {isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                            {isCompiling ? 'Running...' : 'Compile & Run'}
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
