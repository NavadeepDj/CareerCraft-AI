// src/components/dashboard-page.tsx
'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
// Removed useAuth import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Removed LogOut icon import
import { UploadCloud, FileText, Search, GraduationCap, UserSquare } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { analyzeResume } from '@/ai/flows/resume-analysis'; // Import the AI function
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './loading-spinner';


export default function DashboardPage() {
  // Removed useAuth hook usage (user, signOut)
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for AI analysis loading

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Check file size (e.g., 5MB limit)
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName('');
        event.target.value = ''; // Clear the input
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName('');
        event.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
      setFileName(`Selected file: ${file.name}`);
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-accent'); // Highlight on drag over
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('border-accent');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-accent');
    const file = event.dataTransfer.files?.[0];
    if (file) {
        // Validate file type and size here as well
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
            return;
        }
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
            toast({ title: "Invalid File Type", description: "Please upload a PDF or DOCX file.", variant: "destructive" });
            return;
        }
        setSelectedFile(file);
        setFileName(`Selected file: ${file.name}`);
        // Trigger analysis if needed or just update state
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No Resume Uploaded",
        description: "Please upload your resume first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true); // Start loading indicator

    // Simulate analysis delay or trigger actual AI analysis
    // For now, just navigate to the analysis page
    // In a real app, you would call the AI function here
    // and pass the result to the analysis page.

    // Example of reading file as data URI for AI function (if needed)
    // const reader = new FileReader();
    // reader.readAsDataURL(selectedFile);
    // reader.onload = async () => {
    //   const dataUri = reader.result as string;
    //   try {
    //     const jobDescription = "Software Engineer role requiring React and Node.js"; // Example job description
    //     const analysisResult = await analyzeResume({ resumeDataUri: dataUri, jobDescription });
    //     console.log("AI Analysis Result:", analysisResult);
    //     // Pass analysisResult to the next page via state or query params
    //     router.push('/analysis'); // Navigate after successful analysis
    //   } catch (error) {
    //     console.error("AI Analysis Failed:", error);
    //     toast({ title: "AI Analysis Failed", description: "Could not analyze the resume.", variant: "destructive" });
    //   } finally {
    //     setIsAnalyzing(false); // Stop loading indicator
    //   }
    // };
    // reader.onerror = () => {
    //   console.error("Error reading file");
    //   toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
    //   setIsAnalyzing(false);
    // };

    // Temporary: Navigate directly
    setTimeout(() => {
        setIsAnalyzing(false);
        router.push('/analysis');
    }, 1500); // Simulate analysis time

  };


  // Removed handleLogout function

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between border-b pb-4">
        <div className="flex items-center">
          {/* Placeholder Logo */}
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M15.5 3H8.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 3v18"/><path d="M12 8H8"/><path d="M12 13H8"/><path d="M12 18H8"/></svg>
          <h1 className="text-3xl font-bold text-primary">ResumeAI</h1>
        </div>
        {/* Removed user welcome message and logout button section */}
      </header>

      <main>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Find Your Dream Job with AI-Powered Matching</h2>
          <p className="mt-2 text-muted-foreground">Upload your resume, get instant AI feedback, and receive personalized job matches.</p>
        </div>

        {/* Resume Upload Section */}
        <div className="mb-8 mx-auto max-w-2xl">
          <div
            className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-secondary p-6 text-center shadow-sm transition-all hover:border-accent hover:shadow-md"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
            <span className="font-medium text-foreground">Drag & drop your resume here</span>
            <span className="text-sm text-muted-foreground">or click to upload (PDF, DOCX up to 5MB)</span>
            <Input
              type="file"
              id="fileInput"
              className="absolute h-full w-full opacity-0"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
          </div>
          {fileName && <p className="mt-3 text-center text-sm text-muted-foreground">{fileName}</p>}
           <Button
            className="mt-6 w-full py-3 text-lg relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out group"
            onClick={handleSubmit}
            disabled={isAnalyzing || isUploading}
           >
                {isAnalyzing ? (
                    <LoadingSpinner size="sm" />
                ) : (
                    <>
                     <span className="absolute left-0 top-0 h-0 w-0 rounded-full bg-accent opacity-50 transition-all duration-500 ease-out group-hover:h-60 group-hover:w-60"></span>
                     <span className="relative z-10">Submit Resume for Analysis</span>
                    </>
                )}
            </Button>
        </div>


        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/analysis" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center text-center">
                <FileText className="mb-3 h-12 w-12 text-accent" />
                <CardTitle>AI Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>Get personalized feedback and suggestions on your resume based on job descriptions.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/job-matching" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center text-center">
                <Search className="mb-3 h-12 w-12 text-accent" />
                <CardTitle>Intelligent Job Matching</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>Personalized job recommendations based on your profile and skills.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learning-path" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center text-center">
                <GraduationCap className="mb-3 h-12 w-12 text-accent" />
                <CardTitle>Customized Learning Paths</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>AI-suggested courses and resources to bridge your skill gaps for target jobs.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resume-builder" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center text-center">
                 <UserSquare className="mb-3 h-12 w-12 text-accent" />
                <CardTitle>Detailed Resume Creation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>Build or enhance your resume with sections for skills, experience, and preferences.</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}
