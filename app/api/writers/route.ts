import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWriters, createWriter } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, role, bio, fullBio, image, birthYear, education, awards } = body;

    const { data: writer, error } = await createWriter({
      name,
      slug,
      role,
      bio,
      fullBio,
      image,
      birthYear: birthYear || null,
      education: education || null,
      awards: awards || [],
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(writer);
  } catch (error) {
    console.error('Writer creation error:', error);
    return NextResponse.json({ error: 'Failed to create writer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, role, bio, fullBio, image, birthYear, education, awards } = body;

    const { data: writer, error } = await updateWriter(id, {
      name,
      slug,
      role,
      bio,
      fullBio,
      image,
      birthYear: birthYear || null,
      education: education || null,
      awards: awards || [],
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(writer);
  } catch (error) {
    console.error('Writer update error:', error);
    return NextResponse.json({ error: 'Failed to update writer' }, { status: 500 });
  }
}
