import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SocialShare } from '@/components/SocialShare';
import { ViewTracker } from '@/components/ViewTracker';
import { AuthorInfo } from '@/components/AuthorInfo';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { getArticleBySlug, getArticles } from '@/lib/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { calculateReadingTime } from '@/lib/reading-time';
import { checkMaintenanceMode } from '@/lib/maintenance-check';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yurtsever.com';

export const revalidate = 300;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { data: article } = await getArticleBySlug(decodedSlug);

  if (!article) {
    return {
      title: 'Yazı Bulunamadı - YurtSever Dergi',
    };
  }

  const articleUrl = `${siteUrl}/yazi/${encodeURIComponent(article.slug)}`;

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author?.name || 'YurtSever Dergi' }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: articleUrl,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.author?.name || 'YurtSever Dergi'],
      images: article.featuredImage
        ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  await checkMaintenanceMode();

  const { data: article, error } = await getArticleBySlug(decodedSlug);

  if (error || !article || article.status !== 'PUBLISHED') {
    notFound();
  }

  // İlgili yazıları çek
  const { data: relatedData } = await getArticles({
    status: 'PUBLISHED',
    categoryId: article.categoryId,
    limit: 4,
  });

  const relatedArticles = (relatedData || [])
    .filter((a: any) => a.id !== article.id)
    .slice(0, 3);

  const readingTime = calculateReadingTime(article.content);

  const publishDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMMM yyyy', { locale: tr })
    : format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: tr });

  const currentUrl = `${siteUrl}/yazi/${encodeURIComponent(article.slug)}`;
  const authorUrl = article.author?.slug ? `${siteUrl}/yazar/${article.author.slug}` : undefined;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        url={currentUrl}
        image={article.featuredImage || undefined}
        datePublished={(article.publishedAt || article.createdAt).toISOString()}
        dateModified={article.updatedAt?.toISOString()}
        authorName={article.author?.name || 'YurtSever Dergi'}
        authorUrl={authorUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Ana Sayfa', url: siteUrl },
          { name: article.category.name, url: `${siteUrl}/${article.category.slug}` },
          { name: article.title, url: currentUrl },
        ]}
      />
      
      <ViewTracker articleId={article.id} />
      
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <Breadcrumb
            items={[
              { label: article.category.name, href: `/${article.category.slug}` },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {article.featuredImage && (
        <div className="relative h-[400px] lg:h-[500px] bg-neutral-900">
          {article.featuredImage.startsWith('data:') ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      <article className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/${article.category.slug}`}
              className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
            >
              {article.category.name}
            </Link>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{publishDate}</span>
            </div>
            <span>•</span>
            <span>{readingTime} okuma</span>
            <span>•</span>
            <span>{article.views} görüntülenme</span>
          </div>

          <div className="mb-8">
            <SocialShare url={currentUrl} title={article.title} description={article.excerpt} />
          </div>

          <div
            className="prose prose-lg max-w-none mb-12 dark:prose-invert 
              prose-headings:font-bold prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100
              prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:mb-4
              prose-blockquote:border-l-4 prose-blockquote:border-primary-600 prose-blockquote:pl-4 prose-blockquote:italic
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <AuthorInfo 
            article={{
              author: article.author ? {
                name: article.author.name,
                image: article.author.image || undefined,
                slug: article.author.slug || undefined,
                bio: article.author.bio || undefined,
              } : undefined,
              authorRevealDate: article.authorRevealDate?.toISOString(),
            }} 
            variant="card" 
            showBio={true} 
          />
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                Benzer Yazılar
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/yazi/${related.slug}`}
                  className="group relative bg-white dark:bg-neutral-800/80 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-44 overflow-hidden">
                    {related.featuredImage ? (
                      related.featuredImage.startsWith('data:') ? (
                        <img
                          src={related.featuredImage}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src={related.featuredImage}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold opacity-20">
                          {related.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
                        {related.category?.name || 'Genel'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {related.excerpt}
                    </p>
                    <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Devamını Oku</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
