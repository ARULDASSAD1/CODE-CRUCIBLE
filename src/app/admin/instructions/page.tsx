"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getInstructions, saveInstructions } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ManageInstructions() {
    const [instructions, setInstructions] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getInstructions()
            .then(data => setInstructions(data.instructions || ''))
            .catch(() => toast({ title: "Error", description: "Could not load instructions.", variant: "destructive" }))
            .finally(() => setIsLoading(false));
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveInstructions({ instructions });
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
                        <CardDescription>Write the instructions that participants will see before the event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                <Textarea
                                    placeholder="Enter event instructions here..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    rows={15}
                                    disabled={isSaving}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving && <Loader2 className="animate-spin" />}
                                        {isSaving ? 'Saving...' : 'Save Instructions'}
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
