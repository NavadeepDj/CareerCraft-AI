// src/app/job-matching/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, MapPin, Settings2 } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import { getMatchingJobs, type Job } from '@/services/job-matching'; // Import the service
import { Badge } from '@/components/ui/badge';
// Removed useAuth import

export default function JobMatchingPage() {
  // Removed useAuth hook usage
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Get user profile/resume data to pass to the service
        // Since auth is removed, this needs a different source if user-specific data is required.
        // For now, using a placeholder.
        const userProfile = "User's resume content or extracted skills"; // Placeholder profile data
        console.log("Fetching jobs based on profile data..."); // Updated log message

        const jobs = await getMatchingJobs(userProfile);
        setMatchingJobs(jobs);
      } catch (err) {
        console.error("Error fetching matching jobs:", err);
        setError("Failed to load job recommendations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []); // Removed user dependency

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary"> {/* Updated hover */}
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">Intelligent Job Matching</h1>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">Filter Jobs</span>
        </Button>
      </header>

      <main>
        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
           <div className="text-center text-destructive">{error}</div>
        ) : matchingJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matchingJobs.map((job) => (
              <Card key={job.id} className="flex flex-col justify-between shadow-md transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Briefcase className="h-5 w-5 text-primary flex-shrink-0" /> {/* Changed icon color */}
                     <span className="truncate">{job.title}</span>
                  </CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                     <MapPin className="h-4 w-4 flex-shrink-0" />
                     <span>{job.location}</span>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="mb-3 text-sm line-clamp-3">{job.description}</p>
                   <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                   <Button variant="default" className="w-full">View Details & Apply</Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No matching jobs found based on your profile. Consider updating your resume.
          </div>
        )}
      </main>
        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}
