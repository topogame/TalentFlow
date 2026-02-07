import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/utils";

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(errorResponse("UNAUTHORIZED", "Oturum açmanız gerekiyor"), {
        status: 401,
      }),
    };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  if (session!.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json(errorResponse("FORBIDDEN", "Bu işlem için yetkiniz yok"), {
        status: 403,
      }),
    };
  }
  return { session, error: null };
}
