'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Page error:', error);
    }
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center px-4 max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-500" />
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Bir Hata Oluştu
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
          Üzgünüz, bir şeyler yanlış gitti. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>

        {/* Error Digest (for debugging) */}
        {error.digest && (
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-6 font-mono">
            Hata Kodu: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
