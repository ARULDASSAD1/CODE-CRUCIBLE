import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantRound1() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 1: Multiple Choice Questions</CardTitle>
                        <CardDescription>Select the correct answer for each question.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The MCQ questions will be displayed here for the participant.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
