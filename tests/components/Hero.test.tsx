import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Hero } from '@/components/Hero';

// Mock AuthorInfo component
vi.mock('@/components/AuthorInfo', () => ({
  AuthorInfo: ({ article }: any) => (
    <div data-testid="author-info">{article.author?.name || 'Anonim'}</div>
  ),
}));

describe('Hero', () => {
  const mockArticles = [
    {
      id: '1',
      slug: 'article-1',
      title: 'Test Article 1',
      excerpt: 'Test excerpt 1',
      featuredImage: 'https://example.com/image1.jpg',
      category: { name: 'Şiir' },
      author: { name: 'Author 1', image: 'author1.jpg' },
    },
    {
      id: '2',
      slug: 'article-2',
      title: 'Test Article 2',
      excerpt: 'Test excerpt 2',
      featuredImage: null,
      category: { name: 'Eleştiri' },
      author: { name: 'Author 2', image: 'author2.jpg' },
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render nothing when no articles', () => {
    const { container } = render(<Hero articles={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render article title', () => {
    render(<Hero articles={mockArticles} />);
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
  });

  it('should render article excerpt', () => {
    render(<Hero articles={mockArticles} />);
    expect(screen.getByText('Test excerpt 1')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<Hero articles={mockArticles} />);
    expect(screen.getByText('Şiir')).toBeInTheDocument();
  });

  it('should render multiple "Devamını Oku" links for all slides', () => {
    render(<Hero articles={mockArticles} />);
    const links = screen.getAllByText('Devamını Oku');
    expect(links).toHaveLength(2);
  });

  it('should have correct links to articles', () => {
    render(<Hero articles={mockArticles} />);
    const links = screen.getAllByRole('link', { name: /Devamını Oku/i });
    expect(links[0]).toHaveAttribute('href', '/yazi/article-1');
    expect(links[1]).toHaveAttribute('href', '/yazi/article-2');
  });

  it('should render navigation buttons', () => {
    render(<Hero articles={mockArticles} />);
    expect(screen.getByLabelText('Önceki')).toBeInTheDocument();
    expect(screen.getByLabelText('Sonraki')).toBeInTheDocument();
  });

  it('should render slide indicators', () => {
    render(<Hero articles={mockArticles} />);
    const indicators = screen.getAllByLabelText(/Slayt/);
    expect(indicators).toHaveLength(2);
  });

  it('should change slide on next button click', () => {
    render(<Hero articles={mockArticles} />);
    
    // Initially first article is active
    const firstIndicator = screen.getByLabelText('Slayt 1');
    expect(firstIndicator).toHaveClass('w-8');
    
    fireEvent.click(screen.getByLabelText('Sonraki'));
    
    // Second indicator should now be active
    const secondIndicator = screen.getByLabelText('Slayt 2');
    expect(secondIndicator).toHaveClass('w-8');
  });

  it('should change slide on indicator click', () => {
    render(<Hero articles={mockArticles} />);
    
    const indicators = screen.getAllByLabelText(/Slayt/);
    fireEvent.click(indicators[1]);
    
    expect(indicators[1]).toHaveClass('w-8');
  });

  it('should auto-advance slides', () => {
    render(<Hero articles={mockArticles} />);
    
    const firstIndicator = screen.getByLabelText('Slayt 1');
    expect(firstIndicator).toHaveClass('w-8');
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    const secondIndicator = screen.getByLabelText('Slayt 2');
    expect(secondIndicator).toHaveClass('w-8');
  });

  it('should loop back to first slide after last', () => {
    render(<Hero articles={mockArticles} />);
    
    // Go to last slide
    fireEvent.click(screen.getByLabelText('Sonraki'));
    // Go past last slide
    fireEvent.click(screen.getByLabelText('Sonraki'));
    
    const firstIndicator = screen.getByLabelText('Slayt 1');
    expect(firstIndicator).toHaveClass('w-8');
  });
});
