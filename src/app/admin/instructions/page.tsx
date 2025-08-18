"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getInstructions, saveInstructions, Instructions } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

export default function ManageInstructions() {
    const [instructions, setInstructions] = useState<Instructions>({ general: '', round1: '', round2: '', round3: ''});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getInstructions()
            .then(data => setInstructions(data))
            .catch(() => toast({ title: "Error", description: "Could not load instructions.", variant: "destructive" }))
            .finally(() => setIsLoading(false));
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveInstructions(instructions);
            toast({
                title: "Success",
                description: "Instructions have been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save instructions.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleInstructionChange = (key: keyof Instructions, value: string) => {
        setInstructions(prev => ({ ...prev, [key]: value }));
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className='flex justify-end mb-4'>
                    <Button asChild variant="outline">
                        <Link href="/admin">Back to Dashboard</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Instructions</CardTitle>
                        <CardDescription>Write the instructions that participants will see before the event and before each round.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className='space-y-2'>
                                    <Label htmlFor='general-instructions'>General Instructions (Homepage)</Label>
                                    <Textarea
                                        id="general-instructions"
                                        placeholder="Enter general event instructions here..."
                                        value={instructions.general}
                                        onChange={(e) => handleInstructionChange('general', e.target.value)}
                                        rows={8}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='round1-instructions'>Round 1 Instructions</Label>
                                    <Textarea
                                        id="round1-instructions"
                                        placeholder="Enter instructions for the MCQ round..."
                                        value={instructions.round1}
                                        onChange={(e) => handleInstructionChange('round1', e.target.value)}
                                        rows={8}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='round2-instructions'>Round 2 Instructions</Label>
                                    <Textarea
                                        id="round2-instructions"
                                        placeholder="Enter instructions for the Debugging round..."
                                        value={instructions.round2}
                                        onChange={(e) => handleInstructionChange('round2', e.target.value)}
                                        rows={8}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='round3-instructions'>Round 3 Instructions</Label>
                                    <Textarea
                                        id="round3-instructions"
                                        placeholder="Enter instructions for the Coding round..."
                                        value={instructions.round3}
                                        onChange={(e) => handleInstructionChange('round3', e.target.value)}
                                        rows={8}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving && <Loader2 className="animate-spin" />}
                                        {isSaving ? 'Saving...' : 'Save All Instructions'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
