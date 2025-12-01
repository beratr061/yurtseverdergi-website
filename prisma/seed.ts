import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yurtsever.com' },
    update: {},
    create: {
      email: 'admin@yurtsever.com',
      name: 'Admin',
      hashedPassword: adminPassword,
      role: 'ADMIN',
      slug: 'admin',
      bio: 'Site yöneticisi',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample writers
  const writerPassword = await hash('Writer123!', 12);
  
  const writer1 = await prisma.user.upsert({
    where: { email: 'ahmet@yurtsever.com' },
    update: {},
    create: {
      email: 'ahmet@yurtsever.com',
      name: 'Ahmet Yılmaz',
      hashedPassword: writerPassword,
      role: 'WRITER',
      slug: 'ahmet-yilmaz',
      bio: 'Şair ve yazar. İstanbul doğumlu.',
      image: 'https://i.pravatar.cc/150?img=1',
    },
  });

  const writer2 = await prisma.user.upsert({
    where: { email: 'ayse@yurtsever.com' },
    update: {},
    create: {
      email: 'ayse@yurtsever.com',
      name: 'Ayşe Demir',
      hashedPassword: writerPassword,
      role: 'WRITER',
      slug: 'ayse-demir',
      bio: 'Eleştirmen ve akademisyen.',
      image: 'https://i.pravatar.cc/150?img=5',
    },
  });

  console.log('✅ Writers created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'siir' },
      update: {},
      create: { name: 'Şiir', slug: 'siir', description: 'Şiir yazıları' },
    }),
    prisma.category.upsert({
      where: { slug: 'poetika' },
      update: {},
      create: { name: 'Poetika', slug: 'poetika', description: 'Poetika yazıları' },
    }),
    prisma.category.upsert({
      where: { slug: 'elestiri' },
      update: {},
      create: { name: 'Eleştiri', slug: 'elestiri', description: 'Eleştiri yazıları' },
    }),
    prisma.category.upsert({
      where: { slug: 'soylesi' },
      update: {},
      create: { name: 'Söyleşi', slug: 'soylesi', description: 'Söyleşiler' },
    }),
  ]);
  console.log('✅ Categories created');

  // Create sample articles
  const articles = [
    {
      title: 'Gece ve Yıldızlar',
      slug: 'gece-ve-yildizlar',
      excerpt: 'Gecenin karanlığında parlayan yıldızlar üzerine bir şiir.',
      content: `<p>Gece çöktü şehrin üstüne,</p>
<p>Yıldızlar açtı gözlerini.</p>
<p>Sessizliğin içinde kayboldum,</p>
<p>Düşlerin peşinde koştum.</p>
<br/>
<p>Ay ışığı süzüldü pencereden,</p>
<p>Gölgeler dans etti duvarlarda.</p>
<p>Bir şiir doğdu kalbimden,</p>
<p>Yıldızlara fısıldadım sırlarımı.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop',
      status: 'PUBLISHED',
      authorId: writer1.id,
      categoryId: categories[0].id,
      publishedAt: new Date(),
      views: 150,
    },
    {
      title: 'Modern Şiirin Yolculuğu',
      slug: 'modern-siirin-yolculugu',
      excerpt: 'Türk şiirinin modernleşme sürecine bir bakış.',
      content: `<h2>Giriş</h2>
<p>Türk şiiri, 20. yüzyılın başlarından itibaren büyük bir dönüşüm geçirdi. Geleneksel kalıplardan sıyrılarak yeni ifade biçimleri aradı.</p>
<h2>Değişim Rüzgarları</h2>
<p>Nazım Hikmet'in serbest şiiri, Orhan Veli'nin gündelik dili şiire taşıması, İkinci Yeni'nin imge zenginliği... Her biri Türk şiirine yeni kapılar açtı.</p>
<blockquote>Şiir, dilin en yoğun halidir.</blockquote>
<p>Bugün geldiğimiz noktada, şiir artık sadece duygusal bir ifade aracı değil, aynı zamanda düşünsel bir sorgulamanın da aracı haline geldi.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop',
      status: 'PUBLISHED',
      authorId: writer2.id,
      categoryId: categories[1].id,
      publishedAt: new Date(),
      views: 230,
    },
    {
      title: 'Edebiyat ve Toplum',
      slug: 'edebiyat-ve-toplum',
      excerpt: 'Edebiyatın toplumsal işlevi üzerine bir değerlendirme.',
      content: `<p>Edebiyat, toplumun aynasıdır. Bir dönemin ruhunu, insanların umutlarını ve korkularını en iyi edebiyat eserleri yansıtır.</p>
<p>Yazarlar, toplumun vicdanı olarak hareket eder. Görünmeyeni görünür kılar, söylenmeyeni söyler.</p>
<h3>Edebiyatın Gücü</h3>
<p>Bir roman, bir şiir, bir öykü... Bunlar sadece kelimelerden ibaret değildir. Her biri, okuyucunun dünyasını değiştirme potansiyeline sahiptir.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop',
      status: 'PUBLISHED',
      authorId: writer2.id,
      categoryId: categories[2].id,
      publishedAt: new Date(),
      views: 180,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article as any,
    });
  }
  console.log('✅ Articles created');

  // Update article counts
  await prisma.user.update({
    where: { id: writer1.id },
    data: { articleCount: 1 },
  });
  await prisma.user.update({
    where: { id: writer2.id },
    data: { articleCount: 2 },
  });

  // Create default settings
  const defaultSettingsId = '000000000000000000000001';
  await prisma.settings.upsert({
    where: { id: defaultSettingsId },
    update: {},
    create: {
      id: defaultSettingsId,
      siteTitle: 'YurtSever Dergi',
      siteDescription: 'Edebiyat ve kültür dergisi',
      contactEmail: 'info@yurtsever.com',
      articlesPerPage: 12,
      maintenanceMode: false,
    },
  });
  console.log('✅ Settings created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
