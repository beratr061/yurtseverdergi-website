import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Max 10 files at once
    if (files.length > 10) {
      return NextResponse.json({ error: 'En fazla 10 dosya yükleyebilirsiniz' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles: { name: string; url: string; size: number }[] = [];
    const errors: { name: string; error: string }[] = [];

    for (const file of files) {
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          errors.push({ name: file.name, error: 'Geçersiz dosya türü' });
          continue;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push({ name: file.name, error: 'Dosya boyutu 5MB\'dan büyük' });
          continue;
        }

        // Generate unique filename with userId prefix
        const userId = session.user.id;
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.name);
        const safeName = file.name
          .replace(ext, '')
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase()
          .substring(0, 50);
        // Format: userId_safeName-timestamp-randomStr.ext
        const filename = `${userId}_${safeName}-${timestamp}-${randomStr}${ext}`;

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        uploadedFiles.push({
          name: file.name,
          url: `/uploads/${filename}`,
          size: file.size,
        });
      } catch (err) {
        errors.push({ name: file.name, error: 'Yükleme hatası' });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploadedFiles.length} dosya yüklendi${errors.length > 0 ? `, ${errors.length} hata` : ''}`,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
