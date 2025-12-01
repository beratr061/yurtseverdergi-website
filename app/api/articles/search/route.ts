import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Transform to match expected format
    const transformed = articles.map((article) => ({
      ...article,
      categories: article.category,
      users: article.author,
      writers: null, // Legacy field
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json([]);
  }
}
