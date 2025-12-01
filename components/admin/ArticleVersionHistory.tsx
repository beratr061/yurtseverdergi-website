'use client';

import { useState, useEffect } from 'react';
import { History, RotateCcw, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Version {
  id: string;
  version: number;
  title: string;
  excerpt: string;
  content: string;
  changedBy: string;
  changedByName: string;
  changeNote?: string;
  createdAt: string;
}

interface ArticleVersionHistoryProps {
  articleId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export function ArticleVersionHistory({
  articleId,
  isOpen,
  onClose,
  onRestore,
}: ArticleVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, articleId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Bu versiyona geri dönmek istediğinize emin misiniz? Mevcut içerik yeni bir versiyon olarak kaydedilecek.')) {
      return;
    }

    setRestoring(versionId);
    try {
      const response = await fetch(`/api/articles/${articleId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (response.ok) {
        toast.success('Versiyon geri yüklendi');
        onRestore();
        onClose();
      } else {
        toast.error('Geri yükleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setRestoring(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Versiyon Geçmişi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Versiyon Listesi */}
          <div className="w-1/3 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-neutral-500">Yükleniyor...</div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Henüz versiyon geçmişi yok</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                      previewVersion?.id === version.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => setPreviewVersion(version)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        Versiyon {version.version}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version.id);
                        }}
                        disabled={restoring === version.id}
                        className="p-1.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded transition-colors disabled:opacity-50"
                        title="Bu versiyona geri dön"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                      {version.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <span>{version.changedByName}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(version.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    {version.changeNote && (
                      <p className="text-xs text-neutral-500 mt-1 italic">
                        {version.changeNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Önizleme */}
          <div className="flex-1 overflow-y-auto p-6">
            {previewVersion ? (
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {previewVersion.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {previewVersion.excerpt}
                </p>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewVersion.content }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Önizlemek için bir versiyon seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
