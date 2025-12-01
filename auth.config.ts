import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/admin/login';
      
      // Public routes
      if (!isOnAdmin) {
        return true;
      }
      
      // Login page
      if (isOnLogin) {
        if (isLoggedIn) {
          // Redirect to dashboard if already logged in
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        // Allow access to login page
        return true;
      }
      
      // Protected admin routes
      if (isLoggedIn) {
        return true;
      }
      
      // Redirect to login if not logged in
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
