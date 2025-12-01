import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { ArticleList } from '../../../../components/admin/ArticleList';

export default async function ArticlesPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const isAdmin = userRole === 'ADMIN';

  let articles: any[] = [];

  try {
    // Admin tüm yazıları görebilir, Writer sadece kendi yazılarını
    const whereClause = isAdmin ? {} : { authorId: userId };
    
    articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  const stats = {
    total: articles.length,
    published: articles.filter((a: any) => a.status === 'PUBLISHED').length,
    draft: articles.filter((a: any) => a.status === 'DRAFT').length,
    archived: articles.filter((a: any) => a.status === 'ARCHIVED').length,
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {isAdmin ? 'Yazılar' : 'Yazılarım'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {isAdmin 
                ? 'Tüm yazıları yönetin, düzenleyin ve yayınlayın' 
                : 'Yazılarınızı buradan yönetebilirsiniz'}
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Yazı</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Toplam</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Yayınlanan</div>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Taslak</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Arşiv</div>
            <div className="text-2xl font-bold text-neutral-600">{stats.archived}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Yazı ara..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <button className="inline-flex items-center space-x-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Filter className="h-5 w-5" />
            <span>Filtrele</span>
          </button>
        </div>
      </div>

      <ArticleList articles={articles} userRole={userRole} userId={userId} />
    </div>
  );
}
