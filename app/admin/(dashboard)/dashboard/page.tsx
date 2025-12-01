import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Users, Eye, TrendingUp, PenTool, Clock, CheckCircle, ClipboardCheck } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const isAdmin = userRole === 'ADMIN';

  let totalArticles = 0;
  let totalWriters = 0;
  let publishedArticles = 0;
  let draftArticles = 0;
  let pendingReviewCount = 0;
  let recentArticles: any[] = [];
  let myArticlesCount = 0;
  let myPublishedCount = 0;
  let myDraftCount = 0;
  let myPendingCount = 0;
  let totalViews = 0;
  let dbError = false;

  try {
    if (isAdmin) {
      // Admin/Editor: Tüm verileri görsün
      const [
        articlesCount,
        writersCount,
        publishedCount,
        pendingCount,
        articles,
      ] = await Promise.all([
        prisma.article.count(),
        prisma.user.count(),
        prisma.article.count({ where: { status: 'PUBLISHED' } }),
        prisma.article.count({ where: { status: 'PENDING_REVIEW' as any } }),
        prisma.article.findMany({
          include: {
            category: true,
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      totalArticles = articlesCount;
      totalWriters = writersCount;
      publishedArticles = publishedCount;
      pendingReviewCount = pendingCount;
      draftArticles = totalArticles - publishedCount - pendingCount;
      recentArticles = articles;
    } else {
      // Writer: Sadece kendi verilerini görsün
      const [
        myArticles,
        myPublished,
        myDrafts,
        myPending,
        articles,
        viewsSum,
      ] = await Promise.all([
        prisma.article.count({ where: { authorId: userId } }),
        prisma.article.count({ where: { authorId: userId, status: 'PUBLISHED' } }),
        prisma.article.count({ where: { authorId: userId, status: 'DRAFT' } }),
        prisma.article.count({ where: { authorId: userId, status: 'PENDING_REVIEW' as any } }),
        prisma.article.findMany({
          where: { authorId: userId },
          include: {
            category: true,
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.article.aggregate({
          where: { authorId: userId },
          _sum: { views: true },
        }),
      ]);

      myArticlesCount = myArticles;
      myPublishedCount = myPublished;
      myDraftCount = myDrafts;
      myPendingCount = myPending;
      recentArticles = articles;
      totalViews = viewsSum._sum.views || 0;
    }
  } catch (error) {
    console.error('Database error:', error);
    dbError = true;
  }

  // Admin/Editor için istatistikler
  const adminStats = [
    {
      name: 'Toplam Yazı',
      value: totalArticles,
      icon: FileText,
      change: '0%',
      changeType: 'neutral',
    },
    {
      name: 'Onay Bekleyen',
      value: pendingReviewCount,
      icon: ClipboardCheck,
      change: pendingReviewCount > 0 ? 'İncelenmeli' : 'Yok',
      changeType: pendingReviewCount > 0 ? 'warning' : 'neutral',
      link: '/admin/pending-reviews',
    },
    {
      name: 'Yayınlanan',
      value: publishedArticles,
      icon: Eye,
      change: `${draftArticles} taslak`,
      changeType: 'neutral',
    },
    {
      name: 'Kullanıcılar',
      value: totalWriters,
      icon: Users,
      change: totalWriters > 0 ? 'Aktif' : 'Yok',
      changeType: totalWriters > 0 ? 'positive' : 'neutral',
    },
  ];

  // Writer için istatistikler
  const writerStats = [
    {
      name: 'Yazılarım',
      value: myArticlesCount,
      icon: PenTool,
      change: 'Toplam',
      changeType: 'neutral',
    },
    {
      name: 'Onay Bekleyen',
      value: myPendingCount,
      icon: ClipboardCheck,
      change: myPendingCount > 0 ? 'İnceleniyor' : 'Yok',
      changeType: myPendingCount > 0 ? 'warning' : 'neutral',
    },
    {
      name: 'Yayınlanan',
      value: myPublishedCount,
      icon: CheckCircle,
      change: myPublishedCount > 0 ? 'Aktif' : 'Bekliyor',
      changeType: myPublishedCount > 0 ? 'positive' : 'neutral',
    },
    {
      name: 'Görüntülenme',
      value: totalViews,
      icon: Eye,
      change: 'Toplam',
      changeType: 'neutral',
    },
  ];

  const stats = isAdmin ? adminStats : writerStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Hoş Geldiniz, {session?.user?.name}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {isAdmin 
            ? 'İçerik yönetim sisteminize genel bakış' 
            : 'Yazılarınızı buradan yönetebilirsiniz'}
        </p>
      </div>

      {dbError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Veritabanı Bağlantı Hatası
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>MongoDB'ye bağlanılamıyor. Lütfen MongoDB servisinin çalıştığından ve .env dosyanızdaki DATABASE_URL ayarının doğru olduğundan emin olun.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat: any) => {
          const content = (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  stat.changeType === 'warning' 
                    ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                    : 'bg-primary-100 dark:bg-primary-900/20'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.changeType === 'warning' 
                      ? 'text-yellow-600' 
                      : 'text-primary-600'
                  }`} />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : stat.changeType === 'warning'
                          ? 'text-yellow-600'
                          : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {stat.name}
              </div>
            </>
          );

          const baseClass = `bg-white dark:bg-neutral-900 rounded-lg border p-6 ${
            stat.changeType === 'warning' ? 'border-yellow-300 dark:border-yellow-700' : 'border-neutral-200 dark:border-neutral-800'
          }`;
          
          return stat.link ? (
            <Link
              key={stat.name}
              href={stat.link}
              className={`${baseClass} hover:border-primary-600 transition-colors cursor-pointer block`}
            >
              {content}
            </Link>
          ) : (
            <div key={stat.name} className={baseClass}>
              {content}
            </div>
          );
        })}
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        <div className={`${isAdmin ? 'lg:col-span-2' : ''} bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {isAdmin ? 'Son Yazılar' : 'Yazılarım'}
            </h2>
            <a href="/admin/articles" className="text-sm text-primary-600 hover:text-primary-700">
              Tümünü Gör →
            </a>
          </div>

          {recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <PenTool className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {isAdmin ? 'Henüz yazı bulunmuyor' : 'Henüz yazınız bulunmuyor'}
              </p>
              <a
                href="/admin/articles/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isAdmin ? 'İlk Yazıyı Oluştur' : 'İlk Yazınızı Oluşturun'}
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1 line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400">
                          {article.category?.name || 'Genel'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${article.status === 'PUBLISHED'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          }`}>
                          {article.status === 'PUBLISHED' ? 'Yayınlandı' : 'Taslak'}
                        </span>
                        {isAdmin && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {article.author?.name}
                          </span>
                        )}
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {article.views} görüntülenme
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Admin için Hızlı Eylemler */}
        {isAdmin && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Hızlı Eylemler
            </h2>
            <div className="space-y-3">
              <a
                href="/admin/articles/new"
                className="block p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors text-center"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Yeni Yazı
                </span>
              </a>
              <a
                href="/admin/users/new"
                className="block p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors text-center"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Yeni Kullanıcı
                </span>
              </a>
              <a
                href="/admin/categories/new"
                className="block p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors text-center"
              >
                <Eye className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Yeni Kategori
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Writer için Hızlı Eylemler */}
        {!isAdmin && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Hızlı Eylemler
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/articles/new"
                className="block p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors text-center"
              >
                <PenTool className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Yeni Yazı
                </span>
              </a>
              <a
                href="/admin/articles"
                className="block p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-600 dark:hover:border-primary-600 transition-colors text-center"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Yazılarım
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
