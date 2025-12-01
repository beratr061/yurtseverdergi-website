import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ActivityLogList } from '@/components/admin/ActivityLogList';

export default async function ActivityLogsPage() {
  const session = await auth();

  // Sadece Admin erişebilir
  if (session?.user?.role !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Aktivite Logları
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Sistemdeki tüm aktiviteleri görüntüleyin
        </p>
      </div>

      <ActivityLogList logs={logs} />
    </div>
  );
}
