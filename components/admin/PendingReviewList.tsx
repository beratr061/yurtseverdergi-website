'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  submittedAt: Date | null;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PendingReviewListProps {
  articles: Article[];
}

export function PendingReviewList({ articles }: PendingReviewListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (id: string) => {
    if (!confirm('Bu yazıyı onaylamak istediğinize emin misiniz?')) return;

    setProcessing(id);
    try {
      const response = await fetch(`/api/articles/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        toast.success('Yazı onaylandı ve yayınlandı');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error('Lütfen reddetme nedenini girin');
      return;
    }

    setProcessing(rejectModal.id);
    try {
      const response = await fetch(`/api/articles/${rejectModal.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason }),
      });

      if (response.ok) {
        toast.success('Yazı reddedildi');
        setRejectModal(null);
        setRejectReason('');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Yazıyı Reddet
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              "{rejectModal.title}" başlıklı yazıyı reddetmek üzeresiniz.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reddetme nedenini yazın..."
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={processing === rejectModal.id || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing === rejectModal.id ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 transition-colors"
                >
                  {article.title}
                </Link>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    {article.author.image ? (
                      <img
                        src={article.author.image}
                        alt={article.author.name}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <User className="h-3 w-3 text-neutral-500" />
                      </div>
                    )}
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {article.author.name}
                    </span>
                  </div>
                  <span className="text-sm px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400">
                    {article.category.name}
                  </span>
                  {article.submittedAt && (
                    <span className="text-sm text-neutral-500">
                      {format(new Date(article.submittedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                  title="İncele"
                >
                  <Eye className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleApprove(article.id)}
                  disabled={processing === article.id}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Onayla"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setRejectModal({ id: article.id, title: article.title })}
                  disabled={processing === article.id}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Reddet"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
