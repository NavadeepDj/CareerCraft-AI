'use server';

import htmlToDocx from 'html-to-docx';
import { Buffer } from 'buffer'; // Import Buffer

/**
 * Server action to convert HTML string to a DOCX Blob.
 *
 * @param htmlString The HTML string to convert, expected to be a full HTML document including basic styles.
 * @returns A Promise that resolves to a Blob containing the DOCX data, or null on error.
 */
export async function generateDocxAction(htmlString: string): Promise<Blob | null> {
  try {
    // Ensure html-to-docx runs on the server where 'fs' is available (if needed internally by the lib)
    // Pass the full HTML string with inline styles or embedded <style> tag
    const fileBuffer = await htmlToDocx(htmlString, undefined, {
      margins: { top: 720, right: 720, bottom: 720, left: 720 }, // Standard 1-inch margins
      // Add other options if needed, e.g., numberSections: false
    });

    // Ensure fileBuffer is defined and is a Buffer or ArrayBuffer
    if (!fileBuffer || (typeof fileBuffer !== 'object') || (!Buffer.isBuffer(fileBuffer) && !(fileBuffer instanceof ArrayBuffer))) {
        console.error("htmlToDocx did not return a valid buffer.");
        return null;
    }

    // Convert ArrayBuffer/Buffer to Blob
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    return blob;

  } catch (error) {
    console.error("Error generating DOCX in server action:", error);
    // You might want to throw a more specific error or return a custom error object
    return null; // Indicate failure
  }
}