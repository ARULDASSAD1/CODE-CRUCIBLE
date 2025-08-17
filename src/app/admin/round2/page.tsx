
"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getRound2Snippets, saveRound2Snippet, deleteRound2Snippet, Round2Snippet } from '@/app/actions';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';


const snippetSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  code: z.string().min(1, 'Buggy code snippet cannot be empty.'),
  correctedCode: z.string().min(1, 'Corrected code snippet cannot be empty.'),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;


export default function ManageRound2() {
  const [snippets, setSnippets] = useState<Round2Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      code: '',
      correctedCode: ''
    },
  });

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      const fetchedSnippets = await getRound2Snippets();
      setSnippets(fetchedSnippets);
    } catch (error) {
      toast({ title: "Error", description: "Could not load snippets.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleFormSubmit: SubmitHandler<SnippetFormValues> = async (data) => {
    setIsSaving(true);
    try {
      await saveRound2Snippet(data);
      toast({ title: "Success", description: "Snippet saved successfully." });
      reset();
      await fetchSnippets(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to save snippet.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRound2Snippet(id);
      toast({ title: "Success", description: "Snippet deleted." });
      await fetchSnippets(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete snippet.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className='flex justify-end mb-4'>
            <Button asChild variant="outline">
                <Link href="/admin">Back to Dashboard</Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Debugging Snippet</CardTitle>
              <CardDescription>Provide a buggy C code snippet and its corrected version for Round 2.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Snippet Title</Label>
                  <Textarea id="title" {...register('title')} placeholder="e.g., Array Average Bug" />
                  {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="code">Buggy C Code</Label>
                  <Textarea id="code" {...register('code')} placeholder="#include <stdio.h> ..." rows={8} className="font-code"/>
                  {errors.code && <p className="text-destructive text-sm">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correctedCode">Corrected C Code</Label>
                  <Textarea id="correctedCode" {...register('correctedCode')} placeholder="#include <stdio.h> ..." rows={8} className="font-code"/>
                  {errors.correctedCode && <p className="text-destructive text-sm">{errors.correctedCode.message}</p>}
                </div>
              </CardContent>
              <CardFooter className='justify-between'>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Snippet'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Snippet Bank</CardTitle>
              <CardDescription>List of debugging challenges for Round 2.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : snippets.length === 0 ? (
                <p>No snippets have been added yet.</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <ul className="space-y-4">
                    {snippets.map((s) => (
                      <li key={s.id} className="p-4 border rounded-lg flex items-start gap-4">
                        <div className='flex-1'>
                          <p className="font-semibold">{s.title}</p>
                           <pre className="whitespace-pre-wrap font-code text-sm bg-muted p-2 rounded-md mt-2">
                                <code className='text-red-400'>
                                    {s.code}
                                </code>
                           </pre>
                            <pre className="whitespace-pre-wrap font-code text-sm bg-muted p-2 rounded-md mt-2">
                                <code className='text-green-400'>
                                    {s.correctedCode}
                                </code>
                           </pre>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0">
                                  <Trash2 size={18} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the snippet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
