'use client';

import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  categories: string[];
  authors: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  author: string;
  sortBy: 'newest' | 'oldest' | 'popular';
}

export function FilterBar({ categories, authors, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    author: '',
    sortBy: 'newest',
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category: '',
      author: '',
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.category || filters.author || filters.sortBy !== 'newest';

  return (
    <div className="w-full">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span>Filtrele</span>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
            {[filters.category, filters.author].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filters */}
      <div className={`${
        isOpen ? 'block' : 'hidden'
      } lg:block mt-4 lg:mt-0`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="">Tüm Yazarlar</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="popular">Popüler</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Temizle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
