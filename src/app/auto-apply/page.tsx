// src/app/auto-apply/page.tsx
'use client';

import React, { useState, useCallback, ChangeEvent, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UploadCloud, Search, FileUp, Bot, Play, CircleCheck, CircleX, List, Settings, RefreshCcw, Share2, FileCheck, Mail, AlertTriangle, Info, BarChart, Check, ArrowRight, Pencil, ChevronDown, ChevronRight, ChevronLeft, MapPin, Briefcase, Clock, ListFilter, ListX, Ban, DollarSign, Phone, FileText, Send, FileDigit, FormInput } from 'lucide-react'; // Added more icons for review step
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
import { Separator } from '@/components/ui/separator'; // Import Separator
// Re-import GooglePlacesAutocomplete
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';


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
                <div key={step.id} className="flex items-center"> {/* Ensure key is on the outer element */}
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
    { title: 'Emails Sent (Sim)', value: 0, icon: Mail }, // Added Emails Sent stat
    { title: 'Errors Encountered (Sim)', value: 0, icon: AlertTriangle },
  ];

  return (
    <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
                Statistics
            </CardTitle>
             <CardDescription>
                 Overview of your automated job application activity.
             </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center"> {/* Adjusted grid columns */}
                {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-secondary rounded-lg">
                    <stat.icon className="h-8 w-8 text-muted-foreground mb-2" />
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.title}</div>
                </div>
                ))}
            </div>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button size="lg" onClick={onConfigure}>
                <Play className="mr-2 h-5 w-5" />
                Configure New Simulation Loop
            </Button>
        </CardFooter>
    </Card>
  );
};


// Component to display review details neatly
const ReviewDetail: React.FC<{ icon: React.ElementType, label: string, value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value || '-'}</p>
        </div>
    </div>
);


