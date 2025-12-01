// Login Attempt Logger - Database Version
// Güvenlik olaylarını veritabanına kaydeder

import prismaClient from './prisma';

// Prisma client'ı any olarak cast et (loginLog modeli için)
// Not: `npx prisma generate` çalıştırıldıktan sonra bu gerekli olmayacak
const prisma = prismaClient as any;

export type LoginAttemptType =
  | 'SUCCESS'
  | 'FAILED_CREDENTIALS'
  | 'FAILED_VALIDATION'
  | 'RATE_LIMITED'
  | 'DANGEROUS_INPUT'
  | 'ACCOUNT_LOCKED'
  | 'RECAPTCHA_FAILED';

export interface LoginAttemptInput {
  type: LoginAttemptType;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
  userId?: string;
}

/**
 * Email adresini maskele (güvenlik için)
 */
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';

  const [local, domain] = email.split('@');
  const maskedLocal =
    local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : '*'.repeat(local.length);

  return `${maskedLocal}@${domain}`;
}

/**
 * Login denemesini veritabanına kaydet
 */
export async function logLoginAttempt(attempt: LoginAttemptInput) {
  // Console'a yaz
  const logLevel = attempt.success ? 'info' : 'warn';
  const emoji = attempt.success ? '✅' : '❌';

  console[logLevel](
    `${emoji} [LOGIN ${attempt.type}]`,
    `Email: ${maskEmail(attempt.email)}`,
    `IP: ${attempt.ipAddress || 'unknown'}`,
    attempt.details ? `Details: ${attempt.details}` : ''
  );

  // Tehlikeli aktiviteleri özel olarak logla
  if (attempt.type === 'DANGEROUS_INPUT' || attempt.type === 'RATE_LIMITED') {
    console.error(
      `🚨 [SECURITY ALERT]`,
      `Type: ${attempt.type}`,
      `Email: ${attempt.email}`,
      `IP: ${attempt.ipAddress}`,
      `Time: ${new Date().toISOString()}`
    );
  }

  // Veritabanına kaydet
  try {
    // Türkiye saati (sunucu zaten TR saatinde)
    const createdAtLocal = new Date().toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Istanbul',
    });

    await prisma.loginLog.create({
      data: {
        type: attempt.type,
        email: attempt.email,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        success: attempt.success,
        details: attempt.details,
        userId: attempt.userId,
        createdAtLocal, // Türkiye saati
      },
    });
  } catch (error) {
    // Veritabanı hatası olursa sadece console'a yaz
    console.error('Failed to save login log to database:', error);
  }
}

/**
 * Güvenlik istatistiklerini getir
 */
export async function getSecurityStats() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const [
      totalCount,
      last24hSuccessful,
      last24hFailed,
      last24hRateLimited,
      last24hDangerous,
      lastHourTotal,
      lastHourSuccessful,
      lastHourFailed,
    ] = await Promise.all([
      prisma.loginLog.count(),
      prisma.loginLog.count({
        where: { createdAt: { gte: last24h }, success: true },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: last24h }, success: false },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: last24h }, type: 'RATE_LIMITED' },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: last24h }, type: 'DANGEROUS_INPUT' },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: lastHour } },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: lastHour }, success: true },
      }),
      prisma.loginLog.count({
        where: { createdAt: { gte: lastHour }, success: false },
      }),
    ]);

    // En çok başarısız deneme yapan email'ler
    const topFailedEmails = await prisma.loginLog.groupBy({
      by: ['email'],
      where: { createdAt: { gte: last24h }, success: false },
      _count: { email: true },
      orderBy: { _count: { email: 'desc' } },
      take: 5,
    });

    // En çok başarısız deneme yapan IP'ler
    const topFailedIPs = await prisma.loginLog.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: { gte: last24h },
        success: false,
        ipAddress: { not: null },
      },
      _count: { ipAddress: true },
      orderBy: { _count: { ipAddress: 'desc' } },
      take: 5,
    });

    return {
      total: totalCount,
      last24h: {
        total: last24hSuccessful + last24hFailed,
        successful: last24hSuccessful,
        failed: last24hFailed,
        rateLimited: last24hRateLimited,
        dangerousInputs: last24hDangerous,
      },
      lastHour: {
        total: lastHourTotal,
        successful: lastHourSuccessful,
        failed: lastHourFailed,
      },
      topFailedEmails: topFailedEmails.map((e: any) => ({
        email: maskEmail(e.email),
        count: e._count.email,
      })),
      topFailedIPs: topFailedIPs.map((ip: any) => ({
        ip: ip.ipAddress || 'unknown',
        count: ip._count.ipAddress,
      })),
    };
  } catch (error) {
    console.error('Failed to get security stats:', error);
    return null;
  }
}

/**
 * Son logları getir
 */
export async function getRecentLogs(limit = 50) {
  try {
    const logs = await prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map((log: any) => ({
      ...log,
      email: maskEmail(log.email),
    }));
  } catch (error) {
    console.error('Failed to get recent logs:', error);
    return [];
  }
}

/**
 * Belirli bir email için login denemelerini getir
 */
export async function getLoginAttemptsByEmail(email: string, limit = 10) {
  try {
    return await prisma.loginLog.findMany({
      where: { email: email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Failed to get login attempts by email:', error);
    return [];
  }
}

/**
 * Eski logları temizle (30 günden eski)
 */
export async function cleanupOldLogs(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    const result = await prisma.loginLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
    console.log(`Cleaned up ${result.count} old login logs`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
    return 0;
  }
}
