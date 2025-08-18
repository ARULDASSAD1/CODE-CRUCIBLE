
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Crown } from 'lucide-react';
import { getInstructions } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SiteHeader } from '@/components/site-header';

export default async function Home() {
  const { general: instructions } = await getInstructions();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto text-center py-20 md:py-32">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute top-0 z-[-2] h-screen w-screen bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,35,35,0.3),rgba(255,255,255,0))]"></div>
          
          <div className="flex justify-center mb-4">
            <Image
                src="/croppedsj.gif"
                alt="Event Animation"
                width={150}
                height={150}
                unoptimized // Keep GIF animation
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-accent tracking-wider">
            Colloquiums - 2k25
          </h2>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 mt-2">
            Code Crucible
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A Technical Event for Competitive Programming and Debugging.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="text-lg py-7 px-8 font-semibold transition-transform transform hover:scale-105">
                <Link href="/participant/login">
                  Enter Competition <ArrowRight className="ml-2" />
                </Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto pb-20">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <Card className="shadow-lg border-primary/20 hover:border-primary/50 transition-all transform hover:-translate-y-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                    <BookOpen size={28} className="text-accent" /> Event Instructions
                    </CardTitle>
                    <CardDescription>Read the following rules and instructions carefully before you begin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-60 w-full rounded-md border p-4 bg-black/20">
                    <pre className="whitespace-pre-wrap font-code text-sm">
                        {instructions || "No instructions have been posted yet. Please check back later."}
                    </pre>
                    </ScrollArea>
                </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="shadow-lg border-border/50 hover:border-accent/50 transition-all transform hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <Crown size={24} className="text-accent" /> The Challenge
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                            You will face three rounds of challenges: MCQs, code debugging, and a final coding problem. Good luck!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12">
                 <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Event Poster</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src="/poster.jpeg"
                            alt="Event Poster"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    </CardContent>
                </Card>
            </div>

        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>Organized by Vinayaka Mission's Kirupananda Variyar Engineering College.</p>
        <p>&copy; {new Date().getFullYear()} Code Crucible. All rights reserved.</p>
      </footer>
    </div>
  );
}
