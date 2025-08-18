"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEventStatus, updateEventStatus, EventStatus } from '@/app/actions';
import { Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export default function EventControl() {
    const [status, setStatus] = useState<EventStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const fetchedStatus = await getEventStatus();
            setStatus(fetchedStatus);
        } catch (error) {
            toast({ title: "Error", description: "Could not load event status.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleStatusChange = (round: keyof EventStatus, enabled: boolean) => {
        if (!status) return;

        const newStatus: EventStatus = {
            ...status,
            [round]: enabled ? 'enabled' : 'disabled',
        };
        setStatus(newStatus);
    };

    const handleMaxRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!status) return;
        const value = parseInt(e.target.value, 10);
        setStatus({
            ...status,
            maxRegistrations: isNaN(value) ? 0 : value,
        });
    }

    const handleSave = async () => {
        if (!status) return;
        
        setIsSaving(true);
        try {
            await updateEventStatus(status);
            toast({ title: "Success", description: `Event status updated.` });
        } catch {
            toast({ title: "Error", description: "Failed to update event status.", variant: "destructive" });
            // Revert optimistic update
            fetchStatus();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                 <div className='flex justify-between items-center mb-4'>
                    <div/>
                    <div className='flex items-center gap-4'>
                        <Button onClick={fetchStatus} variant="outline" size="icon" disabled={isLoading}>
                           <RefreshCw className={isLoading ? "animate-spin" : ""} />
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin">Back to Dashboard</Link>
                        </Button>
                    </div>
                </div>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Event Control Center</CardTitle>
                        <CardDescription>Manage event settings in real-time. Click "Save Changes" to apply.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading || !status ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label htmlFor="max-registrations" className="text-lg font-medium">Maximum Registrations</Label>
                                        <p className="text-sm text-muted-foreground">Set the maximum number of participants. Use 0 for unlimited.</p>
                                    </div>
                                    <Input
                                        id="max-registrations"
                                        type="number"
                                        value={status.maxRegistrations}
                                        onChange={handleMaxRegChange}
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label htmlFor="round1-switch" className="text-lg font-medium">Round 1: MCQs</Label>
                                        <p className="text-sm text-muted-foreground">Enable this to allow participants to start the MCQ round.</p>
                                    </div>
                                    <Switch
                                        id="round1-switch"
                                        checked={status.round1 === 'enabled'}
                                        onCheckedChange={(checked) => handleStatusChange('round1', checked)}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                     <div className="space-y-1">
                                        <Label htmlFor="round2-switch" className="text-lg font-medium">Round 2: Debugging</Label>
                                        <p className="text-sm text-muted-foreground">Enable this to allow participants to start the debugging round.</p>
                                    </div>
                                    <Switch
                                        id="round2-switch"
                                        checked={status.round2 === 'enabled'}
                                        onCheckedChange={(checked) => handleStatusChange('round2', checked)}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                     <div className="space-y-1">
                                        <Label htmlFor="round3-switch" className="text-lg font-medium">Round 3: Coding</Label>
                                        <p className="text-sm text-muted-foreground">Enable this to allow participants to start the final coding round.</p>
                                    </div>
                                    <Switch
                                        id="round3-switch"
                                        checked={status.round3 === 'enabled'}
                                        onCheckedChange={(checked) => handleStatusChange('round3', checked)}
                                        disabled={isSaving}
                                    />
                                </div>
                                 <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving && <Loader2 className="animate-spin mr-2" />}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
