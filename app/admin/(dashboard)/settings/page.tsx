import { SettingsForm } from '@/components/admin/SettingsForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  
  // Sadece ADMIN ayarlara erişebilir
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Ayarlar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Site ayarlarını yönetin (Sadece Admin)
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
