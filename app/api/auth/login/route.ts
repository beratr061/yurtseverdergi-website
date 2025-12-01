import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { getUserByEmail } from '@/lib/db';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { sanitizeEmail, isDangerousInput } from '@/lib/sanitize';
import { logLoginAttempt } from '@/lib/login-logger';
import { signIn } from '@/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

// IP adresini al
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validation
    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      await logLoginAttempt({
        type: 'FAILED_VALIDATION',
        email: String(body?.email || 'unknown'),
        ipAddress,
        userAgent,
        success: false,
        details: 'Invalid input format',
      });
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre formatı' },
        { status: 400 }
      );
    }

    let { email, password } = validatedFields.data;

    // Input sanitization
    email = sanitizeEmail(email);

    // Tehlikeli input kontrolü
    if (isDangerousInput(email) || isDangerousInput(password)) {
      await logLoginAttempt({
        type: 'DANGEROUS_INPUT',
        email,
        ipAddress,
        userAgent,
        success: false,
        details: 'Potential injection attack detected',
      });
      return NextResponse.json(
        { error: 'Geçersiz karakter tespit edildi' },
        { status: 400 }
      );
    }

    // Rate limiting kontrolü
    const rateLimitResult = checkRateLimit(email);
    if (!rateLimitResult.success) {
      await logLoginAttempt({
        type: 'RATE_LIMITED',
        email,
        ipAddress,
        userAgent,
        success: false,
        details: `Blocked for ${rateLimitResult.resetIn} seconds`,
      });
      return NextResponse.json(
        { 
          error: `Çok fazla deneme. ${Math.ceil(rateLimitResult.resetIn / 60)} dakika sonra tekrar deneyin.`,
          blocked: true,
          resetIn: rateLimitResult.resetIn,
        },
        { status: 429 }
      );
    }

    // Kullanıcıyı bul
    const { data: user, error } = await getUserByEmail(email);

    if (error || !user || !user.hashedPassword) {
      await logLoginAttempt({
        type: 'FAILED_CREDENTIALS',
        email,
        ipAddress,
        userAgent,
        success: false,
        details: 'User not found',
      });
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      await logLoginAttempt({
        type: 'FAILED_CREDENTIALS',
        email,
        ipAddress,
        userAgent,
        success: false,
        details: 'Invalid password',
      });
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Başarılı giriş - rate limit'i sıfırla
    resetRateLimit(email);

    // Başarılı giriş logla
    await logLoginAttempt({
      type: 'SUCCESS',
      email,
      ipAddress,
      userAgent,
      success: true,
      userId: user.id,
      details: `User ${user.name} logged in`,
    });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
