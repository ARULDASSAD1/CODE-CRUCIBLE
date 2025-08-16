"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getParticipants, Participant } from '@/app/actions';
import { Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default function ManageParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchParticipants = async () => {
        setIsLoading(true);
        try {
            const fetchedParticipants = await getParticipants();
            setParticipants(fetchedParticipants);
        } catch (error) {
            toast({ title: "Error", description: "Could not load participants.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                 <div className='flex justify-between items-center mb-4'>
                    <div/>
                    <div className='flex items-center gap-4'>
                        <Button onClick={fetchParticipants} variant="outline" size="icon" disabled={isLoading}>
                           <RefreshCw className={isLoading ? "animate-spin" : ""} />
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin">Back to Dashboard</Link>
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Participant Management</CardTitle>
                        <CardDescription>View all registered participants and their submission status for each round.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && participants.length === 0 ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : participants.length === 0 ? (
                            <p>No participants have registered yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>Member Name</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Round 1 Status</TableHead>
                                        <TableHead>Round 1 Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participants.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.teamName}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.college}</TableCell>
                                            <TableCell>
                                                {p.round1 ? (
                                                    <Badge variant="secondary">Submitted</Badge>
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{p.round1?.score ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                 {p.disqualified ? (
                                                    <Badge variant="destructive">Disqualified</Badge>
                                                ) : (
                                                    <Badge>Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {/* Action buttons will go here */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
