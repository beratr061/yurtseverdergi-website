import { Plus } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { CategoryList } from '@/components/admin/CategoryList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CategoriesPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  let categories: any[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Kategoriler
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Yazı kategorilerini yönetin
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Kategori</span>
        </Link>
      </div>

      <CategoryList categories={categories} />
    </div>
  );
}
