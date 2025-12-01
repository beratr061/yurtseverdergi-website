import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  // ADMIN, WRITER ve POET rolleri erişebilir
  const allowedRoles = ['ADMIN', 'WRITER', 'POET'];
  if (!allowedRoles.includes(session.user.role || '')) {
    redirect('/admin/unauthorized');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminSidebar userRole={session.user.role} />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
