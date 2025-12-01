import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { UserForm } from '@/components/admin/UserForm';
import { auth } from '@/auth';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth();
  const { id } = await params;
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  let user = null;

  try {
    user = await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  if (!user) {
    notFound();
  }

  // Admin kullanıcısı düzenlenemez
  if (user.email === 'admin@yurtsever.com') {
    redirect('/admin/users');
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
          Kullanıcı Düzenle
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {user.name} - {user.email}
        </p>
      </div>

      <UserForm user={user} />
    </div>
  );
}
