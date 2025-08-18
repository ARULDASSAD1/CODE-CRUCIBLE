
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListChecks, Bug, Code, Loader2, LogOut, User, Lock } from "lucide-react";
import { getParticipant, Participant, getMcqQuestions, getRound2TotalPossibleScore } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function ParticipantPortal() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [round1Total, setRound1Total] = useState(0);
  const [round2Total, setRound2Total] = useState(0);

  useEffect(() => {
    const participantId = sessionStorage.getItem('participantId');
    if (!participantId) {
      router.replace('/participant/login');
    } else {
        Promise.all([
            getParticipant(participantId),
            getMcqQuestions(),
            getRound2TotalPossibleScore(),
        ]).then(([p, mcqs, r2Total]) => {
            if (p) {
                setParticipant(p);
                setRound1Total(mcqs.length);
                setRound2Total(r2Total);
            } else {
                toast({ title: "Error", description: "Could not find participant details.", variant: "destructive" });
                sessionStorage.removeItem('participantId');
                router.replace('/participant/login');
            }
        }).finally(() => {
            setLoading(false);
        });
    }
  }, [router, toast]);

  const handleLogout = () => {
    sessionStorage.removeItem('participantId');
    router.push('/');
  };

  const isRound1Completed = !!participant?.round1;
  const isRound1Passed = isRound1Completed && round1Total > 0 && (participant.round1!.score / round1Total * 100) >= 60;

  const isRound2Unlocked = isRound1Completed && isRound1Passed;
  const isRound2Completed = !!participant?.round2;
  const isRound2Passed = isRound2Completed && round2Total > 0 && (participant.round2!.score / round2Total * 100) >= 50;
  
  const isRound3Unlocked = isRound2Completed && (isRound2Passed || !!participant?.advancedToRound3);

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin" size={48} />
            </main>
        </div>
    )
  }
  
  if (participant?.disqualified) {
    return (
       <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Disqualified</CardTitle>
                        <CardDescription>You have been disqualified from the event. Please contact an event organizer for more information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="outline" onClick={handleLogout}>
                            <LogOut /> Logout
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 w-full container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                Participant Portal
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
                Welcome, {participant?.name}! Here are the rounds.
              </p>
            </div>
            <div className='flex items-center gap-2'>
                <Button variant="outline" asChild>
                    <Link href="/participant/edit-profile">
                        <User /> Edit Profile
                    </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut /> Logout
                </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks /> Round 1: MCQs
                </CardTitle>
                <CardDescription>Answer multiple-choice questions.</CardDescription>
              </CardHeader>
              <CardContent>
                {isRound1Completed ? (
                   <Button className="w-full" disabled>Completed</Button>
                ) : (
                  <Link href="/participant/round1" passHref>
                    <Button className="w-full">Start Round 1</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className={!isRound2Unlocked ? "bg-muted/50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug /> Round 2: Debugging
                </CardTitle>
                <CardDescription>Find and fix bugs in the given code.</CardDescription>
              </CardHeader>
              <CardContent>
                 {isRound2Unlocked ? (
                    isRound2Completed ? (
                         <Button className="w-full" disabled>Completed</Button>
                    ) : (
                        <Link href="/participant/round2" passHref>
                            <Button className="w-full">Start Round 2</Button>
                        </Link>
                    )
                 ) : (
                    <Button className="w-full" disabled>
                        <Lock className='mr-2' />
                        Locked
                    </Button>
                 )}
              </CardContent>
            </Card>

            <Card className={!isRound3Unlocked ? "bg-muted/50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code /> Round 3: Coding
                </CardTitle>
                <CardDescription>Solve the final programming challenge.</CardDescription>
              </CardHeader>
              <CardContent>
                {isRound3Unlocked ? (
                    !!participant?.round3 ? (
                        <Button className="w-full" disabled>Completed</Button>
                    ) : (
                        <Link href="/participant/round3" passHref>
                            <Button className="w-full">Start Round 3</Button>
                        </Link>
                    )
                ) : (
                    <Button className="w-full" disabled>
                        <Lock className='mr-2' />
                        Locked
                    </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
