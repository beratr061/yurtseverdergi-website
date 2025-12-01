import { describe, it, expect } from 'vitest';
import { calculateReadingTime, getClientIp } from '@/lib/reading-time';

describe('calculateReadingTime', () => {
  it('should return 1 dakika for very short content', () => {
    expect(calculateReadingTime('Merhaba')).toBe('1 dakika');
  });

  it('should calculate reading time based on word count', () => {
    // 200 words = 1 minute, 400 words = 2 minutes
    const words = Array(400).fill('kelime').join(' ');
    expect(calculateReadingTime(words)).toBe('2 dakika');
  });

  it('should strip HTML tags before counting', () => {
    const html = '<p>Merhaba</p> <strong>Dünya</strong> <div>Test</div>';
    expect(calculateReadingTime(html)).toBe('1 dakika');
  });

  it('should handle complex HTML content', () => {
    const html = `
      <h1>Başlık</h1>
      <p>Bu bir paragraf içeriğidir.</p>
      <ul>
        <li>Liste öğesi 1</li>
        <li>Liste öğesi 2</li>
      </ul>
    `;
    expect(calculateReadingTime(html)).toBe('1 dakika');
  });

  it('should round up reading time', () => {
    // 250 words should be 2 minutes (ceil of 1.25)
    const words = Array(250).fill('kelime').join(' ');
    expect(calculateReadingTime(words)).toBe('2 dakika');
  });

  it('should handle empty content', () => {
    expect(calculateReadingTime('')).toBe('1 dakika');
  });

  it('should handle content with only HTML tags', () => {
    expect(calculateReadingTime('<div></div><p></p>')).toBe('1 dakika');
  });
});

describe('getClientIp', () => {
  it('should return x-forwarded-for header if present', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
    expect(getClientIp(headers)).toBe('192.168.1.1');
  });

  it('should return x-real-ip if x-forwarded-for is not present', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '192.168.1.2');
    expect(getClientIp(headers)).toBe('192.168.1.2');
  });

  it('should return cf-connecting-ip if other headers are not present', () => {
    const headers = new Headers();
    headers.set('cf-connecting-ip', '192.168.1.3');
    expect(getClientIp(headers)).toBe('192.168.1.3');
  });

  it('should return unknown if no IP headers are present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('unknown');
  });

  it('should trim whitespace from forwarded IP', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '  192.168.1.1  , 10.0.0.1');
    expect(getClientIp(headers)).toBe('192.168.1.1');
  });
});
