import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notifyNewPendingArticle } from '@/lib/notifications';
import { logActivity } from '@/lib/activity-logger';

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

    // Yazıyı bul
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true, status: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Sadece yazar kendi yazısını onaya gönderebilir
    if (article.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Sadece DRAFT veya REJECTED durumundaki yazılar onaya gönderilebilir
    if (!['DRAFT', 'REJECTED'].includes(article.status)) {
      return NextResponse.json(
        { error: 'Only draft or rejected articles can be submitted for review' },
        { status: 400 }
      );
    }

    // Yazıyı onaya gönder
    await prisma.article.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Adminlere bildirim gönder
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const adminIds = admins.map((a) => a.id);
    await notifyNewPendingArticle(
      adminIds,
      article.title,
      session.user.name || 'Yazar',
      article.id
    );

    // Aktivite logu
    await logActivity({
      userId: session.user.id,
      userName: session.user.name || 'Unknown',
      action: 'UPDATE',
      entityType: 'article',
      entityId: article.id,
      entityTitle: article.title,
      details: 'Onaya gönderildi',
    });

    return NextResponse.json({ success: true, message: 'Yazı onaya gönderildi' });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Failed to submit article' }, { status: 500 });
  }
}
