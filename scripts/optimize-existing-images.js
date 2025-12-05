// Script: Mevcut görselleri optimize et
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Optimizasyon ayarları
const WEBP_OPTIONS = {
  quality: 82,
  effort: 6,
  smartSubsample: true,
  nearLossless: false,
  alphaQuality: 90,
};

async function optimizeImages() {
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => 
    f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  console.log(`${files.length} görsel bulundu.\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const filepath = path.join(UPLOAD_DIR, file);
    const stat = fs.statSync(filepath);
    const originalSize = stat.size;
    totalOriginal += originalSize;

    try {
      // Görseli oku ve metadata al
      const image = sharp(filepath);
      const metadata = await image.metadata();

      // Boyut limitleri
      let maxWidth = 1600;
      let maxHeight = 1600;
      
      // Avatar ise daha küçük
      if (file.includes('avatar')) {
        maxWidth = 400;
        maxHeight = 400;
      }

      // Optimize et
      const optimizedBuffer = await sharp(filepath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .webp(WEBP_OPTIONS)
        .toBuffer();

      const optimizedSize = optimizedBuffer.length;
      totalOptimized += optimizedSize;

      // Sadece daha küçükse kaydet
      if (optimizedSize < originalSize) {
        // Yeni dosya adı (.webp uzantılı)
        const newFilename = file.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
        const newFilepath = path.join(UPLOAD_DIR, newFilename);
        
        fs.writeFileSync(newFilepath, optimizedBuffer);
        
        // Eski dosyayı sil (farklı uzantıysa)
        if (newFilename !== file) {
          fs.unlinkSync(filepath);
        }

        const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
        console.log(`✓ ${file}: ${(originalSize/1024).toFixed(1)}KB -> ${(optimizedSize/1024).toFixed(1)}KB (-%${savings})`);
      } else {
        totalOptimized = totalOptimized - optimizedSize + originalSize; // Geri al
        console.log(`- ${file}: Zaten optimize (${(originalSize/1024).toFixed(1)}KB)`);
      }
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      totalOptimized += originalSize;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Toplam: ${(totalOriginal/1024).toFixed(1)}KB -> ${(totalOptimized/1024).toFixed(1)}KB`);
  console.log(`Tasarruf: ${((1 - totalOptimized/totalOriginal) * 100).toFixed(1)}%`);
}

optimizeImages().catch(console.error);
