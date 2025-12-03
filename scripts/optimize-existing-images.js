/**
 * Mevcut Görselleri Optimize Etme Script'i
 * 
 * Bu script /public/uploads klasöründeki büyük görselleri
 * sharp kullanarak optimize eder.
 * 
 * Kullanım: npm run optimize:images
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const QUALITY = 80;
const SIZE_THRESHOLD = 200 * 1024; // 200KB üzeri dosyaları optimize et

async function optimizeImages() {
  console.log('🚀 Görsel optimizasyonu başlatılıyor...\n');

  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('❌ Upload klasörü bulunamadı');
    return;
  }

  const files = fs.readdirSync(UPLOAD_DIR);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f) && f !== '.gitkeep'
  );

  console.log(`📊 ${imageFiles.length} adet görsel bulundu\n`);

  let optimizedCount = 0;
  let skippedCount = 0;
  let totalSaved = 0;

  for (const filename of imageFiles) {
    const filepath = path.join(UPLOAD_DIR, filename);
    const stats = fs.statSync(filepath);
    
    // Küçük dosyaları atla
    if (stats.size < SIZE_THRESHOLD) {
      console.log(`⏭️  ${filename} - ${(stats.size / 1024).toFixed(1)}KB (zaten küçük)`);
      skippedCount++;
      continue;
    }

    try {
      const originalSize = stats.size;
      
      // Yeni dosya adı (webp formatında)
      const newFilename = filename.replace(/\.[^/.]+$/, '.webp');
      const newFilepath = path.join(UPLOAD_DIR, newFilename);

      // Sharp ile optimize et
      await sharp(filepath)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toFile(newFilepath);

      const newStats = fs.statSync(newFilepath);
      const savedBytes = originalSize - newStats.size;
      totalSaved += savedBytes;

      console.log(`✅ ${filename}`);
      console.log(`   ${(originalSize / 1024).toFixed(1)}KB -> ${(newStats.size / 1024).toFixed(1)}KB`);
      console.log(`   Tasarruf: ${(savedBytes / 1024).toFixed(1)}KB\n`);

      // Eski dosyayı sil (eğer farklı isimse)
      if (filename !== newFilename && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      optimizedCount++;
    } catch (error) {
      console.error(`❌ Hata (${filename}):`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Optimize edilen: ${optimizedCount}`);
  console.log(`⏭️  Atlanan: ${skippedCount}`);
  console.log(`💾 Toplam tasarruf: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  console.log('='.repeat(50));
}

optimizeImages().catch(console.error);
