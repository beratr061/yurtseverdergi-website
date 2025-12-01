import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedArticles } from '@/components/FeaturedArticles';

// Mock AuthorInfo component
vi.mock('@/components/AuthorInfo', () => ({
  AuthorInfo: ({ article }: any) => (
    <div data-testid="author-info">{article.author?.name || 'Anonim'}</div>
  ),
}));

describe('FeaturedArticles', () => {
  const mockArticles = [
    {
      id: '1',
      slug: 'article-1',
      title: 'Featured Article 1',
      excerpt: 'Featured excerpt 1',
      featuredImage: 'https://example.com/image1.jpg',
      publishedAt: new Date('2025-01-15'),
      createdAt: new Date('2025-01-10'),
      category: { name: 'Şiir', slug: 'siir' },
      author: { name: 'Author 1', image: 'author1.jpg' },
    },
    {
      id: '2',
      slug: 'article-2',
      title: 'Featured Article 2',
      excerpt: 'Featured excerpt 2',
      featuredImage: null,
      publishedAt: null,
      createdAt: new Date('2025-01-12'),
      category: { name: 'Eleştiri', slug: 'elestiri' },
      author: { name: 'Author 2', image: 'author2.jpg' },
    },
  ];

  it('should render section title', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    expect(screen.getByText('Öne Çıkan Yazılar')).toBeInTheDocument();
  });

  it('should render section description', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    expect(screen.getByText('Editörlerimizin seçtiği en iyi içerikler')).toBeInTheDocument();
  });

  it('should render all articles', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    
    expect(screen.getByText('Featured Article 1')).toBeInTheDocument();
    expect(screen.getByText('Featured Article 2')).toBeInTheDocument();
  });

  it('should render article excerpts', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    
    expect(screen.getByText('Featured excerpt 1')).toBeInTheDocument();
    expect(screen.getByText('Featured excerpt 2')).toBeInTheDocument();
  });

  it('should render category badges', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Eleştiri')).toBeInTheDocument();
  });

  it('should render links to articles', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    
    const links = screen.getAllByRole('link');
    const articleLinks = links.filter(link => link.getAttribute('href')?.startsWith('/yazi/'));
    
    expect(articleLinks).toHaveLength(2);
    expect(articleLinks[0]).toHaveAttribute('href', '/yazi/article-1');
    expect(articleLinks[1]).toHaveAttribute('href', '/yazi/article-2');
  });

  it('should render "Tümünü Gör" link', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const viewAllLinks = screen.getAllByText('Tümünü Gör');
    expect(viewAllLinks.length).toBeGreaterThan(0);
  });

  it('should render empty state when no articles', () => {
    render(<FeaturedArticles articles={[]} />);
    expect(screen.getByText('Henüz öne çıkan yazı bulunmuyor.')).toBeInTheDocument();
  });

  it('should render author info for each article', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const authorInfos = screen.getAllByTestId('author-info');
    expect(authorInfos).toHaveLength(2);
  });

  it('should format publish date correctly', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    // Date format: dd MMM yyyy in Turkish
    expect(screen.getByText('15 Oca 2025')).toBeInTheDocument();
  });

  it('should use createdAt when publishedAt is null', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    // Second article has no publishedAt, should use createdAt
    expect(screen.getByText('12 Oca 2025')).toBeInTheDocument();
  });
});
