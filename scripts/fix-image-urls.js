// Script: Eski /uploads/ URL'lerini /api/uploads/ olarak güncelle
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('Görsel URL\'leri güncelleniyor...\n');

  // Articles - featuredImage
  const articles = await prisma.article.findMany({
    where: {
      featuredImage: {
        startsWith: '/uploads/',
        not: { startsWith: '/api/uploads/' }
      }
    },
    select: { id: true, title: true, featuredImage: true }
  });

  console.log(`${articles.length} makale bulundu.`);
  
  for (const article of articles) {
    const newUrl = article.featuredImage.replace('/uploads/', '/api/uploads/');
    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImage: newUrl }
    });
    console.log(`  ✓ ${article.title}: ${newUrl}`);
  }

  // Users - image (avatar)
  const users = await prisma.user.findMany({
    where: {
      image: {
        startsWith: '/uploads/',
        not: { startsWith: '/api/uploads/' }
      }
    },
    select: { id: true, name: true, image: true }
  });

  console.log(`\n${users.length} kullanıcı bulundu.`);
  
  for (const user of users) {
    const newUrl = user.image.replace('/uploads/', '/api/uploads/');
    await prisma.user.update({
      where: { id: user.id },
      data: { image: newUrl }
    });
    console.log(`  ✓ ${user.name}: ${newUrl}`);
  }

  // Settings - invitationBackgroundImage
  const settings = await prisma.settings.findFirst({
    where: {
      invitationBackgroundImage: {
        startsWith: '/uploads/',
        not: { startsWith: '/api/uploads/' }
      }
    }
  });

  if (settings) {
    const newUrl = settings.invitationBackgroundImage.replace('/uploads/', '/api/uploads/');
    await prisma.settings.update({
      where: { id: settings.id },
      data: { invitationBackgroundImage: newUrl }
    });
    console.log(`\n✓ Settings invitationBackgroundImage: ${newUrl}`);
  }

  console.log('\n✅ Tüm URL\'ler güncellendi!');
}

fixImageUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
