import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  findAccessUserByEmail,
  hasAccess,
  verifyPassword,
} from '@/lib/auth/access-store';
import { ADMIN_EMAIL, isAdminEmail, normalizeEmail } from '@/lib/auth/constants';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    id: 'credentials',
    name: 'Email and password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim();
      const password = credentials?.password ?? '';
      if (!email || !password) return null;
      try {
        const user = await verifyPassword(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } catch {
        return null;
      }
    },
  }),
];

if (
  process.env.GOOGLE_CLIENT_ID?.trim() &&
  process.env.GOOGLE_CLIENT_SECRET?.trim()
) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email ? normalizeEmail(user.email) : '';
      if (!email) return false;

      if (account?.provider === 'google') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          return '/login?error=GoogleNotConfigured';
        }
        const allowed = await hasAccess(email);
        if (!allowed) {
          return '/login?error=AccessDenied';
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = normalizeEmail(
        (user?.email || token.email || '') as string
      );
      if (email) {
        token.email = email;
        const record = await findAccessUserByEmail(email);
        token.name = user?.name || record?.name || token.name;
        token.role = isAdminEmail(email) ? 'admin' : record?.role || 'member';
        token.userId = record?.id || (isAdminEmail(email) ? 'usr_admin' : token.sub);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        session.user.role = (token.role as string) || 'member';
        session.user.id = (token.userId as string) || '';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Used when Google OAuth env is missing — Credentials still works. */
export function googleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export { ADMIN_EMAIL };
