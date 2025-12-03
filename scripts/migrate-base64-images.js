/**
 * Base64 Görsel Migration Script
 * 
 * Bu script veritabanındaki Base64 formatındaki görselleri
 * dosya sistemine kaydeder ve URL'lerini günceller.
 * 
 * Kullanım: node scripts/migrate-base64-images.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateBase64Images() {
  console.log('🚀 Base64 görsel migration başlatılıyor...\n');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Upload klasörünü oluştur
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Upload klasörü oluşturuldu\n');
  }

  // Base64 görsel içeren makaleleri bul
  const articles = await prisma.article.findMany({
    where: {
      featuredImage: {
        startsWith: 'data:image'
      }
    },
    select: {
      id: true,
      slug: true,
      featuredImage: true,
      authorId: true
    }
  });

  console.log(`📊 ${articles.length} adet Base64 görsel bulundu\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const article of articles) {
    try {
      const base64Data = article.featuredImage;
      
      // Base64 formatını parse et
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        console.log(`⚠️  Geçersiz Base64 format: ${article.slug}`);
        errorCount++;
        continue;
      }

      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const imageData = matches[2];
      const buffer = Buffer.from(imageData, 'base64');

      // Dosya adı oluştur
      const filename = `${article.authorId}_${Date.now()}-${article.slug}.${extension}`;
      const filepath = path.join(uploadDir, filename);

      // Dosyayı kaydet
      fs.writeFileSync(filepath, buffer);

      // URL'i güncelle
      const newUrl = `/uploads/${filename}`;
      await prisma.article.update({
        where: { id: article.id },
        data: { featuredImage: newUrl }
      });

      console.log(`✅ ${article.slug} -> ${newUrl}`);
      successCount++;

      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Hata (${article.slug}):`, error.message);
      errorCount++;
    }
  }

  // Kullanıcı avatarlarını da kontrol et
  console.log('\n📷 Kullanıcı avatarları kontrol ediliyor...\n');

  const users = await prisma.user.findMany({
    where: {
      image: {
        startsWith: 'data:image'
      }
    },
    select: {
      id: true,
      name: true,
      image: true
    }
  });

  console.log(`📊 ${users.length} adet Base64 avatar bulundu\n`);

  for (const user of users) {
    try {
      const base64Data = user.image;
      
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        console.log(`⚠️  Geçersiz Base64 format: ${user.name}`);
        errorCount++;
        continue;
      }

      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const imageData = matches[2];
      const buffer = Buffer.from(imageData, 'base64');

      const filename = `${user.id}_${Date.now()}-avatar.${extension}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      const newUrl = `/uploads/${filename}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { image: newUrl }
      });

      console.log(`✅ ${user.name} avatar -> ${newUrl}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Avatar hatası (${user.name}):`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

migrateBase64Images().catch(console.error);
