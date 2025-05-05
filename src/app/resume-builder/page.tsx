// src/app/resume-builder/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Eye, FileText, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver'; // For triggering download
import { generateDocxAction } from '@/actions/generate-docx'; // Import the server action
import ResumePreview from '@/components/resume-preview'; // Import the preview component

// Placeholder for template data
interface Template {
    id: string;
    name: string;
    path: string; // Path relative to the public directory
    thumbnail: string; // URL to the thumbnail image
    aiHint: string; // Hint for image generation/replacement
}

// Updated templates array with correct paths and more specific AI hints
const templates: Template[] = [
  {
    id: 'stylish_sales',
    name: 'Stylish Sales',
    path: '/templates/Stylish_sales_resume.docx',
    thumbnail: 'https://picsum.photos/seed/stylish_sales/300/400',
    aiHint: 'stylish modern resume sales professional',
  },
  {
    id: 'modern_professional',
    name: 'Modern Professional',
    path: '/templates/Modern_professional_resume.docx',
    thumbnail: 'https://picsum.photos/seed/modern_prof/300/400',
    aiHint: 'modern professional resume clean design',
  },
  {
    id: 'classic_monochrome',
    name: 'Classic Monochrome',
    path: '/templates/Classic_monochrome_resume.docx',
    thumbnail: 'https://picsum.photos/seed/classic_mono/300/400',
    aiHint: 'classic monochrome resume traditional layout',
  },
  // Add more templates here if needed, ensuring the .docx files exist in public/templates
];


// Type definition for resume data state
export type ResumeData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  profile: string;
  employmentHistory: string;
  education: string;
  skills: string;
  references: string;
  hobbies: string;
  languages: string;
  academicProjects: string;
  [key: string]: string; // Allow other string properties if needed
};

