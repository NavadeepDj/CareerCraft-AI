// src/components/loading-spinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  // Base size is 112px as per provided CSS for lg
  const sizeClasses = {
    sm: 'w-[56px] h-[56px]', // Example scaling (0.5x)
    md: 'w-[84px] h-[84px]', // Example scaling (0.75x)
    lg: 'w-[112px] h-[112px]', // Base size from CSS
  };

  // NOTE: The provided CSS animations (abox1, abox2, abox3) are fixed pixel values.
  // Scaling the container (.loader) won't automatically scale the animation movements.
  // For true scaling, the keyframes would need variants or JS manipulation,
  // which is complex. We'll apply the container size and use the 'lg' animation styles for now.
  // If sm/md sizes look odd, the keyframes in globals.css would need adjustment.

  return (
    <div className={cn('loader relative', sizeClasses[size], className)}>
      {/* Apply base box styles and animation classes from globals.css */}
      <div className={cn('box1')}></div>
      <div className={cn('box2')}></div>
      <div className={cn('box3')}></div>
    </div>
  );
};

export default LoadingSpinner;
