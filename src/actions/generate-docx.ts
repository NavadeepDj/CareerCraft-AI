'use server';

import { PatchDocument, patchDocument, TextRun } from 'docx';
import { promises as fs } from 'fs';
import path from 'path';
import { Buffer } from 'buffer'; // Import Buffer

/**
 * Type definition for the resume data structure expected by the action.
 */
type ResumeData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  profile?: string;
  employmentHistory?: string;
  education?: string;
  skills?: string;
  references?: string;
  hobbies?: string;
  languages?: string;
  academicProjects?: string;
  [key: string]: string | undefined; // Allow other string properties
};

/**
 * Server action to patch a DOCX template with resume data.
 *
 * @param resumeData An object containing the resume data. Placeholders in the template should be like {key}.
 * @param templatePath The relative path to the DOCX template file within the public directory (e.g., '/templates/template.docx').
 * @returns A Promise that resolves to a Blob containing the generated DOCX data, or null on error.
 */
export async function generateDocxAction(resumeData: ResumeData, templatePath: string): Promise<Blob | null> {
  try {
    console.log(`[generateDocxAction] Starting DOCX generation for template: ${templatePath}`);
    console.log('[generateDocxAction] Resume Data:', resumeData); // Log received data

    // Construct the absolute path to the template file in the public directory
    const absoluteTemplatePath = path.join(process.cwd(), 'public', templatePath);
    console.log(`[generateDocxAction] Absolute template path: ${absoluteTemplatePath}`);

    // Read the template file
    const templateBuffer = await fs.readFile(absoluteTemplatePath);
    console.log(`[generateDocxAction] Template file read successfully (${templateBuffer.length} bytes).`);

    // Prepare patches object for the docx library
    // Handle potential multi-line strings by splitting them into TextRun arrays
    const patches: { [key: string]: { type: 'text'; text?: string; runs?: TextRun[] } } = {};
    for (const key in resumeData) {
      if (Object.prototype.hasOwnProperty.call(resumeData, key) && resumeData[key]) {
        const value = resumeData[key] || ''; // Ensure value is a string
        if (value.includes('\n')) {
          // Split into lines and create TextRun for each line break
          const runs = value.split('\n').flatMap((line, index, arr) =>
            index === arr.length - 1 ? [new TextRun(line)] : [new TextRun(line), new TextRun({ break: 1 })]
          );
           patches[key] = {
             type: 'text', // Use 'text' type even for multi-line, specifying 'runs'
             runs: runs,
           };
        } else {
          // Single line text
          patches[key] = {
            type: 'text',
            text: value,
          };
        }
      } else if (Object.prototype.hasOwnProperty.call(resumeData, key)) {
        // Add empty string for keys present but with empty/null/undefined values to clear placeholders
         patches[key] = {
           type: 'text',
           text: '',
         };
      }
    }
    console.log('[generateDocxAction] Patches prepared:', patches);


    // Patch the document
    const patchedDocBuffer = await patchDocument(templateBuffer, { patches });
    console.log(`[generateDocxAction] Document patched successfully (${patchedDocBuffer.byteLength} bytes).`);

    // Convert the generated ArrayBuffer to a Blob
    const blob = new Blob([patchedDocBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    console.log('[generateDocxAction] Blob created successfully.');

    return blob;

  } catch (error) {
    console.error("Error generating DOCX in server action:", error);
    // You might want to throw a more specific error or return a custom error object
    return null; // Indicate failure
  }
}
