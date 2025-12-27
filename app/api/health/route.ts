import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isRedisAvailable } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    redis: {
      status: 'up' | 'down' | 'not_configured';
    };
  };
}

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'down' },
      redis: { status: 'not_configured' },
    },
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'unhealthy';
  }

  // Redis check
  if (isRedisAvailable()) {
    health.checks.redis = { status: 'up' };
  }

  // Determine overall status
  if (health.checks.database.status === 'down') {
    health.status = 'unhealthy';
  } else if (health.checks.redis.status === 'not_configured') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, { status: statusCode });
}
