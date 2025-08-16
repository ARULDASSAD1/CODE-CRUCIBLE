
"use client";

import { useState, useEffect, useRef } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippets, Round2Snippet, Participant } from '@/app/actions';
import { suggestCodeImprovements } from '@/ai/flows/suggest-code-improvements';
import { Loader2, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ParticipantRound2() {
    const [snippets, setSnippets] = useState<Round2Snippet[]>([]);
    const [selectedSnippet, setSelectedSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [aiFeedback, setAiFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const participantDetails = localStorage.getItem('participantDetails');
        if (participantDetails) {
            setParticipant(JSON.parse(participantDetails));
        } else {
            router.replace('/participant/register');
        }

        const fetchSnippets = async () => {
            setIsLoading(true);
            try {
                const fetchedSnippets = await getRound2Snippets();
                setSnippets(fetchedSnippets);
                if (fetchedSnippets.length > 0) {
                    setSelectedSnippet(fetchedSnippets[0]);
                    setCode(fetchedSnippets[0].code);
                }
            } catch (error) {
                toast({ title: "Error", description: "Could not load debugging challenges.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSnippets();
    }, [toast, router]);
    
    const handleSnippetChange = (snippetId: string) => {
        const snippet = snippets.find(s => s.id === snippetId);
        if (snippet) {
            setSelectedSnippet(snippet);
            setCode(snippet.code);
            setAiFeedback('');
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAiFeedback('');
        try {
            const result = await suggestCodeImprovements({ code });
            setAiFeedback(result.suggestions);
            toast({ title: "Analysis Complete", description: "The AI has provided feedback below." });
        } catch (error) {
            toast({ title: "Analysis Failed", description: "Could not get AI feedback. Please try again.", variant: "destructive" });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        // Placeholder for submission logic
        setIsSubmitting(true);
        // Here you would save the final code and timestamp
        toast({ title: "Submitting...", description: "Your final code is being submitted."});
        setTimeout(() => {
            toast({ title: "Code Submitted!", description: "Your solution has been saved."});
            setIsSubmitting(false);
            // router.push('/participant'); // Optional: redirect after submission
        }, 1000);
    }

    const isLoadingResources = isLoading;

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 2: Debugging Challenge</CardTitle>
                        <CardDescription>Fix the bugs in the selected C code snippet. Use the AI analyzer to get feedback on your solution.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoadingResources ? (
                            <div className="col-span-2 flex justify-center items-center h-64">
                                <Loader2 className="animate-spin" size={32} />
                                <span className='ml-4'>Loading Challenges...</span>
                            </div>
                        ) : snippets.length === 0 ? (
                             <p className='col-span-2'>The admin has not added any debugging challenges yet. Please wait.</p>
                        ) : (
                            <>
                                <div className="space-y-4">
                                     <Label>Select Snippet</Label>
                                    <Select onValueChange={handleSnippetChange} defaultValue={selectedSnippet?.id}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a snippet to debug" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {snippets.map((snippet) => (
                                          <SelectItem key={snippet.id} value={snippet.id}>{snippet.title}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Label>Your Code</Label>
                                    <Textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        rows={20}
                                        className="font-code text-sm"
                                        placeholder="Your C code here..."
                                    />
                                </div>
                                <div className="space-y-4">
                                     <div className="flex gap-4">
                                        <Button onClick={handleAnalyze} disabled={isAnalyzing || !code}>
                                            {isAnalyzing && <Loader2 className="animate-spin" />}
                                            <Wand2 />
                                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                                        </Button>
                                    </div>
                                    <Label>AI Feedback</Label>
                                    <Card className='bg-muted'>
                                        <CardContent className="p-4">
                                             {isAnalyzing && (
                                                <div className="flex justify-center items-center h-[400px]">
                                                    <Loader2 className="animate-spin" size={24} />
                                                    <span className="ml-2">AI is thinking...</span>
                                                </div>
                                            )}
                                            {aiFeedback ? (
                                                <Alert>
                                                    <Wand2 />
                                                    <AlertTitle>AI Analysis</AlertTitle>
                                                    <AlertDescription className="whitespace-pre-wrap font-code">
                                                        {aiFeedback}
                                                    </AlertDescription>
                                                </Alert>
                                            ) : !isAnalyzing && (
                                                <pre className="text-sm font-code h-[400px] whitespace-pre-wrap overflow-auto">
                                                    Click "Analyze with AI" to get feedback on your code.
                                                </pre>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </CardContent>
                     {snippets.length > 0 && (
                        <CardFooter className='border-t pt-6 flex justify-end'>
                            <Button onClick={handleSubmit} disabled={isSubmitting || isAnalyzing}>
                                {isSubmitting && <Loader2 className="animate-spin" />}
                                {isSubmitting ? 'Submitting...' : 'Submit Final Code'}
                            </Button>
                        </CardFooter>
                     )}
                </Card>
            </main>
        </div>
    );
}
