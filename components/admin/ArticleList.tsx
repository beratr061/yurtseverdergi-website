'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye, Search, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  views: number;
  authorId?: string;
  author: {
    id?: string;
    name: string;
    email: string;
  };
  category: {
    name: string;
    slug: string;
  };
  writer: {
    name: string;
  } | null;
}

interface ArticleListProps {
  articles: Article[];
  userRole?: string;
  userId?: string;
}

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  ARCHIVED: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400',
};

const statusLabels: Record<string, string> = {
  PUBLISHED: 'Yayınlandı',
  DRAFT: 'Taslak',
  PENDING_REVIEW: 'Onay Bekliyor',
  REJECTED: 'Reddedildi',
  ARCHIVED: 'Arşiv',
};

export function ArticleList({ articles, userRole = 'POET', userId }: ArticleListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);
  
  const isAdmin = userRole === 'ADMIN';

  // Writer sadece kendi taslak yazılarını silebilir
  const canDeleteArticle = (article: Article) => {
    if (isAdmin) return true;
    const articleAuthorId = article.authorId || article.author?.id;
    return articleAuthorId === userId && article.status === 'DRAFT';
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(articles.map((a) => JSON.stringify({ id: a.category.slug, name: a.category.name })))
    ).map((str) => JSON.parse(str));
    return uniqueCategories;
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter;

      const matchesCategory = categoryFilter === 'ALL' || article.category.slug === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, searchQuery, statusFilter, categoryFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Makale silindi');
        router.refresh();
      } else {
        toast.error('Silme işlemi başarısız oldu');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm(`${selectedIds.length} yazıyı silmek istediğinize emin misiniz?`)) {
        return;
      }
    }

    setBulkLoading(true);

    try {
      const response = await fetch('/api/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          ids: selectedIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'İşlem başarılı');
        setSelectedIds([]);
        setBulkAction('');
        router.refresh();
      } else {
        toast.error('Toplu işlem başarısız oldu');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Henüz yazı bulunmuyor
        </p>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span>İlk Yazıyı Oluştur</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Yazı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2 flex-1">
            <Filter className="h-5 w-5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PUBLISHED">Yayınlanan</option>
              <option value="DRAFT">Taslak</option>
              <option value="ARCHIVED">Arşiv</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count and Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredArticles.length} yazı gösteriliyor
            {selectedIds.length > 0 && (
              <span className="ml-2 text-primary-600 font-medium">
                ({selectedIds.length} seçili)
              </span>
            )}
            {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className="ml-2 text-primary-600 hover:text-primary-700"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          {selectedIds.length > 0 && isAdmin && (
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">Toplu İşlem Seç</option>
                <option value="publish">Yayınla</option>
                <option value="draft">Taslağa Al</option>
                <option value="archive">Arşivle</option>
                <option value="delete">Sil</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {bulkLoading ? 'İşleniyor...' : 'Uygula'}
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Arama kriterlerine uygun yazı bulunamadı
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <Link
                href={`/admin/articles/${article.id}/edit`}
                className="flex-1 font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 transition-colors line-clamp-2"
              >
                {article.title}
              </Link>
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[article.status as keyof typeof statusColors]}`}>
                {statusLabels[article.status as keyof typeof statusLabels]}
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                {article.category.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {article.writer?.name || article.author.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                • {article.views} görüntülenme
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {format(new Date(article.publishedAt || article.createdAt), 'dd MMM yyyy', { locale: tr })}
              </span>
              <div className="flex items-center space-x-2">
                {article.status === 'PUBLISHED' && (
                  <Link
                    href={`/yazi/${article.slug}`}
                    target="_blank"
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Görüntüle"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                {canDeleteArticle(article) && (
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deletingId === article.id}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredArticles.length && filteredArticles.length > 0}
                        onChange={toggleSelectAll}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 rounded-md peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500/20 transition-all flex items-center justify-center">
                        {selectedIds.length === filteredArticles.length && filteredArticles.length > 0 && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {selectedIds.length > 0 && selectedIds.length < filteredArticles.length && (
                          <div className="w-2.5 h-0.5 bg-primary-600 rounded" />
                        )}
                      </div>
                    </label>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Kategori
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Yazar
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Görüntülenme
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                    selectedIds.includes(article.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(article.id)}
                          onChange={() => toggleSelect(article.id)}
                          className="sr-only peer"
                        />
                        <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${
                          selectedIds.includes(article.id)
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
                        } peer-focus:ring-2 peer-focus:ring-primary-500/20`}>
                          {selectedIds.includes(article.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        {article.excerpt}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                      {article.category.name}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {article.writer?.name || article.author.name}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[article.status as keyof typeof statusColors]
                        }`}
                    >
                      {statusLabels[article.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: tr })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <Eye className="h-4 w-4" />
                      <span>{article.views}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        href={`/yazi/${article.slug}`}
                        target="_blank"
                        className={`p-2 transition-colors ${
                          article.status === 'PUBLISHED'
                            ? 'text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400'
                            : 'text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400'
                        }`}
                        title={article.status === 'PUBLISHED' ? 'Yazıyı Görüntüle' : 'Ön İzleme'}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {canDeleteArticle(article) && (
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="p-2 text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </>
      )}
    </>
  );
}
