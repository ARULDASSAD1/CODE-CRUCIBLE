"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight">
          Code Crucible
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          The ultimate offline platform for competitive programming and debugging events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">For Participants</CardTitle>
            <CardDescription>
              Ready to test your skills? Jump into the competition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You will face three rounds of challenges: MCQs, code debugging, and a final coding problem. Good luck!
            </p>
            <Link href="/participant" passHref>
              <Button className="w-full text-lg py-6 font-semibold">
                Go to Participant Portal <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">For Admins</CardTitle>
            <CardDescription>
              Manage the event, questions, and scoreboard from here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Control the flow of the competition, from setting up rounds to tracking participant progress.
            </p>
            <Link href="/admin" passHref>
              <Button variant="secondary" className="w-full text-lg py-6 font-semibold">
                Go to Admin Dashboard <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <footer className="py-8 mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Code Crucible. All rights reserved. For offline use.</p>
      </footer>
    </div>
  );
}
