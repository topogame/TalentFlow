import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string;
      lastName: string;
      candidateId?: string;
      userType?: "user" | "candidate";
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    firstName?: string;
    lastName?: string;
    candidateId?: string;
    userType?: "user" | "candidate";
  }
}
