import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface EmailListResponse {
  data: Array<{
    id: string;
    email: string;
    subscribedAt: Date;
  }>;
  count: number;
}

interface APIError {
  error: string;
  code: 'UNAUTHORIZED' | 'SERVER_ERROR';
}

/**
 * GET /api/invitation/emails
 * 
 * Returns list of all subscribed emails with dates and total count.
 * Requires admin authentication.
 * 
 * Requirements:
 * - 5.1: Display count of collected email addresses
 * - 5.2: Display list of all collected emails with subscription dates
 */
export async function GET(): Promise<NextResponse<EmailListResponse | APIError>> {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Bu işlem için yetkiniz yok',
          code: 'UNAUTHORIZED',
        } as APIError,
        { status: 401 }
      );
    }

    // Fetch all emails ordered by subscription date (newest first)
    const emails = await prisma.invitationEmail.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    return NextResponse.json({
      data: emails,
      count: emails.length,
    } as EmailListResponse);
  } catch (error) {
    console.error('Error fetching invitation emails:', error);
    return NextResponse.json(
      {
        error: 'Bir hata oluştu, lütfen tekrar deneyin',
        code: 'SERVER_ERROR',
      } as APIError,
      { status: 500 }
    );
  }
}
