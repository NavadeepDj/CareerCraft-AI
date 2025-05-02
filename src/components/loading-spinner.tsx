// src/components/loading-spinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
}

/**
 * Renders a CSS-based box loading animation.
 * The animation styles are defined in src/app/globals.css.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={cn('relative flex justify-center items-center w-[112px] h-[112px]', className)} role="status" aria-label="Loading">
      <div className="loader"> {/* Container for the boxes */}
        <div className="box1"></div>
        <div className="box2"></div>
        <div className="box3"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
