import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserForm } from '@/components/admin/UserForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function NewUserPage() {
  const session = await auth();
  
  // Sadece ADMIN rolü yeni kullanıcı ekleyebilir
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kullanıcılara Dön</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Yeni Kullanıcı
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Sisteme yeni kullanıcı ekleyin (Sadece Admin)
        </p>
      </div>

      <UserForm />
    </div>
  );
}
