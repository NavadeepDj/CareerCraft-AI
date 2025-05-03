// src/app/auto-apply/page.tsx
'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UploadCloud, Search, FileUp, Bot, Play, CircleCheck, CircleX, List, Settings, RefreshCcw, Share2, FileCheck, Mail, AlertTriangle, Info, BarChart, Check } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'Applied' | 'Error Applying' | 'Pending';
  appliedDate: string;
}

// Add 'statistics' view state and update stepper state
type ViewState = 'statistics' | 'configure' | 'applying' | 'results' | 'error';
// Add email template step
type ConfigureStep = 'searchInfo' | 'emailTemplate' | 'settings' | 'review';

// Placeholder Email Template Data
interface EmailTemplate {
    id: string;
    name: string; // Internal name
    displayName: string; // Name shown in the list
    subject: string;
    body: string;
    isUserTemplate?: boolean; // Flag for user-created templates
}

const popularTemplates: EmailTemplate[] = [
    { id: 'tpl-forward-thinking', name: 'The Forward-Thinking Application', displayName: 'The Forward-Thinking Application', subject: 'Forward-Thinking Approach to {{JOB_TITLE}}', body: 'Dear Hiring Team,\n\nI hope this message finds you in good health.\n\nI am writing to express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}. Known for my forward-thinking approach in this field, I am confident in my ability to bring innovative ideas and contribute to your team\'s success.\n\nAttached is my resume for your consideration. I would welcome the opportunity to discuss how my forward-thinking mindset aligns with {{COMPANY_NAME}}\'s vision.\n\nBest regards,\n{{USER_FIRSTNAME}} {{USER_LASTNAME}}' },
    { id: 'tpl-ask-open', name: 'Ask regarding open position 2', displayName: 'Ask regarding open position 2', subject: 'Inquiry Regarding Open Position - {{JOB_TITLE}}', body: 'Dear Hiring Manager,\n\nI am writing to inquire about the open {{JOB_TITLE}} position I saw advertised on [Platform where you saw the job].\n\nMy background in [mention relevant skills/experience] aligns well with the requirements listed. I am eager to learn more about this opportunity and how I can contribute to {{COMPANY_NAME}}.\n\nThank you for your time and consideration.\n\nSincerely,\n{{USER_FIRSTNAME}} {{USER_LASTNAME}}' },
    { id: 'tpl-expressive', name: 'The Expressive Application', displayName: 'The Expressive Application', subject: 'Passionate Application for {{JOB_TITLE}} at {{COMPANY_NAME}}', body: 'Dear [Hiring Manager Name, if known, otherwise Hiring Team],\n\nI was thrilled to see the opening for the {{JOB_TITLE}} position at {{COMPANY_NAME}}. My passion for [relevant field/skill] and my experience in [key achievement or skill] make me confident I can make a significant impact.\n\nI\'ve attached my resume detailing my qualifications. I am excited about the possibility of joining your team and contributing to your success.\n\nWarm regards,\n{{USER_FIRSTNAME}} {{USER_LASTNAME}}' },
    { id: 'tpl-present-yourself', name: 'Present yourself', displayName: 'Present yourself', subject: 'Introduction and Interest in {{COMPANY_NAME}}', body: 'Dear Hiring Team,\n\nMy name is {{USER_FIRSTNAME}} {{USER_LASTNAME}}, and I am writing to introduce myself and express my strong interest in potential opportunities at {{COMPANY_NAME}}.\n\nWith a background in [mention your field] and skills including [mention 1-2 key skills], I believe I could be a valuable asset to your team.\n\nI have attached my resume for your review and would appreciate the chance to discuss how my qualifications align with your needs.\n\nThank you,\n{{USER_FIRSTNAME}} {{USER_LASTNAME}}' },
];

const myTemplates: EmailTemplate[] = [
     { id: 'tpl-ask-opportunities', name: 'Ask for opportunities', displayName: 'Ask for opportunities', subject: 'Inquiry about Opportunities at {{COMPANY_NAME}}', body: 'Dear Hiring Team at {{COMPANY_NAME}},\n\nI am writing to express my interest in potential future opportunities within your organization. My skills in [mention key skills] and experience in [mention relevant field] might be a good fit for your needs.\n\nI have attached my resume for your consideration.\n\nBest regards,\n{{USER_FIRSTNAME}} {{USER_LASTNAME}}', isUserTemplate: true },
];

