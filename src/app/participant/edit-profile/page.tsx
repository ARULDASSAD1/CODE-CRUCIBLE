
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
import { updateParticipant, Participant, getParticipant } from '@/app/actions';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditProfile() {
    const router = useRouter();
    const { toast } = useToast();
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const participantId = sessionStorage.getItem('participantId');
        if (participantId) {
            getParticipant(participantId).then(p => {
                setParticipant(p);
                 if (!p) {
                    toast({ title: "Error", description: "Could not find participant details.", variant: "destructive" });
                    router.replace('/participant/login');
                }
            }).finally(() => setIsFetching(false));
        } else {
            router.replace('/participant/login');
        }
    }, [router, toast]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant) return;
        setIsLoading(true);

        try {
            await updateParticipant(participant);
            
            toast({
                title: "Profile Updated",
                description: "Your details have been saved successfully.",
            });

            router.push('/participant');

        } catch (error) {
             toast({
                title: "Update Failed",
                description: "Could not update your details.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!participant) return;
        setParticipant({
            ...participant,
            [e.target.id]: e.target.value,
        });
    }

    const handleSelectChange = (value: string) => {
        if (!participant) return;
        setParticipant({
            ...participant,
            gender: value as Participant['gender'],
        });
    }

    if (isFetching) {
        return (
             <div className="flex flex-col min-h-screen">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin" size={48} />
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Your Profile</CardTitle>
                        <CardDescription>Update your registration details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={participant?.name || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="college">College Name</Label>
                                <Input
                                    id="college"
                                    value={participant?.college || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        value={participant?.year || ''}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dept">Department</Label>
                                    <Input
                                        id="dept"
                                        value={participant?.dept || ''}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={participant?.email || ''}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        value={participant?.mobile || ''}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select onValueChange={handleSelectChange} value={participant?.gender} disabled={isLoading}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex justify-between pt-4'>
                                <Button type="submit" className="w-1/2" disabled={isLoading || !participant}>
                                    {isLoading && <Loader2 className="animate-spin" />}
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                 <Button variant="outline" asChild>
                                    <Link href="/participant">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
