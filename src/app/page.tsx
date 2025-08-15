"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Terminal } from 'lucide-react';
import { getAIDebuggingSuggestions } from '@/app/actions';
import { SiteHeader } from '@/components/site-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    int x = 10
    printf("Hello, World! %d\\n", x);
    return 0;
}`);
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuggestions('');

    try {
      const result = await getAIDebuggingSuggestions(code);
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        setSuggestions('No suggestions found. The code seems correct!');
      }
    } catch (err) {
      setError('An error occurred while analyzing the code. Please ensure the local AI server is running and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 w-full container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
              AI Code Debugger
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste your C code below. Our AI assistant will analyze it for bugs and suggest improvements to help you learn.
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your C code here..."
                    className="font-code text-sm min-h-[300px] bg-card rounded-md shadow-inner"
                    required
                    aria-label="C Code Input"
                  />
                </div>
                <Button type="submit" disabled={isLoading || !code} className="w-full text-base py-6 font-semibold">
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Wand2 className="mr-2" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Get Suggestions'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {suggestions && (
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Wand2 className="text-primary" /> AI Suggestions
                </CardTitle>
                <CardDescription>
                  Here are the potential issues and improvements identified by the AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-md border border-input">
                  <pre className="font-code text-sm whitespace-pre-wrap leading-relaxed">{suggestions}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Code Crucible. All rights reserved.</p>
      </footer>
    </div>
  );
}