// Simple Stepper Component
const Stepper: React.FC<{ currentStep: ConfigureStep }> = ({ currentStep }) => {
    const steps = [
        { id: 'searchInfo', name: 'Search Info' },
        { id: 'emailTemplate', name: 'Email Template' },
        { id: 'settings', name: 'Settings' },
        { id: 'review', name: 'Review' },
    ];
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <div className="mb-8 flex items-center justify-center space-x-4 md:space-x-8">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold",
                            index <= currentStepIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"
                        )}
                    >
                        {index + 1}
                    </div>
                    <span className={cn(
                        "ml-2 hidden md:block text-sm",
                        index <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                        {step.name}
                    </span>
                     {/* Add connecting line if not the last step */}
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "ml-4 md:ml-8 h-0.5 w-8 md:w-16",
                            index < currentStepIndex ? "bg-primary" : "bg-border"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );
};


// New component for the statistics cards
const StatisticsDashboard: React.FC<{ onConfigure: () => void }> = ({ onConfigure }) => {
  // Dummy stats, replace with real data later
  const stats = [
    { title: 'Active Loops', value: 0, icon: RefreshCcw },
    { title: 'Total Matches Found', value: 0, icon: Share2 },
    { title: 'Applications Sent (Sim)', value: 0, icon: FileCheck },
    { title: 'Errors Encountered (Sim)', value: 0, icon: AlertTriangle },
  ];

  return (
    <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Statistics</CardTitle>
            <CardDescription>Overview of your automated job application activity.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                <Card key={stat.title} className="flex flex-col items-center justify-center p-4 bg-secondary shadow-sm text-center">
                    <stat.icon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                </Card>
                ))}
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 mt-4">
            <Button onClick={onConfigure} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure New Simulation Loop
            </Button>
        </CardFooter>
    </Card>
  );
};


