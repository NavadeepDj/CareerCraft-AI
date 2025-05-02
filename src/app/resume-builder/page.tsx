// src/app/resume-builder/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Eye, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from '@/components/loading-spinner';

// Placeholder for template data
const templates = [
  { id: 'stylish_sales', name: 'Stylish Sales Resume', path: '/templates/Stylish_sales_resume.docx' },
  { id: 'modern_professional', name: 'Modern Professional', path: '/templates/Modern_professional_resume.docx' },
  // Add more templates here
];

// Placeholder function for DOCX to HTML conversion (client-side only)
// In a real app, consider server-side rendering or a dedicated library
async function convertDocxToHtml(fileBlob: Blob): Promise<string> {
    if (typeof window === 'undefined' || !(window as any).mammoth) {
        console.warn("Mammoth is not available. Skipping DOCX conversion.");
        return "<p>DOCX preview requires client-side JavaScript and Mammoth.js.</p>";
    }
    try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const mammoth = (window as any).mammoth;
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        return result.value; // The generated HTML
    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        return `<p>Error loading resume preview: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
    }
}

export default function ResumeBuilderPage() {
    const [resumeData, setResumeData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        summary: 'Experienced professional seeking challenging opportunities...',
        skills: 'Leadership, Communication, React, Node.js',
        // Add more fields: experience, education, etc.
    });
    const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0].id);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Indicate component has mounted client-side
        // Dynamically load Mammoth.js if needed
        if (typeof window !== 'undefined' && !(window as any).mammoth) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
            script.async = true;
            script.onload = () => {
                 console.log("Mammoth.js loaded.");
                 loadTemplatePreview(selectedTemplate); // Load initial preview after script load
            }
            document.body.appendChild(script);
        } else {
            loadTemplatePreview(selectedTemplate); // Load initial preview if mammoth already exists
        }
    }, []); // Run only once on mount


    const loadTemplatePreview = async (templateId: string) => {
        if (!isClient) return; // Don't run server-side

        setIsLoadingPreview(true);
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            setPreviewHtml('<p>Template not found.</p>');
            setIsLoadingPreview(false);
            return;
        }

        try {
            // Check if the path is valid before fetching
             if (!template.path || typeof template.path !== 'string') {
               throw new Error('Invalid template path.');
             }

            const response = await fetch(template.path);
            if (!response.ok) {
                // Log a more specific error if the template file is not found
                if (response.status === 404) {
                  console.error(`Template file not found at path: ${template.path}`);
                  throw new Error(`Template file not found: ${template.path}. Make sure the file exists in the public/templates directory.`);
                }
                throw new Error(`Failed to fetch template: ${response.statusText}`);
            }
            const blob = await response.blob();
            let html = await convertDocxToHtml(blob);

            // Basic placeholder replacement (replace with a more robust method if needed)
            Object.entries(resumeData).forEach(([key, value]) => {
                 // Use more specific placeholders like {{firstName}}, {{lastName}} in your DOCX
                 const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
                 html = html.replace(regex, value);

                 // Example for skills list - requires specific structure in DOCX
                 if (key === 'skills') {
                    const skillsListHtml = value.split(',')
                        .map(skill => skill.trim())
                        .filter(skill => skill)
                        .map(skill => `<li>${skill}</li>`).join('');
                    html = html.replace(/{{skillsList}}/gi, `<ul>${skillsListHtml}</ul>`);
                 }
            });

            // Replace remaining placeholders with empty strings or default text
            html = html.replace(/{{\s*\w+\s*}}/gi, '');

            setPreviewHtml(html);
        } catch (error) {
            console.error('Error loading template preview:', error);
            setPreviewHtml(`<p>Error loading preview. ${error instanceof Error ? error.message : 'Ensure the template file exists and Mammoth.js is loaded.'}</p>`);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    useEffect(() => {
        // Reload preview when template or data changes (debounced for performance)
        const handler = setTimeout(() => {
            loadTemplatePreview(selectedTemplate);
        }, 500); // Debounce time

        return () => clearTimeout(handler);
    }, [resumeData, selectedTemplate, isClient]); // Added isClient dependency

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, [id]: value }));
    };

    const handleTemplateChange = (value: string) => {
        setSelectedTemplate(value);
    };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">Resume Builder</h1>
         <div className="flex items-center gap-2">
             <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" /> Preview
             </Button>
             <Button variant="default" size="sm">
                 <Download className="mr-2 h-4 w-4" /> Download
             </Button>
         </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Panel: Form Inputs */}
        <div className="lg:col-span-4">
           <Card className="sticky top-6">
             <CardContent className="space-y-6 p-6">
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                   <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger id="template-select">
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>

                <h2 className="text-xl font-semibold border-t pt-4">Edit Content</h2>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={resumeData.firstName} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={resumeData.lastName} onChange={handleInputChange} />
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={resumeData.email} onChange={handleInputChange} />
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" value={resumeData.summary} onChange={handleInputChange} rows={4} />
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input id="skills" value={resumeData.skills} onChange={handleInputChange} placeholder="e.g., React, Node.js, Project Management" />
                 </div>

                  {/* Add more form fields here (Experience, Education, etc.) */}
                   {/* Example:
                   <div className="space-y-2">
                       <Label htmlFor="experience">Experience</Label>
                       <Textarea id="experience" onChange={handleInputChange} rows={6} />
                   </div>
                   */}

                 <div className="border-t pt-4">
                    <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" /> Import from Existing Resume
                    </Button>
                 </div>

             </CardContent>
           </Card>
        </div>

        {/* Right Panel: Resume Preview */}
        <div className="lg:col-span-8">
          <Card className="h-[80vh] overflow-hidden"> {/* Adjust height as needed */}
             <CardContent className="h-full p-0">
               {isLoadingPreview ? (
                 <div className="flex h-full items-center justify-center">
                   <LoadingSpinner />
                 </div>
               ) : (
                 <div
                   className="prose prose-sm max-w-none overflow-y-auto p-6 h-full bg-white text-black" // Basic styling for preview
                   dangerouslySetInnerHTML={{ __html: previewHtml }}
                 />
               )}
             </CardContent>
          </Card>
        </div>
      </div>
       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}
