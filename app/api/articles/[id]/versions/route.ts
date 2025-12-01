import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getArticleVersions, restoreVersion } from '@/lib/article-versions';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Yazının var olduğunu ve erişim yetkisini kontrol et
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';

    // Writer sadece kendi yazısının versiyonlarını görebilir
    if (!isAdmin && article.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const versions = await getArticleVersions(id);

    // Versiyon sahiplerinin isimlerini al
    const userIds = [...new Set(versions.map((v) => v.changedBy))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const versionsWithNames = versions.map((v) => ({
      ...v,
      changedByName: userMap.get(v.changedBy) || 'Bilinmeyen',
    }));

    return NextResponse.json({ versions: versionsWithNames });
  } catch (error) {
    console.error('Versions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
    }

    // Yazının var olduğunu ve erişim yetkisini kontrol et
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';

    // Writer sadece kendi yazısını geri alabilir
    if (!isAdmin && article.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const restoredArticle = await restoreVersion(id, versionId, session.user.id);

    return NextResponse.json({ success: true, article: restoredArticle });
  } catch (error) {
    console.error('Version restore error:', error);
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
  }
}
