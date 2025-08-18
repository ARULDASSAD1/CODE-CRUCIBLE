
"use client";

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getParticipants, Participant, toggleDisqualify, deleteParticipant, deleteParticipants, advanceToRound3 } from '@/app/actions';
import { Loader2, RefreshCw, Trash2, UserX, UserCheck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function ManageParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const { toast } = useToast();

    const fetchParticipants = async () => {
        setIsLoading(true);
        try {
            const fetchedParticipants = await getParticipants();
            setParticipants(fetchedParticipants.sort((a,b) => a.name.localeCompare(b.name)));
        } catch (error) {
            toast({ title: "Error", description: "Could not load participants.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    const handleDisqualifyToggle = async (id: string) => {
        setActioningId(id);
        try {
            await toggleDisqualify(id);
            await fetchParticipants();
            toast({ title: "Success", description: "Participant status updated." });
        } catch {
            toast({ title: "Error", description: "Failed to update participant status.", variant: "destructive" });
        } finally {
            setActioningId(null);
        }
    };
    
    const handleDelete = async (id: string) => {
        setActioningId(id);
        try {
            await deleteParticipant(id);
            await fetchParticipants();
            toast({ title: "Success", description: "Participant has been deleted." });
        } catch {
            toast({ title: "Error", description: "Failed to delete participant.", variant: "destructive" });
        } finally {
            setActioningId(null);
        }
    }

    const handleBulkDelete = async () => {
        try {
            await deleteParticipants(selectedParticipants);
            toast({ title: "Success", description: `${selectedParticipants.length} participants deleted.` });
            setSelectedParticipants([]);
            await fetchParticipants();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete selected participants.", variant: "destructive" });
        }
      };
    
      const handleSelectParticipant = (id: string, isSelected: boolean) => {
        setSelectedParticipants(prev => 
            isSelected ? [...prev, id] : prev.filter(pid => pid !== id)
        );
      };
    
      const handleSelectAll = (isAllSelected: boolean) => {
        setSelectedParticipants(isAllSelected ? participants.map(p => p.id) : []);
      }

      const handleAdvanceToRound3 = async (id: string) => {
        setActioningId(id);
        try {
            await advanceToRound3(id);
            await fetchParticipants();
            toast({ title: "Success", description: "Participant has been advanced to Round 3." });
        } catch {
            toast({ title: "Error", description: "Failed to advance participant.", variant: "destructive" });
        } finally {
            setActioningId(null);
        }
      }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                 <div className='flex justify-between items-center mb-4'>
                    {selectedParticipants.length > 0 ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete ({selectedParticipants.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete {selectedParticipants.length} participants.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : <div/>}
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
                                        <TableHead className="w-[50px]">
                                             <Checkbox
                                                checked={selectedParticipants.length === participants.length && participants.length > 0}
                                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Round 1 Status</TableHead>
                                        <TableHead>Round 1 Score</TableHead>
                                        <TableHead>Round 2 Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participants.map((p) => (
                                        <TableRow key={p.id} className={p.disqualified ? "bg-muted/50 text-muted-foreground" : ""}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedParticipants.includes(p.id)}
                                                    onCheckedChange={(checked) => handleSelectParticipant(p.id, !!checked)}
                                                    aria-label={`Select ${p.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell>{p.college}</TableCell>
                                            <TableCell>
                                                {p.round1 ? (
                                                    <Badge variant={p.disqualified ? "outline" : "secondary"}>Submitted</Badge>
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{p.round1?.score ?? 'N/A'}</TableCell>
                                            <TableCell>{p.round2?.score ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                 {p.disqualified ? (
                                                    <Badge variant="destructive">Disqualified</Badge>
                                                ) : (
                                                    <Badge>Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className='flex gap-2 justify-end'>
                                                    {p.round2 && !p.advancedToRound3 && (!p.round3) && (
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => handleAdvanceToRound3(p.id)}
                                                            disabled={actioningId === p.id}
                                                            title="Manually advance to Round 3"
                                                        >
                                                             {actioningId === p.id ? <Loader2 className='animate-spin' /> : <ShieldCheck />}
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => handleDisqualifyToggle(p.id)}
                                                        disabled={actioningId === p.id}
                                                    >
                                                        {actioningId === p.id ? <Loader2 className='animate-spin' /> : p.disqualified ? <UserCheck /> : <UserX />}
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="ghost" className='text-destructive hover:text-destructive' disabled={actioningId === p.id}>
                                                                {actioningId === p.id ? <Loader2 className='animate-spin' /> : <Trash2 />}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete {p.name}'s record.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
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
