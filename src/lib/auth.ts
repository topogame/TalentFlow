import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { validatePortalToken } from "@/lib/candidate-portal";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: "user" as const,
        };
      },
    }),
    Credentials({
      id: "portal-token",
      name: "Portal Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        const result = await validatePortalToken(credentials.token as string);
        if (!result.valid) {
          return null;
        }

        const candidate = await prisma.candidate.findUnique({
          where: { id: result.candidateId },
          select: { id: true, firstName: true, lastName: true, email: true },
        });

        if (!candidate) {
          return null;
        }

        return {
          id: `candidate_${candidate.id}`,
          email: candidate.email || undefined,
          name: `${candidate.firstName} ${candidate.lastName}`,
          role: "candidate",
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          candidateId: candidate.id,
          userType: "candidate" as const,
        };
      },
    }),
  ],
});
