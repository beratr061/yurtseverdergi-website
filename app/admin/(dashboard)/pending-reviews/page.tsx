import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { PendingReviewList } from '@/components/admin/PendingReviewList';

export default async function PendingReviewsPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Sadece Admin erişebilir
  if (userRole !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  const pendingArticles = await prisma.article.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Onay Bekleyen Yazılar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Yazarların gönderdiği yazıları inceleyin ve onaylayın veya reddedin
        </p>
      </div>

      {pendingArticles.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Onay bekleyen yazı bulunmuyor
          </p>
        </div>
      ) : (
        <PendingReviewList articles={pendingArticles} />
      )}
    </div>
  );
}
