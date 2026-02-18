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
        token.candidateId = user.candidateId;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.candidateId = token.candidateId as string | undefined;
        session.user.userType = token.userType as "user" | "candidate" | undefined;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPortalLogin = nextUrl.pathname.startsWith("/portal/login");
      const isPortalRoute = nextUrl.pathname.startsWith("/portal");
      const isOnPublicPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/reset-password");
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");
      const isHealthApi = nextUrl.pathname === "/api/health";

      // Always allow auth API and health check
      if (isAuthApi || isHealthApi) return true;

      // Portal login page is public
      if (isPortalLogin) {
        return true;
      }

      // Portal routes: require logged-in candidate
      if (isPortalRoute) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/portal/login", nextUrl));
        }
        return true;
      }

      // Dashboard public pages (login, reset-password)
      if (isOnPublicPage) {
        if (isLoggedIn && auth?.user?.userType !== "candidate") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // All other routes require login
      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      // Candidate users should not access dashboard routes
      if (auth?.user?.userType === "candidate") {
        return Response.redirect(new URL("/portal", nextUrl));
      }

      if (nextUrl.pathname === "/") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
