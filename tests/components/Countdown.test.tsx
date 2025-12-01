import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Countdown } from '@/components/Countdown';

// Mock the author-reveal module with all exports
vi.mock('@/lib/author-reveal', () => ({
  isAuthorRevealed: vi.fn(() => true),
  getRevealTimeRemaining: vi.fn((revealDate: string) => {
    const now = new Date('2025-01-15T12:00:00Z').getTime();
    const reveal = new Date(revealDate).getTime();
    const diff = reveal - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, totalMs: diff };
  }),
  formatRevealTime: vi.fn((time: any) => `${time.days} gün ${time.hours} saat`),
  formatRevealTimeShort: vi.fn((time: any) => `${time.days}g ${time.hours}s`),
}));

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render countdown when reveal date is in future', async () => {
    render(<Countdown revealDate="2025-01-20T12:00:00Z" />);
    
    // Advance timers to trigger useEffect
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByText('Yazar açıklanacak:')).toBeInTheDocument();
  });

  it('should display days, hours, minutes, seconds labels', async () => {
    render(<Countdown revealDate="2025-01-16T14:30:45Z" />);
    
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByText('Gün')).toBeInTheDocument();
    expect(screen.getByText('Saat')).toBeInTheDocument();
    expect(screen.getByText('Dakika')).toBeInTheDocument();
    expect(screen.getByText('Saniye')).toBeInTheDocument();
  });

  it('should render compact version without full labels', async () => {
    render(<Countdown revealDate="2025-01-16T12:00:00Z" compact />);
    
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    // Compact version should not have full labels
    expect(screen.queryByText('Gün')).not.toBeInTheDocument();
  });

  it('should return null when reveal date is in past', async () => {
    const { container } = render(<Countdown revealDate="2025-01-10T12:00:00Z" />);
    
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    expect(container.firstChild).toBeNull();
  });
});
