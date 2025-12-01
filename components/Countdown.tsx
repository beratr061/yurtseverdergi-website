'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getRevealTimeRemaining, formatRevealTime, formatRevealTimeShort } from '@/lib/author-reveal';

interface CountdownProps {
  revealDate: string;
  compact?: boolean;
}

export function Countdown({ revealDate, compact = false }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getRevealTimeRemaining(revealDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Her saniye güncelle
    const interval = setInterval(() => {
      const remaining = getRevealTimeRemaining(revealDate);
      
      if (!remaining) {
        // Süre doldu, sayfayı yenile
        clearInterval(interval);
        window.location.reload();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [revealDate]);

  // Hydration hatası önleme
  if (!mounted || !timeRemaining) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-1 text-xs text-neutral-600 dark:text-neutral-400">
        <Clock className="h-3 w-3" />
        <span className="font-mono">{formatRevealTimeShort(timeRemaining)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Clock className="h-4 w-4" />
        <span>Yazar açıklanacak:</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {/* Gün */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {timeRemaining.days}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Gün
          </div>
        </div>

        {/* Saat */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {timeRemaining.hours}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Saat
          </div>
        </div>

        {/* Dakika */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {timeRemaining.minutes}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Dakika
          </div>
        </div>

        {/* Saniye */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary-600 font-mono">
            {timeRemaining.seconds}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Saniye
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
        {formatRevealTime(timeRemaining)} sonra
      </p>
    </div>
  );
}
