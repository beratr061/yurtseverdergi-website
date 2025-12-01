import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { checkMaintenanceMode } from '@/lib/maintenance-check';

export const metadata: Metadata = {
  title: 'Şiirler - YurtSever Dergi',
  description: 'Türk edebiyatının en güzel şiirleri ve şairlerinin eserleri.',
};

export default async function PoemsPage() {
  await checkMaintenanceMode();
  
  let poems: any[] = [];

  try {
    const siirCategory = await prisma.category.findUnique({
      where: { slug: 'siir' },
    });

    if (siirCategory) {
      poems = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          categoryId: siirCategory.id,
        },
        include: {
          author: {
            select: { name: true, image: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching poems:', error);
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <section className="relative py-20 bg-neutral-900 dark:bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Şiirler</h1>
          <p className="text-xl text-neutral-300">Türk edebiyatının en güzel şiirleri</p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {poems.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Henüz yayınlanmış şiir bulunmuyor.
                </p>
              </div>
            ) : (
              poems.map((poem) => {
                const authorName = poem.author?.name || 'Anonim';
                const authorImage = poem.author?.image || 'https://i.pravatar.cc/150?img=1';
                const imageUrl = poem.featuredImage || 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=600&fit=crop';
                const publishDate = poem.publishedAt
                  ? format(new Date(poem.publishedAt), 'dd MMM yyyy', { locale: tr })
                  : format(new Date(poem.createdAt), 'dd MMM yyyy', { locale: tr });

                return (
                  <Link key={poem.id} href={`/yazi/${poem.slug}`} className="group h-full">
                    <article className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                            Şiir
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {poem.title}
                        </h3>
                        
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                          {poem.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-auto">
                          <div className="flex items-center space-x-2">
                            <img src={authorImage} alt={authorName} className="w-6 h-6 rounded-full object-cover" />
                            <span>{authorName}</span>
                          </div>
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
    </main>
  );
}
