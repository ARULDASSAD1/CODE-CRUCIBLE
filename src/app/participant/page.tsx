import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListChecks, Bug, Code, Info } from "lucide-react";

export default function ParticipantPortal() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 w-full container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
              Participant Portal
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome, contestant! Here are the rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card className="md:col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info /> Instructions
                </CardTitle>
                <CardDescription>Please read the instructions carefully before you begin.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/participant/instructions" passHref>
                  <Button className="w-full">View Instructions</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks /> Round 1: MCQs
                </CardTitle>
                <CardDescription>Answer multiple-choice questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/participant/round1" passHref>
                  <Button className="w-full">Start Round 1</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug /> Round 2: Debugging
                </CardTitle>
                <CardDescription>Find and fix bugs in the given code.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/participant/round2" passHref>
                  <Button className="w-full" disabled>Start Round 2</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code /> Round 3: Coding
                </CardTitle>
                <CardDescription>Solve the final programming challenge.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/participant/round3" passHref>
                  <Button className="w-full" disabled>Start Round 3</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
