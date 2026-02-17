import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateInterviewSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string; interviewId: string }> };

// PUT /api/processes/:id/interviews/:interviewId
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id, interviewId } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, processId: id },
  });
  if (!interview) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Mülakat bulunamadı"), { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = updateInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: cleaned,
    select: {
      id: true,
      scheduledAt: true,
      durationMinutes: true,
      type: true,
      meetingLink: true,
      location: true,
      clientParticipants: true,
      notes: true,
      resultNotes: true,
      isCompleted: true,
      createdAt: true,
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(successResponse(updated));
}

// DELETE /api/processes/:id/interviews/:interviewId
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id, interviewId } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, processId: id },
  });
  if (!interview) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Mülakat bulunamadı"), { status: 404 });
  }

  await prisma.interview.delete({ where: { id: interviewId } });

  return NextResponse.json(successResponse({ deleted: true }));
}
