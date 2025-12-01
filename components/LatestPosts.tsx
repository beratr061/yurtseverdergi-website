import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AuthorInfo } from './AuthorInfo';

interface LatestPostsProps {
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

export function LatestPosts({ articles: posts }: LatestPostsProps) {
  return (
    <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-1 w-12 bg-primary-600" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              YurtSever
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Son Eklenenler
          </h2>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Henüz yayınlanmış yazı bulunmuyor.
              </p>
            </div>
          ) : (
            posts.map((post: any) => {
              const publishDate = post.publishedAt
                ? format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: tr })
                : format(new Date(post.createdAt), 'dd MMM yyyy', { locale: tr });

              return (
                <Link
                  key={post.id}
                  href={`/yazi/${post.slug}`}
                  className="group h-full"
                >
                  <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {post.featuredImage ? (
                        post.featuredImage.startsWith('data:') ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-20">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                          {post.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
                        <AuthorInfo article={post} variant="compact" disableLink />
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
      </div>
    </section>
  );
}
