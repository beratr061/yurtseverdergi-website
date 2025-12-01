import Link from 'next/link';
import { PenTool } from 'lucide-react';

interface WritersProps {
  writers: Array<{
    id: string;
    slug: string;
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;
}

export function Writers({ writers }: WritersProps) {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Yazarlarımız
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Türk edebiyatının değerli kalemleri
            </p>
          </div>
          <Link
            href="/yazarlar"
            className="hidden sm:inline-flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>Tümünü Gör</span>
          </Link>
        </div>

        {/* Writers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {writers.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Henüz yazar bulunmuyor.
              </p>
            </div>
          ) : (
            writers.map((writer) => (
            <Link
              key={writer.id}
              href={`/yazar/${writer.slug}`}
              className="group"
            >
              <article className="relative">
                {/* Image Container */}
                <div className="relative mb-6">
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: writer.image ? `url(${writer.image})` : 'none', backgroundColor: writer.image ? undefined : '#e5e7eb' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Icon Badge */}
                  <div className="absolute -bottom-4 left-6 p-3 bg-primary-600 rounded-lg shadow-lg">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 transition-colors">
                      {writer.name}
                    </h3>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {writer.role === 'WRITER' ? 'Yazar' : writer.role === 'POET' ? 'Şair' : writer.role}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                    {writer.bio}
                  </p>
                </div>
              </article>
            </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
