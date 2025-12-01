import prisma from './prisma';

interface CreateVersionParams {
  articleId: string;
  title: string;
  excerpt: string;
  content: string;
  changedBy: string;
  changeNote?: string;
}

export async function createArticleVersion(params: CreateVersionParams) {
  try {
    // Mevcut en yüksek versiyon numarasını bul
    const lastVersion = await prisma.articleVersion.findFirst({
      where: { articleId: params.articleId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const newVersion = (lastVersion?.version || 0) + 1;

    return await prisma.articleVersion.create({
      data: {
        articleId: params.articleId,
        title: params.title,
        excerpt: params.excerpt,
        content: params.content,
        version: newVersion,
        changedBy: params.changedBy,
        changeNote: params.changeNote,
      },
    });
  } catch (error) {
    console.error('Version create error:', error);
    return null;
  }
}

export async function getArticleVersions(articleId: string) {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { version: 'desc' },
  });
}

export async function getArticleVersion(versionId: string) {
  return prisma.articleVersion.findUnique({
    where: { id: versionId },
  });
}

export async function restoreVersion(articleId: string, versionId: string, restoredBy: string) {
  const version = await prisma.articleVersion.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    throw new Error('Version not found');
  }

  // Mevcut içeriği yeni versiyon olarak kaydet
  const currentArticle = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, excerpt: true, content: true },
  });

  if (currentArticle) {
    await createArticleVersion({
      articleId,
      title: currentArticle.title,
      excerpt: currentArticle.excerpt,
      content: currentArticle.content,
      changedBy: restoredBy,
      changeNote: `Versiyon ${version.version}'e geri dönüldü`,
    });
  }

  // Makaleyi eski versiyona geri döndür
  return prisma.article.update({
    where: { id: articleId },
    data: {
      title: version.title,
      excerpt: version.excerpt,
      content: version.content,
      updatedAt: new Date(),
    },
  });
}
