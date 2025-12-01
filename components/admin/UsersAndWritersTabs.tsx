'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, UserCog, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Writer {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  articleCount: number;
  createdAt: string;
}

interface UsersAndWritersTabsProps {
  users: User[];
  writers: Writer[];
}

export function UsersAndWritersTabs({ users, writers }: UsersAndWritersTabsProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'writers'>('users');

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
              }
            `}
          >
            <UserCog className="h-5 w-5" />
            <span>Sistem Kullanıcıları ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('writers')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'writers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
              }
            `}
          >
            <Users className="h-5 w-5" />
            <span>Yazar Profilleri ({writers.length})</span>
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link
              href="/admin/users/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Kullanıcı</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : user.role === 'WRITER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}
                        >
                          {user.role === 'ADMIN' ? 'Admin' : user.role === 'WRITER' ? 'Yazar' : 'Şair'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.email === 'admin@yurtsever.com' ? (
                          <span className="text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                            Korumalı
                          </span>
                        ) : (
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                          >
                            Düzenle
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Writers Tab */}
      {activeTab === 'writers' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link
              href="/admin/writers/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Yazar Profili</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writers.map((writer) => (
              <div
                key={writer.id}
                className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={writer.image}
                    alt={writer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">{writer.name}</h3>
                    <p className="text-sm text-neutral-200">{writer.role}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                    {writer.bio}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {writer.articleCount} yazı
                    </span>
                    <Link
                      href={`/admin/writers/${writer.id}/edit`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Düzenle →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
