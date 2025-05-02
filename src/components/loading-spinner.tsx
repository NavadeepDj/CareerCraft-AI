// src/components/loading-spinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 [&>div]:border-4',
    md: 'w-14 h-14 [&>div]:border-8', // Adjust base size slightly smaller for better visual
    lg: 'w-28 h-28 [&>div]:border-[16px]', // Corresponds to original 112px with 16px border
  };

  const boxClasses = {
      sm: {
        box1: 'w-6 h-3 top-3 left-0 animate-abox1-sm',
        box2: 'w-3 h-3 top-0 left-0 animate-abox2-sm',
        box3: 'w-3 h-3 top-0 left-3 animate-abox3-sm',
      },
      md: {
        box1: 'w-14 h-7 top-7 left-0 animate-abox1-md',
        box2: 'w-7 h-7 top-0 left-0 animate-abox2-md',
        box3: 'w-7 h-7 top-0 left-7 animate-abox3-md',
     },
     lg: {
        box1: 'w-[112px] h-[48px] mt-[64px] ml-[0px] animate-abox1',
        box2: 'w-[48px] h-[48px] mt-[0px] ml-[0px] animate-abox2',
        box3: 'w-[48px] h-[48px] mt-[0px] ml-[64px] animate-abox3',
     }
  }


  return (
    <div className={cn('loader relative', sizeClasses[size], className)}>
      <div className={cn('box1 absolute box-content', boxClasses[size].box1)}></div>
      <div className={cn('box2 absolute box-content', boxClasses[size].box2)}></div>
      <div className={cn('box3 absolute box-content', boxClasses[size].box3)}></div>
    </div>
  );
};

export default LoadingSpinner;

// Add Keyframes for different sizes if necessary or adjust existing ones.
// For simplicity, using Tailwind JIT might require defining these animations in globals.css
// or using a CSS-in-JS solution if dynamic keyframes based on props are needed.
// Assuming keyframes 'abox1', 'abox2', 'abox3' are defined in globals.css
// We might need smaller versions like 'abox1-sm', 'abox2-sm', 'abox3-sm' etc.
// For this example, we'll assume the large keyframes exist and rely on scaling/adjustments.
