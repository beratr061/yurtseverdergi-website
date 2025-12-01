import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { createArticleVersion } from '@/lib/article-versions';
import { logActivity } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const authorId = searchParams.get('authorId');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;

    const take = limit ? parseInt(limit) : 10;
    const skip = page ? (parseInt(page) - 1) * take : 0;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      data: articles,
      total,
      page: page ? parseInt(page) : 1,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    const canPublish = isAdmin;

    const body = await request.json();
    let { title, excerpt, content, featuredImage, status, categoryId, publishedAt, authorRevealDate } = body;

    // Writer'lar sadece taslak oluşturabilir
    if (!canPublish && status === 'PUBLISHED') {
      status = 'DRAFT';
    }

    // Generate slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        authorRevealDate: authorRevealDate ? new Date(authorRevealDate) : null,
        authorId: session.user.id as string,
        categoryId,
      },
      include: {
        category: true,
        author: true,
      },
    });

    // Update author's article count
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: { articleCount: { increment: 1 } },
    });

    // Aktivite logu
    await logActivity({
      userId: session.user.id as string,
      userName: session.user.name || 'Unknown',
      action: 'CREATE',
      entityType: 'article',
      entityId: article.id,
      entityTitle: article.title,
    });

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';
    const canPublish = isAdmin;

    const body = await request.json();
    const { id, title, excerpt, content, featuredImage, categoryId, publishedAt, authorRevealDate } = body;
    let { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Yazıyı kontrol et
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true, slug: true },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Writer sadece kendi yazısını düzenleyebilir
    if (!isAdmin && existingArticle.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own articles' }, { status: 403 });
    }

    // Writer'lar yayınlayamaz
    if (!canPublish && status === 'PUBLISHED') {
      status = 'DRAFT';
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug;
    if (title) {
      const baseSlug = slugify(title);
      if (baseSlug !== existingArticle.slug) {
        slug = baseSlug;
        let counter = 1;
        while (await prisma.article.findFirst({ where: { slug, id: { not: id } } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }

    // Mevcut içeriği versiyon olarak kaydet
    const currentArticle = await prisma.article.findUnique({
      where: { id },
      select: { title: true, excerpt: true, content: true },
    });

    if (currentArticle) {
      await createArticleVersion({
        articleId: id,
        title: currentArticle.title,
        excerpt: currentArticle.excerpt,
        content: currentArticle.content,
        changedBy: userId as string,
      });
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status: status || 'DRAFT',
        categoryId,
        publishedAt: publishedAt ? new Date(publishedAt) : status === 'PUBLISHED' ? new Date() : null,
        authorRevealDate: authorRevealDate ? new Date(authorRevealDate) : null,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        author: true,
      },
    });

    // Aktivite logu
    await logActivity({
      userId: userId as string,
      userName: session.user.name || 'Unknown',
      action: status === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
      entityType: 'article',
      entityId: article.id,
      entityTitle: article.title,
    });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}
