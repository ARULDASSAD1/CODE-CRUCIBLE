"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippets, Round2Snippet } from '@/app/actions';
import { suggestCodeImprovements } from '@/ai/flows/suggest-code-improvements';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';

export default function ParticipantRound2() {
    const [snippets, setSnippets] = useState<Round2Snippet[]>([]);
    const [selectedSnippet, setSelectedSnippet] = useState<Round2Snippet | null>(null);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState('');

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
      const participantDetails = localStorage.getItem('participantDetails');
      if (!participantDetails) {
          router.replace('/participant/register');
          return;
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
              console.error("Failed to load snippets:", error);
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
            setAnalysis(''); // Clear analysis when snippet changes
        }
    };

    const handleAnalyzeCode = async () => {
        setIsAnalyzing(true);
        setAnalysis('');
        try {
            const result = await suggestCodeImprovements({ code });
            setAnalysis(result.suggestions);
        } catch (e: any) {
            console.error("Failed to analyze code:", e);
            toast({ title: "Analysis Error", description: "Failed to get AI feedback. Please try again.", variant: "destructive" });
            setAnalysis("An error occurred while analyzing the code.");
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 2: Debugging Challenge</CardTitle>
                        <CardDescription>Find and fix the bugs in the selected C code snippet. Then, use the AI assistant to analyze your code for correctness.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
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
                                        className="font-mono text-sm"
                                        placeholder="Your C code here..."
                                        disabled={isAnalyzing}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>AI Analysis</Label>
                                    <Card className='bg-muted'>
                                        <CardContent className="p-4">
                                            <pre className="whitespace-pre-wrap font-sans text-sm h-[450px] overflow-auto">
                                                {isAnalyzing ? (
                                                  <div className="flex items-center gap-2">
                                                    <Loader2 className='animate-spin' />
                                                    <span>Analyzing...</span>
                                                  </div>
                                                ) : analysis || 'Click "Analyze Code" to get feedback from the AI assistant.'}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </CardContent>
                     {snippets.length > 0 && (
                        <CardFooter className='border-t pt-6 flex justify-between'>
                             <Button onClick={handleAnalyzeCode} disabled={isAnalyzing}>
                                {isAnalyzing && <Loader2 className="animate-spin" />}
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                            </Button>
                        </CardFooter>
                     )}
                </Card>
            </main>
        </div>
    );
}
