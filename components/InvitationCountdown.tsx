'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownProps {
  targetDate: Date | string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetDate: Date | string): TimeRemaining | null {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return null;
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

export function InvitationCountdown({ targetDate }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(() => 
    calculateTimeRemaining(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  const updateCountdown = useCallback(() => {
    const remaining = calculateTimeRemaining(targetDate);
    setTimeRemaining(remaining);
  }, [targetDate]);

  useEffect(() => {
    setMounted(true);
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  // Hide if no launch date or time has passed
  if (!mounted || !timeRemaining) {
    return null;
  }

  const timeUnits = [
    { value: timeRemaining.days, label: 'Gün' },
    { value: timeRemaining.hours, label: 'Saat' },
    { value: timeRemaining.minutes, label: 'Dakika' },
    { value: timeRemaining.seconds, label: 'Saniye' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 uppercase tracking-widest">
        Yayına Kalan Süre
      </p>
      
      <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 border border-white/20">
                  <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-mono tabular-nums">
                    {padNumber(unit.value)}
                  </span>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur-xl -z-10" />
              </div>
              <span className="mt-1.5 sm:mt-2 text-[10px] xs:text-xs sm:text-sm text-white/60 uppercase tracking-wider">
                {unit.label}
              </span>
            </div>
            
            {/* Separator */}
            {index < timeUnits.length - 1 && (
              <span className="text-lg xs:text-2xl sm:text-3xl md:text-4xl text-white/40 font-light mx-0.5 xs:mx-1 sm:mx-2 -mt-5 sm:-mt-6">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
