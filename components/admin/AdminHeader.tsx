'use client';

import { LogOut, Shield, PenTool, Feather, ExternalLink } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationCenter } from './NotificationCenter';

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const roleConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ADMIN: { label: 'Admin', icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' },
  WRITER: { label: 'Yazar', icon: PenTool, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' },
  POET: { label: 'Şair', icon: Feather, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const role = roleConfig[user.role as string] || roleConfig.POET;
  const isAdmin = user.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 flex h-16 lg:h-20 shrink-0 items-center gap-x-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:gap-x-6 sm:px-6 lg:px-8 mt-14 lg:mt-0">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-base lg:text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {isAdmin ? 'İçerik Yönetim Sistemi' : 'Yazar Paneli'}
          </h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            title="Siteyi Görüntüle"
          >
            <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5" />
          </a>
          <NotificationCenter />
          <ThemeToggle />
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-200 dark:lg:bg-neutral-800" />

          <div className="flex items-center gap-x-2 lg:gap-x-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || ''}
                  className="h-8 w-8 lg:h-10 lg:w-10 rounded-full"
                />
              ) : (
                <div className={`h-8 w-8 lg:h-10 lg:w-10 rounded-full ${role.bg} flex items-center justify-center`}>
                  <role.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${role.color}`} />
                </div>
              )}
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </div>
                <div className={`text-xs font-medium ${role.color}`}>
                  {role.label}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
