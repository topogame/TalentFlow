import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { parseLinkedInProfile } from "@/lib/ai";
import { errorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (text.length < 50) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Profil metni en az 50 karakter olmalıdır"),
        { status: 400 }
      );
    }

    const result = await parseLinkedInProfile(text);

    if (!result.success) {
      return NextResponse.json(
        errorResponse("AI_PARSE_ERROR", result.error),
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("LinkedIn parse error:", err);
    return NextResponse.json(
      errorResponse("SERVER_ERROR", "LinkedIn profili analiz edilemedi"),
      { status: 500 }
    );
  }
}
