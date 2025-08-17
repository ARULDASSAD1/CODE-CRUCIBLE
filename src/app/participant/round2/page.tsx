
"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippet, Round2Snippet } from '@/app/actions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// Helper function to normalize code for comparison
const normalizeCode = (str: string) => {
    // Remove all whitespace and newlines, and make it lowercase
    return str.replace(/\s/g, '').toLowerCase();
}

export default function ParticipantRound2() {
    const [snippet, setSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    
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
    
    const handleCheckCode = () => {
        if (!snippet) {
            toast({ title: "No Snippet Loaded", description: "Cannot check your code right now.", variant: "destructive" });
            return;
        }

        setIsChecking(true);

        const isCorrect = normalizeCode(code) === normalizeCode(snippet.correctedCode);

        setTimeout(() => {
            if (isCorrect) {
                toast({
                    title: "Correct!",
                    description: "Your solution is correct. Great job!",
                    className: "bg-green-600 text-white"
                });
            } else {
                toast({
                    title: "Incorrect",
                    description: "Your solution doesn't match the expected output. Please try again.",
                    variant: "destructive"
                });
            }
            setIsChecking(false);
        }, 500); // Simulate a short delay
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 2: Debugging Challenge - {snippet?.title || 'Loading...'}</CardTitle>
                        <CardDescription>
                            Find and fix the bug(s) in the C code below. When you think you have the correct solution, submit it to check.
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
                    </CardContent>
                    <CardFooter className='border-t pt-6 flex justify-between'>
                        <Button onClick={handleCheckCode} disabled={isChecking || isLoading}>
                            {isChecking ? <Loader2 className='animate-spin' /> : <CheckCircle />}
                            {isChecking ? 'Checking...' : 'Submit & Check'}
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
