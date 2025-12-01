import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatestPosts } from '@/components/LatestPosts';

// Mock AuthorInfo component
vi.mock('@/components/AuthorInfo', () => ({
  AuthorInfo: ({ article }: any) => (
    <div data-testid="author-info">{article.author?.name || 'Anonim'}</div>
  ),
}));

describe('LatestPosts', () => {
  const mockArticles = [
    {
      id: '1',
      slug: 'post-1',
      title: 'Latest Post 1',
      excerpt: 'Latest excerpt 1',
      featuredImage: 'https://example.com/image1.jpg',
      publishedAt: new Date('2025-01-15'),
      createdAt: new Date('2025-01-10'),
      category: { name: 'Şiir' },
      author: { name: 'Author 1', image: 'author1.jpg' },
    },
    {
      id: '2',
      slug: 'post-2',
      title: 'Latest Post 2',
      excerpt: 'Latest excerpt 2',
      featuredImage: null,
      publishedAt: null,
      createdAt: new Date('2025-01-12'),
      category: { name: 'Poetika' },
      author: { name: 'Author 2', image: 'author2.jpg' },
    },
  ];

  it('should render section title', () => {
    render(<LatestPosts articles={mockArticles} />);
    expect(screen.getByText('Son Eklenenler')).toBeInTheDocument();
  });

  it('should render YurtSever label', () => {
    render(<LatestPosts articles={mockArticles} />);
    expect(screen.getByText('YurtSever')).toBeInTheDocument();
  });

  it('should render all posts', () => {
    render(<LatestPosts articles={mockArticles} />);
    
    expect(screen.getByText('Latest Post 1')).toBeInTheDocument();
    expect(screen.getByText('Latest Post 2')).toBeInTheDocument();
  });

  it('should render post excerpts', () => {
    render(<LatestPosts articles={mockArticles} />);
    
    expect(screen.getByText('Latest excerpt 1')).toBeInTheDocument();
    expect(screen.getByText('Latest excerpt 2')).toBeInTheDocument();
  });

  it('should render category badges', () => {
    render(<LatestPosts articles={mockArticles} />);
    
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Poetika')).toBeInTheDocument();
  });

  it('should render links to posts', () => {
    render(<LatestPosts articles={mockArticles} />);
    
    const links = screen.getAllByRole('link');
    const postLinks = links.filter(link => link.getAttribute('href')?.startsWith('/yazi/'));
    
    expect(postLinks).toHaveLength(2);
    expect(postLinks[0]).toHaveAttribute('href', '/yazi/post-1');
    expect(postLinks[1]).toHaveAttribute('href', '/yazi/post-2');
  });

  it('should render empty state when no posts', () => {
    render(<LatestPosts articles={[]} />);
    expect(screen.getByText('Henüz yayınlanmış yazı bulunmuyor.')).toBeInTheDocument();
  });

  it('should render author info for each post', () => {
    render(<LatestPosts articles={mockArticles} />);
    const authorInfos = screen.getAllByTestId('author-info');
    expect(authorInfos).toHaveLength(2);
  });

  it('should format publish date correctly', () => {
    render(<LatestPosts articles={mockArticles} />);
    expect(screen.getByText('15 Oca 2025')).toBeInTheDocument();
  });

  it('should render placeholder for posts without image', () => {
    render(<LatestPosts articles={mockArticles} />);
    // Second post has no image, should show first letter
    expect(screen.getByText('L')).toBeInTheDocument(); // First letter of "Latest Post 2"
  });
});
