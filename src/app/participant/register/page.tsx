"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { saveParticipant } from '@/app/actions';

export default function ParticipantRegister() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [year, setYear] = useState('');
    const [dept, setDept] = useState('');
    const [college, setCollege] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If already registered, redirect to portal
        if (localStorage.getItem('participantDetails')) {
            router.replace('/participant');
        }
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!name || !teamName || !year || !dept || !college) {
            toast({
                title: "Incomplete Form",
                description: "Please fill out all fields.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        const participantData = { name, teamName, year, dept, college };
        try {
            const newParticipant = await saveParticipant(participantData);
            localStorage.setItem('participantDetails', JSON.stringify(newParticipant));
            
            toast({
                title: "Registration Successful",
                description: `Welcome, ${teamName}!`,
            });

            router.push('/participant');

        } catch (error) {
             toast({
                title: "Registration Failed",
                description: "Could not save participant details.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Participant Registration</CardTitle>
                        <CardDescription>Please enter your details to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Ada Lovelace"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="teamName">Team Name</Label>
                                    <Input
                                        id="teamName"
                                        placeholder="e.g., The Compilers"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="college">College Name</Label>
                                <Input
                                    id="college"
                                    placeholder="e.g., Babbage University"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        placeholder="e.g., 2"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dept">Department</Label>
                                    <Input
                                        id="dept"
                                        placeholder="e.g., CSE"
                                        value={dept}
                                        onChange={(e) => setDept(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="animate-spin" />}
                                {isLoading ? 'Registering...' : 'Start Competition'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
