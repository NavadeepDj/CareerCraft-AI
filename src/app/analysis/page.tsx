// src/app/analysis/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb, BarChart } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner'; // Assuming LoadingSpinner exists

// Placeholder type for analysis results
interface AnalysisResult {
  matchScore: number;
  feedback: string;
  // Add more fields as needed based on the actual AI output
}

export default function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching or receiving analysis data
    // In a real app, you'd fetch this data based on the uploaded resume
    // or receive it via props/state from the dashboard page.
    const fetchAnalysis = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Placeholder data - replace with actual data fetching/retrieval
      setAnalysisResult({
        matchScore: 75, // Example score
        feedback: "Your resume shows strong alignment with the required skills in React and Node.js. Consider adding specific project examples that demonstrate your experience with API integrations. Quantify achievements in previous roles where possible (e.g., 'Improved performance by 15%'). Add a brief summary highlighting your key strengths relevant to this role.",
      });
      setIsLoading(false);
    };

    fetchAnalysis();
  }, []);

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary"> {/* Updated hover */}
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">AI Resume Analysis</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main>
        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : analysisResult ? (
          <Card className="mx-auto max-w-3xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <BarChart className="h-6 w-6 text-primary" /> {/* Changed icon color */}
                Analysis Results
              </CardTitle>
              <CardDescription>Feedback based on your uploaded resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  Match Score
                </h3>
                <div className="flex items-center gap-4">
                   <div className="w-full bg-secondary rounded-full h-4">
                     <div
                        className="bg-primary h-4 rounded-full transition-all duration-500 ease-out" // Changed progress bar color to primary
                        style={{ width: `${analysisResult.matchScore}%` }}
                      />
                    </div>
                   <span className="text-xl font-bold text-primary">{analysisResult.matchScore}%</span> {/* Changed score color */}
                </div>
                 <p className="text-sm text-muted-foreground mt-1">How well your resume aligns with a typical role based on its content.</p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                  Feedback & Suggestions
                </h3>
                <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 text-foreground">
                  {/* Render feedback, potentially using markdown */}
                  <p>{analysisResult.feedback}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                 <Link href="/resume-builder" passHref>
                    <Button variant="default">Edit Resume Based on Feedback</Button>
                 </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-muted-foreground">
            Could not load analysis results. Please try again.
          </div>
        )}
      </main>
        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}
