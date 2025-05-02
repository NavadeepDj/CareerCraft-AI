// src/app/resume-builder/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Eye, Upload, FileText, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

// Placeholder for template data
interface Template {
    id: string;
    name: string;
    path: string;
    thumbnail: string; // URL to the thumbnail image
}

const templates: Template[] = [
  {
    id: 'stylish_sales',
    name: 'Stylish Sales',
    path: '/templates/Stylish_sales_resume.docx',
    thumbnail: 'https://picsum.photos/seed/resume1/300/400'
  },
  {
    id: 'modern_professional',
    name: 'Modern Professional',
    path: '/templates/Modern_professional_resume.docx',
    thumbnail: 'https://picsum.photos/seed/resume2/300/400'
  },
  {
    id: 'classic_monochrome',
    name: 'Classic Monochrome',
    path: '/templates/Classic_monochrome_resume.docx', // Assuming this exists
    thumbnail: 'https://picsum.photos/seed/resume3/300/400'
  },
  // Add more templates here
];

// Placeholder function for DOCX to HTML conversion (client-side only)
async function convertDocxToHtml(fileBlob: Blob): Promise<string> {
    if (typeof window === 'undefined' || !(window as any).mammoth) {
        console.warn("Mammoth is not available. Skipping DOCX conversion.");
        return "<p class='p-4 text-center text-red-600'>DOCX preview requires client-side JavaScript and Mammoth.js. Please ensure it's loaded.</p>";
    }
    try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const mammoth = (window as any).mammoth;
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        // Basic styling for preview content - enhanced in loadTemplatePreview
        return `<div class="prose prose-sm max-w-none p-6">${result.value}</div>`;
    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        return `<p class='p-4 text-center text-red-600'>Error loading resume preview: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
    }
}

// Placeholder download function
const downloadFile = (filename: string, content: string, mimeType: string) => {
  if (typeof window !== 'undefined') {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href); // Clean up
  }
};

export default function ResumeBuilderPage() {
    // Initial state matching the screenshot's example data
    const [resumeData, setResumeData] = useState({
        firstName: 'Tanguturi Venkata',
        lastName: 'Sujith Gopi',
        email: 'sujithgopi740@gmail.com',
        phone: '7989418257',
        address: 'Nellore, INDIA', // Added based on preview
        jobTitle: '', // Added new field based on screenshot
        profile: 'Resourceful and dedicated High School student with excellent analytical skills and a demonstrated commitment to providing great service. Strong organizational abilities with proven successes managing multiple academic projects and volunteering events. Well-rounded and professional team player dedicated to continuing academic pursuits at a collegiate level.', // Updated based on preview
        employmentHistory: '', // Placeholder, update if needed
        education: `B.Tech, Kalasalingam university, Krishnan Koil\nSeptember 2022 - December 2026\n\nIntermediate, Narayana JR collagle, Nellore\nNovember 2020 - July 2022`, // Updated based on preview
        skills: 'Effective Time Management, Ability to work Under Pressure, Communication Skills, Microsoft Office, Leadership', // Updated based on preview
        references: '', // Placeholder, update if needed
        hobbies: 'Coding at free time', // Added based on preview
        languages: 'Telugu\nEnglish', // Added based on preview
        academicProjects: `Project using C language\nImplemented denomination in ATM code in C.\n\nProject using Python\nParking management system using Python.\n\nB-EEE\nElectric powered Bicycle.` // Added based on preview
    });
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null); // Start with no template selected
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false); // Don't load initially
    const [isClient, setIsClient] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true); // Start by showing templates


    const loadTemplatePreview = useCallback(async (templateId: string | null) => {
        if (!isClient || !templateId) return; // Don't run server-side or without a template ID

        setIsLoadingPreview(true);
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            setPreviewHtml('<p class="p-4 text-center text-red-600">Template not found.</p>');
            setIsLoadingPreview(false);
            return;
        }

        try {
             if (!template.path || typeof template.path !== 'string') {
               throw new Error('Invalid template path.');
             }

            const response = await fetch(template.path);
            if (!response.ok) {
                if (response.status === 404) {
                  console.error(`Template file not found at path: ${template.path}`);
                  throw new Error(`Template file not found: ${template.path}. Make sure the file exists in the public/templates directory.`);
                }
                throw new Error(`Failed to fetch template: ${response.statusText}`);
            }
            const blob = await response.blob();
            let html = await convertDocxToHtml(blob);

            // Inject dynamic data into the HTML preview
             Object.entries(resumeData).forEach(([key, value]) => {
                 const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
                 let formattedValue = value?.replace(/\n/g, '<br>') ?? ''; // Handle potential undefined/null

                 // Specific formatting for lists (example for skills)
                 if (key === 'skills' && value && html.includes('{{skillsList}}')) {
                     const skillsListHtml = value.split(',')
                         .map(skill => skill.trim())
                         .filter(skill => skill)
                         .map(skill => `<li>${skill}</li>`).join('');
                     html = html.replace(/{{skillsList}}/gi, `<ul>${skillsListHtml}</ul>`);
                 }
                 // Specific formatting for employment history
                 else if (key === 'employmentHistory' && value && html.includes('{{employmentHistoryList}}')) {
                     const historyItems = value.split('\n\n').map(item => {
                        const lines = item.split('\n');
                        const titleLine = lines[0] || '';
                        const dateLine = lines[1] || '';
                        const descriptionLines = lines.slice(2).map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
                        return `<div class="mb-4"><h4>${titleLine}</h4><p class="text-sm text-muted-foreground">${dateLine}</p><ul>${descriptionLines}</ul></div>`;
                     }).join('');
                     html = html.replace(/{{employmentHistoryList}}/gi, historyItems);
                 }
                 // Specific formatting for education
                 else if (key === 'education' && value && html.includes('{{educationList}}')) {
                     const educationItems = value.split('\n\n').map(item => {
                        const lines = item.split('\n');
                        const degreeLine = lines[0] || '';
                        const dateLine = lines[1] || '';
                         return `<div class="mb-2"><p><strong>${degreeLine}</strong><br>${dateLine}</p></div>`;
                    }).join('');
                    html = html.replace(/{{educationList}}/gi, `<div class="education-section">${educationItems}</div>`);
                 }
                  // Specific formatting for references
                 else if (key === 'references' && value && html.includes('{{referencesList}}')) {
                     const referenceItems = value.split('\n\n').map(item => {
                        const lines = item.split('\n');
                        const nameLine = lines[0] || '';
                        const contactLine = lines[1] || '';
                        return `<div class="mb-2"><p><strong>${nameLine}</strong><br>${contactLine}</p></div>`;
                     }).join('');
                     html = html.replace(/{{referencesList}}/gi, `<div class="references-section">${referenceItems}</div>`);
                 }
                  // Specific formatting for academic projects
                 else if (key === 'academicProjects' && value && html.includes('{{academicProjectsList}}')) {
                     const projectItems = value.split('\n\n').map(item => {
                        const lines = item.split('\n');
                        const titleLine = lines[0] || '';
                        const descriptionLines = lines.slice(1).map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
                        return `<div class="mb-4"><h4>${titleLine}</h4><ul>${descriptionLines}</ul></div>`;
                     }).join('');
                     html = html.replace(/{{academicProjectsList}}/gi, `<div class="academic-projects-section">${projectItems}</div>`);
                 }
                 // Handle simple replacements for other fields
                 else {
                     html = html.replace(regex, formattedValue);
                 }
            });


            // Clean up any remaining placeholders
            html = html.replace(/{{\s*\w+\s*}}/gi, ''); // Remove unmatched placeholders

            // Add base styling for preview
            html = `<div class="prose prose-sm max-w-none p-6 text-black bg-white h-full overflow-auto">${html}</div>`;


            setPreviewHtml(html);
        } catch (error) {
            console.error('Error loading template preview:', error);
            setPreviewHtml(`<p class='p-4 text-center text-red-600'>Error loading preview. ${error instanceof Error ? error.message : 'Ensure the template file exists and Mammoth.js is loaded.'}</p>`);
        } finally {
            setIsLoadingPreview(false);
        }
    }, [isClient, resumeData]); // Include resumeData dependency


    useEffect(() => {
        setIsClient(true); // Indicate component has mounted client-side
        // Dynamically load Mammoth.js if needed
        if (typeof window !== 'undefined' && !(window as any).mammoth) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
            script.async = true;
            script.onload = () => {
                 console.log("Mammoth.js loaded.");
                 // Initial load only if a template is selected and we're not showing the gallery
                 if (selectedTemplate && !showTemplates) {
                    loadTemplatePreview(selectedTemplate);
                 } else {
                     setIsLoadingPreview(false); // Stop loading if showing gallery initially
                 }
            }
            script.onerror = () => {
                console.error("Failed to load Mammoth.js");
                 setIsLoadingPreview(false);
                 setPreviewHtml("<p class='p-4 text-center text-red-600'>Failed to load preview library. Please check your connection.</p>");
            }
            document.body.appendChild(script);
             // Cleanup script on unmount
             return () => {
                const existingScript = document.querySelector('script[src="https://unpkg.com/mammoth/mammoth.browser.min.js"]');
                if (existingScript) {
                    document.body.removeChild(existingScript);
                }
             };
        } else {
             // Mammoth already loaded or window is undefined (SSR)
             if (isClient && selectedTemplate && !showTemplates) {
                 loadTemplatePreview(selectedTemplate);
             } else {
                 setIsLoadingPreview(false);
             }
        }
    }, [isClient]); // Run only once on mount, but track isClient


    useEffect(() => {
        // Reload preview when template or data changes, but only if not showing the template selection screen
        if (!showTemplates && selectedTemplate && isClient) {
             // Debounce the preview update
            const handler = setTimeout(() => {
                loadTemplatePreview(selectedTemplate);
            }, 300); // Short debounce time for responsiveness

            return () => clearTimeout(handler);
        }
         // If we are showing templates, ensure preview isn't trying to load
        if (showTemplates) {
             setIsLoadingPreview(false);
             setPreviewHtml(''); // Clear preview when showing templates
        }
    }, [resumeData, selectedTemplate, isClient, loadTemplatePreview, showTemplates]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, [id]: value }));
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setShowTemplates(false); // Hide template selection and show editor/preview
        loadTemplatePreview(templateId); // Load the selected template preview immediately
    };

    const handleDownload = (format: 'word' | 'pdf') => {
        console.log(`Download requested in ${format} format`);
        // Placeholder: Generate content based on resumeData and selected template structure
        // In a real app, you'd need a server-side service or more complex client-side libs
        // to generate actual DOCX/PDF from the data + template structure.
        // This example just downloads raw text data.
        let fileContent = `Name: ${resumeData.firstName} ${resumeData.lastName}\n`;
        fileContent += `Email: ${resumeData.email}\n`;
        fileContent += `Phone: ${resumeData.phone}\n`;
        fileContent += `Address: ${resumeData.address}\n`;
        fileContent += `\nProfile Summary:\n${resumeData.profile}\n`;
        fileContent += `\nSkills: ${resumeData.skills}\n`;
        fileContent += `\nEducation:\n${resumeData.education}\n`;
        fileContent += `\nEmployment History:\n${resumeData.employmentHistory}\n`;
        fileContent += `\nAcademic Projects:\n${resumeData.academicProjects}\n`;
        fileContent += `\nHobbies: ${resumeData.hobbies}\n`;
        fileContent += `\nLanguages: ${resumeData.languages}\n`;
        fileContent += `\nReferences:\n${resumeData.references}\n`;


        if (format === 'word') {
            // This is a very basic .txt pretending to be .docx for placeholder purposes
            downloadFile(`${resumeData.lastName}_${resumeData.firstName}_Resume.docx`, fileContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } else if (format === 'pdf') {
            // This is a basic .txt pretending to be .pdf
            downloadFile(`${resumeData.lastName}_${resumeData.firstName}_Resume.pdf`, fileContent, 'application/pdf');
        }
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
             {!showTemplates && (
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                    <Eye className="mr-2 h-4 w-4" /> Change Template
                 </Button>
             )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" disabled={showTemplates || !selectedTemplate}>
                      <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload('word')} disabled={!selectedTemplate}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Word (.docx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={!selectedTemplate}>
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
                                alt={template.name}
                                width={300}
                                height={400}
                                className="w-full object-cover aspect-[3/4]"
                                data-ai-hint="resume template preview"
                                priority // Load thumbnails faster
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Panel: Form Inputs */}
            <div className="lg:col-span-5"> {/* Adjusted column span */}
               <Card className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto shadow-md">
                 <CardHeader>
                    <CardTitle className="text-xl font-semibold">Edit Content</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4 p-6">
                     {/* Personal Details Section */}
                     <div className="space-y-1">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" value={resumeData.jobTitle} onChange={handleInputChange} placeholder="The role you want"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={resumeData.firstName} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={resumeData.lastName} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
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

                     {/* Profile Section */}
                     <div className="space-y-1">
                        <Label htmlFor="profile">Profile Summary</Label>
                        <Textarea id="profile" value={resumeData.profile} onChange={handleInputChange} rows={5} />
                     </div>

                     {/* Skills Section */}
                     <div className="space-y-1">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input id="skills" value={resumeData.skills} onChange={handleInputChange} placeholder="e.g., React, Node.js, Project Management" />
                     </div>

                     {/* Education Section */}
                      <div className="space-y-1">
                        <Label htmlFor="education">Education</Label>
                        <Textarea id="education" value={resumeData.education} onChange={handleInputChange} rows={6} placeholder="Degree, Institution, Location&#10;Date Range&#10;&#10;Degree 2, Institution 2..." />
                         <p className="text-xs text-muted-foreground">Use double line breaks between entries.</p>
                     </div>

                    {/* Academic Projects Section */}
                     <div className="space-y-1">
                        <Label htmlFor="academicProjects">Academic Projects</Label>
                        <Textarea id="academicProjects" value={resumeData.academicProjects} onChange={handleInputChange} rows={6} placeholder="Project Title&#10;- Description point 1&#10;- Description point 2&#10;&#10;Project Title 2..." />
                        <p className="text-xs text-muted-foreground">Use double line breaks between projects.</p>
                     </div>

                     {/* Employment History Section */}
                     <div className="space-y-1">
                        <Label htmlFor="employmentHistory">Employment History</Label>
                        <Textarea id="employmentHistory" value={resumeData.employmentHistory} onChange={handleInputChange} rows={10} placeholder="Company, Role&#10;Date Range&#10;- Responsibility 1&#10;- Responsibility 2&#10;&#10;Company 2, Role 2..." />
                         <p className="text-xs text-muted-foreground">Use double line breaks between job entries.</p>
                     </div>

                     {/* Hobbies Section */}
                     <div className="space-y-1">
                        <Label htmlFor="hobbies">Hobbies</Label>
                        <Input id="hobbies" value={resumeData.hobbies} onChange={handleInputChange} />
                     </div>

                     {/* Languages Section */}
                      <div className="space-y-1">
                        <Label htmlFor="languages">Languages</Label>
                        <Textarea id="languages" value={resumeData.languages} onChange={handleInputChange} rows={3} placeholder="Language 1&#10;Language 2"/>
                         <p className="text-xs text-muted-foreground">Enter each language on a new line.</p>
                     </div>

                     {/* References Section */}
                     <div className="space-y-1">
                        <Label htmlFor="references">References</Label>
                        <Textarea id="references" value={resumeData.references} onChange={handleInputChange} rows={5} placeholder="Name, Title, Company&#10;Contact Info (Email/Phone)&#10;&#10;Name 2, Title 2..." />
                        <p className="text-xs text-muted-foreground">Use double line breaks between references.</p>
                     </div>

                 </CardContent>
               </Card>
            </div>

            {/* Right Panel: Resume Preview */}
            <div className="lg:col-span-7"> {/* Adjusted column span */}
              <Card className="h-[80vh] overflow-hidden border shadow-lg sticky top-6"> {/* Adjust height as needed, added sticky */}
                 <CardContent className="h-full p-0">
                   {isLoadingPreview ? (
                     <div className="flex h-full items-center justify-center bg-secondary">
                       <LoadingSpinner />
                     </div>
                   ) : previewHtml ? (
                     <div
                       className="h-full overflow-y-auto bg-white" // Container for the preview content
                       dangerouslySetInnerHTML={{ __html: previewHtml }}
                     />
                   ) : (
                     <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">
                       Select a template to see a preview.
                     </div>
                   )}
                 </CardContent>
              </Card>
            </div>
        </div>
      )}
       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}
