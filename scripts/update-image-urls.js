/**
 * Veritabanındaki görsel URL'lerini güncelleme script'i
 * 
 * Optimize edilen görsellerin uzantıları .jpg'den .webp'ye değişti.
 * Bu script veritabanındaki URL'leri günceller.
 * 
 * Kullanım: node scripts/update-image-urls.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function updateImageUrls() {
  console.log('🚀 Görsel URL\'leri güncelleniyor...\n');

  // Mevcut webp dosyalarını listele
  const files = fs.readdirSync(UPLOAD_DIR);
  const webpFiles = files.filter(f => f.endsWith('.webp'));
  
  console.log(`📊 ${webpFiles.length} adet WebP dosyası bulundu\n`);

  // Article featuredImage güncelle
  const articles = await prisma.article.findMany({
    where: {
      featuredImage: {
        startsWith: '/uploads/'
      }
    },
    select: { id: true, slug: true, featuredImage: true }
  });

  let updatedCount = 0;

  for (const article of articles) {
    const currentUrl = article.featuredImage;
    if (!currentUrl) continue;

    // .jpg veya .jpeg uzantısını .webp ile değiştir
    const newUrl = currentUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Dosya var mı kontrol et
    const filename = newUrl.replace('/uploads/', '');
    const filepath = path.join(UPLOAD_DIR, filename);
    
    if (fs.existsSync(filepath) && currentUrl !== newUrl) {
      await prisma.article.update({
        where: { id: article.id },
        data: { featuredImage: newUrl }
      });
      console.log(`✅ Article: ${article.slug}`);
      console.log(`   ${currentUrl} -> ${newUrl}\n`);
      updatedCount++;
    }
  }

  // User image güncelle
  const users = await prisma.user.findMany({
    where: {
      image: {
        startsWith: '/uploads/'
      }
    },
    select: { id: true, name: true, image: true }
  });

  for (const user of users) {
    const currentUrl = user.image;
    if (!currentUrl) continue;

    const newUrl = currentUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const filename = newUrl.replace('/uploads/', '');
    const filepath = path.join(UPLOAD_DIR, filename);
    
    if (fs.existsSync(filepath) && currentUrl !== newUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: newUrl }
      });
      console.log(`✅ User: ${user.name}`);
      console.log(`   ${currentUrl} -> ${newUrl}\n`);
      updatedCount++;
    }
  }

  console.log('='.repeat(50));
  console.log(`✅ Toplam ${updatedCount} URL güncellendi`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

updateImageUrls().catch(console.error);
