import { describe, it, expect } from 'vitest';
import { slugify, slugifyLatin, makeUniqueSlug } from '@/lib/slugify';

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('should preserve Turkish characters', () => {
    expect(slugify('Türkçe Şiir')).toBe('türkçe-şiir');
    expect(slugify('Güzel Öykü')).toBe('güzel-öykü');
    // Note: JavaScript toLowerCase() converts 'I' to 'i' not 'ı'
    expect(slugify('Işık ve Gölge')).toBe('işık-ve-gölge');
  });

  it('should remove special characters except Turkish ones', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
    expect(slugify('Test@#$%')).toBe('test');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
    expect(slugify('---hello---')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(slugify('Article 123')).toBe('article-123');
  });
});

describe('slugifyLatin', () => {
  it('should convert Turkish characters to Latin equivalents', () => {
    expect(slugifyLatin('Türkçe')).toBe('turkce');
    expect(slugifyLatin('Şiir')).toBe('siir');
    expect(slugifyLatin('Güzel')).toBe('guzel');
    expect(slugifyLatin('Öykü')).toBe('oyku');
    expect(slugifyLatin('Işık')).toBe('isik');
  });

  it('should convert to lowercase', () => {
    expect(slugifyLatin('HELLO')).toBe('hello');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugifyLatin('hello world')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugifyLatin('Hello! World?')).toBe('hello-world');
  });

  it('should handle İ character correctly', () => {
    expect(slugifyLatin('İstanbul')).toBe('istanbul');
  });
});

describe('makeUniqueSlug', () => {
  it('should return base slug if not in existing slugs', () => {
    expect(makeUniqueSlug('hello', ['world', 'foo'])).toBe('hello');
  });

  it('should append number if slug exists', () => {
    expect(makeUniqueSlug('hello', ['hello', 'world'])).toBe('hello-1');
  });

  it('should increment number until unique', () => {
    expect(makeUniqueSlug('hello', ['hello', 'hello-1', 'hello-2'])).toBe('hello-3');
  });

  it('should handle empty existing slugs array', () => {
    expect(makeUniqueSlug('hello', [])).toBe('hello');
  });
});
