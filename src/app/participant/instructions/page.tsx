import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ViewInstructions() {
    const { instructions } = await getInstructions();

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                 <div className='flex justify-end mb-4'>
                    <Button asChild variant="outline">
                        <Link href="/participant">Back to Portal</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Instructions</CardTitle>
                        <CardDescription>Read the following rules and instructions carefully.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96 w-full rounded-md border p-4">
                            <pre className="whitespace-pre-wrap font-body text-sm">
                                {instructions || "No instructions have been posted yet. Please check back later."}
                            </pre>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
