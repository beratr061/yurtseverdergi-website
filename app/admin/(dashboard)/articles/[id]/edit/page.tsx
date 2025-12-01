import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getArticleById, getCategories } from '@/lib/db';
import { ArticleForm } from '../../../../../../components/admin/ArticleForm';
import { Breadcrumbs } from '../../../../../../components/admin/Breadcrumbs';

interface EditArticlePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;
    const isAdmin = userRole === 'ADMIN';

    const { id } = await params;

    const [articleResult, categoriesResult] = await Promise.all([
        getArticleById(id),
        getCategories(),
    ]);

    const article = articleResult.data;
    const categories = categoriesResult.data || [];

    if (!article) {
        notFound();
    }

    // Writer sadece kendi yazılarını düzenleyebilir
    if (!isAdmin && article.authorId !== userId) {
        redirect('/admin/unauthorized');
    }

    return (
        <div>
            <Breadcrumbs
                items={[
                    { label: 'Yazılar', href: '/admin/articles' },
                    { label: 'Düzenle', href: `/admin/articles/${article.id}/edit` },
                    { label: article.title },
                ]}
            />

            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Yazıyı Düzenle
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    {article.title}
                </p>
            </div>

            <ArticleForm categories={categories} article={article} userRole={userRole} />
        </div>
    );
}
