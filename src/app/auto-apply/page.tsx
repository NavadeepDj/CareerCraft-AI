// src/app/auto-apply/page.tsx
'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UploadCloud, Search, FileUp, Bot, Play, CircleCheck, CircleX, List } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'Applied' | 'Error Applying' | 'Pending';
  appliedDate: string;
}

type ViewState = 'configure' | 'applying' | 'results' | 'error';

export default function AutoApplyPage() {
  const { toast } = useToast();
  const [viewState, setViewState] = useState<ViewState>('configure');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null); // Store as Data URI if needed by potential future API
  const [keywords, setKeywords] = useState<string>('');
  const [location, setLocation] =useState<string>('');
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle file selection or drop
  const handleFileChange = useCallback((file: File | null) => {
      setUploadedFile(null);
      setResumeDataUri(null);
      setViewState('configure'); // Reset to config view
      setAppliedJobs([]); // Clear previous results

      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
              return;
          }
          if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'].includes(file.type)) {
              toast({ title: "Invalid File Type", description: "Please upload a PDF, DOCX, DOC, or TXT file.", variant: "destructive" });
              return;
          }
          setUploadedFile(file);
          // Read file as Data URI - might be needed if an API call were made
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => setResumeDataUri(reader.result as string);
          reader.onerror = () => {
               toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
               setUploadedFile(null);
          };
      }
  }, [toast]);

   // Drag and Drop handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.add('border-primary');
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.currentTarget.classList.remove('border-primary');
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('border-primary');
      const file = event.dataTransfer.files?.[0];
      handleFileChange(file || null);
  };

  // Input change handlers
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onKeywordsChange = (e: ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value);
  const onLocationChange = (e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value);

  // Handle starting the auto-apply process (simulation)
  const handleStartAutoApply = async () => {
    if (!uploadedFile) {
      toast({ title: "Missing Resume", description: "Please upload a resume file.", variant: "destructive" });
      return;
    }
    if (!keywords.trim()) {
      toast({ title: "Missing Keywords", description: "Please specify job keywords or titles.", variant: "destructive" });
      return;
    }
     if (!location.trim()) {
      toast({ title: "Missing Location", description: "Please specify a location.", variant: "destructive" });
      return;
    }

    setViewState('applying');
    setErrorMessage('');
    setAppliedJobs([]); // Clear previous results

    try {
      // **SIMULATION:** In a real app, this would involve:
      // 1. Calling a job board API or scraper with keywords/location.
      // 2. For each job found:
      //    a. Analyze if it's a good match based on the resume (using AI perhaps).
      //    b. Navigate to the application page (using browser automation like Puppeteer/Playwright on a backend).
      //    c. Parse the application form.
      //    d. Fill the form using resume data (extremely complex).
      //    e. Handle logins, CAPTCHAs, unique questions.
      //    f. Submit the application.
      //    g. Record the result.

      console.log(`Simulating auto-apply for keywords: "${keywords}", location: "${location}" using resume: ${uploadedFile.name}`);

      // Simulate API call delay and application process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate dummy results
      const dummyJobs: AppliedJob[] = [
        { id: 'job1', title: 'Frontend Engineer', company: 'WebInnovate', location: location, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
        { id: 'job2', title: `Software Dev (${keywords})`, company: 'CodeCorp', location: location, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
        { id: 'job3', title: 'UI Developer', company: 'DesignHub', location: 'Remote', status: 'Error Applying', appliedDate: new Date().toLocaleDateString() },
        { id: 'job4', title: 'React Developer', company: 'StartUpX', location: location, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
      ];

       // Simulate some errors randomly
      const results = dummyJobs.map(job => ({
          ...job,
          // Randomly mark some as error for demonstration
          status: (Math.random() > 0.8 && job.status === 'Applied') ? 'Error Applying' : job.status
      }));


      setAppliedJobs(results);
      setViewState('results');
      toast({ title: "Simulation Complete", description: `Simulated applying to ${results.length} jobs.` });

    } catch (err) {
      console.error("Auto-apply simulation failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred during the simulation.";
      setErrorMessage(`Simulation Failed: ${message}`);
      setViewState('error');
      toast({ title: "Simulation Error", description: message, variant: "destructive" });
    }
  };

  const renderContent = () => {
     switch(viewState) {
         case 'configure':
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> Configure Auto-Apply</CardTitle>
                        <CardDescription>Upload your resume and specify job criteria. The AI will simulate finding and applying to matching jobs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* File Upload Area */}
                         <div
                            className={cn(
                              "relative flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-secondary p-4 text-center transition-all hover:border-primary",
                               uploadedFile && "border-primary bg-primary/5" // Indicate file selected
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('resumeFileInput')?.click()}
                        >
                            {uploadedFile ? (
                                 <FileUp className="mb-2 h-8 w-8 text-primary" />
                            ) : (
                                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {uploadedFile ? uploadedFile.name : "Drag &amp; drop your resume here"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {uploadedFile ? "(Click or drag to replace)" : "or click to browse (PDF, DOCX, max 5MB)"}
                            </span>
                            <Input
                              type="file"
                              id="resumeFileInput"
                              className="absolute h-full w-full opacity-0 cursor-pointer"
                              onChange={onFileChange}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </div>

                        {/* Job Keywords Input */}
                        <div className="space-y-1">
                          <Label htmlFor="keywords">Job Keywords / Titles</Label>
                          <Input
                            id="keywords"
                            value={keywords}
                            onChange={onKeywordsChange}
                            placeholder="e.g., Software Engineer, React Developer"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Separate multiple keywords or titles with commas.</p>
                        </div>

                         {/* Location Input */}
                        <div className="space-y-1">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={onLocationChange}
                            placeholder="e.g., Remote, New York, Austin TX"
                            required
                          />
                        </div>
                         {/* Disclaimer */}
                         <Alert variant="default" className="bg-secondary border-primary/20">
                           <Bot className="h-4 w-4" />
                           <AlertTitle>Simulation Notice</AlertTitle>
                           <AlertDescription>
                             This feature simulates the job application process. It will find potential matches but **will not actually submit applications** on external websites due to complexity and security reasons.
                           </AlertDescription>
                         </Alert>

                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleStartAutoApply} disabled={!uploadedFile || !keywords.trim() || !location.trim()}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Auto-Applying (Simulation)
                        </Button>
                    </CardFooter>
                </Card>
            );
        case 'applying':
            return (
                <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4 text-center">
                    <LoadingSpinner />
                    <p className="text-lg font-semibold text-primary">Simulating Job Search & Applications...</p>
                    <p className="text-muted-foreground">This is a simulation and may take a moment.</p>
                </div>
            );
        case 'results':
             return (
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><List className="h-6 w-6 text-primary" /> Simulated Application Results</CardTitle>
                        <CardDescription>Overview of the jobs the simulation attempted to apply for.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                         {appliedJobs.length > 0 ? (
                            appliedJobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between rounded-md border p-4 shadow-sm">
                                     <div className="space-y-1">
                                        <p className="font-semibold">{job.title} - <span className="text-muted-foreground">{job.company}</span></p>
                                        <p className="text-sm text-muted-foreground">{job.location} - Applied: {job.appliedDate}</p>
                                     </div>
                                     <Badge variant={job.status === 'Applied' ? 'default' : 'destructive'} className={cn(job.status === 'Applied' && 'bg-green-600 text-white')}>
                                        {job.status === 'Applied' ? <CircleCheck className="mr-1 h-3 w-3" /> : <CircleX className="mr-1 h-3 w-3" />}
                                        {job.status}
                                     </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">No simulated applications were processed.</p>
                        )}
                     </CardContent>
                     <CardFooter className="flex justify-between border-t pt-4">
                        <Button variant="outline" onClick={() => setViewState('configure')}>Start New Simulation</Button>
                     </CardFooter>
                 </Card>
             );
        case 'error':
             return (
                 <Card className="border-destructive">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-destructive"><CircleX className="h-6 w-6" /> Simulation Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{errorMessage || "An unexpected error occurred during the simulation."}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => setViewState('configure')}>Try Again</Button>
                    </CardFooter>
                </Card>
             );
     }
  };


  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-primary text-center flex-grow">Automated Job Application (Simulation)</h1>
        <div className="w-[150px]"></div> {/* Spacer */}
      </header>

      <main className="mx-auto max-w-3xl">
        {renderContent()}
      </main>

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}

    