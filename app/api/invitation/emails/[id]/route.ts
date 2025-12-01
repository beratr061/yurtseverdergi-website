import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface DeleteResponse {
  success: boolean;
}

interface APIError {
  error: string;
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR';
}

/**
 * DELETE /api/invitation/emails/[id]
 * 
 * Removes an email from the InvitationEmail collection.
 * Requires admin authentication.
 * 
 * Requirements:
 * - 5.4: Remove email from InvitationEmail collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteResponse | APIError>> {
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

    const { id } = await params;

    // Check if email exists
    const existingEmail = await prisma.invitationEmail.findUnique({
      where: { id },
    });

    if (!existingEmail) {
      return NextResponse.json(
        {
          error: 'E-posta bulunamadı',
          code: 'NOT_FOUND',
        } as APIError,
        { status: 404 }
      );
    }

    // Delete the email
    await prisma.invitationEmail.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    } as DeleteResponse);
  } catch (error) {
    console.error('Error deleting invitation email:', error);
    return NextResponse.json(
      {
        error: 'Bir hata oluştu, lütfen tekrar deneyin',
        code: 'SERVER_ERROR',
      } as APIError,
      { status: 500 }
    );
  }
}
