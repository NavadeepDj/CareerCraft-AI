// src/app/learning-path/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GraduationCap, Lightbulb, BookOpen, ExternalLink } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner'; // Updated import
import { getLearningPath, type Course } from '@/services/learning-path'; // Import the service
import { Badge } from '@/components/ui/badge';
// Removed useAuth import

export default function LearningPathPage() {
  // Removed useAuth hook usage
  const [learningPath, setLearningPath] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>(['JavaScript', 'React']); // Example skills needed

  useEffect(() => {
    const fetchPath = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Determine skills needed based on resume analysis vs job requirements
        // This might involve fetching data from a previous step or user profile.
        // Since auth is removed, this needs a different source if user-specific data is required.
        console.log("Fetching learning path based on needed skills..."); // Updated log message

        // Use the example skillsNeeded state
        const path = await getLearningPath(skillsNeeded);
        setLearningPath(path);
      } catch (err) {
        console.error("Error fetching learning path:", err);
        setError("Failed to load learning recommendations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPath();
  }, [skillsNeeded]); // Removed user dependency

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary"> {/* Updated hover */}
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">Customized Learning Path</h1>
         <div className="w-10"></div> {/* Spacer */}
      </header>

      <main>
         <div className="mb-6 rounded-md border bg-secondary p-4 text-center">
            <Lightbulb className="inline-block h-6 w-6 text-primary mb-2" /> {/* Changed icon color */}
            <p className="text-sm text-secondary-foreground">
              Based on your profile and target job roles, here are suggested learning resources to bridge skill gaps in: <br/>
              <strong>{skillsNeeded.join(', ')}</strong>.
            </p>
            {/* Add button to refine skills if needed */}
          </div>

        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner /> {/* Use the new spinner */}
          </div>
        ) : error ? (
           <div className="text-center text-destructive">{error}</div>
        ) : learningPath.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {learningPath.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between shadow-md transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <BookOpen className="h-5 w-5 text-primary flex-shrink-0" /> {/* Changed icon color */}
                     {course.title}
                  </CardTitle>
                  <CardDescription>Provider: {course.provider}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="mb-3 text-sm">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                     <span className="text-xs font-medium mr-1">Skills Covered:</span>
                    {course.skillsCovered.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                   <Button variant="link" asChild className="w-full justify-start p-0 h-auto text-primary hover:underline"> {/* Changed link color to primary */}
                     <a href={course.url} target="_blank" rel="noopener noreferrer">
                       Go to Course <ExternalLink className="ml-1 h-4 w-4" />
                     </a>
                  </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No learning path suggestions available at this time.
          </div>
        )}
      </main>
        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
