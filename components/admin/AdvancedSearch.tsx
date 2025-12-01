'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AdvancedSearchProps {
  categories: Category[];
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  query: string;
  status: string;
  categoryIds: string[];
  dateFrom: string;
  dateTo: string;
}

export function AdvancedSearch({ categories, onSearch, onReset }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'ALL',
    categoryIds: [],
    dateFrom: '',
    dateTo: '',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      status: 'ALL',
      categoryIds: [],
      dateFrom: '',
      dateTo: '',
    });
    onReset();
  };

  const toggleCategory = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const hasActiveFilters =
    filters.query ||
    filters.status !== 'ALL' ||
    filters.categoryIds.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
      {/* Ana Arama */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Başlık veya içerikte ara..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
            hasActiveFilters
              ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Filter className="h-5 w-5" />
          <span>Filtreler</span>
          {hasActiveFilters && (
            <span className="h-5 w-5 flex items-center justify-center text-xs font-bold bg-primary-600 text-white rounded-full">
              {(filters.status !== 'ALL' ? 1 : 0) +
                filters.categoryIds.length +
                (filters.dateFrom ? 1 : 0) +
                (filters.dateTo ? 1 : 0)}
            </span>
          )}
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Ara
        </button>
      </div>

      {/* Genişletilmiş Filtreler */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Durum */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="ALL">Tümü</option>
                <option value="PUBLISHED">Yayınlanan</option>
                <option value="DRAFT">Taslak</option>
                <option value="PENDING_REVIEW">Onay Bekleyen</option>
                <option value="REJECTED">Reddedilen</option>
                <option value="ARCHIVED">Arşiv</option>
              </select>
            </div>

            {/* Başlangıç Tarihi */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            {/* Bitiş Tarihi */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Kategoriler */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Kategoriler
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.categoryIds.includes(category.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Butonu */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
