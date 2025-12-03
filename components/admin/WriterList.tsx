'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';

interface Writer {
  id: string;
  name: string;
  slug: string;
  role: string;
  image: string | null;
  articleCount?: number;
  _count?: {
    articles: number;
  };
}

interface WriterListProps {
  writers: Writer[];
}

export function WriterList({ writers }: WriterListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" yazarını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/writers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Yazar silinemedi');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  if (writers.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
        <Users className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Henüz yazar yok
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          İlk yazarı oluşturarak başlayın
        </p>
        <Link
          href="/admin/writers/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <span>Yeni Yazar Oluştur</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {writers.map((writer) => (
        <div
          key={writer.id}
          className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <img
                src={writer.image || '/images/default-avatar.png'}
                alt={writer.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {writer.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {writer.role}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  {writer.articleCount ?? writer._count?.articles ?? 0} yazı
                </p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 px-6 py-3 flex items-center justify-end space-x-2 border-t border-neutral-200 dark:border-neutral-700">
            <Link
              href={`/admin/writers/${writer.id}/edit`}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Düzenle"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(writer.id, writer.name)}
              disabled={deleting === writer.id}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
