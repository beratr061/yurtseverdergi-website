'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Image,
  Settings,
  PenTool,
  Menu,
  X,
  UserCog,
  ClipboardCheck,
  Activity,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'WRITER', 'POET'], writerName: 'Ana Sayfa' },
  { name: 'Yazılar', href: '/admin/articles', icon: FileText, roles: ['ADMIN', 'WRITER', 'POET'], writerName: 'Yazılarım' },
  { name: 'Onay Bekleyenler', href: '/admin/pending-reviews', icon: ClipboardCheck, roles: ['ADMIN'] },
  { name: 'Kullanıcılar', href: '/admin/users', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Kategoriler', href: '/admin/categories', icon: FolderOpen, roles: ['ADMIN'] },
  { name: 'Medya', href: '/admin/media', icon: Image, roles: ['ADMIN', 'WRITER', 'POET'] },
  { name: 'Aktivite Logları', href: '/admin/activity-logs', icon: Activity, roles: ['ADMIN'] },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

interface AdminSidebarProps {
  userRole?: string;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isWriterOrPoet = userRole === 'WRITER' || userRole === 'POET';
  
  // Filter navigation based on user role
  const filteredNavigation = navigation
    .filter(item => item.roles.includes(userRole || 'POET'))
    .map(item => ({
      ...item,
      name: isWriterOrPoet && item.writerName ? item.writerName : item.name,
    }));

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenTool className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              YurtSever
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-6 py-4">
          <div className="flex h-16 items-center space-x-2 mb-4">
            <PenTool className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              YurtSever
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul role="list" className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors
                        ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 px-6 pb-4">
        <div className="flex h-20 shrink-0 items-center space-x-2">
          <PenTool className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            YurtSever
          </span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors
                          ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    </>
  );
}
