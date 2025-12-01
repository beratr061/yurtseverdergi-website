import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { getUserByEmail } from './lib/db';
import { sanitizeEmail } from './lib/sanitize';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

// Not: Loglama /api/auth/login endpoint'inde yapılıyor (IP ve userAgent ile)
// Bu dosya sadece NextAuth session oluşturmak için kullanılıyor

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        let { email, password } = validatedFields.data;
        email = sanitizeEmail(email);

        const { data: user, error } = await getUserByEmail(email);

        if (error || !user || !user.hashedPassword) {
          return null;
        }

        const isValid = await compare(password, user.hashedPassword);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
});
