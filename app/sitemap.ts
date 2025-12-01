import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yurtsever.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/yazarlar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/arama`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Dynamic pages - Articles
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    articlePages = articles.map((article) => ({
      url: `${siteUrl}/yazi/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching articles', error);
  }

  // Dynamic pages - Categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    categoryPages = categories.map((category) => ({
      url: `${siteUrl}/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching categories', error);
  }

  // Dynamic pages - Writers
  let writerPages: MetadataRoute.Sitemap = [];
  try {
    const writers = await prisma.user.findMany({
      where: { role: { in: ['WRITER', 'POET', 'ADMIN'] as any } },
      select: { slug: true, updatedAt: true },
    });

    writerPages = writers
      .filter((w) => w.slug)
      .map((writer) => ({
        url: `${siteUrl}/yazar/${writer.slug}`,
        lastModified: writer.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('Sitemap: Error fetching writers', error);
  }

  return [...staticPages, ...articlePages, ...categoryPages, ...writerPages];
}
