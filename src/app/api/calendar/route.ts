import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { calendarQuerySchema } from "@/lib/validations";

// GET /api/calendar — List interviews within date range
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = calendarQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { start, end } = parsed.data;

  const interviews = await prisma.interview.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
    },
    select: {
      id: true,
      scheduledAt: true,
      durationMinutes: true,
      type: true,
      meetingLink: true,
      location: true,
      isCompleted: true,
      process: {
        select: {
          id: true,
          candidate: { select: { firstName: true, lastName: true } },
          firm: { select: { name: true } },
          position: { select: { title: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(successResponse(interviews));
}
