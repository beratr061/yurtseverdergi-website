'use client';

import { Lock } from 'lucide-react';

interface LockedAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LockedAvatar({ size = 'md' }: LockedAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden`}>
      {/* Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 blur-sm" />
      
      {/* Lock Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-neutral-900/90 rounded-full p-2 animate-pulse">
          <Lock className={`${iconSizes[size]} text-neutral-600 dark:text-neutral-400`} />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
    </div>
  );
}
