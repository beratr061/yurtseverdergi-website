import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateCSV } from '@/lib/csv-utils';

interface APIError {
  error: string;
  code: 'UNAUTHORIZED' | 'SERVER_ERROR';
}

/**
 * GET /api/invitation/emails/export
 * 
 * Generates and downloads a CSV file containing all email addresses.
 * Requires admin authentication.
 * 
 * Requirements:
 * - 5.3: Generate and download CSV file containing all email addresses
 */
export async function GET(): Promise<NextResponse<string | APIError>> {
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

    // Fetch all emails ordered by subscription date
    const emails = await prisma.invitationEmail.findMany({
      orderBy: { subscribedAt: 'desc' },
      select: {
        email: true,
        subscribedAt: true,
      },
    });

    // Generate CSV content
    const csvContent = generateCSV(emails);

    // Return CSV file with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invitation-emails-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting invitation emails:', error);
    return NextResponse.json(
      {
        error: 'Bir hata oluştu, lütfen tekrar deneyin',
        code: 'SERVER_ERROR',
      } as APIError,
      { status: 500 }
    );
  }
}
