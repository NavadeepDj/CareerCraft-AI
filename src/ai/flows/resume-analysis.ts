// src/ai/flows/resume-analysis.ts
'use server';
/**
 * @fileOverview An AI agent that analyzes a resume against a job description, calculates an ATS score, and provides feedback.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input schema requires either resumeDataUri OR resumeText, plus the job description.
const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .optional()
    .describe(
      "The resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Either this or resumeText must be provided."
    ),
   resumeText: z
    .string()
    .optional()
    .describe("The resume content as plain text. Either this or resumeDataUri must be provided."),
  jobDescription: z.string().describe('The job description to match the resume against.'),
}).refine(data => data.resumeDataUri || data.resumeText, {
    message: "Either resumeDataUri or resumeText must be provided.",
    path: ["resumeDataUri", "resumeText"], // Indicate which fields are involved
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

// Updated output schema based on the Python code's calculate_ats_score function
const AnalyzeResumeOutputSchema = z.object({
  atsScore: z
    .number()
    .min(0).max(100)
    .describe('The overall ATS (Applicant Tracking System) score out of 100.'),
  keywordMatchScore: z
    .number()
    .min(0).max(20)
    .describe('The score for keyword match percentage (out of 20).'),
  skillsAlignmentScore: z
    .number()
    .min(0).max(20)
    .describe('The score for skills alignment (out of 20).'),
  experienceRelevanceScore: z
    .number()
    .min(0).max(20)
    .describe('The score for experience relevance (out of 20).'),
  educationMatchScore: z
    .number()
    .min(0).max(20)
    .describe('The score for education match (out of 20).'),
  formattingReadabilityScore: z
    .number()
    .min(0).max(20)
    .describe('The score for formatting and readability (out of 20).'),
  explanation: z
    .string()
    .describe('Detailed explanation of each score component and suggestions for improvement.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;


export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  // Add validation before calling the flow
  if (!input.resumeDataUri && !input.resumeText) {
      throw new Error("No resume content provided. Please upload a file or paste text.");
  }
  if (!input.jobDescription) {
       throw new Error("Job description is required for analysis.");
  }
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {
    schema: AnalyzeResumeInputSchema, // Use the updated input schema
  },
  output: {
    schema: AnalyzeResumeOutputSchema, // Use the updated output schema
  },
  // Updated prompt based on the Python code's calculate_ats_score function
  prompt: `You are an expert AI resume analyzer acting as an Applicant Tracking System (ATS). Analyze the following resume against the job description provided. Calculate an ATS score out of 100 and provide a detailed breakdown.

Job Description:
{{{jobDescription}}}

Resume Content:
{{#if resumeText}}
{{{resumeText}}}
{{else}}
{{media url=resumeDataUri}}
{{/if}}

Provide the score and explanation in the following format strictly adhering to the field descriptions in the output schema:
ATS Score: [score]/100

Breakdown:
1. Keyword match: [score]/20
2. Skills alignment: [score]/20
3. Experience relevance: [score]/20
4. Education match: [score]/20
5. Formatting and readability: [score]/20

Explanation:
[Detailed explanation of each score component and actionable suggestions for improvement based *only* on the provided resume and job description. Be specific about keywords, skills, and experiences.]`,
});

const analyzeResumeFlow = ai.defineFlow<
  typeof AnalyzeResumeInputSchema,
  typeof AnalyzeResumeOutputSchema
>(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI analysis failed to generate a response.");
    }
    // Basic validation to ensure the score is within range, though schema handles this.
    if (output.atsScore < 0 || output.atsScore > 100) {
        console.warn("ATS score out of range, clamping.", output.atsScore);
        output.atsScore = Math.max(0, Math.min(100, output.atsScore));
    }
    // Similarly check breakdown scores
    output.keywordMatchScore = Math.max(0, Math.min(20, output.keywordMatchScore));
    output.skillsAlignmentScore = Math.max(0, Math.min(20, output.skillsAlignmentScore));
    output.experienceRelevanceScore = Math.max(0, Math.min(20, output.experienceRelevanceScore));
    output.educationMatchScore = Math.max(0, Math.min(20, output.educationMatchScore));
    output.formattingReadabilityScore = Math.max(0, Math.min(20, output.formattingReadabilityScore));

    return output;
  }
);
