// src/components/login-page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Chrome } from 'lucide-react'; // Using Chrome icon for Google

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google Sign-In Failed:", error);
      // Add user feedback, e.g., using toast
    }
  };

  // Placeholder for Email/Password Sign-In Logic
  const handleEmailSignIn = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Email/Password sign-in attempt (not implemented)");
    // Implement email/password sign-in logic here if needed
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to ResumeAI</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6 text-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="h-6 w-6" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200">
              Sign In / Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
}
