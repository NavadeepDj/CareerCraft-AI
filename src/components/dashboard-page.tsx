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
import { UploadCloud, FileText, Search, GraduationCap, UserSquare, Bot } from 'lucide-react'; // Added Bot icon
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { analyzeResume } from '@/ai/flows/resume-analysis'; // Import the AI function
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './loading-spinner'; // Updated import


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
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) { // Added text/plain
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, DOCX, DOC, or TXT file.", // Updated message
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
    event.currentTarget.classList.add('border-primary'); // Highlight on drag over with primary color
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary');
    const file = event.dataTransfer.files?.[0];
    if (file) {
        // Validate file type and size here as well
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
            return;
        }
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) { // Added text/plain
            toast({ title: "Invalid File Type", description: "Please upload a PDF, DOCX, DOC, or TXT file.", variant: "destructive" }); // Updated message
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
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const dataUri = reader.result as string;
       // Store data URI and file temporarily for analysis page
       sessionStorage.setItem('analysisResumeDataUri', dataUri);
       sessionStorage.setItem('analysisResumeFileName', selectedFile.name);
       // TODO: Also need job description - maybe prompt user here or on analysis page?
       // For now, we'll handle it on the analysis page.
      setIsAnalyzing(false);
      router.push('/analysis'); // Navigate after reading file
    };
    reader.onerror = () => {
      console.error("Error reading file");
      toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
      setIsAnalyzing(false);
    };

    // // Temporary: Navigate directly
    // setTimeout(() => {
    //     setIsAnalyzing(false);
    //     router.push('/analysis');
    // }, 1500); // Simulate analysis time

  };


  // Removed handleLogout function

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between border-b pb-4">
        <div className="flex items-center">
          {/* Placeholder Logo */}
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M15.5 3H8.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 3v18"/><path d="M12 8H8"/><path d="M12 13H8"/><path d="M12 18H8"/></svg>
          <h1 className="text-3xl font-bold text-primary">CareerCraft AI</h1>
        </div>
        {/* Removed user welcome message and logout button section */}
      </header>

      <main>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Your AI-Powered Career Toolkit</h2>
          <p className="mt-2 text-muted-foreground">Upload your resume, get instant AI feedback, create polished resumes, find jobs, and even automate applications (simulation).</p>
        </div>

        {/* Resume Upload Section */}
        <div className="mb-8 mx-auto max-w-2xl">
          <div
            className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-secondary p-6 text-center shadow-sm transition-all hover:border-primary hover:shadow-md" // Changed hover border to primary
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
            <span className="font-medium text-foreground">Drag & drop your resume here</span>
            <span className="text-sm text-muted-foreground">or click to upload (PDF, DOCX, DOC, TXT - max 5MB)</span>
            <Input
              type="file"
              id="fileInput"
              className="absolute h-full w-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt" // Updated accept attribute
            />
          </div>
          {fileName && <p className="mt-3 text-center text-sm text-muted-foreground">{fileName}</p>}
           <Button
            className="mt-6 w-full py-3 text-lg relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out group flex items-center justify-center" // Added flex for centering
            onClick={handleSubmit}
            disabled={isAnalyzing || isUploading || !selectedFile} // Disable if no file
            style={{ minHeight: '48px' }} // Ensure button has enough height for spinner
           >
                {isAnalyzing ? (
                    <LoadingSpinner className="h-8 w-8" /> // Use the spinner component
                ) : (
                    <>
                     <span className="relative z-10">Quick Submit for AI Analysis</span>
                    </>
                )}
            </Button>
             <p className="mt-2 text-center text-xs text-muted-foreground">Quickly analyze your uploaded resume against a generic job description, or visit the dedicated Analysis page for more options.</p>
        </div>


        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"> {/* Changed to 5 columns */}
          <Link href="/resume-builder" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="flex flex-col items-center text-center">
                 <UserSquare className="mb-3 h-12 w-12 text-primary" />
                <CardTitle>Resume Builder</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription>Craft a professional resume using various templates and AI suggestions.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analysis" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="flex flex-col items-center text-center">
                <FileText className="mb-3 h-12 w-12 text-primary" />
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription>Get ATS scores and detailed feedback comparing your resume to specific job descriptions.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/job-matching" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="flex flex-col items-center text-center">
                <Search className="mb-3 h-12 w-12 text-primary" />
                <CardTitle>Job Matching</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription>Find relevant job openings based on your resume and desired role.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learning-path" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="flex flex-col items-center text-center">
                <GraduationCap className="mb-3 h-12 w-12 text-primary" />
                <CardTitle>Learning Paths</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription>Discover courses and resources to bridge skill gaps for your target jobs.</CardDescription>
              </CardContent>
            </Card>
          </Link>

           <Link href="/auto-apply" passHref>
            <Card className="h-full transform cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="flex flex-col items-center text-center">
                <Bot className="mb-3 h-12 w-12 text-primary" />
                <CardTitle>Auto Apply (Sim)</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription>Simulate automatically applying to jobs based on your resume and criteria (Experimental).</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}

    