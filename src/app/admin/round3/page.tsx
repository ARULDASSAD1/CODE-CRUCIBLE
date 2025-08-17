
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getRound3Problems, saveRound3Problem, deleteRound3Problem, Round3Problem } from '@/app/actions';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';


const testCaseSchema = z.object({
  input: z.string(), // Allow empty input for programs that don't require it
  expectedOutput: z.string().min(1, "Expected output cannot be empty"),
});

const problemSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  description: z.string().min(1, 'Problem description cannot be empty.'),
  publicTestCases: z.array(testCaseSchema).min(1, "You must provide at least one public test case."),
  privateTestCases: z.array(testCaseSchema).min(1, "You must provide at least one private test case."),
});

type ProblemFormValues = z.infer<typeof problemSchema>;


export default function ManageRound3() {
  const [problems, setProblems] = useState<Round3Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ProblemFormValues>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      publicTestCases: [{ input: '', expectedOutput: '' }],
      privateTestCases: [{ input: '', expectedOutput: '' }]
    },
  });

  const { fields: publicTestCases, append: appendPublicTestCase, remove: removePublicTestCase } = useFieldArray({
    control,
    name: "publicTestCases"
  });

  const { fields: privateTestCases, append: appendPrivateTestCase, remove: removePrivateTestCase } = useFieldArray({
    control,
    name: "privateTestCases"
  });

  const fetchProblems = async () => {
    setIsLoading(true);
    try {
      const fetchedProblems = await getRound3Problems();
      setProblems(fetchedProblems);
    } catch (error) {
      toast({ title: "Error", description: "Could not load problems.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleFormSubmit: SubmitHandler<ProblemFormValues> = async (data) => {
    setIsSaving(true);
    try {
      await saveRound3Problem(data);
      toast({ title: "Success", description: "Problem saved successfully." });
      reset();
      await fetchProblems(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to save problem.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRound3Problem(id);
      toast({ title: "Success", description: "Problem deleted." });
      await fetchProblems(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete problem.", variant: "destructive" });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Add Coding Problem</CardTitle>
              <CardDescription>Create a new programming challenge for Round 3.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                  <Label htmlFor="title">Problem Title</Label>
                  <Input id="title" {...register('title')} placeholder="e.g., Sum of Two Numbers" />
                  {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="description">Problem Description</Label>
                  <Textarea id="description" {...register('description')} placeholder="Write a C program that..." rows={8} className="font-code"/>
                  {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                </div>

                <Separator />

                {/* PUBLIC TEST CASES */}
                <div className="space-y-4">
                    <Label className="text-lg">Public Test Cases</Label>
                    {errors.publicTestCases?.root && <p className="text-destructive text-sm">{errors.publicTestCases.root.message}</p>}
                    {publicTestCases.map((field, index) => (
                        <div key={field.id} className="space-y-2 border p-4 rounded-md relative">
                            <Label>Test Case {index + 1}</Label>
                            <Textarea {...register(`publicTestCases.${index}.input`)} placeholder="Input (stdin). Use newlines for multiple inputs." rows={2} />
                             {errors.publicTestCases?.[index]?.input && <p className="text-destructive text-sm">{errors.publicTestCases[index]?.input?.message}</p>}
                            <Textarea {...register(`publicTestCases.${index}.expectedOutput`)} placeholder="Expected Output (stdout). Use newlines for multiple lines." rows={2} />
                             {errors.publicTestCases?.[index]?.expectedOutput && <p className="text-destructive text-sm">{errors.publicTestCases[index]?.expectedOutput?.message}</p>}
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePublicTestCase(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => appendPublicTestCase({ input: '', expectedOutput: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Public Test Case
                    </Button>
                </div>

                <Separator />

                {/* PRIVATE TEST CASES */}
                <div className="space-y-4">
                    <Label className="text-lg">Private Test Cases</Label>
                     {errors.privateTestCases?.root && <p className="text-destructive text-sm">{errors.privateTestCases.root.message}</p>}
                    {privateTestCases.map((field, index) => (
                        <div key={field.id} className="space-y-2 border p-4 rounded-md relative">
                            <Label>Test Case {index + 1}</Label>
                            <Textarea {...register(`privateTestCases.${index}.input`)} placeholder="Input (stdin). Use newlines for multiple inputs." rows={2} />
                             {errors.privateTestCases?.[index]?.input && <p className="text-destructive text-sm">{errors.privateTestCases[index]?.input?.message}</p>}
                            <Textarea {...register(`privateTestCases.${index}.expectedOutput`)} placeholder="Expected Output (stdout). Use newlines for multiple lines." rows={2} />
                             {errors.privateTestCases?.[index]?.expectedOutput && <p className="text-destructive text-sm">{errors.privateTestCases[index]?.expectedOutput?.message}</p>}
                             <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePrivateTestCase(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPrivateTestCase({ input: '', expectedOutput: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Private Test Case
                    </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Problem'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Problem Bank</CardTitle>
              <CardDescription>List of programming challenges for Round 3.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : problems.length === 0 ? (
                <p>No problems have been added yet.</p>
              ) : (
                <ScrollArea className="h-[700px]">
                  <ul className="space-y-4">
                    {problems.map((p) => (
                      <li key={p.id} className="p-4 border rounded-lg flex items-start gap-4">
                        <div className='flex-1'>
                          <p className="font-semibold">{p.title}</p>
                           <pre className="whitespace-pre-wrap font-code text-sm bg-muted p-2 rounded-md mt-2">
                               {p.description}
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
                                  This action cannot be undone. This will permanently delete the problem.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
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
