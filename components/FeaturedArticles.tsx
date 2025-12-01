import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AuthorInfo } from './AuthorInfo';

interface FeaturedArticlesProps {
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    category: {
      name: string;
      slug: string;
    };
    author?: {
      name: string;
      image?: string;
      slug?: string;
      bio?: string;
    };
    authorRevealDate?: string;
  }>;
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Öne Çıkan Yazılar
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Editörlerimizin seçtiği en iyi içerikler
            </p>
          </div>
          <Link
            href="/yazilar"
            className="hidden sm:inline-flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group"
          >
            <span>Tümünü Gör</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid - 3 columns like LatestPosts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Henüz öne çıkan yazı bulunmuyor.
              </p>
            </div>
          ) : (
            articles.map((article) => {
              const imageUrl = article.featuredImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop';
              const publishDate = article.publishedAt
                ? format(new Date(article.publishedAt), 'dd MMM yyyy', { locale: tr })
                : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: tr });

              return (
              <Link
                key={article.id}
                href={`/yazi/${article.slug}`}
                className="group h-full"
              >
                <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    {imageUrl.startsWith('data:') ? (
                      <img
                        src={imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                        {article.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
                      <AuthorInfo article={article} variant="compact" disableLink />
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{publishDate}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
            })
          )}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 sm:hidden">
          <Link
            href="/yazilar"
            className="flex items-center justify-center space-x-2 w-full py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>Tümünü Gör</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
