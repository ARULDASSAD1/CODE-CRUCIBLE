import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageRound3() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Round 3: Coding Challenge</CardTitle>
                        <CardDescription>Create the programming problem and define public and private test cases.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Coding challenge management interface will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
