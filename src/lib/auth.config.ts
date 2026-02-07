import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [], // Configured in auth.ts with Prisma
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublicPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/reset-password");
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");
      const isHealthApi = nextUrl.pathname === "/api/health";

      if (isAuthApi || isHealthApi) return true;

      if (isOnPublicPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      if (nextUrl.pathname === "/") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
