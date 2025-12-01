import { Wrench } from 'lucide-react';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MaintenancePage() {
    let settings = null;
    
    try {
        settings = await prisma.settings.findFirst();
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
    
    const session = await auth();
    
    // Eğer bakım modu kapalıysa veya kullanıcı admin ise ana sayfaya yönlendir
    if (!settings?.maintenanceMode || session?.user?.role === 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800 px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                            <Wrench className="h-16 w-16 text-primary-600 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                            Bakım Modu
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Sitemiz şu anda bakım çalışması yapıyor
                        </p>
                    </div>

                    <div className="bg-primary-50 dark:bg-primary-900/10 rounded-lg p-4">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            {settings?.maintenanceMessage ||
                                'Daha iyi bir deneyim sunmak için sistemimizi güncelliyoruz. Lütfen daha sonra tekrar ziyaret edin.'}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Acil durumlar için: {settings?.contactEmail || 'info@yurtsever.com'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
