// src/app/analysis/page.tsx
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, XCircle, BarChart, Percent, Star, Users, GraduationCap, ScanText, Lightbulb } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { analyzeResume, type AnalyzeResumeOutput, type AnalyzeResumeInput } from '@/ai/flows/resume-analysis';
import { Progress } from "@/components/ui/progress";

type ViewState = 'upload' | 'analyzing' | 'results' | 'error';

// Placeholder function for DOCX to HTML conversion (client-side only)
async function convertDocxToHtml(fileBlob: Blob): Promise<{ type: 'html' | 'error' | 'loading'; content: string }> {
    if (typeof window === 'undefined' || !(window as any).mammoth) {
        return { type: 'loading', content: "<div class='p-4 text-center text-muted-foreground'>Preview library (Mammoth.js) is loading...</div>" };
    }
    try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const mammoth = (window as any).mammoth;
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        // Return raw HTML wrapped for styling
         return { type: 'html', content: `<div class="prose prose-sm max-w-none p-4 text-black bg-white h-full overflow-auto">${result.value}</div>` };
    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        return { type: 'error', content: `<div class='p-4 text-center text-red-600'>Error loading DOCX preview: ${error instanceof Error ? error.message : 'Unknown error'}</div>` };
    }
}

// Basic PDF text extraction (might be limited) or placeholder
async function handlePdfPreview(fileBlob: Blob): Promise<{ type: 'text' | 'error' | 'placeholder'; content: string }> {
    // For now, just return a placeholder. Robust PDF text extraction client-side is complex.
    // Consider using pdf.js or similar if full preview is needed.
     return { type: 'placeholder', content: `PDF file uploaded: ${fileBlob.name}. Preview not available.` };
}


