import { auth } from '@/auth';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default async function MediaPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const isAdmin = userRole === 'ADMIN';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isAdmin ? 'Medya Kütüphanesi' : 'Görsellerim'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {isAdmin
              ? 'Yüklenen görselleri yönetin'
              : 'Yüklediğiniz görselleri buradan yönetebilirsiniz'}
          </p>
        </div>
      </div>

      <MediaLibrary userRole={userRole} userId={userId} />
    </div>
  );
}
