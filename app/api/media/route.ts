import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    const canSeeAll = isAdmin;

    const uploadDir = join(process.cwd(), 'public', 'uploads');

    try {
      const fileNames = await readdir(uploadDir);

      // Dosyaları filtrele - Admin/Editor tümünü görür, Writer sadece kendisininkileri
      const filteredFileNames = fileNames.filter((name) => {
        if (name === '.gitkeep') return false;
        if (canSeeAll) return true;
        // Dosya adı formatı: userId_timestamp-originalName
        return name.startsWith(`${userId}_`);
      });

      const files = await Promise.all(
        filteredFileNames.map(async (name) => {
          const filePath = join(uploadDir, name);
          const stats = await stat(filePath);

          // Dosya sahibini çıkar
          const ownerMatch = name.match(/^([a-f0-9]+)_/);
          const ownerId = ownerMatch ? ownerMatch[1] : null;

          return {
            name,
            url: `/uploads/${name}`,
            size: stats.size,
            uploadedAt: stats.birthtime.toISOString(),
            ownerId,
            isOwn: ownerId === userId,
          };
        })
      );

      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      return NextResponse.json({ files, canSeeAll });
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json({ files: [], canSeeAll });
    }
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
  }
}
