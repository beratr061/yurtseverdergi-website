import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';

    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    // Security check: prevent path traversal
    if (decodedFilename.includes('..') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Yetki kontrolü: Writer sadece kendi dosyasını silebilir
    if (!isAdmin) {
      // Dosya adı formatı: userId_timestamp-originalName
      if (!decodedFilename.startsWith(`${userId}_`)) {
        return NextResponse.json({ error: 'Forbidden - You can only delete your own files' }, { status: 403 });
      }
    }

    const filePath = join(process.cwd(), 'public', 'uploads', decodedFilename);

    try {
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('File deletion error:', error);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
