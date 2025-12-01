import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWriterById } from '@/lib/db';
import { WriterForm } from '@/components/admin/WriterForm';

interface EditWriterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWriterPage({ params }: EditWriterPageProps) {
  const { id } = await params;

  const { data: writer, error } = await getWriterById(id);

  if (error || !writer) {
    notFound();
  }

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
          Yazarı Düzenle
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {writer.name}
        </p>
      </div>

      <WriterForm writer={writer} />
    </div>
  );
}
