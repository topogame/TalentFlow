import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse } from "@/lib/utils";
import { getAvailableProviders } from "@/lib/meeting";

// GET /api/meeting-providers
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json(successResponse(getAvailableProviders()));
}
