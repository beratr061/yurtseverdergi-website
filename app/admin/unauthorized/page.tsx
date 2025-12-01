import Link from 'next/link';
import { ShieldX, Home, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ShieldX className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Yetkisiz Erişim
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yöneticiler admin paneline erişebilir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Home className="h-5 w-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            <Link
              href="/api/auth/signout"
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Çıkış Yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
