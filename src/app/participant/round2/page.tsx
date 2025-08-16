
"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

declare global {
  interface Window {
    TCC: any;
  }
}

export default function ParticipantRound2() {
    const [code, setCode] = useState('#include <stdio.h>\\n\\nint main() {\\n  printf("Hello, world!\\n");\\n  return 0;\\n}');
    const [output, setOutput] = useState('Compiler not yet loaded. Please wait...');
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
    }, [router]);
    
    const handleScriptLoad = () => {
        if (window.TCC && typeof window.TCC.init === 'function') {
            window.TCC.init().then((loadedTcc: any) => {
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
             setOutput('Error: TCC script did not load correctly.');
        }
    };
    
    const handleRunCode = () => {
        if (!tcc.current) {
            toast({ title: "Compiler Not Ready", description: "Please wait for the compiler to finish loading.", variant: "destructive" });
            return;
        }

        setIsCompiling(true);
        setOutput('Compiling and running...');

        try {
            const exit_code = tcc.current.compile(code);
            if (exit_code !== 0) {
                const error_msg = tcc.current.get_error_message();
                setOutput(`Compilation failed:\\n${error_msg}`);
                setIsCompiling(false);
                return;
            }

            const program_output = tcc.current.run();
            setOutput(`Program exited with code 0.\\nOutput:\\n-------\\n${program_output}`);

        } catch (e: any) {
            console.error("Compilation/Execution error:", e);
            setOutput(`An unexpected error occurred: ${e.message}`);
            toast({ title: "Error", description: "An unexpected error occurred during execution.", variant: "destructive" });
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <>
            <Script src="/tcc-bundle.js" onReady={handleScriptLoad} strategy="lazyOnload" />
            <div className="flex flex-col min-h-screen">
                <SiteHeader />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Round 2: Debugging & Compilation</CardTitle>
                            <CardDescription>
                                Find and fix the bug in the code, then compile and run it. 
                                The initial code is just a placeholder.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
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
                                <Label htmlFor="output">Output</Label>
                                <Card id="output" className='bg-black h-[200px] text-white font-code p-4 overflow-auto'>
                                    <pre className="whitespace-pre-wrap">
                                        {output}
                                    </pre>
                                </Card>
                            </div>
                        </CardContent>
                        <CardFooter className='border-t pt-6 flex justify-between'>
                            <Button onClick={handleRunCode} disabled={isCompiling || !isCompilerReady}>
                                {isCompiling ? <Loader2 className='animate-spin' /> : <Play />}
                                {isCompiling ? 'Running...' : 'Compile & Run'}
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        </>
    );
}
