
"use client";

import { useState, useEffect, useMemo } from 'react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getParticipants, Participant } from '@/app/actions';
import { Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

type RankedParticipant = Participant & {
    totalScore: number;
    rank: number;
    lastSubmissionTime?: string;
};

export default function Scoreboard() {
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

    const rankedParticipants = useMemo((): RankedParticipant[] => {
        const getLatestTime = (p: Participant) => {
             const times = [
                p.round1?.submittedAt,
                p.round2?.submittedAt,
                p.round3?.submittedAt
            ].filter(Boolean).map(t => new Date(t!).getTime());

            if (times.length === 0) return undefined;
            return new Date(Math.max(...times));
        }

        const withScores = participants.map(p => ({
            ...p,
            totalScore: (p.round1?.score ?? 0) + (p.round2?.score ?? 0) + (p.round3?.score ?? 0),
            lastSubmissionTime: getLatestTime(p)?.toLocaleString()
        }));

        // Separate disqualified participants
        const active = withScores.filter(p => !p.disqualified);
        const disqualified = withScores.filter(p => p.disqualified);

        // Sort active participants by score, then by the earliest final submission time
        active.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            const timeA = getLatestTime(a)?.getTime() || 0;
            const timeB = getLatestTime(b)?.getTime() || 0;
            return timeA - timeB;
        });

        // Assign ranks
        let lastScore = -1;
        let lastRank = 0;
        const ranked = active.map((p, index) => {
            if (p.totalScore !== lastScore) {
                lastRank = index + 1;
                lastScore = p.totalScore;
            }
            return { ...p, rank: lastRank };
        });

        // Add disqualified participants at the end without a rank
        const disqualifiedRanked = disqualified.map(p => ({ ...p, rank: -1 }));

        return [...ranked, ...disqualifiedRanked];
    }, [participants]);

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
                        <CardTitle>Scoreboard</CardTitle>
                        <CardDescription>Live scores and rankings of all participants. Sorted by highest score and then by earliest submission time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : rankedParticipants.length === 0 ? (
                            <p>No participants to display on the scoreboard yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>R1 Score</TableHead>
                                        <TableHead>R2 Score</TableHead>
                                        <TableHead>R3 Score</TableHead>
                                        <TableHead>Total Score</TableHead>
                                        <TableHead>Last Submission</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rankedParticipants.map((p) => (
                                        <TableRow key={p.id} className={p.disqualified ? "bg-muted/50 text-muted-foreground" : ""}>
                                            <TableCell className="font-medium text-lg">
                                                {p.disqualified ? 'DQ' : p.rank}
                                            </TableCell>
                                            <TableCell>{p.teamName}</TableCell>
                                            <TableCell>{p.college}</TableCell>
                                            <TableCell>{p.round1?.score ?? 'N/A'}</TableCell>
                                            <TableCell>{p.round2?.score ?? 'N/A'}</TableCell>
                                            <TableCell>{p.round3?.score ?? 'N/A'}</TableCell>
                                            <TableCell className="font-bold text-lg text-primary">{p.totalScore}</TableCell>
                                            <TableCell>{p.lastSubmissionTime ?? 'N/A'}</TableCell>
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
