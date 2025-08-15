import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Scoreboard() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Scoreboard</CardTitle>
                        <CardDescription>Live scores and rankings of all participants.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The scoreboard will be displayed here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
