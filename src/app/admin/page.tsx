"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, ClipboardCheck, BarChart2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 w-full container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
                Manage all aspects of the Code Crucible event from here.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users /> Round 1: MCQs
                </CardTitle>
                <CardDescription>Manage multiple-choice questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/round1" passHref>
                  <Button className="w-full">Manage Round 1</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText /> Round 2: Debugging
                </CardTitle>
                <CardDescription>Manage debugging challenges.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/round2" passHref>
                  <Button className="w-full">Manage Round 2</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck /> Round 3: Coding
                </CardTitle>
                <CardDescription>Manage coding problems and test cases.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/round3" passHref>
                  <Button className="w-full">Manage Round 3</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 /> Scoreboard & Event Control
                </CardTitle>
                <CardDescription>View live scores and manage event state.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/scoreboard" passHref>
                  <Button variant="secondary" className="w-full">View Scoreboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
