import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      rank?: string;
      loginCount?: number;
      twoFactorSetupComplete?: boolean;
      needsIdCard?: boolean;
      profileFromOAuth?: boolean;
    };
  }

  interface User {
    rank?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rank?: string;
  }
}
