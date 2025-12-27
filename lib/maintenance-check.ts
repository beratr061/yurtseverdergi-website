import { redirect } from 'next/navigation';
import { getSettings } from './db';
import { auth } from '@/auth';

export async function checkMaintenanceMode() {
  let shouldRedirect = false;
  
  try {
    // Önce session kontrolü yap - admin kullanıcılar muaf
    const session = await auth();
    if (session?.user?.role === 'ADMIN') {
      return; // Admin kullanıcılar bakım modundan muaf
    }
    
    const { data: settings } = await getSettings();
    
    if (settings?.maintenanceMode) {
      shouldRedirect = true;
    }
  } catch (error) {
    // Build sırasında static generation denemesinde bu hata normal
    if (process.env.NODE_ENV === 'development') {
      console.error('Maintenance check error:', error);
    }
  }
  
  // redirect'i try-catch dışında çağır
  if (shouldRedirect) {
    redirect('/maintenance');
  }
}
