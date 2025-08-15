import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManageRound1() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Round 1: MCQs</CardTitle>
                        <CardDescription>Add, edit, or remove multiple-choice questions for the first round.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>MCQ management interface will be here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
