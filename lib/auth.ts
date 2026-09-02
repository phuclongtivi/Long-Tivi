import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

/**
 * Đăng nhập nhanh (Facebook / Google / X / …):
 * - User chưa có TK → tạo tài khoản mới, thông tin OAuth = thông tin đăng ký ban đầu
 * - User đã có TK → đăng nhập, ghi nhận loginCount
 * - CCCD + 2FA chỉ yêu cầu từ lần 6 nếu CHƯA hoàn tất cập nhật
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'missing',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'missing',
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || 'missing',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || 'missing',
      version: '2.0',
    }),

    CredentialsProvider({
      id: 'device-biometric',
      name: 'Device Biometric',
      credentials: {
        loginCode: { label: 'Login Code', type: 'text' },
      },
      async authorize(credentials) {
        const code = credentials?.loginCode?.trim();
        if (!code) return null;
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        const row = await prisma.appSetting.findUnique({
          where: { key: `bio_login_${hash}` },
        });
        if (!row?.value) return null;
        try {
          const data = JSON.parse(row.value);
          if (!data.userId || !data.exp || new Date(data.exp) < new Date()) {
            await prisma.appSetting.delete({ where: { key: `bio_login_${hash}` } }).catch(() => null);
            return null;
          }
          // One-time
          await prisma.appSetting.delete({ where: { key: `bio_login_${hash}` } }).catch(() => null);
          const user = await prisma.user.findUnique({ where: { id: data.userId } });
          if (!user || !user.biometricEnabled) return null;
          return {
            id: user.id,
            name: user.fullName || user.name,
            email: user.email,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),


    CredentialsProvider({
      id: 'boss-email',
      name: 'Boss Email',
      credentials: {
        loginCode: { label: 'Login Code', type: 'text' },
      },
      async authorize(credentials) {
        const code = credentials?.loginCode?.trim();
        if (!code) return null;
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        const row = await prisma.appSetting.findUnique({
          where: { key: `boss_login_${hash}` },
        });
        if (!row?.value) return null;
        try {
          const data = JSON.parse(row.value);
          if (!data.userId || !data.exp || new Date(data.exp) < new Date()) {
            await prisma.appSetting.delete({ where: { key: `boss_login_${hash}` } }).catch(() => null);
            return null;
          }
          await prisma.appSetting.delete({ where: { key: `boss_login_${hash}` } }).catch(() => null);
          const user = await prisma.user.findUnique({ where: { id: data.userId } });
          if (!user || user.role !== 'boss') return null;
          return {
            id: user.id,
            name: user.fullName || user.name || 'Boss',
            email: user.email,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
    // TODO: TikTok & Zalo custom providers
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Đảm bảo user mới từ OAuth được đánh dấu + điền thông tin đăng ký
      if (user?.id && account) {
        try {
          const existing = await prisma.user.findUnique({ where: { id: user.id } });
          if (existing) {
            const updates: Record<string, unknown> = {};
            // Chỉ lần đầu: lấy name/email/image từ provider làm thông tin đăng ký
            if (!existing.profileFromOAuth && (existing.loginCount || 0) === 0) {
              updates.profileFromOAuth = true;
              if (!existing.name && user.name) updates.name = user.name;
              if (!existing.fullName && user.name) updates.fullName = user.name;
              if (!existing.email && user.email) updates.email = user.email;
              if (!existing.image && user.image) updates.image = user.image;
            }
            // Đồng bộ social link theo provider
            if (account.provider === 'facebook' && !existing.socialFacebook) {
              updates.socialFacebook = (profile as any)?.link || (profile as any)?.id || 'facebook';
            }
            if (account.provider === 'google' && !existing.socialYoutube) {
              // YouTube / Gmail cùng Google
              updates.socialYoutube = user.email || 'google';
            }
            if (Object.keys(updates).length) {
              await prisma.user.update({ where: { id: user.id }, data: updates });
            }
          }
        } catch (e) {
          console.error('signIn profile fill', e);
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      if (session.user) {
        const id = (user as any)?.id || token.sub!;
        session.user.id = id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id },
            select: {
              rank: true,
              loginCount: true,
              twoFactorSetupComplete: true,
              idNumber: true,
              fullName: true,
              biometricEnabled: true,
              profileFromOAuth: true,
            },
          });
          session.user.rank = dbUser?.rank || 'normal';
          (session.user as any).loginCount = dbUser?.loginCount || 0;
          (session.user as any).twoFactorSetupComplete = dbUser?.twoFactorSetupComplete || false;
          (session.user as any).needsIdCard =
            (dbUser?.loginCount || 0) >= 5 && !dbUser?.idNumber;
          (session.user as any).profileFromOAuth = dbUser?.profileFromOAuth || false;
        } catch {
          session.user.rank = (token.rank as string) || 'normal';
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      if (user) {
        token.rank = (user as any).rank || 'normal';
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Tài khoản mới từ OAuth = đăng ký nhanh
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            profileFromOAuth: true,
            name: user.name || undefined,
            fullName: user.name || undefined,
            email: user.email || undefined,
            image: user.image || undefined,
            loginCount: 0,
          },
        });
      } catch (e) {
        console.error('createUser event', e);
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    // Tự thoát sau 60 phút kể từ lần dùng gần nhất (rolling)
    maxAge: 60 * 60, // 3600 giây
    updateAge: 5 * 60, // gia hạn token nếu còn hoạt động (mỗi 5 phút)
  },
};
