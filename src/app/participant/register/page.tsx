
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
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParticipantRegister() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        year: '',
        dept: '',
        college: '',
        email: '',
        mobile: '',
        gender: '' as 'male' | 'female' | 'other' | '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        // If already logged in, redirect to portal
        if (sessionStorage.getItem('participantId')) {
            router.replace('/participant');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }

    const handleSelectChange = (value: 'male' | 'female' | 'other') => {
        setFormData(prev => ({ ...prev, gender: value }));
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please check your password and try again.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (!formData.gender) {
            toast({
                title: "Gender not selected",
                description: "Please select your gender.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...participantData } = formData;
            const { participant, error } = await saveParticipant(participantData);

            if (error) {
                toast({
                    title: "Registration Failed",
                    description: error,
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
            
            if (participant) {
                sessionStorage.setItem('participantId', participant.id);
                toast({
                    title: "Registration Successful",
                    description: `Welcome, ${participant.name}!`,
                });
                router.push('/participant');
            }

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
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Participant Registration</CardTitle>
                        <CardDescription>Please enter your details to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="e.g., Ada Lovelace" value={formData.name} onChange={handleChange} required disabled={isLoading}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="college">College Name</Label>
                                <Input id="college" placeholder="e.g., Babbage University" value={formData.college} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" placeholder="e.g., 2" value={formData.year} onChange={handleChange} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dept">Department</Label>
                                    <Input id="dept" placeholder="e.g., CSE" value={formData.dept} onChange={handleChange} required disabled={isLoading} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="ada@lovelace.com" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input id="mobile" placeholder="e.g., 9876543210" value={formData.mobile} onChange={handleChange} required disabled={isLoading} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select onValueChange={handleSelectChange} value={formData.gender} disabled={isLoading}>
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
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="Choose a unique username" value={formData.username} onChange={handleChange} required disabled={isLoading} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={formData.password} onChange={handleChange} required disabled={isLoading}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="animate-spin" />}
                                {isLoading ? 'Registering...' : 'Register and Start'}
                            </Button>
                             <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/participant/login" className="underline hover:text-primary">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
