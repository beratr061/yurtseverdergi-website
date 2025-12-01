import { redirect } from 'next/navigation';

export default async function WritersPage() {
  // Yazarlar artık /admin/users sayfasında yönetiliyor
  redirect('/admin/users');
}
