import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Email validation regex - RFC 5322 compliant basic pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }
  return EMAIL_REGEX.test(trimmed);
}

interface SubscribeRequest {
  email: string;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

interface APIError {
  error: string;
  code: 'VALIDATION_ERROR' | 'DUPLICATE_EMAIL' | 'SERVER_ERROR';
  details?: Record<string, string>;
}

/**
 * POST /api/invitation/subscribe
 * 
 * Subscribes an email to the invitation notification list.
 * 
 * Requirements:
 * - 3.1: Save valid email to InvitationEmail collection
 * - 3.2: Handle duplicate emails with friendly message
 * - 3.3: Reject invalid email formats with validation error
 * - 3.4: Display success confirmation message
 */
export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse | APIError>> {
  try {
    const body = await request.json() as SubscribeRequest;
    const { email } = body;

    // Validate email format (Requirement 3.3)
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: 'Geçerli bir e-posta adresi girin',
          code: 'VALIDATION_ERROR',
          details: { email: 'Invalid email format' },
        } as APIError,
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email (Requirement 3.2)
    const existingEmail = await prisma.invitationEmail.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: true,
          message: 'Bu e-posta adresi zaten kayıtlı',
          alreadySubscribed: true,
        } as SubscribeResponse,
        { status: 200 }
      );
    }

    // Save email to database (Requirement 3.1)
    await prisma.invitationEmail.create({
      data: {
        email: normalizedEmail,
      },
    });

    // Return success message (Requirement 3.4)
    return NextResponse.json(
      {
        success: true,
        message: 'E-posta adresiniz başarıyla kaydedildi. Site yayına alındığında size haber vereceğiz!',
      } as SubscribeResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Email subscription error:', error);
    return NextResponse.json(
      {
        error: 'Bir hata oluştu, lütfen tekrar deneyin',
        code: 'SERVER_ERROR',
      } as APIError,
      { status: 500 }
    );
  }
}
