import { Metadata } from 'next';
import Link from 'next/link';
import { PenTool } from 'lucide-react';
import { getWriters } from '@/lib/db';
import { checkMaintenanceMode } from '@/lib/maintenance-check';

export const metadata: Metadata = {
  title: 'Yazarlar - YurtSever Dergi',
  description: 'YurtSever Dergi\'nin değerli yazarları ve şairleri.',
};

export default async function WritersPage() {
  await checkMaintenanceMode();
  const { data: writers } = await getWriters();
  
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-neutral-900 dark:bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Yazarlarımız
          </h1>
          <p className="text-xl text-neutral-300">
            Türk edebiyatının değerli kalemleri
          </p>
        </div>
      </section>

      {/* Writers Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {writers && writers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {writers.map((writer: any) => (
                <Link
                  key={writer.id}
                  href={`/yazar/${writer.slug}`}
                  className="group h-full"
                >
                  <article className="relative h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image Container */}
                    <div className="relative h-80 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ 
                          backgroundImage: writer.image 
                            ? `url(${writer.image})` 
                            : 'linear-gradient(to br, #6366f1, #8b5cf6)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Icon Badge */}
                      <div className="absolute top-4 right-4 p-2 bg-primary-600 rounded-lg">
                        <PenTool className="h-5 w-5 text-white" />
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {writer.name}
                        </h3>
                        <p className="text-neutral-200 text-sm">
                          {writer.role === 'WRITER' ? 'Yazar' : writer.role === 'POET' ? 'Şair' : writer.role}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {writer.bio || 'YurtSever Dergi yazarı'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm mt-auto">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {writer.articleCount || 0} yazı
                        </span>
                        <span className="text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
                          Profili Gör →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Henüz yazar bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