export default function AutoApplyPage() {
  const { toast } = useToast();
  // Set initial state to 'statistics'
  const [viewState, setViewState] = useState<ViewState>('statistics');
  const [configureStep, setConfigureStep] = useState<ConfigureStep>('searchInfo'); // Track configuration step
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null); // Store as Data URI if needed by potential future API

  // State variables for Step 1 (Search Info)
  const [jobTitles, setJobTitles] = useState<string>('');
  const [jobLocation, setJobLocation] = useState<string>('');
  const [searchOnlyRemote, setSearchOnlyRemote] = useState<boolean>(false);
  const [searchRemoteAnywhere, setSearchRemoteAnywhere] = useState<boolean>(false); // Premium feature
  const [searchJobBoards, setSearchJobBoards] = useState<string>('All'); // Default to 'All'
  const [enableCareerPageSearch, setEnableCareerPageSearch] = useState<boolean>(false); // Premium feature
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [jobType, setJobType] = useState<string>('');

  // State variables for Step 2 (Email Template)
  const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([...popularTemplates, ...myTemplates]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>(popularTemplates[0]?.id || ''); // Default to first popular
  const [emailTemplateName, setEmailTemplateName] = useState<string>(popularTemplates[0]?.name || '');
  const [emailSubject, setEmailSubject] = useState<string>(popularTemplates[0]?.subject || '');
  const [emailBody, setEmailBody] = useState<string>(popularTemplates[0]?.body || '');
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('sujithgopi740@gmail.com'); // Default from image


  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

   // Select an email template
  const handleSelectTemplate = (templateId: string) => {
    const selected = allTemplates.find(t => t.id === templateId);
    if (selected) {
        setSelectedEmailTemplateId(selected.id);
        setEmailTemplateName(selected.name); // Use internal name for the input field
        setEmailSubject(selected.subject);
        setEmailBody(selected.body);
    }
  };


  // Handle file selection or drop
  const handleFileChange = useCallback((file: File | null) => {
      setUploadedFile(null);
      setResumeDataUri(null);
      // Don't reset view state here, handle navigation explicitly
      // setViewState('configure'); // Reset to config view
      // setAppliedJobs([]); // Clear previous results on new config

      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
              return;
          }
          // LoopCV allows PDF or Word
          if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(file.type)) {
              toast({ title: "Invalid File Type", description: "Please upload a PDF or Word (DOC, DOCX) file.", variant: "destructive" });
              return;
          }
          setUploadedFile(file);
          // Read file as Data URI - might be needed if an API call were made
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => setResumeDataUri(reader.result as string);
          reader.onerror = () => {
               toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
               setUploadedFile(null);
          };
      }
  }, [toast]);

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

  // --- Input change handlers ---
  // Step 1
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onJobTitlesChange = (e: ChangeEvent<HTMLInputElement>) => setJobTitles(e.target.value);
  const onJobLocationChange = (e: ChangeEvent<HTMLInputElement>) => setJobLocation(e.target.value);
  const onSearchJobBoardsChange = (value: string) => setSearchJobBoards(value);
  const onExperienceLevelChange = (value: string) => setExperienceLevel(value);
  const onJobTypeChange = (value: string) => setJobType(value);
  const onSearchOnlyRemoteChange = (checked: boolean | 'indeterminate') => setSearchOnlyRemote(Boolean(checked));
  const onSearchRemoteAnywhereChange = (checked: boolean | 'indeterminate') => setSearchRemoteAnywhere(Boolean(checked));
  const onEnableCareerPageSearchChange = (checked: boolean | 'indeterminate') => setEnableCareerPageSearch(Boolean(checked));

  // Step 2
  const onEmailTemplateNameChange = (e: ChangeEvent<HTMLInputElement>) => setEmailTemplateName(e.target.value);
  const onEmailSubjectChange = (e: ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value);
  const onEmailBodyChange = (e: ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value);
  const onTestEmailRecipientChange = (e: ChangeEvent<HTMLInputElement>) => setTestEmailRecipient(e.target.value);
  // Placeholder for creating a new template
  const handleCreateTemplate = () => {
      toast({ title: "Create Template (Placeholder)", description: "Functionality to create a new template is not yet implemented." });
      // In a real app: Clear fields, set isUserTemplate, generate new ID, maybe open a modal?
  };
  // Placeholder for sending test email
  const handleSendTestEmail = () => {
      if (!testEmailRecipient) {
          toast({ title: "Missing Recipient", description: "Please enter an email address to send the test to.", variant: "destructive" });
          return;
      }
       toast({ title: "Send Test Email (Simulation)", description: `Simulating sending test email to ${testEmailRecipient} using template '${emailTemplateName}'.` });
       // Actual implementation would involve a backend service.
  };
  // Placeholder for saving changes to template (if editable)
  const handleSaveChanges = () => {
       toast({ title: "Save Changes (Placeholder)", description: `Simulating saving changes to template '${emailTemplateName}'.` });
       // In a real app: Update the template in state/backend if it's a user template
       // Maybe move to the next step after saving
       setConfigureStep('settings');
  };


  // --- Navigation and Actions ---

  // Handle starting the auto-apply process (simulation) - renamed to "Save and Run"
  const handleSaveAndRun = async () => {
    // ** Run Validations for ALL required steps before simulation **
    // Step 1 Validation
    if (!jobTitles.trim()) {
      setConfigureStep('searchInfo');
      toast({ title: "Missing Job Titles", description: "Please specify the desired job titles.", variant: "destructive" });
      return;
    }
    if (!jobLocation.trim() && !searchOnlyRemote) {
       setConfigureStep('searchInfo');
       toast({ title: "Missing Job Location", description: "Please specify a location or select 'Search only for remote jobs'.", variant: "destructive" });
       return;
    }
    if (!uploadedFile) {
      setConfigureStep('searchInfo');
      toast({ title: "Missing Resume", description: "Please upload your resume (CV).", variant: "destructive" });
      return;
    }
     if (!experienceLevel) {
       setConfigureStep('searchInfo');
       toast({ title: "Missing Experience Level", description: "Please select your experience level.", variant: "destructive" });
       return;
     }
     if (!jobType) {
       setConfigureStep('searchInfo');
       toast({ title: "Missing Job Type", description: "Please select the desired job type.", variant: "destructive" });
       return;
     }
     // Step 2 Validation (Basic)
     if (!emailTemplateName.trim() || !emailSubject.trim() || !emailBody.trim()) {
          setConfigureStep('emailTemplate');
          toast({ title: "Incomplete Email Template", description: "Please ensure the email template has a name, subject, and body.", variant: "destructive" });
          return;
     }
     // TODO: Add validation for Step 3 and Step 4 if/when implemented


    setViewState('applying');
    setErrorMessage('');
    setAppliedJobs([]); // Clear previous results

    try {
      // **SIMULATION:** In a real app, this would involve complex backend processes.
      console.log(`Simulating job search loop for: ${jobTitles} in ${jobLocation || 'Remote'}...`);
      console.log("Configuration:", {
          jobTitles, jobLocation, searchOnlyRemote, searchRemoteAnywhere,
          searchJobBoards, enableCareerPageSearch, experienceLevel, jobType,
          resume: uploadedFile?.name,
          emailTemplate: { name: emailTemplateName, subject: emailSubject }
      });

      // Simulate API call delay and application process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate dummy results based somewhat on inputs
      const baseLocation = searchOnlyRemote ? 'Remote' : jobLocation;
      const dummyJobs: AppliedJob[] = [
        { id: 'job1', title: `${jobTitles.split(',')[0].trim()} (${experienceLevel})`, company: 'SimuTech', location: baseLocation, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
        { id: 'job2', title: 'Related Role', company: 'DemoCorp', location: baseLocation, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
        { id: 'job3', title: jobTitles.includes(',') ? jobTitles.split(',')[1].trim() : 'Another Role', company: 'Placeholder Inc.', location: 'Different Location (Sim Error)', status: 'Error Applying', appliedDate: new Date().toLocaleDateString() },
        { id: 'job4', title: `Senior ${jobTitles.split(',')[0].trim()}`, company: 'Faux Company', location: baseLocation, status: 'Applied', appliedDate: new Date().toLocaleDateString() },
      ];

       // Simulate some errors randomly
      const results = dummyJobs.map(job => ({
          ...job,
          status: (Math.random() > 0.8 && job.status === 'Applied') ? 'Error Applying' : job.status
      }));

      setAppliedJobs(results);
      setViewState('results');
      toast({ title: "Simulation Complete", description: `Simulated applying to ${results.length} jobs based on your loop configuration.` });

    } catch (err) {
      console.error("Auto-apply simulation failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred during the simulation.";
      setErrorMessage(`Simulation Failed: ${message}`);
      setViewState('error');
      toast({ title: "Simulation Error", description: message, variant: "destructive" });
    }
  };

   // Navigate between configuration steps
  const handleNextStep = () => {
    // Validate current step before moving to next
    if (configureStep === 'searchInfo') {
        if (!jobTitles.trim()) { toast({ title: "Missing Job Titles", variant: "destructive" }); return; }
        if (!jobLocation.trim() && !searchOnlyRemote) { toast({ title: "Missing Job Location", variant: "destructive" }); return; }
        if (!uploadedFile) { toast({ title: "Missing Resume", variant: "destructive" }); return; }
        if (!experienceLevel) { toast({ title: "Missing Experience Level", variant: "destructive" }); return; }
        if (!jobType) { toast({ title: "Missing Job Type", variant: "destructive" }); return; }
        setConfigureStep('emailTemplate');
    } else if (configureStep === 'emailTemplate') {
         if (!emailTemplateName.trim() || !emailSubject.trim() || !emailBody.trim()) {
             toast({ title: "Incomplete Email Template", description: "Please ensure the template has name, subject, and body.", variant: "destructive"});
             return;
         }
        setConfigureStep('settings');
    } else if (configureStep === 'settings') {
        // Add validation for settings if needed
        setConfigureStep('review');
    } else if (configureStep === 'review') {
        // Review step is the last step before running
        handleSaveAndRun(); // Trigger simulation from review step's "Next"
    }
  };

   const handlePreviousStep = () => {
     if (configureStep === 'emailTemplate') {
        setConfigureStep('searchInfo');
     } else if (configureStep === 'settings') {
        setConfigureStep('emailTemplate');
     } else if (configureStep === 'review') {
         setConfigureStep('settings');
     }
     // If on 'searchInfo', the back button goes to 'statistics'
   };


  // Function to switch to configuration view
  const navigateToConfigure = () => {
      setViewState('configure');
      setConfigureStep('searchInfo'); // Start at the first step
      // Optionally clear old data when starting new configuration
      // setUploadedFile(null); ...etc
  };

  const renderContent = () => {
     switch(viewState) {
         case 'statistics': // Render statistics dashboard first
            return <StatisticsDashboard onConfigure={navigateToConfigure} />;

         case 'configure':
            return (
                 <Card className="shadow-lg max-w-5xl mx-auto"> {/* Increased max-width */}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            Let's create a new Loop
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted">
                                       <Info className="h-4 w-4" />
                                       <span className="sr-only">Loop Info</span>
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent side="right">
                                   <p>A "Loop" represents an automated job search <br /> and application simulation based on your criteria.</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                         </CardTitle>
                        <CardDescription>Automate your job search simulation.</CardDescription>
                         {/* Stepper Component */}
                        <Stepper currentStep={configureStep} />
                    </CardHeader>

                    {/* --- Step 1: Search Info --- */}
                    {configureStep === 'searchInfo' && (
                         <CardContent className="space-y-6 border-t pt-6">
                            <h3 className="font-semibold text-lg mb-4">1. Complete your desired job info and location</h3>
                             {/* Job Titles */}
                             <div className="space-y-1">
                                <Label htmlFor="jobTitles">Job Titles <span className="text-destructive">*</span></Label>
                                <Input
                                    id="jobTitles"
                                    value={jobTitles}
                                    onChange={onJobTitlesChange}
                                    placeholder="e.g., Software Engineer, Product Manager"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">This job title will be used to search for jobs around the web. Separate multiple titles with commas.</p>
                            </div>
                             {/* Job Location */}
                            <div className="space-y-1">
                                <Label htmlFor="jobLocation">Job Location</Label>
                                <Input
                                    id="jobLocation"
                                    value={jobLocation}
                                    onChange={onJobLocationChange}
                                    placeholder="e.g., Remote, New York, London"
                                    disabled={searchOnlyRemote} // Disable if searching only remote
                                />
                                {!searchOnlyRemote && <p className="text-xs text-muted-foreground">Specify city, state, country, or "Remote".</p>}
                            </div>
                            {/* Checkboxes */}
                             <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                      id="searchOnlyRemote"
                                      checked={searchOnlyRemote}
                                      onCheckedChange={onSearchOnlyRemoteChange}
                                  />
                                  <Label htmlFor="searchOnlyRemote" className="text-sm font-normal cursor-pointer">
                                      Search only for remote jobs
                                  </Label>
                                </div>
                                 <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed"> {/* Simulate disabled premium feature */}
                                   <Checkbox
                                       id="searchRemoteAnywhere"
                                       checked={searchRemoteAnywhere}
                                       onCheckedChange={onSearchRemoteAnywhereChange}
                                       disabled // Premium feature
                                   />
                                   <Label htmlFor="searchRemoteAnywhere" className="text-sm font-normal cursor-not-allowed flex items-center">
                                       Search for remote jobs anywhere in the world
                                       <Badge variant="outline" className="ml-2 text-xs border-yellow-500 text-yellow-600">STANDARD AND PREMIUM MEMBERS ONLY</Badge>
                                   </Label>
                                 </div>
                             </div>
                            {/* Search Job Boards */}
                             <div className="space-y-1">
                                <Label htmlFor="searchJobBoards">Search in Specific Job Boards</Label>
                                <Select value={searchJobBoards} onValueChange={onSearchJobBoardsChange}>
                                    <SelectTrigger id="searchJobBoards">
                                        <SelectValue placeholder="Select job boards..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Platforms</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Indeed">Indeed</SelectItem>
                                        <SelectItem value="Glassdoor">Glassdoor</SelectItem>
                                        <SelectItem value="Wellfound">Wellfound (AngelList Talent)</SelectItem>
                                        {/* Add more platforms */}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Choose specific platforms if you want to narrow your search. Leave it blank to allow all platforms for your profile.</p>
                             </div>
                              {/* Enable Career Page Search */}
                              <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed"> {/* Simulate disabled premium feature */}
                                 <Checkbox
                                     id="enableCareerPageSearch"
                                     checked={enableCareerPageSearch}
                                     onCheckedChange={onEnableCareerPageSearchChange}
                                     disabled // Premium feature
                                 />
                                 <Label htmlFor="enableCareerPageSearch" className="text-sm font-normal cursor-not-allowed flex items-center">
                                    Enable Career Page Job Search
                                     <Badge variant="outline" className="ml-2 text-xs border-yellow-500 text-yellow-600">PREMIUM MEMBERS ONLY</Badge>
                                 </Label>
                              </div>
                             {/* Experience and Job Type */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <Label htmlFor="experienceLevel">Experience <span className="text-destructive">*</span></Label>
                                      <Select value={experienceLevel} onValueChange={onExperienceLevelChange} required>
                                          <SelectTrigger id="experienceLevel">
                                              <SelectValue placeholder="Select experience..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="Entry-level">Entry-level</SelectItem>
                                              <SelectItem value="Junior">Junior</SelectItem>
                                              <SelectItem value="Mid-level">Mid-level</SelectItem>
                                              <SelectItem value="Senior">Senior</SelectItem>
                                              <SelectItem value="Lead">Lead</SelectItem>
                                              <SelectItem value="Manager">Manager</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                   <div className="space-y-1">
                                      <Label htmlFor="jobType">Job Type <span className="text-destructive">*</span></Label>
                                      <Select value={jobType} onValueChange={onJobTypeChange} required>
                                          <SelectTrigger id="jobType">
                                              <SelectValue placeholder="Select job type..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="Full-time">Full time</SelectItem>
                                              <SelectItem value="Part-time">Part time</SelectItem>
                                              <SelectItem value="Contract">Contract</SelectItem>
                                              <SelectItem value="Internship">Internship</SelectItem>
                                              <SelectItem value="Temporary">Temporary</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                             </div>
                            {/* File Upload Area */}
                             <div className="space-y-2">
                                <Label>Upload your CV (résumé) <span className="text-destructive">*</span></Label>
                                 <div className="p-4 bg-secondary rounded-md border border-input text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground mb-2">
                                        {uploadedFile ? `CURRENTLY SELECTED: ${uploadedFile.name}` : "NO CVS UPLOADED YET"}
                                    </p>
                                    To get the most out of our platform, uploading your CV is important. Here's why:
                                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                        <li><strong>Automate your applications</strong> by having your CV automatically attached to emails sent to companies.</li>
                                        <li><strong>Apply directly</strong> to online forms effortlessly.</li>
                                        <li><strong>Get better job matches</strong> tailored to your experience and skills.</li>
                                    </ul>
                                </div>
                                 <div
                                    className={cn(
                                      "relative flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background p-4 text-center transition-all hover:border-primary",
                                       uploadedFile && "border-primary bg-primary/5" // Indicate file selected
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resumeFileInput')?.click()}
                                >
                                    <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                      {uploadedFile ? uploadedFile.name : "Drop your file here, or upload one from your device."}
                                    </span>
                                    <Button variant="outline" size="sm" className="mt-2 pointer-events-none">
                                        SELECT A PDF OR WORD FILE
                                    </Button>
                                    <Input
                                      type="file"
                                      id="resumeFileInput"
                                      className="absolute h-full w-full opacity-0 cursor-pointer"
                                      onChange={onFileChange}
                                      accept=".pdf,.doc,.docx" // PDF or Word
                                    />
                                  </div>
                             </div>
                             {/* Simulation Notice */}
                             <Alert variant="default" className="bg-secondary border-primary/20">
                               <Bot className="h-4 w-4" />
                               <AlertTitle>Simulation Notice</AlertTitle>
                               <AlertDescription>
                                 This feature simulates the job application process. It **will not actually submit applications** on external websites.
                               </AlertDescription>
                             </Alert>
                         </CardContent>
                     )}

                     {/* --- Step 2: Email Template --- */}
                     {configureStep === 'emailTemplate' && (
                         <CardContent className="space-y-6 border-t pt-6">
                             <h3 className="font-semibold text-lg mb-4">2. Select or create a unique email template</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {/* Left: Template List */}
                                 <div className="md:col-span-1 space-y-4">
                                     <div>
                                         <h4 className="font-medium mb-2 text-sm text-muted-foreground">Popular templates</h4>
                                         <ScrollArea className="h-48 border rounded-md">
                                            <div className="p-2 space-y-1">
                                                {allTemplates.filter(t => !t.isUserTemplate).map(template => (
                                                    <Button
                                                        key={template.id}
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start h-auto py-2 px-3 text-left",
                                                            selectedEmailTemplateId === template.id && "bg-secondary font-semibold"
                                                        )}
                                                        onClick={() => handleSelectTemplate(template.id)}
                                                    >
                                                        {template.displayName}
                                                        {selectedEmailTemplateId === template.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                    </Button>
                                                ))}
                                             </div>
                                         </ScrollArea>
                                     </div>
                                     <div>
                                         <h4 className="font-medium mb-2 text-sm text-muted-foreground">My templates</h4>
                                         <ScrollArea className="h-32 border rounded-md">
                                             <div className="p-2 space-y-1">
                                                 {allTemplates.filter(t => t.isUserTemplate).map(template => (
                                                     <Button
                                                        key={template.id}
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start h-auto py-2 px-3 text-left",
                                                            selectedEmailTemplateId === template.id && "bg-secondary font-semibold"
                                                        )}
                                                        onClick={() => handleSelectTemplate(template.id)}
                                                    >
                                                         {template.displayName}
                                                         {selectedEmailTemplateId === template.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                    </Button>
                                                 ))}
                                                {allTemplates.filter(t => t.isUserTemplate).length === 0 && (
                                                     <p className="p-4 text-center text-xs text-muted-foreground">No custom templates created yet.</p>
                                                )}
                                            </div>
                                         </ScrollArea>
                                          <Button variant="outline" className="w-full mt-2" onClick={handleCreateTemplate}>
                                            CREATE YOUR TEMPLATE
                                         </Button>
                                     </div>
                                 </div>

                                 {/* Right: Template Editor */}
                                 <div className="md:col-span-2 space-y-4">
                                     <div className="space-y-1">
                                         <Label htmlFor="emailTemplateName">Email template name <span className="text-xs text-muted-foreground">(this is just an identifier)</span></Label>
                                         <Input
                                             id="emailTemplateName"
                                             value={emailTemplateName}
                                             onChange={onEmailTemplateNameChange}
                                             placeholder="e.g., My Standard Application"
                                             required
                                         />
                                     </div>
                                      <div className="space-y-1">
                                         <Label htmlFor="emailSubject">Email subject</Label>
                                         <Input
                                             id="emailSubject"
                                             value={emailSubject}
                                             onChange={onEmailSubjectChange}
                                             placeholder="e.g., Application for {{JOB_TITLE}}"
                                             required
                                         />
                                     </div>
                                      <div className="space-y-1">
                                         <Label htmlFor="emailBody">Email body</Label>
                                         <Textarea
                                             id="emailBody"
                                             value={emailBody}
                                             onChange={onEmailBodyChange}
                                             placeholder="Write your email content here. Use placeholders like {{JOB_TITLE}}, {{COMPANY_NAME}}, etc."
                                             rows={10}
                                             required
                                             className="min-h-[200px]"
                                         />
                                         <p className="text-xs text-muted-foreground">Hint: type {'{{'} to show the suggestions list (feature not implemented). NOTE: We will attach your CV to this email.</p>
                                     </div>
                                     <Button onClick={handleSaveChanges} variant="default" className="bg-green-600 hover:bg-green-700 text-white">SAVE</Button> {/* Match style from image */}

                                     {/* Send Test Email Section */}
                                     <div className="border-t pt-4 mt-4 space-y-2">
                                         <h4 className="font-medium">Send a test email</h4>
                                         <p className="text-sm text-muted-foreground">This is the email a company will receive once your criteria match the job posting.</p>
                                          <div className="flex items-center gap-2">
                                             <Input
                                                 id="testEmailRecipient"
                                                 type="email"
                                                 value={testEmailRecipient}
                                                 onChange={onTestEmailRecipientChange}
                                                 placeholder="your-email@example.com"
                                                 className="flex-grow"
                                             />
                                              <Button variant="secondary" onClick={handleSendTestEmail}>
                                                SEND TEST EMAIL
                                            </Button>
                                          </div>
                                     </div>
                                 </div>
                            </div>
                         </CardContent>
                     )}


                     {/* --- Step 3: Settings (Placeholder) --- */}
                     {configureStep === 'settings' && (
                         <CardContent className="min-h-[200px] flex items-center justify-center border-t pt-6">
                             <p className="text-muted-foreground">3. Settings Configuration (Not Implemented)</p>
                         </CardContent>
                     )}

                     {/* --- Step 4: Review (Placeholder) --- */}
                     {configureStep === 'review' && (
                         <CardContent className="min-h-[200px] flex items-center justify-center border-t pt-6">
                              <p className="text-muted-foreground">4. Review Your Configuration (Not Implemented)</p>
                         </CardContent>
                     )}

                    <CardFooter className="flex justify-between border-t pt-6 mt-6">
                         {/* Back Button */}
                         {configureStep === 'searchInfo' ? (
                            <Button variant="outline" onClick={() => setViewState('statistics')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stats
                            </Button>
                         ) : (
                            <Button variant="outline" onClick={handlePreviousStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                         )}

                         {/* Action Buttons */}
                         <div className="flex items-center gap-2">
                             {/* Show "Save and Run" only on the final (review) step */}
                              {configureStep === 'review' && (
                                <Button variant="secondary" onClick={handleSaveAndRun}>
                                    Save and Run Simulation
                                </Button>
                             )}

                             {/* Show "Next" on all steps except the last one */}
                              {configureStep !== 'review' ? (
                                <Button onClick={handleNextStep}>
                                    Next
                                    <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" /> {/* Right Arrow */}
                                 </Button>
                              ) : (
                                  // Optional: Different button text on the last step if needed
                                  // <Button onClick={handleSaveAndRun}> Start Simulation </Button>
                                  null // Or simply hide "Next" on the last step if "Save and Run" is primary
                              )}
                         </div>
                    </CardFooter>
                </Card>
            );
        case 'applying':
            return (
                <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4 text-center">
                    <LoadingSpinner />
                    <p className="text-lg font-semibold text-primary">Simulating Job Search & Applications...</p>
                    <p className="text-muted-foreground">This is a simulation based on your loop configuration.</p>
                </div>
            );
        case 'results':
             return (
                <Card className="shadow-md">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><List className="h-6 w-6 text-primary" /> Simulated Application Results</CardTitle>
                        <CardDescription>Overview of the jobs the simulation attempted to apply for based on your loop configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                         {appliedJobs.length > 0 ? (
                            appliedJobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between rounded-md border p-4 shadow-sm bg-background">
                                     <div className="space-y-1">
                                        <p className="font-semibold">{job.title} - <span className="text-muted-foreground">{job.company}</span></p>
                                        <p className="text-sm text-muted-foreground">{job.location} - Simulated: {job.appliedDate}</p>
                                     </div>
                                     <Badge variant={job.status === 'Applied' ? 'default' : 'destructive'} className={cn(job.status === 'Applied' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700', 'text-white')}>
                                        {job.status === 'Applied' ? <CircleCheck className="mr-1 h-3 w-3" /> : <CircleX className="mr-1 h-3 w-3" />}
                                        {job.status}
                                     </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">No simulated applications were processed in this run.</p>
                        )}
                     </CardContent>
                     <CardFooter className="flex justify-between border-t pt-6 mt-4">
                         {/* Button to configure a new loop */}
                        <Button variant="outline" onClick={navigateToConfigure}>
                           <Settings className="mr-2 h-4 w-4" /> Configure New Loop
                        </Button>
                        {/* Button to go back to the main statistics dashboard */}
                        <Button variant="secondary" onClick={() => setViewState('statistics')}>
                            <BarChart className="mr-2 h-4 w-4" /> Back to Stats {/* Changed icon */}
                        </Button>
                     </CardFooter>
                 </Card>
             );
        case 'error':
             return (
                 <Card className="border-destructive shadow-lg">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-destructive"><CircleX className="h-6 w-6" /> Simulation Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{errorMessage || "An unexpected error occurred during the simulation."}</p>
                    </CardContent>
                     <CardFooter className="flex justify-between border-t pt-6 mt-4">
                        <Button variant="outline" onClick={navigateToConfigure}>Try Again</Button>
                        <Button variant="secondary" onClick={() => setViewState('statistics')}>
                           <BarChart className="mr-2 h-4 w-4" /> Back to Stats
                        </Button>
                    </CardFooter>
                </Card>
             );
     }
  };


  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        {/* Adjust title based on view state */}
        <h1 className="text-xl md:text-2xl font-semibold text-primary text-center flex-grow">
            {viewState === 'statistics' ? 'Auto Apply Dashboard' : 'Automated Job Application (Simulation)'}
        </h1>
         {/* Keep consistent spacing */}
        <div className="w-[150px] text-right">
            {viewState === 'configure' && (
                <Button variant="ghost" size="sm" onClick={() => setViewState('statistics')}>Cancel</Button>
            )}
        </div>
      </header>

      {/* Use TooltipProvider at a higher level if not already present */}
      <TooltipProvider>
         <main className="mx-auto max-w-5xl"> {/* Use consistent wider max-width */}
            {renderContent()}
         </main>
      </TooltipProvider>

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
