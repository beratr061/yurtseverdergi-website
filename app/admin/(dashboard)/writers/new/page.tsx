import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { WriterForm } from '@/components/admin/WriterForm';

export default function NewWriterPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/writers"
          className="inline-flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Yazarlara Dön</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Yeni Yazar Oluştur
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Yeni bir yazar profili ekleyin
        </p>
      </div>

      <WriterForm />
    </div>
  );
}
