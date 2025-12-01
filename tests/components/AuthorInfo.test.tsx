import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthorInfo } from '@/components/AuthorInfo';

// Mock the author-reveal module with all exports
vi.mock('@/lib/author-reveal', () => ({
  isAuthorRevealed: vi.fn(),
  getRevealTimeRemaining: vi.fn(() => ({ days: 1, hours: 2, minutes: 30, seconds: 0, totalMs: 100000 })),
  formatRevealTime: vi.fn(() => '1 gün 2 saat'),
  formatRevealTimeShort: vi.fn(() => '1g 2s'),
}));

import { isAuthorRevealed } from '@/lib/author-reveal';

describe('AuthorInfo', () => {
  beforeEach(() => {
    vi.mocked(isAuthorRevealed).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('card variant (default)', () => {
    it('should render author name when revealed', () => {
      const article = {
        author: { name: 'Test Author', image: 'test.jpg' },
      };
      render(<AuthorInfo article={article} />);
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should render Anonim when no author name', () => {
      const article = { author: undefined };
      render(<AuthorInfo article={article} />);
      expect(screen.getByText('Anonim')).toBeInTheDocument();
    });

    it('should render author image when provided', () => {
      const article = {
        author: { name: 'Test Author', image: 'test.jpg' },
      };
      render(<AuthorInfo article={article} />);
      const img = screen.getByAltText('Test Author');
      expect(img).toHaveAttribute('src', 'test.jpg');
    });

    it('should render profile link when slug is provided', () => {
      const article = {
        author: { name: 'Test Author', slug: 'test-author' },
      };
      render(<AuthorInfo article={article} />);
      expect(screen.getByText('Profili Görüntüle')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/yazar/test-author');
    });

    it('should render bio when showBio is true', () => {
      const article = {
        author: { name: 'Test Author', bio: 'Test bio text' },
      };
      render(<AuthorInfo article={article} showBio={true} />);
      expect(screen.getByText('Test bio text')).toBeInTheDocument();
    });

    it('should render locked state when not revealed', () => {
      vi.mocked(isAuthorRevealed).mockReturnValue(false);
      const article = {
        author: { name: 'Test Author' },
        authorRevealDate: '2025-12-31T00:00:00Z',
      };
      render(<AuthorInfo article={article} />);
      expect(screen.getByText('Yazar Gizli')).toBeInTheDocument();
      expect(screen.getByText('Yazarın kimliği yakında açıklanacak')).toBeInTheDocument();
    });
  });

  describe('inline variant', () => {
    it('should render author name inline', () => {
      const article = {
        author: { name: 'Test Author' },
      };
      render(<AuthorInfo article={article} variant="inline" />);
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should render locked state inline when not revealed', () => {
      vi.mocked(isAuthorRevealed).mockReturnValue(false);
      const article = {
        author: { name: 'Test Author' },
      };
      render(<AuthorInfo article={article} variant="inline" />);
      expect(screen.getByText('Yazar gizli')).toBeInTheDocument();
    });
  });

  describe('compact variant', () => {
    it('should render author name in compact mode', () => {
      const article = {
        author: { name: 'Test Author', image: 'test.jpg' },
      };
      render(<AuthorInfo article={article} variant="compact" />);
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should render locked state compact when not revealed', () => {
      vi.mocked(isAuthorRevealed).mockReturnValue(false);
      const article = {
        author: { name: 'Test Author' },
      };
      render(<AuthorInfo article={article} variant="compact" />);
      expect(screen.getByText('Yazar gizli')).toBeInTheDocument();
    });

    it('should render link when author has slug', () => {
      const article = {
        author: { name: 'Test Author', slug: 'test-author' },
      };
      render(<AuthorInfo article={article} variant="compact" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/yazar/test-author');
    });
  });
});
