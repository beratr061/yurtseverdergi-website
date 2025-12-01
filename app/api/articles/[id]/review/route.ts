import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notifyArticleApproved, notifyArticleRejected } from '@/lib/notifications';
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

    const isAdmin = session.user.role === 'ADMIN';

    // Sadece Admin onaylayabilir/reddedebilir
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Yazıyı bul
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true, status: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Sadece PENDING_REVIEW durumundaki yazılar onaylanabilir/reddedilebilir
    if (article.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { error: 'Article is not pending review' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Yazıyı onayla ve yayınla
      await prisma.article.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });

      // Yazara bildirim gönder
      await notifyArticleApproved(article.authorId, article.title, article.id);

      // Aktivite logu
      await logActivity({
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'APPROVE',
        entityType: 'article',
        entityId: article.id,
        entityTitle: article.title,
      });

      return NextResponse.json({ success: true, message: 'Yazı onaylandı ve yayınlandı' });
    } else {
      // Yazıyı reddet
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });
      }

      await prisma.article.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: reason,
        },
      });

      // Yazara bildirim gönder
      await notifyArticleRejected(article.authorId, article.title, article.id, reason);

      // Aktivite logu
      await logActivity({
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'REJECT',
        entityType: 'article',
        entityId: article.id,
        entityTitle: article.title,
        details: reason,
      });

      return NextResponse.json({ success: true, message: 'Yazı reddedildi' });
    }
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to review article' }, { status: 500 });
  }
}
