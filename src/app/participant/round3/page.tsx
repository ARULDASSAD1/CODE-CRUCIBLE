import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantRound3() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Round 3: Final Coding Challenge</CardTitle>
                        <CardDescription>Write C code to solve the problem and pass all test cases.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The coding interface will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
