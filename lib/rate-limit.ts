// Rate limiter with Upstash Redis support (falls back to in-memory)
// Production'da Redis kullanılması önerilir

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis client (if configured)
let redis: Redis | null = null;
let upstashRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
    analytics: true,
    prefix: 'ratelimit:login',
  });
}

// Fallback: In-memory rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Belirli aralıklarla eski kayıtları temizle
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Her dakika temizle
}

export interface RateLimitConfig {
  maxAttempts: number;      // Maksimum deneme sayısı
  windowMs: number;         // Zaman penceresi (ms)
  blockDurationMs: number;  // Engelleme süresi (ms)
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;          // Saniye cinsinden
  blocked: boolean;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,           // 5 deneme
  windowMs: 15 * 60 * 1000, // 15 dakika
  blockDurationMs: 30 * 60 * 1000, // 30 dakika engelleme
};

export async function checkRateLimitAsync(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  // Upstash Redis varsa onu kullan
  if (upstashRatelimit) {
    try {
      const result = await upstashRatelimit.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        resetIn: Math.ceil((result.reset - Date.now()) / 1000),
        blocked: !result.success,
      };
    } catch (error) {
      console.error('Upstash rate limit error, falling back to in-memory:', error);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  return checkRateLimit(identifier, config);
}

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { maxAttempts, windowMs, blockDurationMs } = { ...defaultConfig, ...config };
  const now = Date.now();
  const key = `login:${identifier}`;

  let entry = rateLimitMap.get(key);

  // Yeni giriş veya süre dolmuş
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, entry);

    return {
      success: true,
      remaining: maxAttempts - 1,
      resetIn: Math.ceil(windowMs / 1000),
      blocked: false,
    };
  }

  // Limit aşıldı mı?
  if (entry.count >= maxAttempts) {
    // Engelleme süresini uzat
    entry.resetTime = now + blockDurationMs;
    rateLimitMap.set(key, entry);

    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil(blockDurationMs / 1000),
      blocked: true,
    };
  }

  // Sayacı artır
  entry.count++;
  rateLimitMap.set(key, entry);

  return {
    success: true,
    remaining: maxAttempts - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    blocked: false,
  };
}

export async function resetRateLimitAsync(identifier: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(`ratelimit:login:${identifier}`);
    } catch (error) {
      console.error('Upstash reset error:', error);
    }
  }
  rateLimitMap.delete(`login:${identifier}`);
}

export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(`login:${identifier}`);
}

export function getRateLimitStatus(identifier: string): RateLimitResult | null {
  const entry = rateLimitMap.get(`login:${identifier}`);
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.resetTime) {
    rateLimitMap.delete(`login:${identifier}`);
    return null;
  }

  return {
    success: entry.count < defaultConfig.maxAttempts,
    remaining: Math.max(0, defaultConfig.maxAttempts - entry.count),
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    blocked: entry.count >= defaultConfig.maxAttempts,
  };
}

// Check if Redis is available
export function isRedisAvailable(): boolean {
  return redis !== null;
}