export default function AutoApplyPage() {
  const { toast } = useToast();
  // Set initial state to 'statistics'
  const [viewState, setViewState] = useState<ViewState>('statistics');
  const [configureStep, setConfigureStep] = useState<ConfigureStep>('searchInfo'); // Track configuration step
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null); // Store as Data URI if needed by potential future API

  // State variables for Step 1 (Search Info)
  const [jobTitles, setJobTitles] = useState<string>('');
  const [jobLocation, setJobLocation] = useState<any>(null); // Use `any` or create a type for the Place object
  const [searchOnlyRemote, setSearchOnlyRemote] = useState<boolean>(false);
  const [searchRemoteAnywhere, setSearchRemoteAnywhere] = useState<boolean>(false);
  const [searchJobBoards, setSearchJobBoards] = useState<string>('All'); // Default to 'All'
  const [enableCareerPageSearch, setEnableCareerPageSearch] = useState<boolean>(false);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [jobType, setJobType] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Store key in variable

  useEffect(() => {
    setIsClient(true); // Indicate component has mounted client-side
  }, []);


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
  const [cityLocation, setCityLocation] = useState<any>(null); // Use `any` or create a type
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
  const onJobLocationChange = (newValue: any) => {
     console.log("Job Location Selected:", newValue);
     setJobLocation(newValue);
     // Optionally geocode here if needed immediately
     // if (newValue) {
     //     geocodeByAddress(newValue.label)
     //         .then(results => getLatLng(results[0]))
     //         .then(({ lat, lng }) => console.log('Successfully got latitude and longitude', { lat, lng }))
     //         .catch(error => console.error('Error geocoding:', error));
     // }
  };
  const onSearchJobBoardsChange = (value: string) => setSearchJobBoards(value);
  const onExperienceLevelChange = (value: string) => setExperienceLevel(value);
  const onJobTypeChange = (value: string) => setJobType(value);
  const onSearchOnlyRemoteChange = (checked: boolean | 'indeterminate') => {
      setSearchOnlyRemote(Boolean(checked));
      if (Boolean(checked)) {
          setJobLocation(null); // Clear job location if only remote is selected
      }
  };
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

  // --- Salary Validation Function ---
  const validateSalaryRange = (currentMin: string, currentMax: string) => {
    const minVal = parseFloat(currentMin);
    const maxVal = parseFloat(currentMax);

    if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
      toast({
        title: "Invalid Salary Range",
        description: "Minimum salary cannot be greater than maximum salary.",
        variant: "destructive",
        duration: 3000, // Show toast for 3 seconds
      });
      return false; // Indicate validation failure
    }
    return true; // Indicate validation success
  };


  // --- Updated Salary Input Handlers ---
  const onMinSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMinSalary = e.target.value;
    setMinSalary(newMinSalary);
    validateSalaryRange(newMinSalary, maxSalary); // Validate on change
  };

  const onMaxSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMaxSalary = e.target.value;
    setMaxSalary(newMaxSalary);
    validateSalaryRange(minSalary, newMaxSalary); // Validate on change
  };


  // Step 3 (Continued)
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
  const onCityLocationChange = (newValue: any) => {
     console.log("City Location Selected:", newValue);
     setCityLocation(newValue);
     // Optionally geocode here as well
  };
  const onCoverLetterContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setCoverLetterContent(e.target.value);
  const onDesiredSalaryCurrencyChange = (value: string) => setDesiredSalaryCurrency(value);
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

  // Handle starting the auto-apply process (simulation) - renamed to "START THE LOOP"
  const handleStartTheLoop = async () => {
    // ** Run Validations for ALL required steps before simulation **
    // Step 1 Validation
    if (!jobTitles.trim()) {
      setConfigureStep('searchInfo');
      toast({ title: "Missing Job Titles", description: "Please specify the desired job titles.", variant: "destructive" });
      return;
    }
    if (!jobLocation && !searchOnlyRemote) { // Check if jobLocation object is null or undefined
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
     if (!phoneNumber.trim() || !cityLocation) { // Check if cityLocation object is null/undefined
         setConfigureStep('settings');
         toast({ title: "Missing Required Fields", description: "Please provide your Phone number and City in the Settings tab.", variant: "destructive" });
         return;
     }
     // Salary validation - Re-validate before starting the loop
     if (!validateSalaryRange(minSalary, maxSalary)) {
        setConfigureStep('settings');
        // Toast is already shown by validateSalaryRange
        return;
     }


    setViewState('applying');
    setErrorMessage('');
    setAppliedJobs([]); // Clear previous results

    try {
      // **SIMULATION:** In a real app, this would involve complex backend processes.
      console.log(`Simulating job search loop for: ${jobTitles} in ${jobLocation?.label || 'Remote'}...`);
      console.log("Configuration:", {
          // Step 1
          jobTitles, jobLocation: jobLocation?.label, searchOnlyRemote, searchRemoteAnywhere,
          searchJobBoards, enableCareerPageSearch, experienceLevel, jobType,
          resume: uploadedFile?.name,
          // Step 2
          emailTemplate: { name: selectedTemplate.name, subject: selectedTemplate.subject },
          // Step 3
          masterAutoApply, autoSendEmails, autoFillForms, aiAnswering,
          phone: `${phoneCountryCode} ${phoneNumber}`, cityLocation: cityLocation?.label,
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
      const baseLocation = searchOnlyRemote ? 'Remote' : (jobLocation?.label || 'Unknown Location');
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
        if (!jobLocation && !searchOnlyRemote) { toast({ title: "Missing Job Location", variant: "destructive" }); return; }
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
         if (!phoneNumber.trim() || !cityLocation) { // Check cityLocation object
             toast({ title: "Missing Required Fields", description: "Please provide your Phone number and City.", variant: "destructive" });
             return;
         }
         // Validate Salary Range
         if (!validateSalaryRange(minSalary, maxSalary)) {
             // Toast is already shown by the validation function
             return;
         }
         setConfigureStep('review');
    } else if (configureStep === 'review') {
        // Review step is the last step before running
        handleStartTheLoop(); // Trigger simulation from review step's "Next" (now "START THE LOOP")
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
        <Badge variant="secondary" className="flex items-center gap-1">
            {label}
            <button onClick={onRemove} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                <CircleX className="h-3 w-3" />
                <span className="sr-only">Remove {label}</span>
            </button>
        </Badge>
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

  // Helper function to format salary range for display
  const formatSalaryRange = (min: string, max: string, currency: string): string => {
    if (!min && !max) return "Any salary";
    if (min && max) return `${currency} ${min} - ${max}`;
    if (min) return `From ${currency} ${min}`;
    if (max) return `Up to ${currency} ${max}`;
    return "Any salary";
  };

  // Styles for Google Places Autocomplete
  const autocompleteStyles = {
      input: (provided: any) => ({
        ...provided,
        height: '2.5rem', // Match ShadCN input height (h-10)
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem', // text-sm
        borderRadius: '0.375rem', // rounded-md
        borderColor: 'hsl(var(--input))', // Match ShadCN input border
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
        ':focus': {
          borderColor: 'hsl(var(--ring))',
          boxShadow: '0 0 0 2px hsl(var(--ring))',
          outline: 'none',
        }
      }),
      option: (provided: any, state: { isFocused: boolean }) => ({
        ...provided,
        backgroundColor: state.isFocused ? 'hsl(var(--secondary))' : 'hsl(var(--popover))',
        color: 'hsl(var(--popover-foreground))',
        fontSize: '0.875rem',
        padding: '0.5rem 0.75rem',
      }),
       singleValue: (provided: any) => ({
         ...provided,
         color: 'hsl(var(--foreground))',
       }),
      // Add other parts as needed (e.g., menu, dropdownIndicator)
       dropdownIndicator: (provided: any) => ({
         ...provided,
         color: 'hsl(var(--muted-foreground))',
         ':hover': {
           color: 'hsl(var(--foreground))',
         }
       }),
       container: (provided: any) => ({
            ...provided,
            width: '100%', // Ensure container takes full width
       }),
       menu: (provided: any) => ({
           ...provided,
           zIndex: 50, // Ensure dropdown is above other elements
           backgroundColor: 'hsl(var(--popover))',
           borderRadius: '0.375rem',
           border: '1px solid hsl(var(--border))',
           marginTop: '0.25rem',
       }),
  };


  const renderContent = () => {
     switch(viewState) {
         case 'statistics': // Render statistics dashboard first
            return <StatisticsDashboard onConfigure={navigateToConfigure} />;

         case 'configure':
            // Container for the configuration steps
             return (
                    <Card className="shadow-lg max-w-5xl mx-auto"> {/* Increased max-width */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                Automate your job search {/* Updated Title */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>A "Loop" represents an automated job search <br /> and application simulation based on your criteria.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </CardTitle>
                            {/* Removed CardDescription */}
                            {/* Stepper Component */}
                            <Stepper currentStep={configureStep} />
                        </CardHeader>


                    {/* --- Step 1: Search Info --- */}
                    {configureStep === 'searchInfo' && (
                         <CardContent className="space-y-8 border-t pt-6">
                            <h3 className="font-semibold text-lg mb-4">1. Complete your desired job info and location</h3>

                             {/* Job Titles */}
                             <div className="space-y-2">
                                <Label htmlFor="jobTitles">
                                    Job Titles <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="jobTitles"
                                    value={jobTitles}
                                    onChange={onJobTitlesChange}
                                    placeholder="e.g., Software Engineer, Product Manager"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    This job title will be used to search for jobs around the web. Separate multiple titles with commas.
                                </p>
                            </div>
                             {/* Job Location */}
                            <div className="space-y-2">
                                <Label htmlFor="jobLocation">Job Location</Label>
                                {isClient && googleMapsApiKey ? ( // Render Autocomplete only on client AND if API key exists
                                     <GooglePlacesAutocomplete
                                        apiKey={googleMapsApiKey} // Use stored variable
                                        selectProps={{
                                            value: jobLocation,
                                            onChange: onJobLocationChange,
                                            placeholder: 'e.g., Remote, New York, London',
                                            isDisabled: searchOnlyRemote,
                                            isClearable: true,
                                            styles: autocompleteStyles,
                                             inputId: "jobLocation", // For label association
                                        }}
                                        autocompletionRequest={{
                                             types: ['(cities)', '(regions)', 'country'], // Suggest cities, regions, countries
                                        }}
                                     />
                                ) : (
                                     <Input // Fallback for SSR or if Maps API key is missing
                                         id="jobLocation"
                                         value={jobLocation?.label || ''} // Display label if object exists
                                         onChange={(e) => onJobLocationChange({ label: e.target.value, value: { description: e.target.value } })} // Basic text input simulation
                                         placeholder="e.g., Remote, New York, London"
                                         disabled={searchOnlyRemote || !isClient || !googleMapsApiKey} // Also disable if not client-side
                                     />
                                )}
                                {!searchOnlyRemote && <p className="text-xs text-muted-foreground">
                                    Specify city, state, country, or "Remote". Required if not searching only remote.
                                </p>}
                                {!isClient && <p className="text-xs text-destructive mt-1">Location autocomplete requires client-side rendering.</p>}
                                {isClient && !googleMapsApiKey && <p className="text-xs text-destructive mt-1">Google Maps API key is missing. Location autocomplete disabled.</p>}
                            </div>
                            {/* Checkboxes */}
                             <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="searchOnlyRemote" checked={searchOnlyRemote} onCheckedChange={onSearchOnlyRemoteChange} />
                                  <Label htmlFor="searchOnlyRemote" className="font-normal">
                                       Search only for remote jobs
                                  </Label>
                                </div>
                                <div className={cn("flex items-center space-x-2 pl-6", !searchOnlyRemote && "opacity-50")}> {/* Indent and disable visually */}
                                   <Checkbox
                                       id="searchRemoteAnywhere"
                                       checked={searchRemoteAnywhere}
                                       onCheckedChange={onSearchRemoteAnywhereChange}
                                       disabled={!searchOnlyRemote}
                                   />
                                   <Label htmlFor="searchRemoteAnywhere" className={cn("font-normal", !searchOnlyRemote && "text-muted-foreground")}>
                                       Search for remote jobs anywhere in the world
                                   </Label>
                               </div>
                             </div>
                            {/* Search Job Boards */}
                             <div className="space-y-2">
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
                                <p className="text-xs text-muted-foreground">
                                    Choose specific platforms if you want to narrow your search. Leave it blank to allow all platforms for your profile.
                                </p>
                             </div>
                              {/* Enable Career Page Search */}
                              <div className="flex items-center space-x-2">
                                 <Checkbox id="enableCareerPageSearch" checked={enableCareerPageSearch} onCheckedChange={onEnableCareerPageSearchChange} />
                                 <Label htmlFor="enableCareerPageSearch" className="font-normal">
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="flex items-center gap-1">
                                                    Enable Career Page Job Search
                                                     <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Allows searching directly on company career pages.<br /> (This is a simulation feature)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                     </TooltipProvider>
                                 </Label>
                              </div>


                             {/* Experience and Job Type */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <Label htmlFor="experienceLevel">
                                          Experience <span className="text-destructive">*</span>
                                      </Label>
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
                                   <div className="space-y-2">
                                      <Label htmlFor="jobType">
                                          Job Type <span className="text-destructive">*</span>
                                      </Label>
                                      <Select value={jobType} onValueChange={onJobTypeChange} required>
                                          <SelectTrigger id="jobType">
                                              <SelectValue placeholder="Select job type..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="Full time">Full time</SelectItem>
                                              <SelectItem value="Part time">Part time</SelectItem>
                                              <SelectItem value="Contract">Contract</SelectItem>
                                              <SelectItem value="Internship">Internship</SelectItem>
                                              <SelectItem value="Temporary">Temporary</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                             </div>


                            {/* File Upload Area */}
                             <div className="space-y-2">
                                <Label htmlFor="resumeFileInput">
                                    Upload your CV (resume) <span className="text-destructive">*</span>
                                </Label>
                                 <Alert variant="default" className="bg-secondary border-secondary-foreground/10">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        <p className="font-medium mb-1">
                                            CURRENTLY SELECTED: {uploadedFile ? uploadedFile.name : "NO CVS UPLOADED YET"}
                                        </p>
                                        To get the most out of our platform, uploading your CV is important. Here's why:
                                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                            <li>Automate your applications by having your CV automatically attached to emails sent to companies.</li>
                                            <li>Apply directly to online forms effortlessly.</li>
                                            <li>Get better job matches tailored to your experience and skills.</li>
                                        </ul>
                                    </AlertDescription>
                                 </Alert>
                                <div
                                    className={cn(
                                        "relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background p-4 text-center transition-all hover:border-primary",
                                        uploadedFile && "border-primary bg-primary/5" // Indicate file selected visually
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
                                    <p className="text-xs text-muted-foreground mt-1">SELECT A PDF OR WORD FILE (MAX 5MB)</p>
                                    <Input
                                      type="file"
                                      id="resumeFileInput"
                                      className="absolute h-full w-full opacity-0 cursor-pointer"
                                      onChange={onFileChange}
                                      accept=".pdf,.doc,.docx" // Adjusted accept types
                                      required={!uploadedFile} // Required if no file is currently uploaded
                                    />
                                  </div>
                             </div>


                             {/* Simulation Notice */}
                             <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                               <AlertTriangle className="h-4 w-4 text-destructive" />
                                <AlertTitle className="text-destructive font-semibold">Simulation Notice</AlertTitle>
                                <AlertDescription className="text-destructive/90">
                                    This feature simulates the job application process. It **will not actually submit applications** on external websites.
                                </AlertDescription>
                             </Alert>
                         </CardContent>
                     )}

                     {/* --- Step 2: Email Template --- */}
                     {configureStep === 'emailTemplate' && (
                         <CardContent className="space-y-8 border-t pt-6">
                             <h3 className="font-semibold text-lg mb-4">2. Select or create a unique email template</h3>
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                 {/* Left: Template List */}
                                 <div className="lg:col-span-1 space-y-4">
                                     <Card className="overflow-hidden">
                                         <CardHeader className="bg-muted p-3 border-b">
                                             <CardTitle className="text-sm font-medium">Popular templates</CardTitle>
                                         </CardHeader>
                                         <ScrollArea className="h-[200px]">
                                             <CardContent className="p-2 space-y-1">
                                                {allTemplates.filter(t => !t.isUserTemplate).map(template => (
                                                    <Button
                                                        key={template.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "w-full justify-start h-auto py-1.5 px-2 text-xs", // Smaller text
                                                            selectedEmailTemplateId === template.id && "bg-secondary font-semibold"
                                                        )}
                                                        onClick={() => handleSelectTemplate(template.id)}
                                                    >
                                                        {/* Allow wrapping for longer names */}
                                                        <span className="whitespace-normal text-left leading-snug">{template.displayName}</span>
                                                        {selectedEmailTemplateId === template.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                    </Button>
                                                ))}
                                             </CardContent>
                                         </ScrollArea>
                                     </Card>
                                     <Card className="overflow-hidden">
                                         <CardHeader className="bg-muted p-3 border-b">
                                             <CardTitle className="text-sm font-medium">My templates</CardTitle>
                                         </CardHeader>
                                         <ScrollArea className="h-[150px]">
                                             <CardContent className="p-2 space-y-1">
                                                 {allTemplates.filter(t => t.isUserTemplate).map(template => (
                                                     <Button
                                                        key={template.id}
                                                        variant="ghost"
                                                        size="sm"
                                                         className={cn(
                                                            "w-full justify-start h-auto py-1.5 px-2 text-xs", // Smaller text
                                                            selectedEmailTemplateId === template.id && "bg-secondary font-semibold"
                                                        )}
                                                        onClick={() => handleSelectTemplate(template.id)}
                                                     >
                                                          <span className="whitespace-normal text-left leading-snug">{template.displayName}</span>
                                                          {selectedEmailTemplateId === template.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                     </Button>
                                                 ))}
                                                {allTemplates.filter(t => t.isUserTemplate).length === 0 && (
                                                     <p className="p-2 text-xs text-muted-foreground text-center">No custom templates created yet.</p>
                                                )}
                                            </CardContent>
                                         </ScrollArea>
                                          <CardFooter className="p-2 border-t">
                                             <Button variant="outline" size="sm" className="w-full" onClick={handleCreateTemplate}>
                                                 <Pencil className="mr-2 h-4 w-4" /> CREATE YOUR TEMPLATE
                                             </Button>
                                         </CardFooter>
                                     </Card>
                                 </div>


                                 {/* Right: Template Editor */}
                                 <div className="lg:col-span-2 space-y-4">
                                     <div className="space-y-1">
                                         <Label htmlFor="emailTemplateName">
                                             Email template name <span className="text-xs text-muted-foreground">(this is just an identifier)</span>
                                         </Label>
                                         <Input
                                             id="emailTemplateName"
                                             value={emailTemplateName}
                                             onChange={onEmailTemplateNameChange}
                                             placeholder="e.g., My Standard Application"
                                             disabled={selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate} // Disable editing for popular templates
                                         />
                                     </div>
                                      <div className="space-y-1">
                                         <Label htmlFor="emailSubject">Email subject</Label>
                                         <Input
                                             id="emailSubject"
                                             value={emailSubject}
                                             onChange={onEmailSubjectChange}
                                             placeholder="e.g., Application for {{JOB_TITLE}}"
                                             disabled={selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate} // Disable editing for popular templates
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
                                             disabled={selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate} // Disable editing for popular templates
                                         />
                                         <p className="text-xs text-muted-foreground">Hint: type {'{{'} to show the suggestions list (feature not implemented). NOTE: We will attach your CV to this email.</p>
                                     </div>
                                     {/* Updated Save Button Style */}
                                     {/* Only enable save if it's a new template or a user template */}
                                     <div className="flex items-center justify-between">
                                         <Button
                                              variant="default" // Black button
                                              onClick={handleSaveChanges}
                                              disabled={isSaving || (selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate)} // Disable if saving or popular template selected
                                              className="bg-primary text-primary-foreground hover:bg-primary/90" // Explicit black/white styling
                                          >
                                              <Check className="mr-2 h-4 w-4"/>
                                              {isSaving ? "Saving..." : "SAVE"}
                                              {hasUnsavedChanges && !isSaving && <span className="ml-2 text-xs opacity-70">(unsaved)</span>}
                                         </Button>
                                         {selectedEmailTemplateId && !allTemplates.find(t => t.id === selectedEmailTemplateId)?.isUserTemplate && (
                                              <p className="text-xs text-destructive">Popular templates cannot be edited. Create a new template to customize.</p>
                                          )}
                                      </div>


                                     {/* Send Test Email Section */}
                                     <Card className="bg-secondary/50">
                                         <CardHeader className="pb-2">
                                             <CardTitle className="text-base font-medium flex items-center gap-1"><Mail className="h-4 w-4"/> Send a test email</CardTitle>
                                             <CardDescription className="text-xs">This is the email a company will receive once your criteria match the job posting.</CardDescription>
                                         </CardHeader>
                                         <CardContent className="flex items-center gap-2 pt-0 pb-3">
                                             <Input
                                                 type="email"
                                                 placeholder="recipient@example.com"
                                                 value={testEmailRecipient}
                                                 onChange={onTestEmailRecipientChange}
                                                 className="h-8 text-xs"
                                             />
                                              <Button variant="outline" size="sm" onClick={handleSendTestEmail}>
                                                 <ChevronRight className="h-4 w-4 mr-1"/> SEND TEST EMAIL
                                            </Button>
                                         </CardContent>
                                     </Card>
                                 </div>
                            </div>
                         </CardContent>
                     )}


                     {/* --- Step 3: Settings --- */}
                     {configureStep === 'settings' && (
                          <CardContent className="space-y-8 border-t pt-6">
                              <h3 className="font-semibold text-lg mb-4">3. Fine-tune your automation settings</h3>

                              {/* Master Toggle */}
                               <Card className="bg-secondary/50">
                                 <CardContent className="p-4 flex items-start justify-between gap-4">
                                     <div>
                                         <Label htmlFor="masterAutoApply" className="font-semibold text-base flex items-center gap-1">
                                             <Bot className="h-5 w-5 text-primary"/> {masterAutoApply ? "Auto-Apply Active" : "Auto-Apply Disabled"}
                                         </Label>
                                         <p className="text-xs text-muted-foreground mt-1 pr-4">
                                             {masterAutoApply
                                                 ? "The Master Auto-apply toggle is enabled. Emails and form fills will proceed based on individual loop settings."
                                                 : "The Master Auto-apply toggle is disabled. Please enable it if you want to automatically send emails and fill-in job application forms."}
                                         </p>
                                     </div>
                                     <Switch id="masterAutoApply" checked={masterAutoApply} onCheckedChange={onMasterAutoApplyChange} />
                                 </CardContent>
                              </Card>


                              {/* Individual Toggles */}
                              <div className={cn("space-y-4", !masterAutoApply && "opacity-60 pointer-events-none")}> {/* Disable group if master is off */}
                                 <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                                     <div>
                                         <Label htmlFor="autoSendEmails" className="font-medium">Automatically send emails</Label>
                                         <p className="text-xs text-muted-foreground mt-1">
                                             Enable this to let our platform instantly send emails to matching companies, streamlining your job hunt. Prefer reviewing emails first? Simply turn this off to personalise messages, ensuring alignment with your preferences before dispatch.
                                         </p>
                                     </div>
                                     <Switch id="autoSendEmails" checked={autoSendEmails} onCheckedChange={onAutoSendEmailsChange} disabled={!masterAutoApply}/>
                                 </div>
                                 <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                                     <div>
                                         <Label htmlFor="autoFillForms" className="font-medium">Auto-fill Application Forms</Label>
                                         <p className="text-xs text-muted-foreground mt-1">
                                             Enable this to allow our platform to automatically submit job application forms on your behalf.
                                         </p>
                                     </div>
                                     <Switch id="autoFillForms" checked={autoFillForms} onCheckedChange={onAutoFillFormsChange} disabled={!masterAutoApply}/>
                                 </div>
                              </div>


                             {/* Additional Form Fields */}
                              <Card>
                                 <CardHeader>
                                     <CardTitle className="text-base font-semibold">Additional Fields for Form Applications</CardTitle>
                                     <CardDescription className="text-xs">The below fields are asked by most companies in order to let you apply online. We need to save your answers in order to be able to apply online for you.</CardDescription>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                     {/* Phone Number */}
                                    <div className="flex items-end gap-2">
                                        <div className="w-24 flex-shrink-0">
                                            <Label htmlFor="phoneCountryCode">Phone <span className="text-destructive">*</span></Label>
                                             <Select value={phoneCountryCode} onValueChange={onPhoneCountryCodeChange} required>
                                                 <SelectTrigger id="phoneCountryCode" className="mt-1 h-9 text-xs">
                                                     <SelectValue placeholder="Code"/>
                                                 </SelectTrigger>
                                                 <SelectContent>
                                                     <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                                     <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                                     <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                                     <SelectItem value="+33">🇫🇷 +33</SelectItem>
                                                     <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                                     {/* Add more country codes */}
                                                 </SelectContent>
                                             </Select>
                                        </div>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={onPhoneNumberChange}
                                            placeholder="Phone Number"
                                            required
                                            className="h-9 text-xs"
                                        />
                                    </div>


                                     {/* City */}
                                     <div className="space-y-1">
                                         <Label htmlFor="cityLocation">City <span className="text-destructive">*</span></Label>
                                          {isClient && googleMapsApiKey ? ( // Check client and API key
                                              <GooglePlacesAutocomplete
                                                 apiKey={googleMapsApiKey} // Use variable
                                                 selectProps={{
                                                      value: cityLocation,
                                                      onChange: onCityLocationChange,
                                                      placeholder: 'Location that you are based in',
                                                      isClearable: true,
                                                      styles: autocompleteStyles,
                                                      inputId: "cityLocation",
                                                 }}
                                                 autocompletionRequest={{
                                                      types: ['(cities)'], // Suggest only cities
                                                 }}
                                             />
                                         ) : (
                                             <Input
                                                 id="cityLocation"
                                                 value={cityLocation?.label || ''}
                                                 onChange={(e) => onCityLocationChange({ label: e.target.value, value: { description: e.target.value } })}
                                                 placeholder="Location that you are based in"
                                                 required
                                                 className="h-9 text-xs"
                                                 disabled={!isClient || !googleMapsApiKey} // Also disable if not client-side
                                             />
                                         )}
                                         {!isClient && <p className="text-xs text-destructive mt-1">Location autocomplete requires client-side rendering.</p>}
                                         {isClient && !googleMapsApiKey && <p className="text-xs text-destructive mt-1">Google Maps API key is missing. Location autocomplete disabled.</p>}
                                     </div>


                                     {/* Cover Letter */}
                                    <div className="space-y-1">
                                         <Label htmlFor="coverLetterContent">Cover letter</Label>
                                         <div className="flex items-center gap-2">
                                             <Textarea
                                                 id="coverLetterContent"
                                                 value={coverLetterContent}
                                                 onChange={onCoverLetterContentChange}
                                                 rows={4}
                                                 className="text-xs"
                                                 placeholder="Enter your generic cover letter template..."
                                             />
                                             <Button variant="outline" size="sm" className="self-start">
                                                 <Pencil className="h-3 w-3"/>
                                                 <span className="sr-only">Edit Cover Letter</span>
                                             </Button>
                                         </div>
                                     </div>
                                 </CardContent>
                             </Card>


                             {/* Salary Range */}
                              <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                                        <span>Desired salary range</span>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">(Learn More - Not Impl.)</Button>
                                    </CardTitle>
                                    <CardDescription className="text-xs flex items-center gap-1">
                                        <Info className="h-3 w-3 flex-shrink-0"/> Set your desired salary range to filter job matches. Only jobs with reported salaries that match your criteria will be included.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-2 items-end">
                                     <div className="space-y-1">
                                          <Label htmlFor="desiredSalaryCurrency" className="text-xs">Currency</Label>
                                          <Select value={desiredSalaryCurrency} onValueChange={onDesiredSalaryCurrencyChange}>
                                              <SelectTrigger id="desiredSalaryCurrency" className="h-9 text-xs">
                                                  <SelectValue placeholder="Select Currency" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                                  <SelectItem value="USD">USD ($)</SelectItem>
                                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                                  {/* Add more currencies */}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <div className="space-y-1">
                                          <Label htmlFor="minSalary" className="text-xs">Min Salary</Label>
                                          <Input id="minSalary" type="number" placeholder="e.g., 50000" value={minSalary} onChange={onMinSalaryChange} className="h-9 text-xs"/>
                                      </div>
                                       <div className="space-y-1">
                                          <Label htmlFor="maxSalary" className="text-xs">Max Salary</Label>
                                          <Input id="maxSalary" type="number" placeholder="e.g., 80000" value={maxSalary} onChange={onMaxSalaryChange} className="h-9 text-xs"/>
                                      </div>
                                 </CardContent>
                             </Card>


                              {/* Filtering Section */}
                              <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold">Filtering Options</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     {/* Exclude Companies */}
                                     <div className="space-y-2">
                                         <Label htmlFor="excludeCompaniesInput">
                                             Do you want to exclude some companies?
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1 mb-0.5" /></TooltipTrigger>
                                                      <TooltipContent><p>Select companies that will not be part of your search.</p></TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                         </Label>
                                         <div className="flex gap-2">
                                              <Input
                                                id="excludeCompaniesInput"
                                                value={excludeCompaniesInput}
                                                onChange={(e) => setExcludeCompaniesInput(e.target.value)}
                                                placeholder="Enter company name"
                                                className="h-8 text-xs"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword('company')}
                                               />
                                               <Button variant="outline" size="sm" onClick={() => handleAddKeyword('company')} className="h-8">Add</Button>
                                         </div>
                                         {excludedCompanies.length > 0 && (
                                             <div className="mt-2 space-y-1">
                                                 <p className="text-xs font-medium text-muted-foreground">Companies you have chosen</p>
                                                 <div className="flex flex-wrap gap-1">
                                                       {excludedCompanies.map(company => (
                                                           <ItemChip key={company} label={company} onRemove={() => handleRemoveItem('company', company)} />
                                                      ))}
                                                  </div>
                                             </div>
                                         )}
                                         {excludedCompanies.length === 0 && <p className="text-xs text-muted-foreground mt-1">You don't have any excluded companies selected for this Loop.</p>}
                                     </div>


                                      {/* Include Keywords */}
                                     <div className="space-y-2">
                                         <Label htmlFor="includeKeywordsInput">
                                             Select the keywords that should be present in the job posting
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1 mb-0.5" /></TooltipTrigger>
                                                      <TooltipContent><p>Keywords that must be included in job description.</p></TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                         </Label>
                                         <div className="flex gap-2">
                                              <Input
                                                id="includeKeywordsInput"
                                                value={includeKeywordsInput}
                                                onChange={(e) => setIncludeKeywordsInput(e.target.value)}
                                                placeholder="Enter keyword"
                                                className="h-8 text-xs"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword('include')}
                                              />
                                               <Button variant="outline" size="sm" onClick={() => handleAddKeyword('include')} className="h-8">Add</Button>
                                         </div>
                                          {includedKeywords.length > 0 && (
                                              <div className="mt-2 space-y-1">
                                                  <p className="text-xs font-medium text-muted-foreground">Keywords you have chosen</p>
                                                  <div className="flex flex-wrap gap-1">
                                                       {includedKeywords.map(keyword => (
                                                           <ItemChip key={keyword} label={keyword} onRemove={() => handleRemoveItem('include', keyword)} />
                                                       ))}
                                                   </div>
                                              </div>
                                          )}
                                        {includedKeywords.length === 0 && <p className="text-xs text-muted-foreground mt-1">You don't have any keywords selected.</p>}
                                     </div>


                                     {/* Exclude Keywords */}
                                    <div className="space-y-2">
                                         <Label htmlFor="excludeKeywordsInput">
                                             Exclude keywords
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1 mb-0.5" /></TooltipTrigger>
                                                      <TooltipContent><p>Keywords that must NOT be included in job description.</p></TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                         </Label>
                                         <div className="flex gap-2">
                                               <Input
                                                 id="excludeKeywordsInput"
                                                 value={excludeKeywordsInput}
                                                 onChange={(e) => setExcludeKeywordsInput(e.target.value)}
                                                 placeholder="Enter keyword to exclude"
                                                 className="h-8 text-xs"
                                                 onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword('exclude')}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleAddKeyword('exclude')} className="h-8">Add</Button>
                                         </div>
                                          {excludedKeywords.length > 0 && (
                                              <div className="mt-2 space-y-1">
                                                  <p className="text-xs font-medium text-muted-foreground">Keywords you have chosen</p>
                                                  <div className="flex flex-wrap gap-1">
                                                       {excludedKeywords.map(keyword => (
                                                           <ItemChip key={keyword} label={keyword} onRemove={() => handleRemoveItem('exclude', keyword)} />
                                                       ))}
                                                   </div>
                                              </div>
                                          )}
                                        {excludedKeywords.length === 0 && <p className="text-xs text-muted-foreground mt-1">You don't have any keywords selected.</p>}
                                     </div>
                                </CardContent>
                             </Card>


                             {/* Job Match Level */}
                             <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Please choose the level of the job match you prefer</CardTitle>
                                     <p className="text-sm text-primary font-medium">
                                        Our Auto-Apply will <span className="font-bold">{getJobMatchText(jobMatchLevel)}</span> match with your preferences.
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4 space-y-3">
                                    <Slider
                                        value={[jobMatchLevel]}
                                        onValueChange={onJobMatchLevelChange}
                                        max={2}
                                        step={1}
                                        className="w-[80%] mx-auto"
                                    />
                                     <div className="flex justify-between text-xs text-muted-foreground w-[80%] mx-auto">
                                        <span>Low</span>
                                        <span>Middle</span>
                                        <span>High</span>
                                     </div>

                                      <Alert variant="default" className="mt-4 bg-secondary/50">
                                       <Info className="h-4 w-4 text-muted-foreground" />
                                        <AlertTitle className="font-semibold">Important Note</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            {getJobMatchLevelDescription(jobMatchLevel)} {/* Dynamic description here */}
                                        </AlertDescription>
                                      </Alert>
                                </CardContent>
                             </Card>

                          </CardContent>
                      )}


                     {/* --- Step 4: Review --- */}
                     {configureStep === 'review' && (
                         <CardContent className="space-y-8 border-t pt-6">
                             <h3 className="font-semibold text-lg mb-4">Review the details and start your loop</h3>
                             <h2 className="text-2xl font-bold text-primary">{jobTitles}</h2>
                             <p className="text-sm text-muted-foreground mb-6">Job Title</p>

                              {/* Search Info Section */}
                             <div className="space-y-4">
                                 <h4 className="font-semibold text-md text-muted-foreground mb-2">Search Info</h4>
                                 <ReviewDetail icon={MapPin} label="Job Location" value={searchOnlyRemote ? (searchRemoteAnywhere ? "Remote Anywhere" : "Remote") : (jobLocation?.label || 'N/A')} />
                                 <ReviewDetail icon={Search} label="Job Board Platform" value={searchJobBoards} />
                                 <ReviewDetail icon={Briefcase} label="Experience" value={experienceLevel} />
                                 <ReviewDetail icon={Clock} label="Job Type" value={jobType} />
                                 <ReviewDetail icon={ListFilter} label="Keywords" value={includedKeywords.length > 0 ? includedKeywords.join(', ') : "No keywords"} />
                                 <ReviewDetail icon={ListX} label="Excluded Keywords" value={excludedKeywords.length > 0 ? excludedKeywords.join(', ') : "No keywords"} />
                                 <ReviewDetail icon={Ban} label="Excluded Companies" value={excludedCompanies.length > 0 ? excludedCompanies.join(', ') : "No excluded companies"} />
                                 <ReviewDetail icon={DollarSign} label="Salary Range" value={formatSalaryRange(minSalary, maxSalary, desiredSalaryCurrency)} />
                                 <Separator />
                             </div>


                             {/* Your Info Section */}
                             <div className="space-y-4">
                                <h4 className="font-semibold text-md text-muted-foreground mb-2">Your Info</h4>
                                 <ReviewDetail icon={Phone} label="Phone number" value={`${phoneCountryCode} ${phoneNumber}`} />
                                 <ReviewDetail icon={FileText} label="Uploaded CV" value={uploadedFile?.name} />
                                 <ReviewDetail icon={Mail} label="Personal email" value={testEmailRecipient} /> {/* Using test recipient as placeholder */}
                                 <Separator />
                              </div>

                             {/* Options Section */}
                              <div className="space-y-4">
                                 <h4 className="font-semibold text-md text-muted-foreground mb-2">Options</h4>
                                  <div className="flex items-center justify-between">
                                       <ReviewDetail icon={Send} label="Automatic Emails" value="This loop automatically sends emails when we are able to find the company email" />
                                       <Switch checked={autoSendEmails} disabled className="pointer-events-none"/>
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <ReviewDetail icon={FormInput} label="Automatic Form Applications" value="This loop applies to platforms automatically when possible" />
                                      <Switch checked={autoFillForms} disabled className="pointer-events-none"/>
                                  </div>
                                 <Separator />
                              </div>


                             {/* Email Template Preview Section */}
                             <div className="space-y-4">
                                 <h4 className="font-semibold text-md text-muted-foreground mb-2">Email Template</h4>
                                 <div className="p-4 border rounded-md bg-secondary/50 text-sm">
                                     <p className="font-medium mb-2">Subject: {emailSubject}</p>
                                     <div className="whitespace-pre-wrap">{emailBody}</div>
                                 </div>
                                 <Separator />
                              </div>


                              {/* Cover Letter Preview Section */}
                             <div className="space-y-4">
                                 <h4 className="font-semibold text-md text-muted-foreground mb-2">Cover Letter</h4>
                                 <div className="p-4 border rounded-md bg-secondary/50 text-sm whitespace-pre-wrap">
                                     {coverLetterContent}
                                 </div>
                              </div>
                         </CardContent>
                     )}


                    <CardFooter className="flex justify-between border-t pt-6">
                         {/* Back Button */}
                         {configureStep === 'searchInfo' ? (
                            <Link href="/auto-apply" passHref>
                                 <Button variant="outline" onClick={() => setViewState('statistics')}>
                                     <ArrowLeft className="mr-2 h-4 w-4"/> Back to Stats
                                 </Button>
                            </Link>
                         ) : (
                            <Button variant="outline" onClick={handlePreviousStep}>
                                 <ChevronLeft className="mr-2 h-4 w-4"/> PREVIOUS
                            </Button>
                         )}

                         {/* Action Buttons */}
                         <div className="flex gap-2">
                             {/* Show "START THE LOOP" only on the final (review) step */}
                              {configureStep === 'review' ? (
                                <Button
                                    variant="default"
                                    onClick={handleStartTheLoop} // Use the specific handler
                                    className="bg-primary text-primary-foreground hover:bg-primary/90" // Explicit black/white
                                >
                                    START THE LOOP {/* Changed label */}
                                </Button>
                             ) : (
                                <Button onClick={handleNextStep}>
                                    NEXT <ChevronRight className="ml-2 h-4 w-4"/>
                                 </Button>
                             )}
                         </div>
                    </CardFooter>
                </Card>
            );
        case 'applying':
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                    <LoadingSpinner />
                    <p className="text-lg font-semibold text-primary">
                        Simulating Job Search & Applications...
                    </p>
                    <p className="text-muted-foreground">
                        This is a simulation based on your loop configuration. Please wait.
                    </p>
                </div>
            );
        case 'results':
             return (
                 <Card className="shadow-lg max-w-4xl mx-auto">
                     <CardHeader>
                          <CardTitle className="text-xl font-semibold text-center">
                              <CircleCheck className="h-8 w-8 text-primary mx-auto mb-2" /> Simulated Application Results
                          </CardTitle>
                         <CardDescription className="text-center">
                             Overview of the jobs the simulation attempted to apply for based on your loop configuration.
                         </CardDescription>
                     </CardHeader>
                     <CardContent className="max-h-[60vh] overflow-y-auto p-4 border-t border-b">
                          {appliedJobs.length > 0 ? (
                            <div className="space-y-3">
                                {appliedJobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between rounded-md border p-3 bg-background">
                                          <div>
                                             <p className="font-medium">{job.title} - <span className="text-muted-foreground">{job.company}</span></p>
                                             <p className="text-xs text-muted-foreground">{job.location} - Simulated: {job.appliedDate}</p>
                                          </div>
                                          <Badge variant={job.status === 'Applied' ? 'default' : 'destructive'} className="text-xs">
                                              {job.status === 'Applied' ? <Check className="h-3 w-3 mr-1"/> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                             {job.status}
                                          </Badge>
                                     </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No simulated applications were processed in this run.</p>
                        )}
                     </CardContent>
                      <CardFooter className="flex justify-between pt-4">
                         <Button variant="outline" onClick={navigateToConfigure}>
                              <Settings className="mr-2 h-4 w-4"/> Configure New Loop
                         </Button>
                         <Button variant="secondary" onClick={() => setViewState('statistics')}>
                             <BarChart className="mr-2 h-4 w-4"/> Back to Stats {/* Changed icon */}
                         </Button>
                     </CardFooter>
                 </Card>
             );
        case 'error':
             return (
                 <Card className="shadow-lg max-w-md mx-auto text-center">
                     <CardHeader>
                          <CardTitle className="text-xl font-semibold text-destructive">
                              <CircleX className="h-8 w-8 text-destructive mx-auto mb-2" /> Simulation Error
                          </CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-muted-foreground">
                             {errorMessage || "An unexpected error occurred during the simulation."}
                         </p>
                     </CardContent>
                      <CardFooter className="flex justify-center gap-4 pt-4">
                         <Button variant="outline" onClick={navigateToConfigure}>
                             <RefreshCcw className="mr-2 h-4 w-4"/> Try Again
                         </Button>
                         <Button variant="secondary" onClick={() => setViewState('statistics')}>
                            <BarChart className="mr-2 h-4 w-4"/> Back to Stats
                         </Button>
                      </CardFooter>
                 </Card>
             );
     }
  };


  return (
    <div className="container mx-auto min-h-screen flex flex-col p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        {/* Adjust title based on view state */}
        <h1 className="text-xl md:text-2xl font-semibold text-primary text-center flex-grow">
            {viewState === 'statistics' ? 'Auto Apply Dashboard' : 'Automated Job Application (Simulation)'}
        </h1>
         {/* Keep consistent spacing */}
        <div className="w-[160px] text-right"> {/* Adjusted width */}
            {viewState === 'configure' && (
                <Button variant="ghost" size="sm" onClick={() => setViewState('statistics')}>
                    Cancel
                </Button>
            )}
        </div>
      </header>

      {/* Use TooltipProvider at a higher level if not already present */}
      <TooltipProvider>
         <main className="flex-grow"> {/* Add flex-grow to main */}
            {renderContent()}
         </main>
      </TooltipProvider>

      {/* Footer is now outside the main content rendering */}
      <footer className="mt-auto border-t pt-6 text-center text-sm text-muted-foreground"> {/* Use mt-auto */}
         © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
      </footer>
    </div>
  );
}
