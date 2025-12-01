import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft, PenTool } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getWriterBySlug, getArticles } from '@/lib/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { checkMaintenanceMode } from '@/lib/maintenance-check';

export const revalidate = 300;

interface WriterPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: WriterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: writer } = await getWriterBySlug(slug);

  if (!writer) {
    return {
      title: 'Yazar Bulunamadı - YurtSever Dergi',
    };
  }

  return {
    title: `${writer.name} - YurtSever Dergi`,
    description: writer.bio || `${writer.name} yazıları`,
  };
}

export default async function WriterPage({ params }: WriterPageProps) {
  const { slug } = await params;

  await checkMaintenanceMode();

  const { data: writer, error } = await getWriterBySlug(slug);

  if (error || !writer) {
    notFound();
  }

  // Yazarın yazılarını çek
  const { data: articles } = await getArticles({
    status: 'PUBLISHED',
    authorId: writer.id,
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Back Button */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/yazarlar"
            className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tüm Yazarlar</span>
          </Link>
        </div>
      </div>

      {/* Writer Profile - Hero with Background Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        {/* Background Image */}
        {writer.image ? (
          <Image
            src={writer.image}
            alt={writer.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        )}
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        
        {/* Content */}
        <div className="relative h-full flex items-end">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Small Avatar */}
              <div className="relative flex-shrink-0">
                {writer.image ? (
                  <Image
                    src={writer.image}
                    alt={writer.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/20">
                    <PenTool className="h-12 w-12 text-white/70" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-medium text-primary-400 mb-1 uppercase tracking-wider">
                  {writer.role}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  {writer.name}
                </h1>
                {writer.bio && (
                  <p className="text-neutral-300 leading-relaxed max-w-2xl mb-4">
                    {writer.bio}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <PenTool className="h-4 w-4" />
                    {writer.articleCount || 0} yazı
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writer's Articles */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            Yazıları
          </h2>

          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => {
                const publishDate = article.publishedAt
                  ? format(new Date(article.publishedAt), 'dd MMM yyyy', { locale: tr })
                  : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: tr });

                return (
                  <Link
                    key={article.id}
                    href={`/yazi/${article.slug}`}
                    className="group"
                  >
                    <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all">
                      <div className="relative h-48 bg-neutral-200 dark:bg-neutral-700">
                        {article.featuredImage ? (
                          article.featuredImage.startsWith('data:') ? (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          )
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold opacity-20">
                              {article.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                            {article.category?.name || 'Genel'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{publishDate}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Henüz yayınlanmış yazı bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
