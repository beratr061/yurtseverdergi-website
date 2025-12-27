import { Hero } from '@/components/Hero';
import { FeaturedArticles } from '@/components/FeaturedArticles';
import { LatestPosts } from '@/components/LatestPosts';
import { Writers } from '@/components/Writers';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import { getArticles, getWriters } from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/maintenance-check';
import { checkAndRedirectInvitationMode } from '@/lib/invitation-check';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yurtsever.com';

// Revalidate her 60 saniyede bir
export const revalidate = 60;

export const metadata = {
  title: 'YurtSever Dergi - Ana Sayfa',
  description: 'Edebiyat, şiir, eleştiri ve söyleşi içerikleri',
};

export default async function Home() {
  // Davet modu kontrolü - non-admin kullanıcıları /invitation'a yönlendirir
  await checkAndRedirectInvitationMode();
  
  // Bakım modu kontrolü
  await checkMaintenanceMode();

  let allArticles: any[] = [];
  let writers: any[] = [];

  try {
    const [articlesResult, writersResult] = await Promise.all([
      getArticles({ status: 'PUBLISHED', limit: 10 }),
      getWriters(3),
    ]);

    allArticles = (articlesResult.data || []).map((article: any) => ({
      ...article,
      categories: article.category,
    }));

    writers = writersResult.data || [];
  } catch (error) {
    console.error('Database error:', error);
  }

  // Client-side'da ayır
  const heroArticles = allArticles.slice(0, 3);
  const latestArticles = allArticles.slice(0, 6);
  const featuredArticles = [...allArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  // Database bağlantısı yoksa uyarı göster
  const hasNoData = allArticles.length === 0 && writers.length === 0;

  return (
    <>
      {hasNoData && (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900 z-50">
          <div className="text-center space-y-4 px-4">
            <div className="text-6xl">📚</div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Veritabanı Boş
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
              Henüz içerik eklenmemiş. Admin panelinden içerik ekleyebilirsiniz.
            </p>
            <div className="pt-4">
              <a
                href="/admin/login"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Admin Paneli
              </a>
            </div>
          </div>
        </div>
      )}
      
      {!hasNoData && (
        <main className="min-h-screen">
          <OrganizationJsonLd
            name="YurtSever Dergi"
            url={siteUrl}
            logo={`${siteUrl}/images/logos/logo.svg`}
            description="Edebiyat ve Kültür Dergisi - Şiir, eleştiri, söyleşi ve poetika içerikleri"
          />
          <WebSiteJsonLd
            name="YurtSever Dergi"
            url={siteUrl}
            description="Edebiyat ve Kültür Dergisi - Şiir, eleştiri, söyleşi ve poetika içerikleri"
          />
          
          <Hero articles={heroArticles} />
          <FeaturedArticles articles={featuredArticles} />
          <LatestPosts articles={latestArticles} />
          <Writers writers={writers} />
        </main>
      )}
    </>
  );
}
