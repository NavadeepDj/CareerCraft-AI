'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UploadCloud, Search, FileUp, Bot, Play, CircleCheck, CircleX, List, Settings, RefreshCcw, Share2, FileCheck, Mail, AlertTriangle, Info, BarChart, Check, ArrowRight, Pencil } from 'lucide-react'; // Added Pencil
import LoadingSpinner from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Slider } from "@/components/ui/slider"; // Import Slider


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

// Updated templates based on user input
const popularTemplates: EmailTemplate[] = [
    {
        id: 'tpl-forward-thinking',
        name: 'The Forward-Thinking Application',
        displayName: 'The Forward-Thinking Application',
        subject: 'Forward-Thinking Approach to {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I hope this message finds you in good health.

I am writing to express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}. Known for my forward-thinking approach in this field, I am confident in my ability to bring innovative ideas and contribute to your team's success.

Attached is my resume for your consideration. I would welcome the opportunity to discuss how my forward-thinking mindset aligns with {{COMPANY_NAME}}'s vision.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-ask-open', // Kept original ID, updated content
        name: 'Ask regarding open position 2',
        displayName: 'Ask regarding open position 2',
        subject: 'Quick question regarding an amazing opportunity',
        body: `Dear Hiring Team at {{COMPANY_NAME}},

I hope that this email finds you well and your day is off to a great start. I am reaching out to you today because I am actively searching for a new role, and I recently learned about the {{JOB_TITLE}} opportunity at {{COMPANY_NAME}}, and I am extremely interested in this opportunity.

Additionally, I wanted to confirm that this role is still open and to see if there is an opportunity for us to discuss my qualifications further.

I am confident that my experience coupled with my desire to make an impact within the role makes me a strong fit for the position.

I value any insight that you can provide to me. Thank you so much for your time and assistance, and I look forward to hearing from you.

Sincerely,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-expressive',
        name: 'The Expressive Application',
        displayName: 'The Expressive Application',
        subject: 'Eager to Join {{COMPANY_NAME}} as {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I trust you are doing well.

I am {{USER_FIRSTNAME}}, and I wanted to express my strong interest in the {{JOB_TITLE}} role at {{COMPANY_NAME}}. The prospect of contributing to {{COMPANY_NAME}}'s success is incredibly exciting to me.

Attached is my resume, which outlines my experience in the required skills related to the {{JOB_TITLE}}. I am confident in my ability to make an immediate impact on your team and would love the opportunity to discuss my qualifications further.

Thank you for considering my application. I look forward to the possibility of discussing my candidacy in greater detail.

Warm regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-present-yourself',
        name: 'Present yourself',
        displayName: 'Present yourself',
        subject: 'Interested to learn more!',
        body: `Hello,

I came across your job posted here: {{JOB_URL}} regarding an opportunity in {{JOB_LOCATION}}.

I am interested in applying for the position of {{JOB_TITLE}} at {{COMPANY_NAME}}.

After reading the job description and requirements and matching it with my own experiences, I know that it fits great with my profile. I have attached my resume for your consideration.

Please take a moment to go through it to get a better picture of who I am. I would love to talk to you in more detail regarding this opportunity.

 

Sincerely,

{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    // New Templates Added Below
     {
        id: 'tpl-recognition',
        name: 'The Recognition of Company Achievements',
        displayName: 'The Recognition of Company Achievements',
        subject: 'Impressed by {{COMPANY_NAME}} Achievements',
        body: `Dear Hiring Team,

I hope this email finds you well.

I recently did my own research for {{COMPANY_NAME}}. Congratulations on the remarkable accomplishments you managed to achieve! It further solidifies my admiration for your team and your commitment to excellence.

In light of this, I am even more excited about the opportunity to potentially contribute to {{COMPANY_NAME}}. I have attached my resume for your consideration and would welcome the chance to discuss my application further.

Thank you for your time and congratulations again on the recent success.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-unique-skill',
        name: 'The Unique Skill Highlight',
        displayName: 'The Unique Skill Highlight',
        subject: 'Elevating {{JOB_TITLE}} with Specialized Skills',
        body: `Dear Hiring Team,

I hope this message finds you in good spirits.

My name is {{USER_FIRSTNAME}}, and I'm excited to submit my application for the {{JOB_TITLE}} position at {{COMPANY_NAME}}. With my specialized skills and experience in this industry, I am confident in my ability to bring a fresh perspective and make a meaningful impact on your company.

Attached is my resume for your review. I look forward to the possibility of discussing how my unique skills align with {{COMPANY_NAME}}'s goals.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-problem-solver',
        name: 'The Problem Solver',
        displayName: 'The Problem Solver',
        subject: 'Solving Challenges as Your {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I hope this email reaches you in good health.

I'm {{USER_FIRSTNAME}}, and I'm eager to apply for the {{JOB_TITLE}} position at {{COMPANY_NAME}}. With a proven track record in tackling challenges related to the context of the job description, I am confident in my ability to contribute innovative solutions to your team.

Attached is my resume for your review. I would welcome the opportunity to discuss how my problem-solving skills can benefit {{COMPANY_NAME}}.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-short-sweet',
        name: 'The Short and Sweet Application',
        displayName: 'The Short and Sweet Application',
        subject: 'Application for {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I am writing to apply for the {{JOB_TITLE}} position at {{COMPANY_NAME}}. You may find my resume attached for further information on my candidacy.

I am thrilled about the opportunity to contribute to your team, and I would welcome your availability to further discuss this.

Best regards,

{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-ask-opportunities-popular', // Added as popular, distinct ID
        name: 'Ask for opportunities',
        displayName: 'Ask for opportunities (Popular)', // Clarified name
        subject: 'Opportunities',
        body: `Hello,

I checked your website and social profiles recently, and I came across your job posting regarding the {{JOB_TITLE}} opening at {{JOB_LOCATION}}. I am interested in applying my knowledge in a real project at {{COMPANY_NAME}} where I believe I will also be able to learn many new things! For this reason, I'd like to find out if you have opportunities related to my profile.

 

I have attached my resume to let you learn more about me.

I would love to talk to you in more detail. Let me know your availability in the coming weeks.

 

Thanks,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-formal-interest',
        name: 'The Formal Expression of Interest',
        displayName: 'The Formal Expression of Interest',
        subject: 'Formal Application for {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I trust this email finds you in good health.

I am writing to formally express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}. Enclosed is my resume, providing a comprehensive overview of my professional background and achievements.

I am eager to contribute my skills to {{COMPANY_NAME}}, and would appreciate the opportunity to discuss how my qualifications align with the goals of your organization.

Thank you for considering my application.

Sincerely,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-straightforward',
        name: 'The Straightforward Application',
        displayName: 'The Straightforward Application',
        subject: 'Application for {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I hope this message finds you in good health.

I am {{USER_FIRSTNAME}}, and I am writing to apply for the {{JOB_TITLE}} position at {{COMPANY_NAME}}, which I found through your website.

I have attached my resume and a brief cover letter highlighting my qualifications. With much work experience as well as many tested skills in this field, I am confident in my ability to thrive in this job role and contribute to {{COMPANY_NAME}}'s goals and success.

I would greatly appreciate the opportunity to discuss how my professional profile aligns with your requirements.

Thank you for considering my application.

Best regards,

{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-intro-twist',
        name: 'The Introduction with a Twist',
        displayName: 'The Introduction with a Twist',
        subject: 'Unveiling My Potential for {{JOB_TITLE}} Role',
        body: `Dear Hiring Team,

I trust this email finds you well.

I'm {{USER_FIRSTNAME}}, and I couldn't resist the opportunity to explore the potential alignment of my skills with the {{JOB_TITLE}} position at {{COMPANY_NAME}}. I've attached my resume, and I'm eager to discuss how my unique approach aligned with the job description could contribute to your company’s success.

Thank you for considering my application.

Best,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-unique-value',
        name: 'The Unique Value Proposition',
        displayName: 'The Unique Value Proposition',
        subject: 'Bringing Exceptional Skills to {{COMPANY_NAME}}',
        body: `Dear Hiring Team,

I trust this email finds you well.

I am reaching out to express my interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}. With a strong background in this industry, I am confident in my ability to bring a unique and valuable perspective to your team.

Enclosed is my resume for your consideration, and I would welcome the opportunity to discuss how my skills align with your organization's goals.

Thank you for considering my application.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-ask-regarding-open', // Different from tpl-ask-open
        name: 'Ask regarding open position',
        displayName: 'Ask regarding open position',
        subject: 'Quick question',
        body: `Hello,

I would like to ask regarding a position I found here: {{JOB_URL}}.

Is the position of {{JOB_TITLE}} still open or did you already find someone?

I like {{JOB_LOCATION}} a lot, so I would be very interested to discuss more this opportunity in more detail at {{COMPANY_NAME}}.

 

You can find my cv attached. Let me know if you need any other detail.

I would love to talk to you soon.

Thanks,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-visionary',
        name: 'The Visionary',
        displayName: 'The Visionary',
        subject: 'Envisioning Success in the {{JOB_TITLE}} Role',
        body: `Dear Hiring Team,

I hope this email finds you in good health.

As a forward-thinking professional in this field, I am reaching out to express my keen interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}. In envisioning the impact I could make within your team, I am inspired by the innovative projects and solutions that {{COMPANY_NAME}} is known for.

I've attached my resume, and I would love the opportunity to discuss how my vision aligns with the future goals of {{COMPANY_NAME}}.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-present-yourself-2',
        name: 'Present yourself 2',
        displayName: 'Present yourself 2',
        subject: 'Looking to join the team',
        body: `Hello {{COMPANY_NAME}} hiring team,

My name is {{USER_FIRSTNAME}}, and I noticed that {{COMPANY_NAME}} is looking for someone to deliver sustainable outcomes as the next {{JOB_TITLE}}. After reviewing the specific role details on {{JOB_URL}}, I recognize that my skills directly align with the expectations of this role.

Throughout my career, I have consistently leveraged my skills and expertise to thrive in my assigned responsibilities. I am excited about the opportunity to bring these skills to your organization and to be a part of a team that fosters collaboration to make a positive impact in the industry. I would truly value an opportunity to discuss this role, as I am not only very interested in the position, but I truly aspire to join an organization with such an amazing culture and mission.

Thank you for considering my application. I look forward to the opportunity to speak with you regarding this rewarding opportunity.

Respectfully submitted,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-casual-inquiry',
        name: 'The Casual Inquiry',
        displayName: 'The Casual Inquiry',
        subject: 'Quick Question about {{JOB_TITLE}} Position',
        body: `Hello Hiring Team,

Hope you're having a good day.

I came across the {{JOB_TITLE}} position at {{COMPANY_NAME}} and wanted to reach out with a quick question. Could you share a bit more about the day-to-day responsibilities of the role?

Thanks a bunch!

Best,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-exploring',
        name: 'Exploring Opportunities',
        displayName: 'Exploring Opportunities',
        subject: 'Exploring Opportunities at {{COMPANY_NAME}}',
        body: `Dear Hiring Team,

I trust this email finds you well.

I am {{USER_FIRSTNAME}}, and I am reaching out to express my interest in potential opportunities at {{COMPANY_NAME}}. With my background in this industry, I am confident in my ability to bring valuable insights and contribute to your team's success.

I have attached my resume for your consideration and would welcome the chance to discuss how my skills align with the goals of {{COMPANY_NAME}}.

Thank you for your time, and I look forward to the possibility of connecting.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-talk-event',
        name: 'Talk about that event',
        displayName: 'Talk about that event',
        subject: 'Hi, it\'s {{USER_FIRSTNAME}}',
        body: `I checked your website and your social media, and I really like what {{COMPANY_NAME}} does.

I also found this job posting: {{JOB_URL}}. Is the position still open?

I would be very interested to work as a {{JOB_TITLE}} in {{JOB_LOCATION}}. I already have offers in similar positions, so I am currently evaluating them in order to decide my next steps.

 

You can find my cv attached (if you need any other document or details about my experience let me know).

Feel free to contact me to arrange a skype call to discuss more.

 

Thanks,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-enthusiastic',
        name: 'The Enthusiastic Application',
        displayName: 'The Enthusiastic Application',
        subject: 'Enthusiastically Applying for {{JOB_TITLE}} Position',
        body: `Dear Hiring Team,

I trust this email finds you well.

I am writing to express my genuine enthusiasm for the {{JOB_TITLE}} position at {{COMPANY_NAME}}. The prospect of contributing to your team is truly exciting, and I believe my background in this industry makes me a strong fit for the role.

Attached is my resume for your consideration. I look forward to the opportunity to discuss how my enthusiasm aligns with {{COMPANY_NAME}}'s mission.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
    {
        id: 'tpl-standard',
        name: 'The Standard Application',
        displayName: 'The Standard Application',
        subject: 'Letter of Interest for {{JOB_TITLE}}',
        body: `Dear Hiring Team,

I hope this email finds you well.

I am {{USER_FIRSTNAME}} and I am writing to express my strong interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}} as advertised on {{JOB_URL}}.

I have attached my resume for your consideration. Having carefully read the job description, I believe my skills, experience and academic background in combination with my strong interest in this field make me a qualified candidate for this role. I am excited about the opportunity to contribute to {{COMPANY_NAME}}'s success and would welcome the chance to discuss how my qualifications align with your requirements.

Thank you for considering my application. I look forward to the possibility of discussing my candidacy in greater detail.

Sincerely,

{{USER_FIRSTNAME}} {{USER_LASTNAME}}`
    },
];

// Update 'myTemplates' based on user input
const myTemplates: EmailTemplate[] = [
     {
        id: 'tpl-ask-opportunities',
        name: 'Ask for opportunities', // Internal name
        displayName: 'Ask for opportunities', // Display name
        subject: 'Opportunities', // Updated subject
        body: `Hello,

I checked your website and social profiles recently, and I came across your job posting regarding the {{JOB_TITLE}} opening at {{JOB_LOCATION}}. I am interested in applying my knowledge in a real project at {{COMPANY_NAME}} where I believe I will also be able to learn many new things! For this reason, I'd like to find out if you have opportunities related to my profile.

 

I have attached my resume to let you learn more about me.

I would love to talk to you in more detail. Let me know your availability in the coming weeks.

 

Thanks,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
        isUserTemplate: true
     },
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
    
        
            
                Statistics
            
            
                Overview of your automated job application activity.
            
        
        
            
                {stats.map((stat) => (
                
                    
                        <stat.icon className="h-8 w-8 text-muted-foreground mb-2" />
                        
{stat.value}
                        
{stat.title}
                    
                ))}
            
        
        
            
                
                    Configure New Simulation Loop
                
            
        
    
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
  const [searchRemoteAnywhere, setSearchRemoteAnywhere] = useState<boolean>(false);
  const [searchJobBoards, setSearchJobBoards] = useState<string>('All'); // Default to 'All'
  const [enableCareerPageSearch, setEnableCareerPageSearch] = useState<boolean>(false);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [jobType, setJobType] = useState<string>('');

  // State variables for Step 2 (Email Template)
  const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([...popularTemplates, ...myTemplates]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>(popularTemplates[0]?.id || ''); // Default to first popular
  const [emailTemplateName, setEmailTemplateName] = useState<string>(popularTemplates[0]?.name || '');
  const [emailSubject, setEmailSubject] = useState<string>(popularTemplates[0]?.subject || '');
  const [emailBody, setEmailBody] = useState<string>(popularTemplates[0]?.body || '');
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('sujithgopi740@gmail.com'); // Default from image
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes

  // State variables for Step 3 (Settings)
  const [masterAutoApply, setMasterAutoApply] = useState<boolean>(false); // Master switch
  const [autoSendEmails, setAutoSendEmails] = useState<boolean>(false);
  const [autoFillForms, setAutoFillForms] = useState<boolean>(false);
  const [aiAnswering, setAiAnswering] = useState<boolean>(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('+91'); // Default to India
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // Example '06 12 34 56 70'
  const [cityLocation, setCityLocation] = useState<string>('');
  const [coverLetterContent, setCoverLetterContent] = useState<string>(
    `The role is very appealing to me, and I believe that my experience and education make me a highly competitive candidate for this position.\nPlease see my resume for additional information on my experience.\n\nThank you for your time and consideration.\nI look forward to speaking with you about this employment opportunity.`
  ); // Default from image
  const [desiredSalaryCurrency, setDesiredSalaryCurrency] = useState<string>(''); // e.g., USD, EUR
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [excludeCompaniesInput, setExcludeCompaniesInput] = useState<string>('');
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);
  const [includeKeywordsInput, setIncludeKeywordsInput] = useState<string>('');
  const [includedKeywords, setIncludedKeywords] = useState<string[]>([]);
  const [excludeKeywordsInput, setExcludeKeywordsInput] = useState<string>('');
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);
  const [jobMatchLevel, setJobMatchLevel] = useState<number>(1); // Default to Middle (0=Low, 1=Middle, 2=High)


  // Select an email template
  const handleSelectTemplate = (templateId: string) => {
    // Check for unsaved changes before switching
     if (hasUnsavedChanges) {
       if (!confirm("You have unsaved changes in the current template. Are you sure you want to discard them and switch?")) {
         return; // Don't switch if user cancels
       }
     }

    const selected = allTemplates.find(t => t.id === templateId);
    if (selected) {
        setSelectedEmailTemplateId(selected.id);
        setEmailTemplateName(selected.name); // Use internal name for the input field
        setEmailSubject(selected.subject);
        setEmailBody(selected.body);
        setHasUnsavedChanges(false); // Reset unsaved changes flag when selecting a template
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
  const onEmailTemplateNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEmailTemplateName(e.target.value);
      setHasUnsavedChanges(true); // Mark changes as unsaved
  };
  const onEmailSubjectChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEmailSubject(e.target.value);
      setHasUnsavedChanges(true); // Mark changes as unsaved
  };
  const onEmailBodyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setEmailBody(e.target.value);
      setHasUnsavedChanges(true); // Mark changes as unsaved
  };
  const onTestEmailRecipientChange = (e: ChangeEvent<HTMLInputElement>) => setTestEmailRecipient(e.target.value);

  // Step 3
  const onMasterAutoApplyChange = (checked: boolean) => {
      setMasterAutoApply(checked);
      // If master is turned off, ensure sub-options are also off
      if (!checked) {
          setAutoSendEmails(false);
          setAutoFillForms(false);
          setAiAnswering(false);
      }
  };
  const onAutoSendEmailsChange = (checked: boolean) => setAutoSendEmails(checked);
  const onAutoFillFormsChange = (checked: boolean) => setAutoFillForms(checked);
  const onAiAnsweringChange = (checked: boolean) => setAiAnswering(checked);
  const onPhoneCountryCodeChange = (value: string) => setPhoneCountryCode(value);
  const onPhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value);
  const onCityLocationChange = (e: ChangeEvent<HTMLInputElement>) => setCityLocation(e.target.value);
  const onCoverLetterContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setCoverLetterContent(e.target.value);
  const onDesiredSalaryCurrencyChange = (value: string) => setDesiredSalaryCurrency(value);
  const onMinSalaryChange = (e: ChangeEvent<HTMLInputElement>) => setMinSalary(e.target.value);
  const onMaxSalaryChange = (e: ChangeEvent<HTMLInputElement>) => setMaxSalary(e.target.value);
  // Updated handler for the 3-step slider
  const onJobMatchLevelChange = (value: number[]) => setJobMatchLevel(value[0]); // Value will be 0, 1, or 2

  // Handlers for adding/removing keywords/companies
  const handleAddKeyword = (type: 'include' | 'exclude' | 'company') => {
    const inputState = type === 'include' ? includeKeywordsInput : type === 'exclude' ? excludeKeywordsInput : excludeCompaniesInput;
    const setter = type === 'include' ? setIncludedKeywords : type === 'exclude' ? setExcludedKeywords : setExcludedCompanies;
    const inputSetter = type === 'include' ? setIncludeKeywordsInput : type === 'exclude' ? setExcludeKeywordsInput : setExcludeCompaniesInput;

    if (inputState.trim()) {
      setter(prev => [...prev, inputState.trim()]);
      inputSetter('');
    }
  };

  const handleRemoveItem = (type: 'include' | 'exclude' | 'company', itemToRemove: string) => {
      const setter = type === 'include' ? setIncludedKeywords : type === 'exclude' ? setExcludedKeywords : setExcludedCompanies;
      setter(prev => prev.filter(item => item !== itemToRemove));
  };


  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle creating a new template
  const handleCreateTemplate = () => {
      // Check for unsaved changes before creating new
      if (hasUnsavedChanges) {
          if (!confirm("You have unsaved changes. Are you sure you want to discard them and create a new template?")) {
              return;
          }
      }
      // Set default values for a new template
      setSelectedEmailTemplateId(''); // Clear selection to indicate it's a new/custom one
      setEmailTemplateName('New Template');
      setEmailSubject('Email Subject');
      setEmailBody('{{COMPANY_NAME}} {{JOB_TITLE}} {{JOB_LOCATION}} {{USER_FIRSTNAME}} {{USER_LASTNAME}}');
       // Optionally, focus the name input or something similar
       document.getElementById('emailTemplateName')?.focus();
       setHasUnsavedChanges(true); // New template starts with "unsaved" state until saved
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

   // Save changes to the current template (or create new one) in state
   const handleSaveChanges = async () => {
       if (!emailTemplateName.trim() || !emailSubject.trim() || !emailBody.trim()) {
             toast({ title: "Incomplete Email Template", description: "Please ensure the template has name, subject, and body.", variant: "destructive"});
             return;
         }

       setIsSaving(true);
       toast({ title: "Saving Template...", description: `Simulating saving template '${emailTemplateName}'.` });
       await new Promise(resolve => setTimeout(resolve, 700)); // Simulate async operation

       // Determine if it's a new template or an update
       const isUpdatingExisting = selectedEmailTemplateId && allTemplates.find(t => t.id === selectedEmailTemplateId && t.isUserTemplate); // Only allow saving changes to user templates
       const isNewTemplate = !selectedEmailTemplateId || !allTemplates.find(t => t.id === selectedEmailTemplateId); // If ID is empty or not found

       let updatedTemplates = [...allTemplates];
       let updatedTemplateId = selectedEmailTemplateId;

       if (isUpdatingExisting) {
            // Update existing USER template
            updatedTemplates = updatedTemplates.map(template => {
                if (template.id === selectedEmailTemplateId) {
                    return {
                        ...template,
                        name: emailTemplateName.trim(),
                        displayName: emailTemplateName.trim(), // Update display name too
                        subject: emailSubject.trim(),
                        body: emailBody,
                    };
                }
                return template;
            });
            toast({ title: "Template Updated", description: `Template '${emailTemplateName}' saved.` });
       } else if (isNewTemplate) {
           // Add new template
           const newTemplate: EmailTemplate = {
               id: `tpl-user-${Date.now()}`, // Generate a temporary unique ID
               name: emailTemplateName.trim(),
               displayName: emailTemplateName.trim(),
               subject: emailSubject.trim(),
               body: emailBody,
               isUserTemplate: true, // New templates are always user templates
           };
           updatedTemplates.push(newTemplate);
           updatedTemplateId = newTemplate.id; // Store the new ID
           // Automatically select the newly created template
           setSelectedEmailTemplateId(updatedTemplateId); // Update the selected ID state
           toast({ title: "Template Created", description: `Template '${newTemplate.name}' saved.` });
       } else {
            // Trying to save changes to a non-user template (popular template)
            toast({ title: "Cannot Save", description: "Cannot modify popular templates. Create a new template to customize.", variant: "destructive" });
       }


       setAllTemplates(updatedTemplates);
       setIsSaving(false);
       setHasUnsavedChanges(false); // Mark changes as saved
       // Stay on the email template step after saving
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
     // Step 2 Validation (Basic) - Ensure a template is selected and has content
     const selectedTemplate = allTemplates.find(t => t.id === selectedEmailTemplateId);
     if (!selectedTemplate || !selectedTemplate.name || !selectedTemplate.subject || !selectedTemplate.body) {
          setConfigureStep('emailTemplate');
          toast({ title: "Incomplete Email Template", description: "Please select a valid template or ensure the current template is saved and complete.", variant: "destructive" });
          return;
     }
     if (hasUnsavedChanges) { // Check for unsaved changes before running
         setConfigureStep('emailTemplate');
         toast({ title: "Unsaved Changes", description: "Please save your email template changes before running the simulation.", variant: "destructive"});
         return;
     }
     // Step 3 Validation
     if (!phoneNumber.trim() || !cityLocation.trim()) {
         setConfigureStep('settings');
         toast({ title: "Missing Required Fields", description: "Please provide your Phone number and City in the Settings tab.", variant: "destructive" });
         return;
     }
     // TODO: Add more validation for Step 3 if needed (e.g., salary format)


    setViewState('applying');
    setErrorMessage('');
    setAppliedJobs([]); // Clear previous results

    try {
      // **SIMULATION:** In a real app, this would involve complex backend processes.
      console.log(`Simulating job search loop for: ${jobTitles} in ${jobLocation || 'Remote'}...`);
      console.log("Configuration:", {
          // Step 1
          jobTitles, jobLocation, searchOnlyRemote, searchRemoteAnywhere,
          searchJobBoards, enableCareerPageSearch, experienceLevel, jobType,
          resume: uploadedFile?.name,
          // Step 2
          emailTemplate: { name: selectedTemplate.name, subject: selectedTemplate.subject },
          // Step 3
          masterAutoApply, autoSendEmails, autoFillForms, aiAnswering,
          phone: `${phoneCountryCode} ${phoneNumber}`, cityLocation,
          coverLetterPreview: coverLetterContent.substring(0, 50) + '...',
          salaryRange: `${minSalary} - ${maxSalary} ${desiredSalaryCurrency}`,
          excludedCompanies: excludedCompanies.join(', '),
          includedKeywords: includedKeywords.join(', '),
          excludedKeywords: excludedKeywords.join(', '),
          jobMatchLevel,
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

       // Simulate some errors randomly and exclude based on settings
      const results = dummyJobs
         .filter(job => !excludedCompanies.some(exComp => job.company.toLowerCase().includes(exComp.toLowerCase())))
         .map(job => ({
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
         // Check if template content is unsaved before proceeding
          if (hasUnsavedChanges) {
              toast({ title: "Unsaved Changes", description: "Please save your email template changes before proceeding.", variant: "destructive"});
              return;
          }
          // Ensure a template is selected (it should be if saved/created)
          const selectedTemplate = allTemplates.find(t => t.id === selectedEmailTemplateId);
          if (!selectedTemplate) {
              toast({ title: "No Template Selected", description: "Please select or create and save a template.", variant: "destructive"});
              return;
          }
         // Only navigate if changes are saved
         setConfigureStep('settings');
    } else if (configureStep === 'settings') {
        // Validate Settings Step
         if (!phoneNumber.trim() || !cityLocation.trim()) {
             toast({ title: "Missing Required Fields", description: "Please provide your Phone number and City.", variant: "destructive" });
             return;
         }
         // Add more validation if needed (e.g., salary format)
        setConfigureStep('review');
    } else if (configureStep === 'review') {
        // Review step is the last step before running
        handleSaveAndRun(); // Trigger simulation from review step's "Next"
    }
  };


   const handlePreviousStep = () => {
     if (configureStep === 'emailTemplate') {
        // Check for unsaved changes before going back
         if (hasUnsavedChanges) {
             if (!confirm("You have unsaved changes. Are you sure you want to discard them and go back?")) {
                 return;
             }
             // Reset changes to the currently selected template's saved state
             handleSelectTemplate(selectedEmailTemplateId); // Reselect to discard changes
         }
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
      setHasUnsavedChanges(false); // Reset unsaved changes when starting new config
  };

    // Helper component for keyword/company list items
    const ItemChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
        
            {label}
            
                <CircleX className="h-3 w-3" />
                <span className="sr-only">Remove {label}</span>
            
        
    );

    // Get descriptive text for job match level
    const getJobMatchLevelDescription = (level: number): string => {
        switch (level) {
        case 0: // Low
            return "You will be matched with positions that meet only some of your preferences and information of your CV (resume). We will try to apply to as many jobs as we can, but we risk that some might not be totally suitable for your profile.";
        case 1: // Middle
            return "You will be matched with positions that meet most of your preferences and information of your CV (resume). We will try to apply to a lot of seemingly suitable jobs, but we risk that some might not be a 100% match with your profile.";
        case 2: // High
            return "You will be matched with positions that meet all your preferences and information of your CV (resume). We will take extra precautions to narrow down our search and apply only to jobs that match with the most of your specified details, to the degree possible.";
        default:
            return "Select the desired level of job matching precision.";
        }
    };

    // Function to get corresponding text for job match level
    const getJobMatchText = (level: number): string => {
        switch (level) {
            case 0:
                return "Low";
            case 1:
                return "Middle";
            case 2:
                return "High";
            default:
                return "";
        }
    };



  const renderContent = () => {
     switch(viewState) {
         case 'statistics': // Render statistics dashboard first
            return <StatisticsDashboard onConfigure={navigateToConfigure} />;

         case 'configure':
            // This structure was causing the parsing error. Ensure it's valid JSX.
            return (
                 
                    
                    
                        
                            Let's create a new Loop
                             
                               
                                  
                                       
                                       
                                            A "Loop" represents an automated job search  and application simulation based on your criteria.
                                       
                                  
                               
                             
                         
                        
                            Automate your job search simulation.
                        
                         {/* Stepper Component */}
                        
                    
                    

                    {/* --- Step 1: Search Info --- */}
                    {configureStep === 'searchInfo' && (
                         
                            
3. Complete your desired job info and location

                             {/* Job Titles */}
                             
                                
                                    Job Titles 
                                
                                
                                    e.g., Software Engineer, Product Manager
                                
                                
                                    This job title will be used to search for jobs around the web. Separate multiple titles with commas.
                                
                            
                             {/* Job Location */}
                            
                                
                                    Job Location
                                
                                
                                    e.g., Remote, New York, London
                                
                                {!searchOnlyRemote && 
                                    Specify city, state, country, or "Remote".
}
                            
                            {/* Checkboxes */}
                             
                                
                                  
                                      
Search only for remote jobs
                                  
                               
                                
                                   
                                       
Search for remote jobs anywhere in the world
                                   
                               
                             
                            {/* Search Job Boards */}
                             
                                
                                    Search in Specific Job Boards
                                
                                
                                    
                                        
                                            Select job boards...
                                        
                                        
                                            
                                                All Platforms
                                            
                                            
                                                LinkedIn
                                            
                                            
                                                Indeed
                                            
                                            
                                                Glassdoor
                                            
                                            
                                                Wellfound (AngelList Talent)
                                            
                                            {/* Add more platforms */}
                                        
                                    
                                
                                
                                    Choose specific platforms if you want to narrow your search. Leave it blank to allow all platforms for your profile.
                                
                             
                              {/* Enable Career Page Search */}
                              
                                 
                                    
                                       Enable Career Page Job Search
                                    
                                 
                              

                             {/* Experience and Job Type */}
                             
                                  
                                      
                                          Experience 
                                      
                                      
                                          
                                              Select experience...
                                          
                                          
                                              
                                                  Entry-level
                                              
                                              
                                                  Junior
                                              
                                              
                                                  Mid-level
                                              
                                              
                                                  Senior
                                              
                                              
                                                  Lead
                                              
                                              
                                                  Manager
                                              
                                          
                                      
                                  
                                   
                                      
                                          Job Type 
                                      
                                      
                                          
                                              Select job type...
                                          
                                          
                                              
                                                  Full time
                                              
                                              
                                                  Part time
                                              
                                              
                                                  Contract
                                              
                                              
                                                  Internship
                                              
                                              
                                                  Temporary
                                              
                                          
                                      
                                  
                             
                            

                            {/* File Upload Area */}
                             
                                
                                    Upload your CV (resume) 
                                
                                 
                                    
                                        
                                            CURRENTLY SELECTED: {uploadedFile ? uploadedFile.name : "NO CVS UPLOADED YET"}
                                        
                                        To get the most out of our platform, uploading your CV is important. Here's why:
                                        
                                            
Automate your applications by having your CV automatically attached to emails sent to companies.
                                            
Apply directly to online forms effortlessly.
                                            
Get better job matches tailored to your experience and skills.
                                        
                                    
                                 
                                    
                                      {uploadedFile ? uploadedFile.name : "Drop your file here, or upload one from your device."}
                                    
                                    SELECT A PDF OR WORD FILE
                                    
                                      
                                      
                                          
                                      
                                    
                                  
                             

                             {/* Simulation Notice */}
                             
                               
                                
Simulation Notice

                                
                                    This feature simulates the job application process. It **will not actually submit applications** on external websites.
                                
                             
                         
                     )}

                     {/* --- Step 2: Email Template --- */}
                     {configureStep === 'emailTemplate' && (
                         
                             
2. Select or create a unique email template

                             
                                 {/* Left: Template List */}
                                 
                                     
                                         
                                             Popular templates
                                         
                                         
                                            
                                                {allTemplates.filter(t => !t.isUserTemplate).map(template => (
                                                    
                                                        {template.displayName}
                                                        {selectedEmailTemplateId === template.id && }
                                                    
                                                ))}
                                             
                                         
                                     
                                     
                                         
                                             My templates
                                         
                                         
                                             
                                                 {allTemplates.filter(t => t.isUserTemplate).map(template => (
                                                     
                                                         {template.displayName}
                                                         {selectedEmailTemplateId === template.id && }
                                                     
                                                 ))}
                                                {allTemplates.filter(t => t.isUserTemplate).length === 0 && (
                                                     
No custom templates created yet.
                                                )}
                                            
                                         
                                          
                                            CREATE YOUR TEMPLATE
                                         
                                     
                                 

                                 {/* Right: Template Editor */}
                                 
                                     
                                         
                                             Email template name 
(this is just an identifier)
                                         
                                         
                                             e.g., My Standard Application
                                             
                                         
                                     
                                      
                                         
                                             Email subject
                                         
                                         
                                             e.g., Application for {{JOB_TITLE}}
                                         
                                     
                                      
                                         
                                             Email body
                                         
                                         
                                             Write your email content here. Use placeholders like {{JOB_TITLE}}, {{COMPANY_NAME}}, etc.
                                             
                                         
                                         Hint: type {'{{'} to show the suggestions list (feature not implemented). NOTE: We will attach your CV to this email.
                                     
                                     {/* Updated Save Button Style */}
                                     {/* Only enable save if it's a new template or a user template */}
                                      
                                         {isSaving ? "Saving..." : "SAVE"}
                                         {hasUnsavedChanges && !isSaving && 
(unsaved)
}
                                     
                                     {selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate && (
                                          
Popular templates cannot be edited. Create a new template to customize.
                                      )}


                                     {/* Send Test Email Section */}
                                     
                                         
                                             Send a test email
                                         
                                         
                                             This is the email a company will receive once your criteria match the job posting.
                                         
                                          
                                             
                                                 
                                                 
                                             
                                              
                                                SEND TEST EMAIL
                                            
                                          
                                     
                                 
                            
                         
                     )}


                     {/* --- Step 3: Settings --- */}
                     {configureStep === 'settings' && (
                         
                             
3. Fine-tune your automation settings

                             {/* Master Toggle */}
                              
                                
                                 
{masterAutoApply ? "Auto-Apply Active" : "Auto-Apply Disabled"}
                                
                                 
{masterAutoApply
                                        ? "The Master Auto-apply toggle is enabled. Emails and form fills will proceed based on individual loop settings."
                                        : "The Master Auto-apply toggle is disabled. Please enable it if you want to automatically send emails and fill-in job application forms."}
                                      
                                
                             

                             {/* Individual Toggles */}
                             
                                
                                     
Automatically send emails

                                        
Enable this to let our platform instantly send emails to matching companies, streamlining your job hunt. Prefer reviewing emails first? Simply turn this off to personalise messages, ensuring alignment with your preferences before dispatch.
                                    
                                    
                                
                                
                                     
Auto-fill Application Forms

                                      
Enable this to allow our platform to automatically submit job application forms on your behalf.
                                            Check an example application form that we usually fill for you.
                                       
                                    
                                
                                 
                                      
                                         AI answering
                                         
                                      
                                      
Enable this to let AI handle any question that occur during the application processes.
                                  
                                    
                                
                             

                            {/* Additional Form Fields */}
                             
                                 
Additional Fields for Form Applications

                                 
The below fields are asked by most companies in order to let you apply online. We need to save your answers in order to be able to apply online for you.
                                

                                 {/* Phone Number */}
                                
                                      
Phone 

                                         
                                            🇮🇳 +91
                                            🇺🇸 +1
                                            🇬🇧 +44
                                            🇫🇷 +33
                                            🇩🇪 +49
                                            {/* Add more country codes */}
                                        
                                      
                                      
Phone Number
                                         
                                     
                                

                                 {/* City */}
                                
                                     
City 

                                      
                                          Location that you are based in
                                         
                                     
                                

                                 {/* Cover Letter */}
                                
                                     
Cover letter

                                     
                                         
                                             
                                             
                                         
                                         
                                             Edit Cover Letter
                                         
                                     
                                 
                            

                            {/* Salary Range */}
                             
                               Desired salary range

                                     
                                       
                                           
                                              Set your desired salary range to filter job matches. 
 Only jobs with reported salaries that match your criteria will be included.
                                          
                                       
                                    
                               
                                
                                         
                                            INR (₹)
                                            USD ($)
                                            EUR (€)
                                            GBP (£)
                                            {/* Add more currencies */}
                                        
                                        
                                        
                                        
                                        
                                    
                                  Learn More
                             

                             {/* Exclude Companies */}
                             
                                
                                     
Do you want to exclude some companies?

                                         
                                           
Select companies that will not be part of your search.
                                         
                                       
                                    
                                    
                                          
                                          
                                           Add
                                     
                                
                                
                                     
Companies you have chosen

                                     
                                          
                                               {excludedCompanies.map(company => (
                                                   
                                                       {company}
                                                       
Remove {company}
                                                  
                                              ))}
                                          
                                        
                                        You don't have any excluded companies selected for this Loop.
                                    
                                
                             

                              {/* Include Keywords */}
                             
                                
                                    
Select the keywords that should be present in the job posting

                                         
                                        
Keywords that must be included in job description.
                                         
                                     
                                    
                                         
                                          
                                          
                                            Add
                                     
                                
                                 
                                    
Keywords you have chosen

                                    
                                         
                                              {includedKeywords.map(keyword => (
                                                  
                                                      {keyword}
                                                      
Remove {keyword}
                                                  
                                              ))}
                                         
                                    
                                        You don't have any keywords selected.
                                    
                                
                             

                             {/* Exclude Keywords */}
                            
                                
                                     
Exclude keywords

                                         
                                          
Keywords that must NOT be included in job description.
                                         
                                     
                                    
                                        
                                           
                                           Add
                                     
                                
                                
                                    
Keywords you have chosen

                                     
                                          
                                              {excludedKeywords.map(keyword => (
                                                  
                                                      {keyword}
                                                      
Remove {keyword}
                                                  
                                              ))}
                                         
                                    
                                        You don't have any keywords selected.
                                    
                                
                            

                            {/* Job Match Level */}
                            
                                
Please choose the level of the job match you prefer
                                {/* New paragraph for match level display */}
                                 
Our Auto-Apply will {getJobMatchText(jobMatchLevel)} match with your preferences.
                                
                                
                                    
                                
                                
                                    
                                    
                                 
                             

                             {/* Final Note - Updated to show dynamic description */}
                              
                               
                                
Important Note

                                
                                    {getJobMatchLevelDescription(jobMatchLevel)} {/* Dynamic description here */}
                               
                             

                         
                     )}


                     {/* --- Step 4: Review (Placeholder) --- */}
                     {configureStep === 'review' && (
                         
                              4. Review Your Configuration (Not Implemented)
                         
                     )}

                    
                         {/* Back Button */}
                         {configureStep === 'searchInfo' ? (
                            
                                 
Back to Stats
                            
                         ) : (
                            
                                 
PREVIOUS {/* Changed label */}
                            
                         )}

                         {/* Action Buttons */}
                         
                             {/* Show "Save and Run" only on the final (review) step */}
                              {configureStep === 'review' && (
                                
                                    SAVE AND RUN {/* Changed label */}
                                
                             )}
                              {/* Show "Save and Run" on settings step as well, but only if review is not implemented */}
                              {configureStep === 'settings' && (
                                 
                                     SAVE AND RUN
                                 
                              )}


                             {/* Show "Next" on all steps except the last one */}
                              {configureStep !== 'review' ? (
                                
                                    NEXT
                                    
                                 
                              ) : (
                                  null // Hide "Next" on the last step
                              )}
                         
                    
                
                
            );
        case 'applying':
            return (
                
                    
Simulating Job Search & Applications...

                    
This is a simulation based on your loop configuration.
                
            );
        case 'results':
             return (
                
                    
                         
Simulated Application Results

                        
Overview of the jobs the simulation attempted to apply for based on your loop configuration.
                    
                    
                         {appliedJobs.length > 0 ? (
                            appliedJobs.map((job) => (
                                
                                      
                                         
{job.title} - {job.company}

                                        
{job.location} - Simulated: {job.appliedDate}
                                     
                                     
{job.status === 'Applied' ?  : }
                                        {job.status}
                                     
                                
                            ))
                        ) : (
                            
No simulated applications were processed in this run.
                        )}
                     
                     
                        
                            
                                 Configure New Loop
                            
                            
                                
Back to Stats {/* Changed icon */}
                            
                        
                     
                
             );
        case 'error':
             return (
                 
                    
                         
Simulation Error
                    

                    
{errorMessage || "An unexpected error occurred during the simulation."}
                    
                     
                        
Try Again

                        
                           
Back to Stats
                        
                     
                
             );
     }
  };


  return (
    
      
        
          
            
             Back to Dashboard
          
        
        {/* Adjust title based on view state */}
        
            {viewState === 'statistics' ? 'Auto Apply Dashboard' : 'Automated Job Application (Simulation)'}
        
         {/* Keep consistent spacing */}
        
            {viewState === 'configure' && (
                
Cancel
            )}
        
      

      {/* Use TooltipProvider at a higher level if not already present */}
      
         
            {renderContent()}
         
      

        
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      
    
  );
}

    
