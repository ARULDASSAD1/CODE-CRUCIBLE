import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { getInstructions } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function Home() {
  const { instructions } = await getInstructions();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight">
          Code Crucible
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          The ultimate offline platform for competitive programming and debugging events.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 max-w-2xl w-full px-4">
        <Card className="shadow-lg w-full">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-3xl">
              <Info /> Event Instructions
            </CardTitle>
            <CardDescription>Read the following rules and instructions carefully before you begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60 w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-body text-sm">
                {instructions || "No instructions have been posted yet. Please check back later."}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-lg w-full">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Participant Portal</CardTitle>
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
                Enter Competition <ArrowRight className="ml-2" />
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
