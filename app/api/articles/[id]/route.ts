import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
            bio: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';
    const canPublish = isAdmin;

    // Yazıyı kontrol et
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Writer sadece kendi yazısını düzenleyebilir
    if (!isAdmin && existingArticle.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own articles' }, { status: 403 });
    }

    const body = await request.json();
    let { status, ...rest } = body;

    // Writer'lar yayınlayamaz
    if (!canPublish && status === 'PUBLISHED') {
      status = 'DRAFT';
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...rest,
        status,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
        authorRevealDate: body.authorRevealDate ? new Date(body.authorRevealDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        author: true,
      },
    });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';

    // Get article to find author
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Writer sadece kendi taslak yazısını silebilir
    if (!isAdmin) {
      if (article.authorId !== userId) {
        return NextResponse.json({ error: 'Forbidden - You can only delete your own articles' }, { status: 403 });
      }
      if (article.status === 'PUBLISHED') {
        return NextResponse.json({ error: 'Forbidden - You cannot delete published articles' }, { status: 403 });
      }
    }

    // Delete article
    await prisma.article.delete({ where: { id } });

    // Decrement author's article count
    await prisma.user.update({
      where: { id: article.authorId },
      data: { articleCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
