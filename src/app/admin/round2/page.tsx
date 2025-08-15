import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageRound2() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Round 2: Debugging</CardTitle>
                        <CardDescription>Provide C code snippets that participants need to debug.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Debugging challenge management interface will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
