'use client';

import { BookOpen } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Loading Overlay */}
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-black z-[9999]">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Book Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center animate-pulse">
              <BookOpen className="w-12 h-12 text-primary-600 animate-bounce" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary-600/20 blur-2xl rounded-full -z-10" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-neutral-900 dark:text-neutral-100 text-2xl font-bold tracking-tight">
              YurtSever Dergi
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              İçerik yükleniyor...
            </p>
            {/* Loading dots */}
            <div className="flex justify-center space-x-1 pt-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <div className="h-[600px] lg:h-[700px] bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        
        {/* Featured Articles Skeleton */}
        <div className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mb-12 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
