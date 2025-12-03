'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  LogIn,
  LogOut,
  Activity,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityTitle?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
}

interface ActivityLogListProps {
  logs: ActivityLog[];
}

const actionIcons: Record<string, any> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  PUBLISH: Eye,
  APPROVE: Check,
  REJECT: X,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  PUBLISH: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  APPROVE: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  REJECT: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  LOGIN: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  LOGOUT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

const actionLabels: Record<string, string> = {
  CREATE: 'Oluşturdu',
  UPDATE: 'Güncelledi',
  DELETE: 'Sildi',
  PUBLISH: 'Yayınladı',
  APPROVE: 'Onayladı',
  REJECT: 'Reddetti',
  LOGIN: 'Giriş Yaptı',
  LOGOUT: 'Çıkış Yaptı',
};

const entityLabels: Record<string, string> = {
  article: 'Yazı',
  user: 'Kullanıcı',
  category: 'Kategori',
  media: 'Medya',
  settings: 'Ayarlar',
};

export function ActivityLogList({ logs }: ActivityLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
        <Activity className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          Henüz aktivite kaydı bulunmuyor
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                İşlem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Hedef
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Detay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Tarih
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {logs.map((log) => {
              const Icon = actionIcons[log.action] || Activity;
              const colorClass = actionColors[log.action] || actionColors.UPDATE;

              return (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {log.userName}
                    </div>
                    {log.ipAddress && (
                      <div className="text-xs text-neutral-500">{log.ipAddress}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">
                      {entityLabels[log.entityType] || log.entityType}
                    </div>
                    {log.entityTitle && (
                      <div className="text-xs text-neutral-500 truncate max-w-xs">
                        {log.entityTitle}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
                      {log.details || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
