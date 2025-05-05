// src/components/resume-preview.tsx
import React from 'react';
import type { ResumeData } from '@/app/resume-builder/page'; // Adjust path if needed
import { cn } from '@/lib/utils';

interface ResumePreviewProps {
  data: ResumeData;
}

/**
 * Renders a styled HTML preview of the resume, mimicking a DOCX document.
 */
const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {

  // Helper to format multi-line text (like education, projects, etc.)
  const formatMultilineText = (text: string) => {
    return text.split('\n').map((line, index) => (
      // Using <p> for each line and adding margin for spacing between entries (double line breaks)
      <p key={index} className={cn(line.trim() === '' ? 'mt-2' : '')}>
        {line || <>&nbsp;</>} {/* Render non-breaking space for empty lines to maintain spacing */}
      </p>
    ));
  };

  return (
    // A4-like aspect ratio container with padding and background
    <div className="p-8 bg-white text-black aspect-[210/297] w-[210mm] min-h-[297mm] mx-auto my-4 shadow-lg">
      {/* Using prose for basic document styling */}
       <article className="prose prose-sm max-w-none document-preview"> {/* Applied new class */}
        {/* Header Section */}
        <header className="text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold mb-1">{data.firstName} {data.lastName}</h1>
          <p className="text-base font-semibold text-primary mb-2">{data.jobTitle}</p>
          <div className="flex justify-center gap-4 text-xs">
            <span>{data.address}</span>
            <span>|</span>
            <span>{data.phone}</span>
            <span>|</span>
            <span>{data.email}</span>
          </div>
        </header>

        {/* Profile Summary */}
        {data.profile && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Profile Summary</h2>
            <p>{data.profile}</p>
          </section>
        )}

        {/* Skills */}
        {data.skills && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Skills</h2>
            {/* Display skills possibly as a list or comma-separated */}
            <p>{data.skills}</p>
            {/* Or alternatively, as a list:
            <ul className="list-disc pl-5">
              {data.skills.split(',').map((skill, index) => skill.trim() && <li key={index}>{skill.trim()}</li>)}
            </ul>
            */}
          </section>
        )}

        {/* Education */}
        {data.education && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Education</h2>
            <div>{formatMultilineText(data.education)}</div>
          </section>
        )}

         {/* Academic Projects */}
         {data.academicProjects && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Academic Projects</h2>
             <div>{formatMultilineText(data.academicProjects)}</div>
           </section>
         )}

         {/* Employment History */}
         {data.employmentHistory && (
           <section className="mb-4">
             <h2 className="text-base font-bold border-b mb-2 pb-1">Employment History</h2>
             <div>{formatMultilineText(data.employmentHistory)}</div>
           </section>
         )}

        {/* Languages */}
        {data.languages && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Languages</h2>
            <div>{formatMultilineText(data.languages)}</div>
          </section>
        )}

        {/* Hobbies */}
        {data.hobbies && (
          <section className="mb-4">
            <h2 className="text-base font-bold border-b mb-2 pb-1">Hobbies</h2>
            <p>{data.hobbies}</p>
          </section>
        )}

        {/* References */}
        {data.references && (
          <section>
            <h2 className="text-base font-bold border-b mb-2 pb-1">References</h2>
            <div>{formatMultilineText(data.references)}</div>
          </section>
        )}
      </article>
    </div>
  );
};

export default ResumePreview;
