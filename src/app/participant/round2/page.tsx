import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantRound2() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 2: Debugging Challenge</CardTitle>
                        <CardDescription>Fix the bugs in the provided C code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The debugging interface will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
