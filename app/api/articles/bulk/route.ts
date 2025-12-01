import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';

    // Toplu işlemler sadece Admin için
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { action, ids } = await req.json();

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    switch (action) {
      case 'publish':
        await prisma.article.updateMany({
          where: { id: { in: ids } },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });
        break;

      case 'draft':
        await prisma.article.updateMany({
          where: { id: { in: ids } },
          data: { status: 'DRAFT' },
        });
        break;

      case 'archive':
        await prisma.article.updateMany({
          where: { id: { in: ids } },
          data: { status: 'ARCHIVED' },
        });
        break;

      case 'delete':
        await prisma.article.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: ids.length,
      message: `${ids.length} yazı güncellendi`,
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Toplu işlem başarısız oldu' },
      { status: 500 }
    );
  }
}
