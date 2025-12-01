import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/reading-time';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const ipAddress = getClientIp(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check if view already exists
    const existing = await prisma.articleView.findUnique({
      where: {
        articleId_ipAddress: {
          articleId,
          ipAddress,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already viewed' });
    }

    // Create new view
    await prisma.articleView.create({
      data: {
        articleId,
        ipAddress,
        userAgent,
      },
    });

    // Increment article views count
    await prisma.article.update({
      where: { id: articleId },
      data: {
        views: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
