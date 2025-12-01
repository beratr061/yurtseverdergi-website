import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { getCategories } from '@/lib/db';
import { ArticleForm } from '../../../../../components/admin/ArticleForm';

export default async function NewArticlePage() {
  const session = await auth();
  const userRole = session?.user?.role;
  const isAdmin = userRole === 'ADMIN';

  const categoriesResult = await getCategories();
  const categories = categoriesResult.data || [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/articles"
          className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Yazılara Dön</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {isAdmin ? 'Yeni Yazı Oluştur' : 'Yeni Yazı Ekle'}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {isAdmin 
            ? 'Yeni bir yazı veya şiir ekleyin' 
            : 'Yazınız taslak olarak kaydedilecek ve admin onayından sonra yayınlanacaktır'}
        </p>
      </div>

      <ArticleForm categories={categories} userRole={userRole} />
    </div>
  );
}
