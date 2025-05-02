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
        console.log("Mammoth.js not ready, returning loading state.");
        return { type: 'loading', content: "<div class='p-4 text-center text-muted-foreground'>Preview library (Mammoth.js) is loading...</div>" };
    }
    try {
        console.log("Attempting to convert DOCX to HTML...");
        const arrayBuffer = await fileBlob.arrayBuffer();
        const mammoth = (window as any).mammoth;
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        console.log("DOCX conversion successful.");
        // Return raw HTML wrapped for styling
         return { type: 'html', content: result.value }; // Remove wrapping div, apply styles in JSX
    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        return { type: 'error', content: `<div class='p-4 text-center text-destructive'>Error loading DOCX preview: ${error instanceof Error ? error.message : 'Unknown error'}</div>` };
    }
}

// Basic PDF text extraction (might be limited) or placeholder
async function handlePdfPreview(fileBlob: File): Promise<{ type: 'text' | 'error' | 'placeholder'; content: string }> {
    // For now, just return a placeholder. Robust PDF text extraction client-side is complex.
    // Consider using pdf.js or similar if full preview is needed.
     console.log("Handling PDF preview (placeholder).");
     return { type: 'placeholder', content: `PDF file uploaded: ${fileBlob.name}. Full preview not available, but content will be analyzed.` };
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
                if (document.getElementById(scriptId)) {
                    console.log("Mammoth script tag already exists.");
                    // If script exists but mammoth isn't on window, it might still be loading or failed
                     if (!(window as any).mammoth) {
                         console.log("Mammoth script tag found, but object not yet available on window.");
                         // Optionally set a timeout to check again, or rely on onload
                     } else {
                         console.log("Mammoth object already available on window.");
                         // Trigger preview generation if needed immediately
                         if (uploadedFile && viewState === 'results') {
                             generatePreview(uploadedFile);
                         }
                     }
                    return;
                }
                console.log("Creating Mammoth.js script tag.");
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
                script.async = true;
                 script.onload = () => {
                     console.log("Mammoth.js script loaded successfully via onload.");
                     // Re-trigger preview generation if a file is already selected and we are in results view
                     if (uploadedFile && viewState === 'results') {
                         console.log("Mammoth loaded, triggering preview generation for existing file.");
                         generatePreview(uploadedFile);
                     } else if (uploadedFile && viewState === 'upload') {
                          console.log("Mammoth loaded, file present but in upload view. Preview will generate on analysis.");
                     }
                 };
                 script.onerror = () => {
                     console.error("Failed to load Mammoth.js script via onerror.");
                     // Update state to show error in preview area if needed
                      if (uploadedFile?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                         setPreviewContent({ type: 'error', content: 'Failed to load DOCX preview library (Mammoth.js).' });
                      }
                 };
                document.body.appendChild(script);
             } else if ((window as any).mammoth) {
                  console.log("Mammoth already loaded on initial check.");
             }
        };
        loadMammothScript();
        // No cleanup function needed if we want Mammoth to persist
    }, [isClient]); // Run only once on mount

    // Function to generate preview based on file type
    const generatePreview = useCallback(async (file: File) => {
         if (!isClient) {
            console.log("generatePreview called on server, skipping.");
            return; // Don't run on server
         }
        console.log(`Generating preview for: ${file.name}, type: ${file.type}`);
        setPreviewContent({ type: 'loading', content: 'Generating preview...' });

        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
             if ((window as any).mammoth) {
                 console.log("Mammoth available, calling convertDocxToHtml.");
                 const result = await convertDocxToHtml(file);
                 setPreviewContent(result);
             } else {
                 console.log("Mammoth not available yet, setting preview to loading state.");
                 // Keep loading state, or potentially set a specific message
                 setPreviewContent({ type: 'loading', content: "<div class='p-4 text-center text-muted-foreground'>Waiting for preview library...</div>" });
                 // Optionally, set a timeout to try again if Mammoth loads later
             }
        } else if (file.type === 'application/pdf') {
            console.log("Calling handlePdfPreview.");
            const result = await handlePdfPreview(file); // Use placeholder/basic text extraction
            setPreviewContent(result);
        } else if (file.type === 'text/plain' || file.type === 'application/msword') { // Handle .doc as plain text for now
             console.log("Handling plain text or .doc file preview.");
             try {
                const textContent = await file.text();
                setPreviewContent({ type: 'text', content: textContent });
             } catch (error) {
                 console.error("Error reading text file:", error);
                 setPreviewContent({ type: 'error', content: 'Could not read text file for preview.' });
             }
        } else {
             console.log("Unsupported file type for preview:", file.type);
             setPreviewContent({ type: 'error', content: 'Unsupported file type for preview.' });
        }
    }, [isClient]); // Add isClient dependency


    // Handle file selection or drop
    const handleFileChange = useCallback((file: File | null) => {
        setUploadedFile(null);
        setResumeDataUri(null);
        setResumeText(''); // Clear text input if file is selected
        setPreviewContent(null); // Clear preview
        setAnalysisResult(null); // Clear previous results
        setErrorMessage('');
        // setViewState('upload'); // Reset view state only if appropriate (maybe not needed here)


        if (file) {
            console.log(`File selected: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
                return;
            }
            // Allow common text, pdf, doc, docx types
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'];
            if (!allowedTypes.includes(file.type)) {
                toast({ title: "Invalid File Type", description: "Please upload a PDF, DOCX, DOC, or TXT file.", variant: "destructive" });
                return;
            }
            setUploadedFile(file);

            // Read file as Data URI for AI processing (always needed)
            const reader = new FileReader();
            reader.onload = () => {
                setResumeDataUri(reader.result as string);
                console.log("File read as Data URI successfully.");
                // Optionally generate preview *after* data URI is set, if needed immediately
                // if (isClient) generatePreview(file);
            };
            reader.onerror = (error) => {
                 console.error("File Read Error:", error);
                 toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
                 setUploadedFile(null);
                 setResumeDataUri(null);
            };
            reader.readAsDataURL(file);

             // Trigger preview generation immediately for the upload view if desired
             // Or defer it until the analysis step if preview is only shown in results
             // If generating here:
             // if (isClient) {
             //     generatePreview(file);
             // }

        } else {
             console.log("File selection cleared.");
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
        // Update preview immediately for text
        setPreviewContent({ type: 'text', content: e.target.value });
         setAnalysisResult(null); // Clear previous results
         setErrorMessage('');
         // setViewState('upload'); // Reset view state
    };
    const onJobDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value);


    // Handle analysis submission
    const handleAnalyze = async () => {
        // Ensure either file or text is provided
        const hasFile = uploadedFile && resumeDataUri;
        const hasText = resumeText.trim().length > 0;

        if (!hasFile && !hasText) {
            toast({ title: "Missing Resume Content", description: "Please upload a resume file or paste the text.", variant: "destructive" });
            return;
        }
        if (!jobDescription.trim()) {
            toast({ title: "Missing Job Description", description: "Please provide the job description to analyze against.", variant: "destructive" });
            return;
        }

        setViewState('analyzing');
        setErrorMessage('');
        setAnalysisResult(null);
        setPreviewContent(null); // Clear old preview before starting

        // Generate preview for the results view
        if (uploadedFile && isClient) {
            console.log("Generating preview for results view...");
            generatePreview(uploadedFile); // Regenerate preview specifically for results view
        } else if (hasText) {
             console.log("Setting text preview for results view...");
             setPreviewContent({ type: 'text', content: resumeText });
        }


        try {
            console.log("Starting AI analysis...");
            const input: AnalyzeResumeInput = { jobDescription };
            if (hasFile) {
                input.resumeDataUri = resumeDataUri!; // Use the data URI read earlier
                console.log("Analysis using uploaded file (Data URI).");
            } else {
                input.resumeText = resumeText;
                console.log("Analysis using pasted text.");
            }

            const result = await analyzeResume(input);
            console.log("AI Analysis Successful:", result);
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
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UploadCloud className="h-6 w-6 text-primary" />
                                    Upload or Paste Resume
                                </CardTitle>
                                <CardDescription>Provide your resume content (PDF, DOCX, TXT, DOC) or paste the text directly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div
                                    className={cn(
                                        "relative flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-secondary p-4 text-center transition-all hover:border-primary",
                                        uploadedFile && "border-primary bg-primary/5" // Indicate file selected visually
                                        )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resumeFileInput')?.click()}
                                >
                                    <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <span className="font-medium text-foreground">
                                       {uploadedFile ? uploadedFile.name : "Drag & drop resume file"}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {uploadedFile ? `(${Math.round(uploadedFile.size / 1024)} KB) Click or drag to replace` : "or click to upload (PDF, DOCX, TXT, DOC - max 5MB)"}
                                    </span>
                                    <Input
                                      type="file"
                                      id="resumeFileInput"
                                      className="absolute h-full w-full opacity-0 cursor-pointer"
                                      onChange={onFileChange}
                                      accept=".pdf,.doc,.docx,.txt" // Match allowed types
                                    />
                                  </div>
                                  {/* Removed redundant file name display */}
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
                                         disabled={!!uploadedFile} // Disable if file is uploaded
                                     />
                                      {uploadedFile && <p className="text-xs text-muted-foreground mt-1">Pasting text is disabled when a file is uploaded.</p>}
                                 </div>
                            </CardContent>
                        </Card>

                        {/* Right: Job Description */}
                         <Card className="shadow-md">
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
                                     rows={15} // Adjusted rows
                                     className="text-sm min-h-[200px]" // Ensure minimum height
                                     required
                                 />
                            </CardContent>
                             <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={handleAnalyze}
                                    disabled={(!uploadedFile && !resumeText.trim()) || !jobDescription.trim()}
                                >
                                    Analyze Resume
                                </Button>
                             </CardFooter>
                        </Card>
                    </div>
                );
            case 'analyzing':
                return (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                        <LoadingSpinner />
                        <p className="text-lg font-semibold text-primary">Analyzing your resume...</p>
                        <p className="text-muted-foreground">This may take a moment. Please wait.</p>
                    </div>
                );
            case 'results':
                 if (!analysisResult) return <div className="text-center text-destructive">Error: Analysis results are missing.</div>;
                return (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12"> {/* Use 12 columns for finer control */}
                         {/* Left Panel: Resume Preview */}
                         <div className="lg:col-span-5"> {/* Span 5 columns on large screens */}
                            <Card className="h-[80vh] overflow-hidden sticky top-6 shadow-md">
                                <CardHeader className="p-4 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                    <ScanText className="h-5 w-5 text-primary" /> Resume Content Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[calc(80vh-65px)] p-0 overflow-auto bg-muted">
                                    {previewContent?.type === 'loading' && (
                                        <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
                                    )}
                                    {previewContent?.type === 'error' && (
                                        <div className="p-4 text-destructive">{previewContent.content}</div>
                                    )}
                                    {previewContent?.type === 'html' && (
                                        // Apply prose styles directly here for better control
                                        <div className="p-4 prose prose-sm max-w-none prose-headings:text-primary prose-a:text-primary">
                                            <div
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
                                    {/* Fallback if preview failed but we have text */}
                                    {!previewContent && resumeText && (
                                        <div className="p-4 whitespace-pre-wrap text-sm bg-white h-full overflow-auto">{resumeText}</div>
                                    )}
                                </CardContent>
                            </Card>
                         </div>

                         {/* Right Panel: Analysis Results */}
                        <div className="lg:col-span-7"> {/* Span 7 columns on large screens */}
                            <Card className="max-h-[80vh] overflow-y-auto shadow-md">
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
                                            <Progress value={analysisResult.atsScore} className="h-3 flex-grow" aria-valuenow={analysisResult.atsScore} aria-valuemin={0} aria-valuemax={100} />
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
                                                <Progress value={(score / max) * 100} className="h-2" aria-label={`${label} score ${score} out of ${max}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Feedback Explanation */}
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold flex items-center gap-2">
                                            <Lightbulb className="h-5 w-5 text-muted-foreground" />
                                            Explanation & Suggestions
                                        </h3>
                                        {/* Apply prose styles for better formatting of AI explanation */}
                                        <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 text-foreground whitespace-pre-wrap prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                                            {analysisResult.explanation}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4 mt-6">
                                    <Button variant="outline" onClick={() => {
                                         setViewState('upload');
                                         setUploadedFile(null);
                                         setResumeDataUri(null);
                                         setResumeText('');
                                         setJobDescription(''); // Optionally clear job description too
                                         setPreviewContent(null);
                                         setAnalysisResult(null);
                                    }}>Analyze Another</Button>
                                    <Link href="/resume-builder" passHref>
                                        <Button variant="default">Edit Resume in Builder</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                        <XCircle className="h-16 w-16 text-destructive" />
                        <h2 className="text-xl font-semibold text-destructive">Analysis Failed</h2>
                        <p className="text-muted-foreground max-w-md">{errorMessage || "An unexpected error occurred. Please check the console for details and try again."}</p>
                        <Button onClick={() => setViewState('upload')}>Try Again</Button>
                    </div>
                );
        }
    };


  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary text-center flex-grow">AI Resume Analysis</h1>
        <div className="w-[80px]"></div> {/* Spacer */}
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
