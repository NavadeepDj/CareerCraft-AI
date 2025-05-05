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
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver'; // For triggering download
import { generateDocxAction } from '@/actions/generate-docx'; // Import the server action

// Placeholder for template data
interface Template {
    id: string;
    name: string;
    path: string; // Path relative to the public directory
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
    // Ensure mammoth is available on the window object
    if (typeof window === 'undefined' || !(window as any).mammoth) {
        console.warn("Mammoth is not available. Skipping DOCX conversion.");
        // Provide a more informative message in the preview itself
        return "<div class='p-4 text-center text-orange-600'>Preview library (Mammoth.js) is loading or failed to load. DOCX preview unavailable.</div>";
    }
    try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const mammoth = (window as any).mammoth;
        // Configure mammoth for basic conversion
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        // Return raw HTML, styling and data injection will happen later
        return result.value;
    } catch (error) {
        console.error("Error converting DOCX to HTML:", error);
        // Return an error message to be displayed in the preview pane
        return `<div class='p-4 text-center text-red-600'>Error loading resume preview: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
}


export default function ResumeBuilderPage() {
    const { toast } = useToast();
    // Initial state matching the screenshot's example data
    const [resumeData, setResumeData] = useState({
        firstName: 'Tanguturi Venkata',
        lastName: 'Sujith Gopi',
        email: 'sujithgopi740@gmail.com',
        phone: '7989418257',
        address: 'Nellore, INDIA', // Added based on preview
        jobTitle: 'Aspiring Software Engineer', // Added default job title
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
    const [rawTemplateHtml, setRawTemplateHtml] = useState<string | null>(null); // Store the raw HTML from DOCX conversion
    const [previewHtml, setPreviewHtml] = useState<string>(''); // Store the final injected HTML for display and download
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false); // Track loading state
    const [isClient, setIsClient] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true); // Start by showing templates

    // Function to handle injecting data into HTML template string
    // This now returns only the inner HTML content for the docx conversion
    const injectDataIntoHtml = (html: string, data: typeof resumeData): string => {
        if (!html) return '<p>Template not loaded.</p>'; // Handle case where raw HTML is not ready
        let processedHtml = html;

        Object.entries(data).forEach(([key, value]) => {
            const simplePlaceholder = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
            // Ensure value is treated as a string, handle potential null/undefined
            const stringValue = (typeof value === 'string' || typeof value === 'number') ? String(value) : '';
            let formattedValue = stringValue.replace(/\n/g, '<br>');

            // Handle specific list placeholders if they exist in the template
            if (key === 'skills' && stringValue.trim() && (processedHtml.includes('{{skillsList}}') || processedHtml.includes('{{ skillsList }}'))) {
                const skillsListHtml = stringValue.split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill)
                    .map(skill => `<li>${skill}</li>`).join('');
                processedHtml = processedHtml.replace(/{{\s*skillsList\s*}}/gi, `<ul class="list-disc pl-5">${skillsListHtml}</ul>`);
            }
             else if (key === 'employmentHistory' && stringValue.trim() && (processedHtml.includes('{{employmentHistoryList}}') || processedHtml.includes('{{ employmentHistoryList }}'))) {
                 const historyItems = stringValue.split('\n\n').map(item => {
                    const lines = item.split('\n');
                    const titleLine = lines[0] || ''; // e.g., Company, Role
                    const dateLine = lines[1] || ''; // e.g., Date Range
                    // Remaining lines are descriptions, format as list items
                    const descriptionLines = lines.slice(2).map(line => `<li>${line.replace(/^- /, '').trim()}</li>`).join('');
                    // Basic structure, template might need more specific classes
                    return `<div class="mb-4 employment-item">
                              <h4 class="font-semibold">${titleLine}</h4>
                              <p class="text-sm text-muted-foreground">${dateLine}</p>
                              ${descriptionLines ? `<ul class="list-disc pl-5 mt-1">${descriptionLines}</ul>` : ''}
                            </div>`;
                 }).join('');
                 processedHtml = processedHtml.replace(/{{\s*employmentHistoryList\s*}}/gi, historyItems);
            }
             else if (key === 'education' && stringValue.trim() && (processedHtml.includes('{{educationList}}') || processedHtml.includes('{{ educationList }}'))) {
                 const educationItems = stringValue.split('\n\n').map(item => {
                    const lines = item.split('\n');
                    const degreeLine = lines[0] || ''; // e.g., Degree, Institution, Location
                    const dateLine = lines[1] || ''; // e.g., Date Range
                     // Basic structure
                    return `<div class="mb-2 education-item">
                                <p class="font-semibold">${degreeLine}</p>
                                <p class="text-sm text-muted-foreground">${dateLine}</p>
                            </div>`;
                }).join('');
                processedHtml = processedHtml.replace(/{{\s*educationList\s*}}/gi, `<div class="education-section">${educationItems}</div>`);
             }
            else if (key === 'academicProjects' && stringValue.trim() && (processedHtml.includes('{{academicProjectsList}}') || processedHtml.includes('{{ academicProjectsList }}'))) {
                 const projectItems = stringValue.split('\n\n').map(item => {
                    const lines = item.split('\n');
                    const titleLine = lines[0] || ''; // Project Title
                     // Remaining lines are descriptions
                    const descriptionLines = lines.slice(1).map(line => `<li>${line.replace(/^- /, '').trim()}</li>`).join('');
                     // Basic structure
                    return `<div class="mb-4 project-item">
                              <h4 class="font-semibold">${titleLine}</h4>
                              ${descriptionLines ? `<ul class="list-disc pl-5 mt-1">${descriptionLines}</ul>` : ''}
                           </div>`;
                 }).join('');
                 processedHtml = processedHtml.replace(/{{\s*academicProjectsList\s*}}/gi, `<div class="academic-projects-section">${projectItems}</div>`);
             }
             else if (key === 'languages' && stringValue.trim() && (processedHtml.includes('{{languagesList}}') || processedHtml.includes('{{ languagesList }}'))) {
                 const languageItems = stringValue.split('\n')
                    .map(lang => lang.trim())
                    .filter(lang => lang)
                    .map(lang => `<li>${lang}</li>`).join('');
                 processedHtml = processedHtml.replace(/{{\s*languagesList\s*}}/gi, `<ul class="list-disc pl-5">${languageItems}</ul>`);
             }
              else if (key === 'references' && stringValue.trim() && (processedHtml.includes('{{referencesList}}') || processedHtml.includes('{{ referencesList }}'))) {
                 const referenceItems = stringValue.split('\n\n').map(item => {
                    const lines = item.split('\n');
                    const nameLine = lines[0] || ''; // Name, Title, Company
                    const contactLine = lines[1] || ''; // Contact Info
                     return `<div class="mb-2 reference-item">
                               <p class="font-semibold">${nameLine}</p>
                               <p class="text-sm">${contactLine}</p>
                             </div>`;
                 }).join('');
                 processedHtml = processedHtml.replace(/{{\s*referencesList\s*}}/gi, `<div class="references-section">${referenceItems}</div>`);
             }
            // Handle simple replacements for other fields, only if not handled above
             else {
                 // Check if the complex placeholder was already handled for this key
                 const complexPlaceholderHandled = [
                     'skillsList', 'employmentHistoryList', 'educationList',
                     'academicProjectsList', 'languagesList', 'referencesList'
                 ].some(listKey => processedHtml.includes(`{{${listKey}}}`) && key === listKey.replace('List', ''));

                 if (!complexPlaceholderHandled) {
                    processedHtml = processedHtml.replace(simplePlaceholder, formattedValue);
                 }
            }
        });

        // Clean up any remaining/unmatched simple placeholders
        processedHtml = processedHtml.replace(/{{\s*[\w\.]+\s*}}/gi, ''); // Remove {{ fieldName }}
         // Clean up any remaining/unmatched list placeholders
        processedHtml = processedHtml.replace(/{{\s*\w+List\s*}}/gi, ''); // Remove {{ fieldNameList }}

        // Return the inner HTML content, without the wrapper div
        return processedHtml;
    };

    // Load and convert the DOCX template ONCE when selected
    const loadTemplateAndConvert = useCallback(async (templateId: string | null) => {
        if (!isClient || !templateId) {
            setRawTemplateHtml(null); // Clear raw template if no template selected
            setPreviewHtml('<div class="flex h-full items-center justify-center bg-secondary text-muted-foreground">Select a template to begin.</div>');
            return;
        }

        setIsLoadingPreview(true);
        setRawTemplateHtml(null); // Clear previous raw template
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            setRawTemplateHtml(null);
            setPreviewHtml('<p class="p-4 text-center text-red-600">Template not found.</p>');
            setIsLoadingPreview(false);
            toast({ title: "Error", description: "Selected template could not be found.", variant: "destructive" });
            return;
        }

        try {
            if (!template.path || typeof template.path !== 'string') {
                throw new Error('Invalid template path configuration.');
            }

            // Fetch the DOCX template file
            const response = await fetch(template.path);
            if (!response.ok) {
                throw new Error(`Failed to fetch template '${template.name}' (Status: ${response.status}). Check if file exists at '${template.path}' in the public folder.`);
            }
            const blob = await response.blob();

            // Convert DOCX to raw HTML using Mammoth
            const rawHtmlContent = await convertDocxToHtml(blob);

            // Store the raw HTML
            setRawTemplateHtml(rawHtmlContent);

            // Check if conversion itself returned an error message
            if (rawHtmlContent.includes("Error loading resume preview") || rawHtmlContent.includes("Preview library (Mammoth.js) is loading")) {
                 // Display the error/loading message from conversion directly
                 setPreviewHtml(`<div class='p-4 text-center ${rawHtmlContent.includes("Error") ? 'text-red-600' : 'text-orange-600'}'>${rawHtmlContent}</div>`);
            } else {
                // Inject current resumeData into the newly converted raw HTML
                const injectedHtml = injectDataIntoHtml(rawHtmlContent, resumeData);
                setPreviewHtml(injectedHtml); // Update the display preview
            }

        } catch (error) {
            console.error('Error loading and converting template:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setRawTemplateHtml(null); // Clear raw template on error
            setPreviewHtml(`<div class='p-4 text-center text-red-600'>Error loading preview: ${errorMessage}</div>`);
            toast({ title: "Preview Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoadingPreview(false);
        }
    }, [isClient, resumeData, toast]); // Add resumeData to dependencies here


    useEffect(() => {
        setIsClient(true); // Indicate component has mounted client-side

        // Function to load Mammoth.js script
        const loadMammothScript = () => {
             if (typeof window !== 'undefined' && !(window as any).mammoth) {
                const scriptId = 'mammoth-script';
                // Avoid adding script if it already exists
                if (document.getElementById(scriptId)) return;

                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
                script.async = true;
                 script.onload = () => {
                     console.log("Mammoth.js loaded successfully.");
                     // Attempt to reload preview if a template is selected and we are in editor view
                     if (selectedTemplate && !showTemplates) {
                        loadTemplateAndConvert(selectedTemplate); // Use the combined function
                     }
                 }
                 script.onerror = () => {
                     console.error("Failed to load Mammoth.js script.");
                     // Update UI to indicate preview library failed to load
                     setPreviewHtml("<p class='p-4 text-center text-red-600'>Failed to load preview library (Mammoth.js). DOCX preview will not work.</p>");
                     setIsLoadingPreview(false); // Ensure loading stops
                     toast({ title: "Error", description: "Failed to load DOCX preview library.", variant: "destructive" });
                 }
                document.body.appendChild(script);
             } else if (isClient && selectedTemplate && !showTemplates && (window as any).mammoth) {
                 // If Mammoth is already loaded, trigger preview load immediately
                 loadTemplateAndConvert(selectedTemplate); // Use the combined function
             } else if (!selectedTemplate || showTemplates) {
                 // If no template selected or showing gallery, stop loading indicator
                 setIsLoadingPreview(false);
             }
        };

        loadMammothScript();

        // Cleanup script on unmount (optional, but good practice)
        // return () => {
        //     const script = document.getElementById('mammoth-script');
        //     if (script && script.parentNode) {
        //         script.parentNode.removeChild(script);
        //     }
        // };
    }, [isClient, selectedTemplate, showTemplates, loadTemplateAndConvert, toast]); // Dependencies updated


    // Effect to update preview ONLY when resumeData changes (if raw template exists)
    useEffect(() => {
        if (!showTemplates && selectedTemplate && rawTemplateHtml && !isLoadingPreview) {
            // Use the stored raw template HTML to inject data and update preview
            const injectedHtml = injectDataIntoHtml(rawTemplateHtml, resumeData);
            setPreviewHtml(injectedHtml);
        } else if (showTemplates) {
            // If showing templates, reset the preview
            setPreviewHtml('<div class="flex h-full items-center justify-center bg-secondary text-muted-foreground">Select a template to begin.</div>');
            setRawTemplateHtml(null); // Clear raw template HTML as well
        }
        // No need for debouncing here anymore as Mammoth conversion happens only once on template select.
        // Dependency array includes resumeData, rawTemplateHtml, etc. to react to changes.
    }, [resumeData, rawTemplateHtml, selectedTemplate, showTemplates, isLoadingPreview]);


    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, [id]: value }));
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setShowTemplates(false); // Hide template selection and show editor/preview
        // Trigger the loading and conversion process
        loadTemplateAndConvert(templateId); // Call the combined function
        setIsLoadingPreview(true); // Show loading indicator immediately
    };

     const handleDownload = async (format: 'word' | 'pdf') => {
         console.log(`Download requested in ${format} format`);

         if (!previewHtml || previewHtml.startsWith('<div class="flex h-full items-center justify-center')) {
             toast({
                 title: "Preview Not Ready",
                 description: "Please select a template and wait for the preview to load.",
                 variant: "destructive",
             });
             return;
         }
          if (previewHtml.includes("Error loading resume preview") || previewHtml.includes("Preview library (Mammoth.js) is loading")) {
                toast({
                    title: "Preview Error",
                    description: "Cannot download due to a preview loading error.",
                    variant: "destructive",
                });
                return;
            }

         const fileNameBase = `${resumeData.lastName}_${resumeData.firstName}_Resume`.replace(/\s+/g, '_');

         if (format === 'word') {
             try {
                 toast({
                     title: "Generating DOCX...",
                     description: "This may take a moment.",
                 });

                 // Construct the full HTML document structure WITH basic styles
                 // These styles are critical for html-to-docx to understand structure and basic formatting
                  const fullHtml = `
                     <!DOCTYPE html>
                     <html lang="en">
                     <head>
                         <meta charset="UTF-8">
                         <title>Resume</title>
                         <style>
                             /* Minimal CSS for html-to-docx structure - Adjust based on template needs */
                             body { font-family: sans-serif; font-size: 11pt; color: #000; margin: 1in; }
                             p, li, div, h1, h2, h3, h4, h5, h6 { margin-bottom: 0.1in; line-height: 1.15; } /* Basic spacing */
                             h1, h2, h3, h4, h5, h6 { font-weight: bold; margin-top: 0.2in; }
                             h1 { font-size: 16pt; }
                             h2 { font-size: 14pt; }
                             h3 { font-size: 12pt; }
                             ul { list-style-type: disc; margin-left: 0.25in; }
                             ol { list-style-type: decimal; margin-left: 0.25in; }
                             strong, b { font-weight: bold; }
                             em, i { font-style: italic; }
                             u { text-decoration: underline; }
                             /* Add specific styles from the preview if needed, e.g., */
                             .text-muted-foreground { color: #666; }
                             .font-semibold { font-weight: 600; }
                             .text-sm { font-size: 10pt; }
                             .mb-2 { margin-bottom: 0.5rem; } /* Example Tailwind conversion */
                             .mb-4 { margin-bottom: 1rem; }
                             .mt-1 { margin-top: 0.25rem; }
                             .pl-5 { padding-left: 1.25rem; } /* Check if margin-left is better */
                             /* Add styles for headings to match resume builder/prose */
                              h1, h2, h3, h4, h5, h6 { color: black; } /* Use black instead of primary */
                              p { color: black; } /* Ensure paragraphs are black */
                         </style>
                     </head>
                     <body>
                         ${previewHtml} {/* Use the injected HTML content */}
                     </body>
                     </html>
                 `;

                // Call the server action
                const docxBlob = await generateDocxAction(fullHtml);

                if (docxBlob) {
                    saveAs(docxBlob, `${fileNameBase}.docx`);
                    toast({
                        title: "DOCX Download Started",
                        description: "Your resume has been downloaded.",
                    });
                } else {
                    throw new Error("Server action returned no data or failed.");
                }

             } catch (error) {
                 console.error("Error generating DOCX:", error);
                 toast({
                     title: "DOCX Generation Failed",
                     description: `Could not generate Word file. ${error instanceof Error ? error.message : 'Check console for details.'}`,
                     variant: "destructive",
                 });
             }
         } else if (format === 'pdf') {
             // PDF generation placeholder remains the same
             toast({
                 title: "PDF Download (Not Implemented)",
                 description: "Client-side PDF generation is complex. DOCX download is recommended.",
                 variant: "destructive",
             });
             // Potential future implementation: Use a library like jsPDF or html2pdf.js,
             // or preferably, a server-side PDF generation service.
         }
     };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary"> {/* Updated hover */}
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">Resume Builder</h1>
         <div className="flex items-center gap-2">
             {!showTemplates && (
                <Button variant="outline" size="sm" onClick={() => {
                    setShowTemplates(true);
                    setSelectedTemplate(null); // Clear selection when going back to templates
                    setRawTemplateHtml(null); // Clear raw HTML
                    setPreviewHtml(''); // Clear preview
                }}>
                    <Eye className="mr-2 h-4 w-4" /> Change Template
                 </Button>
             )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" disabled={showTemplates || !selectedTemplate || isLoadingPreview}>
                      <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload('word')} disabled={showTemplates || !selectedTemplate || isLoadingPreview}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Word (.docx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={showTemplates || !selectedTemplate || isLoadingPreview}>
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
                                className="w-full object-cover aspect-[3/4]" // Keep image in color
                                data-ai-hint="resume template preview"
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
                        <Label htmlFor="jobTitle">Job Title / Headline</Label>
                        <Input id="jobTitle" value={resumeData.jobTitle} onChange={handleInputChange} placeholder="e.g., Software Engineer"/>
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
                        <Textarea id="profile" value={resumeData.profile} onChange={handleInputChange} rows={5} placeholder="Brief professional summary..."/>
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
                        <Input id="hobbies" value={resumeData.hobbies} onChange={handleInputChange} placeholder="e.g., Coding, Reading, Hiking"/>
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
                        <p className="text-xs text-muted-foreground">Use double line breaks between references. Often "Available upon request" is sufficient.</p>
                     </div>

                 </CardContent>
               </Card>
            </div>

            {/* Right Panel: Resume Preview */}
            <div className="lg:col-span-7"> {/* Adjusted column span */}
              <Card className="h-[80vh] overflow-hidden border shadow-lg sticky top-6"> {/* Adjust height as needed, added sticky */}
                 <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg">Preview: {templates.find(t => t.id === selectedTemplate)?.name || 'No Template Selected'}</CardTitle>
                 </CardHeader>
                 <CardContent className="h-[calc(80vh-65px)] p-0"> {/* Adjusted height calculation */}
                   {isLoadingPreview ? (
                     <div className="flex h-full items-center justify-center bg-secondary">
                       <LoadingSpinner /> {/* Use the new spinner */}
                     </div>
                   ) : previewHtml && !previewHtml.includes("Error loading resume preview") && !previewHtml.includes("Preview library (Mammoth.js) is loading") ? (
                     // Container for scrolling
                     <div className="h-full w-full overflow-auto bg-muted p-4"> {/* Light gray background for scroll area */}
                         {/* Page-like container for the HTML content */}
                         <div
                             id="resume-preview-content" // ID for potential PDF generation
                             className="mx-auto max-w-3xl bg-white p-8 shadow-md document-preview" // White background for the "page"
                             // Apply basic prose styles here + raw HTML from Mammoth
                             dangerouslySetInnerHTML={{ __html: `<div class="prose prose-sm max-w-none text-black">${previewHtml}</div>` }}
                         />
                     </div>
                   ) : (
                     // Show error or initial message
                     <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground p-4 text-center">
                         {/* Use dangerouslySetInnerHTML to render potential error messages from Mammoth */}
                         <div dangerouslySetInnerHTML={{ __html: previewHtml || 'Select a template to see the preview.' }} />
                     </div>
                   )}
                 </CardContent>
              </Card>
            </div>
        </div>
      )}
       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}

    