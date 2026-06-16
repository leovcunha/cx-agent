import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user?.email}</CardTitle>
            <CardDescription>Manage your Customer Service Agent from here.</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Standard Operating Procedures (SOPs)</CardTitle>
            <CardDescription>
              Upload PDF or Markdown documents. The agent will read these to answer customer queries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="sop-file">SOP Document</Label>
                <Input id="sop-file" type="file" />
              </div>
              <Button type="button">Upload Document</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
