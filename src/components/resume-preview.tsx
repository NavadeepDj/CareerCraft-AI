// src/components/resume-preview.tsx
import React from 'react';
import type { ResumeData } from '@/app/resume-builder/page'; // Adjust path if needed
import { cn } from '@/lib/utils';

interface ResumePreviewProps {
  data: ResumeData;
}

/**
 * Renders a styled HTML preview of the resume, attempting to mimic a DOCX document.
 * Relies on styles defined in globals.css under the .document-preview class.
 */
const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {

  // Helper to format multi-line text, handling potential empty lines and basic structure
  const formatMultilineText = (text: string) => {
     // Split by double newline first for paragraphs, then single for lines within
     return text.split('\n\n').map((paragraph, pIndex) => (
         <p key={`p-${pIndex}`} className={paragraph.trim() === '' ? 'h-4' : 'mb-2'}>
             {paragraph.split('\n').map((line, lIndex) => {
                 // Basic handling for potential list-like items (starting with - or *)
                 if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                     return (
                         <span key={`l-${pIndex}-${lIndex}`} className="block pl-4 relative before:content-['•'] before:absolute before:left-0">
                           {line.trim().substring(2)}
                         </span>
                     );
                 }
                 // Render line breaks within paragraph for single newlines
                 return (
                     <React.Fragment key={`l-${pIndex}-${lIndex}`}>
                       {line}
                       <br />
                     </React.Fragment>
                 );
             }).slice(0, -1)} {/* Remove trailing <br> added by map */}
         </p>
     ));
  };

  // Helper to format simple lists (like skills, languages)
   const formatSimpleList = (text: string, separator: string | RegExp = '\n') => {
     return text.split(separator).map((item, index) => (
       item.trim() && <li key={index}>{item.trim()}</li>
     ));
   };

  return (
    // A4-like container with padding and background, applying document-preview styles
    <div className="p-[2.5cm] bg-white text-black aspect-[210/297] w-[210mm] min-h-[297mm] mx-auto my-4 shadow-lg overflow-auto">
       <article className="prose prose-sm max-w-none document-preview">
        {/* Header Section - Centered */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1 name">{data.firstName} {data.lastName}</h1>
          {data.jobTitle && <p className="text-base font-semibold text-primary mb-2 job-title">{data.jobTitle}</p>}
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs contact-info">
            {data.address && <span>{data.address}</span>}
            {data.address && (data.phone || data.email) && <span className="separator">|</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.phone && data.email && <span className="separator">|</span>}
            {data.email && <span>{data.email}</span>}
          </div>
           {/* Add a horizontal line after header */}
           <hr className="border-t border-black my-4" />
        </header>

        {/* Profile Summary */}
        {data.profile && (
          <section className="mb-4 profile-summary">
            <h2 className="section-title">Profile Summary</h2>
            <p>{data.profile}</p>
          </section>
        )}

        {/* Skills */}
        {data.skills && (
          <section className="mb-4 skills">
            <h2 className="section-title">Skills</h2>
             {/* Display skills as a simple comma-separated line or basic list */}
             <p>{data.skills.split(',').map(s => s.trim()).join(' • ')}</p>
             {/* Alternatively, a simple list:
             <ul className="simple-list">
               {formatSimpleList(data.skills, ',')}
             </ul>
             */}
          </section>
        )}

         {/* Education */}
         {data.education && (
           <section className="mb-4 education">
             <h2 className="section-title">Education</h2>
             {/* Use the multiline formatter */}
             {formatMultilineText(data.education)}
           </section>
         )}


         {/* Employment History */}
         {data.employmentHistory && (
           <section className="mb-4 employment">
             <h2 className="section-title">Employment History</h2>
              {formatMultilineText(data.employmentHistory)}
           </section>
         )}


         {/* Academic Projects */}
         {data.academicProjects && (
           <section className="mb-4 projects">
             <h2 className="section-title">Academic Projects</h2>
             {formatMultilineText(data.academicProjects)}
           </section>
         )}


        {/* Languages */}
        {data.languages && (
          <section className="mb-4 languages">
            <h2 className="section-title">Languages</h2>
             <ul className="simple-list">
               {formatSimpleList(data.languages)}
             </ul>
          </section>
        )}

        {/* Hobbies */}
        {data.hobbies && (
          <section className="mb-4 hobbies">
            <h2 className="section-title">Hobbies</h2>
            <p>{data.hobbies}</p>
          </section>
        )}

        {/* References */}
        {data.references && (
          <section className="references">
            <h2 className="section-title">References</h2>
            {formatMultilineText(data.references)}
          </section>
        )}
      </article>
    </div>
  );
};

export default ResumePreview;
