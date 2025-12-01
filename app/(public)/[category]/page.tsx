import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getArticles } from '@/lib/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { checkMaintenanceMode } from '@/lib/maintenance-check';
import { AuthorInfo } from '@/components/AuthorInfo';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const { data: category } = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Kategori Bulunamadı - YurtSever Dergi',
    };
  }

  return {
    title: `${category.name} - YurtSever Dergi`,
    description: category.description || `${category.name} kategorisindeki yazılar`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  await checkMaintenanceMode();

  const { data: category, error } = await getCategoryBySlug(slug);

  if (error || !category) {
    notFound();
  }

  const { data: articles } = await getArticles({
    status: 'PUBLISHED',
    categoryId: category.id,
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-neutral-900 dark:bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-neutral-300">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    className="group h-full"
                  >
                    <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        {article.featuredImage ? (
                          article.featuredImage.startsWith('data:') ? (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold opacity-20">
                              {article.title.charAt(0)}
                            </span>
                          </div>
                        )}
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
                          <AuthorInfo article={article} variant="compact" />
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
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Bu kategoride henüz yazı bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
