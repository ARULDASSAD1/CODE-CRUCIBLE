"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getMcqQuestions, saveMcqQuestion, deleteMcqQuestion, McqQuestion } from '@/app/actions';
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


const mcqSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  options: z.array(z.string().min(1, 'Option cannot be empty.')).length(4, 'There must be exactly 4 options.'),
  correctAnswer: z.string().min(1, 'You must select a correct answer.'),
});

type McqFormValues = z.infer<typeof mcqSchema>;

export default function ManageRound1() {
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm<McqFormValues>({
    resolver: zodResolver(mcqSchema),
    defaultValues: {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const options = watch("options");

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const fetchedQuestions = await getMcqQuestions();
      setQuestions(fetchedQuestions);
    } catch (error) {
      toast({ title: "Error", description: "Could not load questions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [toast]);

  const handleFormSubmit: SubmitHandler<McqFormValues> = async (data) => {
    setIsSaving(true);
    try {
      await saveMcqQuestion(data);
      toast({ title: "Success", description: "Question saved successfully." });
      reset();
      fetchQuestions(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to save question.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMcqQuestion(id);
      toast({ title: "Success", description: "Question deleted." });
      fetchQuestions(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete question.", variant: "destructive" });
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
              <CardTitle>Add New MCQ</CardTitle>
              <CardDescription>Create a new multiple-choice question for Round 1.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea id="question" {...register('question')} placeholder="What is the output of printf...?" rows={3} />
                  {errors.question && <p className="text-destructive text-sm">{errors.question.message}</p>}
                </div>

                <div className="space-y-4">
                  <Label>Options & Correct Answer</Label>
                  <p className="text-sm text-muted-foreground">
                    Enter 4 options and select the correct one.
                  </p>
                  <Controller
                    name="correctAnswer"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-2"
                      >
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <RadioGroupItem value={options[index]} id={`option-${index}`} />
                            <Input
                              {...register(`options.${index}`)}
                              placeholder={`Option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.options && <p className="text-destructive text-sm">{errors.options.message}</p>}
                  {errors.correctAnswer && <p className="text-destructive text-sm">{errors.correctAnswer.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Question'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>The list of questions currently saved for Round 1.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : questions.length === 0 ? (
                <p>No questions have been added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {questions.map((q) => (
                    <li key={q.id} className="p-4 border rounded-lg flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{q.question}</p>
                        <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                          {q.options.map((opt, i) => (
                            <li key={i} className={q.correctAnswer === opt ? 'font-bold text-accent' : ''}>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the question.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(q.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
