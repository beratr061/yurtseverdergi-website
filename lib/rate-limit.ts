// Basit in-memory rate limiter
// Production'da Redis kullanılması önerilir

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Belirli aralıklarla eski kayıtları temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Her dakika temizle

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
