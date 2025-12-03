import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { validateInvitationSettings } from '@/lib/validation';

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
