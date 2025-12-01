import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kategorilere Dön</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Yeni Kategori Oluştur
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Yeni bir kategori ekleyin
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
