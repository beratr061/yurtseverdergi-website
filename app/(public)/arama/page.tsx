'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const POSTS_PER_PAGE = 6;

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  categories: { name: string } | null;
  writers: { name: string; image: string } | null;
  users: { name: string } | null;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    author: '',
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Article[]>([]);

  // Fetch articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/articles/search');
        const data = await response.json();
        setAllPosts(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Get unique categories and authors
  const categories = useMemo(() => 
    Array.from(new Set(allPosts.map(p => p.categories?.name).filter(Boolean))) as string[],
    [allPosts]
  );
  
  const authors = useMemo(() => {
    const authorNames = allPosts.map(p => p.writers?.name || p.users?.name).filter(Boolean);
    return Array.from(new Set(authorNames)) as string[];
  }, [allPosts]);

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          (p.writers?.name || p.users?.name || '').toLowerCase().includes(query) ||
          (p.categories?.name || '').toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filters.category) {
      posts = posts.filter(p => p.categories?.name === filters.category);
    }

    // Filter by author
    if (filters.author) {
      posts = posts.filter(p => (p.writers?.name || p.users?.name) === filters.author);
    }

    // Sort
    if (filters.sortBy === 'oldest') {
      posts.reverse();
    } else {
      posts.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    return posts;
  }, [searchQuery, filters, allPosts]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Arama' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Yazı Ara
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {filteredPosts.length} yazı bulundu
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            categories={categories}
            authors={authors}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <SkeletonGrid count={POSTS_PER_PAGE} />
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => {
                const authorName = post.writers?.name || post.users?.name || 'Anonim';
                const authorImage = post.writers?.image || 'https://i.pravatar.cc/150?img=1';
                const categoryName = post.categories?.name || 'Genel';
                const publishDate = post.publishedAt
                  ? format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: tr })
                  : format(new Date(post.createdAt), 'dd MMM yyyy', { locale: tr });
                const imageUrl = post.featuredImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop';

                return (
                  <Link
                    key={post.id}
                    href={`/yazi/${post.slug}`}
                    className="group h-full"
                  >
                    <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        {imageUrl.startsWith('data:') ? (
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                            {categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
                          <div className="flex items-center space-x-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden">
                              <Image
                                src={authorImage}
                                alt={authorName}
                                fill
                                className="object-cover"
                                sizes="24px"
                              />
                            </div>
                            <span>{authorName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{publishDate}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Aradığınız kriterlere uygun yazı bulunamadı.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
