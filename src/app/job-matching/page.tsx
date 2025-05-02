// src/app/job-matching/page.tsx
'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, MapPin, UploadCloud, Search, FileUp } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import { getMatchingJobs, type Job } from '@/services/job-matching'; // Import the service
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export default function JobMatchingPage() {
  const { toast } = useToast();
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Initially not loading
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null); // Store as Data URI if needed by API
  const [desiredJobRole, setDesiredJobRole] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  // Handle file selection or drop
  const handleFileChange = useCallback((file: File | null) => {
      setUploadedFile(null);
      setResumeDataUri(null);

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
          // Read file as Data URI - needed if API expects base64 content
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
  const onJobRoleChange = (e: ChangeEvent<HTMLInputElement>) => setDesiredJobRole(e.target.value);

  // Handle finding matches
  const handleFindMatches = async () => {
    if (!uploadedFile) {
      toast({ title: "Missing Resume", description: "Please upload a resume file.", variant: "destructive" });
      return;
    }
    if (!desiredJobRole.trim()) {
      toast({ title: "Missing Job Role", description: "Please specify the desired job role.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatchingJobs([]); // Clear previous results
    setHasSearched(true); // Mark that a search has been initiated

    try {
      // TODO: Adjust getMatchingJobs if it needs resume content (Data URI) or just profile text
      // For now, assuming it needs a generic profile string and the job role.
      // You might need to extract text from the resumeDataUri here if the service expects text.
      const userProfile = `Resume: ${uploadedFile.name}`; // Placeholder profile data
      console.log(`Fetching jobs for role: ${desiredJobRole} based on profile: ${userProfile}`);

      const jobs = await getMatchingJobs(userProfile, desiredJobRole);
      setMatchingJobs(jobs);
    } catch (err) {
      console.error("Error fetching matching jobs:", err);
      setError("Failed to load job recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary"> {/* Adjusted size */}
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-primary text-center flex-grow">Intelligent Job Matching</h1>
        <div className="w-[150px]"></div> {/* Spacer to balance header */}
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Upload and Job Role */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume &amp; Specify Job Role</CardTitle>
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
                  className="absolute h-full w-full opacity-0"
                  onChange={onFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              {/* {uploadedFile && <p className="text-center text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>} */}

            {/* Desired Job Role Input */}
            <div className="space-y-1">
              <Label htmlFor="desiredJobRole">Desired Job Role</Label>
              <Input
                id="desiredJobRole"
                value={desiredJobRole}
                onChange={onJobRoleChange}
                placeholder="e.g., Frontend Developer, Data Scientist"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFindMatches} disabled={isLoading || !uploadedFile || !desiredJobRole.trim()}>
              {isLoading ? <LoadingSpinner size="sm" /> : <Search className="mr-2 h-4 w-4" />}
              Find Job Matches
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: Job Matches */}
        <Card>
           <CardHeader>
            <CardTitle>Job Matches</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[40vh] flex flex-col"> {/* Ensure minimum height */}
             {isLoading ? (
                <div className="flex flex-grow items-center justify-center">
                  <LoadingSpinner />
                </div>
            ) : error ? (
              <div className="flex flex-grow items-center justify-center text-center text-destructive">
                <p>{error}</p>
               </div>
            ) : !hasSearched ? (
                 <div className="flex flex-grow flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                   <Search className="h-16 w-16" />
                   <p>Upload your resume and specify a job role to get matched with relevant opportunities.</p>
                 </div>
             ) : matchingJobs.length > 0 ? (
                <div className="space-y-4 overflow-y-auto max-h-[60vh]"> {/* Scrollable area */}
                  {matchingJobs.map((job) => (
                    <Card key={job.id} className="shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{job.title}</span>
                        </CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                         <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 pt-0">
                        {/* <p className="mb-2 text-xs line-clamp-2">{job.description}</p> */}
                         <div className="flex flex-wrap gap-1">
                           {job.requiredSkills.map((skill, index) => (
                             <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                           ))}
                         </div>
                      </CardContent>
                       <CardFooter className="pt-0 pb-3">
                         <Button variant="link" size="sm" className="h-auto p-0 text-primary hover:underline">View Details &amp; Apply</Button>
                       </CardFooter>
                    </Card>
                  ))}
                </div>
            ) : (
              <div className="flex flex-grow items-center justify-center text-center text-muted-foreground">
                 <p>No matching jobs found for "{desiredJobRole}". Try refining your search or updating your resume.</p>
               </div>
            )}
          </CardContent>
        </Card>
      </main>

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