export default function AnalysisPage() {
    const { toast } = useToast();
    const [viewState, setViewState] = useState<ViewState>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
    const [previewContent, setPreviewContent] = useState<{ type: 'html' | 'text' | 'error' | 'loading' | 'placeholder'; content: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    // Load Mammoth.js script
    useEffect(() => {
        setIsClient(true);
        const loadMammothScript = () => {
             if (typeof window !== 'undefined' && !(window as any).mammoth) {
                const scriptId = 'mammoth-script';
                if (document.getElementById(scriptId)) return;
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
                script.async = true;
                 script.onload = () => console.log("Mammoth.js loaded.");
                 script.onerror = () => console.error("Failed to load Mammoth.js.");
                document.body.appendChild(script);
             }
        };
        loadMammothScript();
    }, []);

    // Function to generate preview based on file type
    const generatePreview = useCallback(async (file: File) => {
        setPreviewContent({ type: 'loading', content: 'Generating preview...' });
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
             const result = await convertDocxToHtml(file);
             setPreviewContent(result);
        } else if (file.type === 'application/pdf') {
            const result = await handlePdfPreview(file); // Use placeholder/basic text extraction
             setPreviewContent(result);
        } else {
             setPreviewContent({ type: 'error', content: 'Unsupported file type for preview.' });
        }
    }, []);


    // Handle file selection or drop
    const handleFileChange = useCallback((file: File | null) => {
        setUploadedFile(null);
        setResumeDataUri(null);
        setResumeText(''); // Clear text input if file is selected
        setPreviewContent(null); // Clear preview

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
            // Read file as Data URI for AI processing
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setResumeDataUri(reader.result as string);
            reader.onerror = () => {
                 toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
                 setUploadedFile(null);
            };

            // Generate preview
            if (isClient) {
                generatePreview(file);
            }

        }
    }, [toast, isClient, generatePreview]);

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
    const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setResumeText(e.target.value);
        setUploadedFile(null); // Clear file input if text is entered
        setResumeDataUri(null);
        setPreviewContent({ type: 'text', content: e.target.value }); // Show text as preview
    };
    const onJobDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value);


    // Handle analysis submission
    const handleAnalyze = async () => {
        if (!resumeDataUri && !resumeText.trim()) {
            toast({ title: "Missing Resume", description: "Please upload a resume file or paste the text.", variant: "destructive" });
            return;
        }
        if (!jobDescription.trim()) {
            toast({ title: "Missing Job Description", description: "Please provide the job description to analyze against.", variant: "destructive" });
            return;
        }

        setViewState('analyzing');
        setErrorMessage('');
        setAnalysisResult(null);

        try {
            const input: AnalyzeResumeInput = { jobDescription };
            if (resumeDataUri) {
                input.resumeDataUri = resumeDataUri;
            } else {
                input.resumeText = resumeText;
            }
            const result = await analyzeResume(input);
            setAnalysisResult(result);
            setViewState('results');
        } catch (error) {
            console.error("AI Analysis Failed:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
            setErrorMessage(`Analysis Failed: ${message}`);
            setViewState('error');
            toast({ title: "AI Analysis Error", description: message, variant: "destructive" });
        }
    };

    // Render different sections based on viewState
    const renderContent = () => {
        switch (viewState) {
            case 'upload':
                return (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Left: Upload Area */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UploadCloud className="h-6 w-6 text-primary" />
                                    Upload or Paste Resume
                                </CardTitle>
                                <CardDescription>Provide your resume content (PDF, DOCX, TXT) or paste the text directly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div
                                    className="relative flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-secondary p-4 text-center transition-all hover:border-primary"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resumeFileInput')?.click()}
                                >
                                    <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <span className="font-medium text-foreground">Drag & drop resume file</span>
                                    <span className="text-sm text-muted-foreground">or click to upload (PDF, DOCX, TXT, max 5MB)</span>
                                    <Input
                                      type="file"
                                      id="resumeFileInput"
                                      className="absolute h-full w-full opacity-0"
                                      onChange={onFileChange}
                                      accept=".pdf,.doc,.docx,.txt"
                                    />
                                  </div>
                                  {uploadedFile && <p className="text-center text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>}
                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                      <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                      <span className="bg-card px-2 text-muted-foreground">
                                        Or
                                      </span>
                                    </div>
                                  </div>
                                 <div className="space-y-1">
                                     <Label htmlFor="resumeText">Paste Resume Text</Label>
                                     <Textarea
                                         id="resumeText"
                                         value={resumeText}
                                         onChange={onTextChange}
                                         placeholder="Paste your resume content here..."
                                         rows={10}
                                         className="text-sm"
                                     />
                                 </div>
                            </CardContent>
                        </Card>

                        {/* Right: Job Description */}
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-primary" />
                                    Job Description
                                </CardTitle>
                                <CardDescription>Paste the job description you want to analyze your resume against.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Textarea
                                     id="jobDescription"
                                     value={jobDescription}
                                     onChange={onJobDescChange}
                                     placeholder="Paste the full job description here..."
                                     rows={15}
                                     className="text-sm"
                                     required
                                 />
                            </CardContent>
                             <CardFooter>
                                <Button className="w-full" onClick={handleAnalyze} disabled={(!uploadedFile && !resumeText.trim()) || !jobDescription.trim()}>
                                    Analyze Resume
                                </Button>
                             </CardFooter>
                        </Card>
                    </div>
                );
            case 'analyzing':
                return (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-lg font-semibold text-primary">Analyzing your resume...</p>
                        <p className="text-muted-foreground">This may take a moment.</p>
                    </div>
                );
            case 'results':
                 if (!analysisResult) return <div className="text-center text-destructive">Error: Analysis results are missing.</div>;
                return (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                         {/* Left Panel: Resume Preview */}
                         <Card className="h-[80vh] overflow-hidden sticky top-6">
                             <CardHeader className="p-4 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                   <ScanText className="h-5 w-5 text-primary" /> Resume Content
                                </CardTitle>
                             </CardHeader>
                             <CardContent className="h-[calc(80vh-65px)] p-0 overflow-auto bg-muted">
                                {previewContent?.type === 'loading' && (
                                     <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
                                )}
                                 {previewContent?.type === 'error' && (
                                     <div className="p-4 text-red-600">{previewContent.content}</div>
                                )}
                                {previewContent?.type === 'html' && (
                                    <div className="p-4">
                                        <div
                                            className="mx-auto max-w-3xl bg-white p-6 shadow-md document-preview"
                                            dangerouslySetInnerHTML={{ __html: previewContent.content }}
                                        />
                                    </div>
                                )}
                                {previewContent?.type === 'text' && (
                                     <div className="p-4 whitespace-pre-wrap text-sm bg-white h-full overflow-auto">{previewContent.content}</div>
                                )}
                                 {previewContent?.type === 'placeholder' && (
                                     <div className="p-4 text-muted-foreground">{previewContent.content}</div>
                                )}
                                {!previewContent && resumeText && ( // Fallback for text paste if preview logic fails
                                     <div className="p-4 whitespace-pre-wrap text-sm bg-white h-full overflow-auto">{resumeText}</div>
                                )}
                             </CardContent>
                         </Card>

                         {/* Right Panel: Analysis Results */}
                        <Card className="max-h-[80vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                                    <BarChart className="h-6 w-6 text-primary" />
                                    Analysis Results
                                </CardTitle>
                                <CardDescription>ATS Score Breakdown and Feedback</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Overall Score */}
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-muted-foreground" />
                                        Overall ATS Match Score
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <Progress value={analysisResult.atsScore} className="h-3 flex-grow" />
                                        <span className="text-2xl font-bold text-primary">{analysisResult.atsScore}%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">How well your resume aligns with the job description.</p>
                                </div>

                                {/* Score Breakdown */}
                                <div className="space-y-3">
                                     <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                                        <BarChart className="h-5 w-5 text-muted-foreground" />
                                        Score Breakdown (out of 100)
                                    </h3>
                                    {[
                                        { label: "Keyword Match", score: analysisResult.keywordMatchScore, icon: Star, max: 20 },
                                        { label: "Skills Alignment", score: analysisResult.skillsAlignmentScore, icon: CheckCircle2, max: 20 },
                                        { label: "Experience Relevance", score: analysisResult.experienceRelevanceScore, icon: Users, max: 20 },
                                        { label: "Education Match", score: analysisResult.educationMatchScore, icon: GraduationCap, max: 20 },
                                        { label: "Formatting & Readability", score: analysisResult.formattingReadabilityScore, icon: ScanText, max: 20 },
                                    ].map(({ label, score, icon: Icon, max }) => (
                                        <div key={label}>
                                            <div className="flex justify-between items-center mb-1">
                                                 <span className="text-sm font-medium flex items-center gap-1.5"><Icon className="h-4 w-4 text-muted-foreground" />{label}</span>
                                                <span className="text-sm font-semibold text-primary">{score}/{max}</span>
                                            </div>
                                            <Progress value={(score / max) * 100} className="h-2" />
                                        </div>
                                    ))}
                                </div>

                                {/* Feedback Explanation */}
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-muted-foreground" />
                                        Explanation & Suggestions
                                    </h3>
                                    <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 text-foreground whitespace-pre-wrap">
                                        {analysisResult.explanation}
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setViewState('upload')}>Analyze Another</Button>
                                 <Link href="/resume-builder" passHref>
                                    <Button variant="default">Edit Resume</Button>
                                 </Link>
                             </CardFooter>
                        </Card>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                        <XCircle className="h-16 w-16 text-destructive" />
                        <h2 className="text-xl font-semibold text-destructive">Analysis Failed</h2>
                        <p className="text-muted-foreground max-w-md">{errorMessage || "An unexpected error occurred. Please try again."}</p>
                        <Button onClick={() => setViewState('upload')}>Try Again</Button>
                    </div>
                );
        }
    };


  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">AI Resume Analysis</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main>
        {renderContent()}
      </main>

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
