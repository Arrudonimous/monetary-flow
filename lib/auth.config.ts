import type { NextAuthConfig } from "next-auth";

/**
 * Config "leve", sem o Credentials provider (que depende do Prisma/`pg`,
 * incompatível com o Edge Runtime do middleware). O middleware usa só isso;
 * a config completa com o provider fica em lib/auth.ts, usada nas rotas,
 * server actions e server components (Node runtime).
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/integration");

      if (isPublic) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
