import prisma from './prisma';

/**
 * Database helper functions
 */

// Articles
export async function getArticles(filters?: {
  status?: string;
  categoryId?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters?.status) {
    where.status = filters.status as any;
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.authorId) {
    where.authorId = filters.authorId;
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          slug: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit,
    skip: filters?.offset,
  });

  return { data: articles, error: null };
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            role: true,
            image: true,
            bio: true,
          },
        },
      },
    });
    return { data: article, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getArticleById(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
      },
    });
    return { data: article, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createArticle(data: any) {
  try {
    const article = await prisma.article.create({
      data,
      include: {
        category: true,
        author: true,
      },
    });
    return { data: article, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateArticle(id: string, data: any) {
  try {
    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        category: true,
        author: true,
      },
    });
    return { data: article, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteArticle(id: string) {
  try {
    await prisma.article.delete({ where: { id } });
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Users (Writers)
export async function getWriters(limit?: number) {
  try {
    const writers = await prisma.user.findMany({
      where: {
        slug: { not: null },
        role: { not: 'ADMIN' }, // Admin'leri hariç tut
      },
      orderBy: { articleCount: 'desc' },
      take: limit,
    });
    return { data: writers, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function getWriterBySlug(slug: string) {
  try {
    const writer = await prisma.user.findUnique({
      where: { slug },
    });
    return { data: writer, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getWriterById(id: string) {
  try {
    const writer = await prisma.user.findUnique({
      where: { id },
    });
    return { data: writer, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createUser(data: any) {
  try {
    const user = await prisma.user.create({ data });
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Writer aliases (writers are users with isWriter=true)
export const createWriter = createUser;
export const updateWriter = updateUser;
export const deleteWriter = deleteUser;

// Categories
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return { data: categories, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    return { data: category, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return { data: category, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createCategory(data: any) {
  try {
    const category = await prisma.category.create({ data });
    return { data: category, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return { data: category, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Settings Cache (60 saniye TTL)
let settingsCache: { data: any; timestamp: number } | null = null;
const SETTINGS_CACHE_TTL = 60 * 1000; // 60 saniye

export async function getSettings(skipCache = false) {
  try {
    // Cache kontrolü
    if (!skipCache && settingsCache && Date.now() - settingsCache.timestamp < SETTINGS_CACHE_TTL) {
      return { data: settingsCache.data, error: null };
    }

    let settings = await prisma.settings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteTitle: 'YurtSever Dergi',
          siteDescription: 'Edebiyat ve kültür dergisi',
          contactEmail: 'info@yurtsever.com',
          articlesPerPage: 12,
          maintenanceMode: false,
          invitationMode: false,
        },
      });
    }
    
    // Cache'i güncelle
    settingsCache = { data: settings, timestamp: Date.now() };
    
    return { data: settings, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Cache'i temizle (settings güncellendiğinde çağrılmalı)
export function invalidateSettingsCache() {
  settingsCache = null;
}

export async function updateSettings(id: string, data: any) {
  try {
    const settings = await prisma.settings.update({
      where: { id },
      data,
    });
    // Cache'i temizle
    invalidateSettingsCache();
    return { data: settings, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Article Views
export async function incrementArticleView(articleId: string, ipAddress: string, userAgent?: string) {
  try {
    // Check if view already exists
    const existing = await prisma.articleView.findUnique({
      where: {
        articleId_ipAddress: {
          articleId,
          ipAddress,
        },
      },
    });

    if (existing) {
      return { data: null, error: null }; // Already viewed
    }

    // Create new view
    await prisma.articleView.create({
      data: {
        articleId,
        ipAddress,
        userAgent,
      },
    });

    // Increment article views count
    await prisma.article.update({
      where: { id: articleId },
      data: {
        views: { increment: 1 },
      },
    });

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Dashboard Stats
export async function getDashboardStats() {
  try {
    const [
      totalArticles,
      publishedArticles,
      totalUsers,
      totalCategories,
      totalViews,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count(),
      prisma.category.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
    ]);

    return {
      data: {
        totalArticles,
        publishedArticles,
        totalUsers,
        totalCategories,
        totalViews: totalViews._sum.views || 0,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
