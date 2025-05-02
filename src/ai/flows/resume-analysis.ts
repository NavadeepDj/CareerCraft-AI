// src/ai/flows/resume-analysis.ts
'use server';
/**
 * @fileOverview An AI agent that analyzes a resume against a job description and provides feedback.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to match the resume against.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  matchScore: z
    .number()
    .describe('A score indicating how well the resume matches the job description.'),
  feedback: z.string().describe('Feedback on the resume and suggestions for improvement.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {
    schema: z.object({
      resumeDataUri: z
        .string()
        .describe(
          "A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      jobDescription: z.string().describe('The job description to match the resume against.'),
    }),
  },
  output: {
    schema: z.object({
      matchScore: z
        .number()
        .describe('A score indicating how well the resume matches the job description.'),
      feedback: z.string().describe('Feedback on the resume and suggestions for improvement.'),
    }),
  },
  prompt: `You are an AI resume analyzer. You will analyze a resume against a job description and provide feedback on how well the resume matches the job requirements. Also provide suggestions for improvement.

Job Description: {{{jobDescription}}}

Resume: {{media url=resumeDataUri}}

Match Score: 
Feedback:`, // DO NOT put the score in Handlebars, the model should generate the score.
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
    return output!;
  }
);
