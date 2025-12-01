import prisma from './prisma';

type ActivityType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN'
  | 'LOGOUT';

interface LogActivityParams {
  userId: string;
  userName: string;
  action: ActivityType;
  entityType: 'article' | 'user' | 'category' | 'media' | 'settings';
  entityId?: string;
  entityTitle?: string;
  details?: string;
  ipAddress?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityTitle: params.entityTitle,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

export async function getActivityLogs(options?: {
  userId?: string;
  entityType?: string;
  action?: ActivityType;
  limit?: number;
  skip?: number;
}) {
  const where: any = {};

  if (options?.userId) where.userId = options.userId;
  if (options?.entityType) where.entityType = options.entityType;
  if (options?.action) where.action = options.action;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.skip || 0,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
}
