import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { auth } from '@/auth';
import sharp from 'sharp';

// Görsel boyut limitleri
const IMAGE_LIMITS = {
  avatar: { width: 400, height: 400, quality: 80 },
  cover: { width: 1200, height: 800, quality: 80 },
  default: { width: 1200, height: 1200, quality: 80 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageType = (formData.get('type') as string) || 'default';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Dosya tipini kontrol et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Geçersiz dosya tipi: ${file.type}. İzin verilen tipler: JPEG, PNG, WebP, GIF` 
      }, { status: 400 });
    }

    // Dosya boyutunu kontrol et (10MB max - sıkıştırma yapacağız)
    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json({ 
        error: `Dosya çok büyük: ${sizeMB}MB. Maksimum 10MB olmalıdır.` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Görsel tipine göre limit belirle
    const limits = IMAGE_LIMITS[imageType as keyof typeof IMAGE_LIMITS] || IMAGE_LIMITS.default;

    // Sharp ile görsel optimizasyonu
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(inputBuffer)
        .resize(limits.width, limits.height, {
          fit: 'inside', // En-boy oranını koru
          withoutEnlargement: true, // Küçük görselleri büyütme
        })
        .webp({ quality: limits.quality }) // WebP formatına çevir
        .toBuffer();
    } catch (sharpError) {
      console.error('Sharp optimization error:', sharpError);
      // Sharp başarısız olursa orijinal dosyayı kullan
      optimizedBuffer = inputBuffer;
    }

    // Benzersiz dosya adı oluştur - userId prefix ile
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
    // Format: userId_timestamp-originalName.webp
    const filename = `${userId}_${timestamp}-${baseName}.webp`;

    // Upload klasörünü oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Optimize edilmiş dosyayı kaydet
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, optimizedBuffer);

    // URL'i döndür
    const url = `/uploads/${filename}`;

    // Boyut bilgisi logla
    const originalSizeKB = (inputBuffer.length / 1024).toFixed(1);
    const optimizedSizeKB = (optimizedBuffer.length / 1024).toFixed(1);
    console.log(`Image optimized: ${originalSizeKB}KB -> ${optimizedSizeKB}KB (${filename})`);

    return NextResponse.json({ 
      url, 
      filename, 
      uploadedBy: userId,
      originalSize: inputBuffer.length,
      optimizedSize: optimizedBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
