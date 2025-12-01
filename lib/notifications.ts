import prisma from './prisma';

// TypeScript henüz yeni Prisma modellerini tanımıyor, prisma db push sonrası çalışacak
const db = prisma as any;

type NotificationType =
  | 'ARTICLE_APPROVED'
  | 'ARTICLE_REJECTED'
  | 'ARTICLE_PUBLISHED'
  | 'NEW_ARTICLE_PENDING'
  | 'SYSTEM';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });
  } catch (error) {
    console.error('Notification create error:', error);
    return null;
  }
}

export async function getUserNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
) {
  const where: any = { userId };
  if (options?.unreadOnly) where.isRead = false;

  return db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
  });
}

export async function markAsRead(notificationId: string) {
  return db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, isRead: false },
  });
}

// Yazı onaylandığında yazara bildirim gönder
export async function notifyArticleApproved(
  authorId: string,
  articleTitle: string,
  articleId: string
) {
  return createNotification({
    userId: authorId,
    type: 'ARTICLE_APPROVED',
    title: 'Yazınız Onaylandı',
    message: `"${articleTitle}" başlıklı yazınız onaylandı ve yayınlandı.`,
    link: `/admin/articles/${articleId}/edit`,
  });
}

// Yazı reddedildiğinde yazara bildirim gönder
export async function notifyArticleRejected(
  authorId: string,
  articleTitle: string,
  articleId: string,
  reason?: string
) {
  return createNotification({
    userId: authorId,
    type: 'ARTICLE_REJECTED',
    title: 'Yazınız Reddedildi',
    message: reason
      ? `"${articleTitle}" başlıklı yazınız reddedildi. Sebep: ${reason}`
      : `"${articleTitle}" başlıklı yazınız reddedildi.`,
    link: `/admin/articles/${articleId}/edit`,
  });
}

// Yeni yazı onay bekliyor - adminlere bildirim
export async function notifyNewPendingArticle(
  adminIds: string[],
  articleTitle: string,
  authorName: string,
  articleId: string
) {
  const notifications = adminIds.map((adminId) =>
    createNotification({
      userId: adminId,
      type: 'NEW_ARTICLE_PENDING',
      title: 'Yeni Yazı Onay Bekliyor',
      message: `${authorName} tarafından "${articleTitle}" başlıklı yeni bir yazı onay bekliyor.`,
      link: `/admin/articles/${articleId}/edit`,
    })
  );

  return Promise.all(notifications);
}
