import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isAuthorRevealed,
  getRevealTimeRemaining,
  formatRevealTime,
  formatRevealTimeShort,
  getAuthorDisplay,
} from '@/lib/author-reveal';

describe('isAuthorRevealed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true if authorRevealDate is not set', () => {
    expect(isAuthorRevealed({})).toBe(true);
    expect(isAuthorRevealed({ authorRevealDate: null })).toBe(true);
    expect(isAuthorRevealed({ authorRevealDate: undefined })).toBe(true);
  });

  it('should return true if reveal date is in the past', () => {
    const article = { authorRevealDate: '2025-01-10T12:00:00Z' };
    expect(isAuthorRevealed(article)).toBe(true);
  });

  it('should return false if reveal date is in the future', () => {
    const article = { authorRevealDate: '2025-01-20T12:00:00Z' };
    expect(isAuthorRevealed(article)).toBe(false);
  });

  it('should return true if reveal date is exactly now', () => {
    const article = { authorRevealDate: '2025-01-15T12:00:00Z' };
    expect(isAuthorRevealed(article)).toBe(true);
  });
});

describe('getRevealTimeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null if reveal date is in the past', () => {
    expect(getRevealTimeRemaining('2025-01-10T12:00:00Z')).toBeNull();
  });

  it('should calculate remaining time correctly', () => {
    const result = getRevealTimeRemaining('2025-01-16T14:30:45Z');
    expect(result).not.toBeNull();
    expect(result!.days).toBe(1);
    expect(result!.hours).toBe(2);
    expect(result!.minutes).toBe(30);
    expect(result!.seconds).toBe(45);
  });

  it('should handle Date object input', () => {
    const result = getRevealTimeRemaining(new Date('2025-01-16T12:00:00Z'));
    expect(result).not.toBeNull();
    expect(result!.days).toBe(1);
  });

  it('should return correct totalMs', () => {
    const result = getRevealTimeRemaining('2025-01-15T13:00:00Z');
    expect(result).not.toBeNull();
    expect(result!.totalMs).toBe(3600000); // 1 hour in ms
  });
});

describe('formatRevealTime', () => {
  it('should format time with all components', () => {
    const time = { days: 2, hours: 5, minutes: 30, seconds: 15, totalMs: 0 };
    expect(formatRevealTime(time)).toBe('2 gün 5 saat 30 dakika');
  });

  it('should not show seconds if days > 0', () => {
    const time = { days: 1, hours: 0, minutes: 0, seconds: 30, totalMs: 0 };
    expect(formatRevealTime(time)).toBe('1 gün');
  });

  it('should show seconds if days = 0', () => {
    const time = { days: 0, hours: 1, minutes: 30, seconds: 45, totalMs: 0 };
    expect(formatRevealTime(time)).toBe('1 saat 30 dakika 45 saniye');
  });

  it('should return 0 saniye for zero time', () => {
    const time = { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    expect(formatRevealTime(time)).toBe('0 saniye');
  });

  it('should skip zero values', () => {
    const time = { days: 0, hours: 2, minutes: 0, seconds: 30, totalMs: 0 };
    expect(formatRevealTime(time)).toBe('2 saat 30 saniye');
  });
});

describe('formatRevealTimeShort', () => {
  it('should format time in short format', () => {
    const time = { days: 2, hours: 5, minutes: 30, seconds: 15, totalMs: 0 };
    expect(formatRevealTimeShort(time)).toBe('2g 5s 30d');
  });

  it('should show seconds if no other values', () => {
    const time = { days: 0, hours: 0, minutes: 0, seconds: 45, totalMs: 0 };
    expect(formatRevealTimeShort(time)).toBe('45sn');
  });

  it('should skip zero values', () => {
    const time = { days: 1, hours: 0, minutes: 30, seconds: 0, totalMs: 0 };
    expect(formatRevealTimeShort(time)).toBe('1g 30d');
  });
});

describe('getAuthorDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return revealed author info when revealed', () => {
    const article = {
      author: { name: 'Test Author', image: 'test.jpg' },
      authorRevealDate: '2025-01-10T12:00:00Z',
    };
    const result = getAuthorDisplay(article);
    expect(result.revealed).toBe(true);
    expect(result.author).toEqual(article.author);
  });

  it('should hide author info when not revealed', () => {
    const article = {
      author: { name: 'Test Author', image: 'test.jpg' },
      authorRevealDate: '2025-01-20T12:00:00Z',
    };
    const result = getAuthorDisplay(article);
    expect(result.revealed).toBe(false);
    expect(result.author).toBeNull();
    expect(result.timeRemaining).not.toBeNull();
  });

  it('should return revealed true when no reveal date', () => {
    const article = { author: { name: 'Test Author' } };
    const result = getAuthorDisplay(article);
    expect(result.revealed).toBe(true);
  });
});
