'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4 max-w-2xl mx-auto">
            {/* Error Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Kritik Hata
            </h1>
            <p className="text-neutral-600 mb-8 text-lg">
              Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı yenileyin.
            </p>

            {/* Error Digest */}
            {error.digest && (
              <p className="text-sm text-neutral-500 mb-6 font-mono">
                Hata Kodu: {error.digest}
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Sayfayı Yenile</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