export default function ResumeBuilderPage() {
    const { toast } = useToast();
    // Initial state matching the screenshot's example data
    const [resumeData, setResumeData] = useState<ResumeData>({
        firstName: 'Tanguturi Venkata',
        lastName: 'Sujith Gopi',
        email: 'sujithgopi740@gmail.com',
        phone: '7989418257',
        address: 'Nellore, INDIA',
        jobTitle: 'Aspiring Software Engineer',
        profile: 'Resourceful and dedicated High School student with excellent analytical skills and a demonstrated commitment to providing great service. Strong organizational abilities with proven successes managing multiple academic projects and volunteering events. Well-rounded and professional team player dedicated to continuing academic pursuits at a collegiate level.',
        employmentHistory: '', // Placeholder, update if needed
        education: `B.Tech, Kalasalingam university, Krishnan Koil\nSeptember 2022 - December 2026\n\nIntermediate, Narayana JR collagle, Nellore\nNovember 2020 - July 2022`,
        skills: 'Effective Time Management, Ability to work Under Pressure, Communication Skills, Microsoft Office, Leadership',
        references: '', // Placeholder, update if needed
        hobbies: 'Coding at free time',
        languages: 'Telugu\nEnglish',
        academicProjects: `Project using C language\nImplemented denomination in ATM code in C.\n\nProject using Python\nParking management system using Python.\n\nB-EEE\nElectric powered Bicycle.`
    });
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // General loading state for downloads
    const [isClient, setIsClient] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true); // Start by showing templates

     useEffect(() => {
        setIsClient(true); // Indicate component has mounted client-side
     }, []);

    // Handles input changes in the form fields
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, [id]: value }));
    };

    // Handles template selection from the gallery
    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(template);
            setShowTemplates(false); // Hide template selection and show editor
            toast({ title: `Template selected: ${template.name}`, description: "Fill in your details." });
        } else {
            toast({ title: "Error", description: "Template not found.", variant: "destructive" });
        }
    };

    // Handles download requests (Word or PDF)
     const handleDownload = async (format: 'word' | 'pdf') => {
         console.log(`Download requested in ${format} format`);

         if (!selectedTemplate) {
             toast({
                 title: "No Template Selected",
                 description: "Please select a template before downloading.",
                 variant: "destructive",
             });
             return;
         }

         // Generate file name based on resume data
         const fileNameBase = `${resumeData.lastName}_${resumeData.firstName}_Resume`.replace(/\s+/g, '_');

         setIsLoading(true); // Start loading indicator

         if (format === 'word') {
             try {
                 toast({
                     title: "Generating DOCX...",
                     description: "This may take a moment.",
                 });

                 // Call the server action with current resume data and selected template path
                 const docxBlob = await generateDocxAction(resumeData, selectedTemplate.path);

                 if (docxBlob) {
                     saveAs(docxBlob, `${fileNameBase}.docx`); // Trigger download using file-saver
                     toast({
                         title: "DOCX Download Started",
                         description: "Your resume has been downloaded.",
                     });
                 } else {
                     throw new Error("Server action returned no data or failed."); // Handle potential null return
                 }

             } catch (error) {
                 console.error("Error generating DOCX via server action:", error);
                 toast({
                     title: "DOCX Generation Failed",
                     description: `Could not generate Word file. ${error instanceof Error ? error.message : 'Check console for details.'}`,
                     variant: "destructive",
                 });
             } finally {
                 setIsLoading(false); // Stop loading indicator
             }
         } else if (format === 'pdf') {
             // PDF generation placeholder - still not implemented
             toast({
                 title: "PDF Download (Not Implemented)",
                 description: "Generating PDF from DOCX is complex. DOCX download is recommended.",
                 variant: "destructive",
             });
             setIsLoading(false); // Stop loading indicator
             // Future: Implement server-side DOCX to PDF conversion or use a client-side library carefully.
         }
     };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary"> {/* Size adjusted */}
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary text-center flex-grow">Resume Builder</h1>
         <div className="flex items-center gap-2">
             {!showTemplates && selectedTemplate && (
                <Button variant="outline" size="sm" onClick={() => {
                    setShowTemplates(true);
                    setSelectedTemplate(null); // Clear selection when going back to templates
                }}>
                    <Eye className="mr-2 h-4 w-4" /> Change Template
                 </Button>
             )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" disabled={showTemplates || !selectedTemplate || isLoading}>
                    {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4 border-t-current border-r-current border-b-transparent border-l-transparent" /> : <Download className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating...' : 'Download'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload('word')} disabled={isLoading}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Word (.docx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={isLoading}>
                    <FileText className="mr-2 h-4 w-4" />
                     <span>PDF (.pdf)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
         </div>
      </header>

      {showTemplates ? (
         // Template Selection View
        <div>
            <h2 className="mb-6 text-center text-xl font-semibold">Choose a Resume Template</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        className="cursor-pointer overflow-hidden shadow-md transition-all hover:shadow-lg hover:scale-105"
                        onClick={() => handleTemplateSelect(template.id)}
                        aria-label={`Select ${template.name} template`}
                    >
                        <CardContent className="p-0">
                            <Image
                                src={template.thumbnail}
                                alt={`${template.name} thumbnail`}
                                width={300}
                                height={400}
                                className="w-full object-cover aspect-[3/4] bg-secondary" // Added bg-secondary as placeholder background
                                data-ai-hint={template.aiHint} // Use specific hint
                                priority // Load thumbnails faster
                                unoptimized // Avoid Next.js image optimization for external URLs like picsum
                            />
                             <div className="p-4 border-t">
                                <p className="text-center font-medium">{template.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      ) : (
         // Editor and Preview View
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Editor Form */}
            <Card className="shadow-md max-h-[85vh] overflow-y-auto">
                 <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Edit Content for: {selectedTemplate?.name || 'Selected Template'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Enter your details below. The preview will update in real-time.</p>
                 </CardHeader>
                 <CardContent className="space-y-6 p-6">
                     {/* Personal Details Section */}
                     <fieldset className="space-y-4 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Personal Details</legend>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={resumeData.firstName} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={resumeData.lastName} onChange={handleInputChange} />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="jobTitle">Job Title / Headline</Label>
                            <Input id="jobTitle" value={resumeData.jobTitle} onChange={handleInputChange} placeholder="e.g., Software Engineer"/>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={resumeData.email} onChange={handleInputChange} />
                             </div>
                              <div className="space-y-1">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" value={resumeData.phone} onChange={handleInputChange} />
                             </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={resumeData.address} onChange={handleInputChange} placeholder="City, Country"/>
                         </div>
                     </fieldset>

                     {/* Profile Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Profile Summary</legend>
                        <Textarea id="profile" value={resumeData.profile} onChange={handleInputChange} rows={5} placeholder="Brief professional summary..."/>
                     </fieldset>

                      {/* Skills Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Skills</legend>
                        <Textarea id="skills" value={resumeData.skills} onChange={handleInputChange} rows={4} placeholder="Skill 1, Skill 2, Skill 3..." />
                        <p className="text-xs text-muted-foreground">Separate skills with commas or put each on a new line.</p>
                     </fieldset>

                     {/* Education Section */}
                      <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Education</legend>
                        <Textarea id="education" value={resumeData.education} onChange={handleInputChange} rows={6} placeholder="Degree, Institution, Location&#10;Date Range&#10;&#10;Degree 2, Institution 2..." />
                         <p className="text-xs text-muted-foreground">Use double line breaks between entries.</p>
                     </fieldset>

                    {/* Academic Projects Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Academic Projects</legend>
                        <Textarea id="academicProjects" value={resumeData.academicProjects} onChange={handleInputChange} rows={6} placeholder="Project Title&#10;- Description point 1&#10;- Description point 2&#10;&#10;Project Title 2..." />
                        <p className="text-xs text-muted-foreground">Use double line breaks between projects.</p>
                     </fieldset>

                     {/* Employment History Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Employment History</legend>
                        <Textarea id="employmentHistory" value={resumeData.employmentHistory} onChange={handleInputChange} rows={10} placeholder="Company, Role&#10;Date Range&#10;- Responsibility 1&#10;- Responsibility 2&#10;&#10;Company 2, Role 2..." />
                         <p className="text-xs text-muted-foreground">Use double line breaks between job entries.</p>
                     </fieldset>

                     {/* Hobbies Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Hobbies</legend>
                        <Input id="hobbies" value={resumeData.hobbies} onChange={handleInputChange} placeholder="e.g., Coding, Reading, Hiking"/>
                     </fieldset>

                     {/* Languages Section */}
                      <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">Languages</legend>
                        <Textarea id="languages" value={resumeData.languages} onChange={handleInputChange} rows={3} placeholder="Language 1&#10;Language 2"/>
                         <p className="text-xs text-muted-foreground">Enter each language on a new line.</p>
                     </fieldset>

                     {/* References Section */}
                     <fieldset className="space-y-1 rounded border p-4 pt-2">
                       <legend className="-ml-1 px-1 text-sm font-medium text-primary">References</legend>
                        <Textarea id="references" value={resumeData.references} onChange={handleInputChange} rows={4} placeholder='Often "Available upon request" is sufficient.' />
                        <p className="text-xs text-muted-foreground">Use double line breaks between references if providing multiple.</p>
                     </fieldset>

                 </CardContent>
               </Card>

             {/* Right Column: Preview Pane */}
             <div className="sticky top-6 h-[85vh] overflow-hidden rounded-lg border shadow-md bg-muted">
                <CardHeader className="p-4 border-b bg-background">
                   <CardTitle className="text-lg flex items-center gap-2">
                     <Eye className="h-5 w-5 text-primary" />
                     Preview
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[calc(85vh-65px)] overflow-auto">
                   {/* Render the ResumePreview component */}
                   <ResumePreview data={resumeData} />
                 </CardContent>
            </div>
        </div>
      )}
       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
