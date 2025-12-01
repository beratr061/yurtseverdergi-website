import Link from 'next/link';
import { Home, Search, BookOpen, Users, FileText } from 'lucide-react';

const popularLinks = [
  { href: '/siir', label: 'Şiirler', icon: BookOpen },
  { href: '/yazarlar', label: 'Yazarlar', icon: Users },
  { href: '/hakkimizda', label: 'Hakkımızda', icon: FileText },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center px-4 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[180px] font-bold text-neutral-200 dark:text-neutral-800 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-primary-600 opacity-50" />
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
          Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
          <br />
          Aşağıdaki bağlantılardan devam edebilirsiniz.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <Link
            href="/arama"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>Yazıları Keşfet</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
            Popüler Sayfalar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-600 hover:shadow-md transition-all group"
                >
                  <Icon className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
