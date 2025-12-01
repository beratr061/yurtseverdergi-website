import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWriterById, updateWriter, deleteWriter } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if writer exists
    const { data: writer } = await getWriterById(id);

    if (!writer) {
      return NextResponse.json({ error: 'Writer not found' }, { status: 404 });
    }

    // Check if writer has articles
    if (writer.articleCount > 0) {
      return NextResponse.json(
        { error: 'Bu yazarın yazıları var, silemezsiniz' },
        { status: 400 }
      );
    }

    const { error } = await deleteWriter(id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Writer deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete writer' }, { status: 500 });
  }
}
