import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Validation constants
const MAX_HEADLINE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

// URL validation regex (HTTP/HTTPS)
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// Validation error interface
interface ValidationError {
  field: string;
  message: string;
}

// Validate URL format
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return true; // Empty URLs are allowed (optional fields)
  return URL_REGEX.test(url.trim());
}

// Validate date is in the future
export function isFutureDate(date: Date | string | null | undefined): boolean {
  if (!date) return true; // Null dates are allowed (optional field)
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false; // Invalid date
  return dateObj.getTime() > Date.now();
}

// Validate text length
export function isValidTextLength(text: string | null | undefined, maxLength: number): boolean {
  if (!text) return true; // Null/empty text is allowed (optional fields)
  return text.length <= maxLength;
}

// Validate invitation settings
export function validateInvitationSettings(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate headline length
  if (body.invitationHeadline !== undefined) {
    if (!isValidTextLength(body.invitationHeadline as string, MAX_HEADLINE_LENGTH)) {
      errors.push({
        field: 'invitationHeadline',
        message: `Başlık en fazla ${MAX_HEADLINE_LENGTH} karakter olabilir`,
      });
    }
  }

  // Validate description length
  if (body.invitationDescription !== undefined) {
    if (!isValidTextLength(body.invitationDescription as string, MAX_DESCRIPTION_LENGTH)) {
      errors.push({
        field: 'invitationDescription',
        message: `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir`,
      });
    }
  }

  // Validate launch date (must be future)
  if (body.invitationLaunchDate !== undefined && body.invitationLaunchDate !== null) {
    if (!isFutureDate(body.invitationLaunchDate as string | Date)) {
      errors.push({
        field: 'invitationLaunchDate',
        message: 'Lansman tarihi gelecekte bir tarih olmalıdır',
      });
    }
  }

  // Validate Twitter URL
  if (body.invitationTwitterUrl !== undefined) {
    if (!isValidUrl(body.invitationTwitterUrl as string)) {
      errors.push({
        field: 'invitationTwitterUrl',
        message: 'Geçerli bir Twitter URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  // Validate Instagram URL
  if (body.invitationInstagramUrl !== undefined) {
    if (!isValidUrl(body.invitationInstagramUrl as string)) {
      errors.push({
        field: 'invitationInstagramUrl',
        message: 'Geçerli bir Instagram URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  // Validate Facebook URL
  if (body.invitationFacebookUrl !== undefined) {
    if (!isValidUrl(body.invitationFacebookUrl as string)) {
      errors.push({
        field: 'invitationFacebookUrl',
        message: 'Geçerli bir Facebook URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  return errors;
}

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteTitle: 'YurtSever Dergi',
          siteDescription: 'Edebiyat ve kültür dergisi',
          contactEmail: 'info@yurtsever.com',
          articlesPerPage: 12,
          maintenanceMode: false,
          // Invitation mode defaults
          invitationMode: false,
          invitationHeadline: 'Yakında Sizlerle',
          invitationDescription: 'Yeni bir edebiyat ve kültür deneyimi için hazırlanıyoruz. Haberdar olmak için e-posta bırakın.',
          invitationLaunchDate: null,
          invitationBackgroundImage: null,
          invitationTwitterUrl: null,
          invitationInstagramUrl: null,
          invitationFacebookUrl: null,
        },
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate invitation settings
    const validationErrors = validateInvitationSettings(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }

    // Get existing settings or create new
    let settings = await prisma.settings.findFirst();

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: body,
      });
    } else {
      settings = await prisma.settings.create({
        data: body,
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
