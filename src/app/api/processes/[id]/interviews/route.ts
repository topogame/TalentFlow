import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { createInterviewSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/processes/:id/interviews
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const process = await prisma.process.findUnique({ where: { id }, select: { id: true } });
  if (!process) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }

  const interviews = await prisma.interview.findMany({
    where: { processId: id },
    orderBy: { scheduledAt: "asc" },
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

  return NextResponse.json(successResponse(interviews));
}

// POST /api/processes/:id/interviews
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const process = await prisma.process.findUnique({ where: { id }, select: { id: true, closedAt: true } });
  if (!process) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }
  if (process.closedAt) {
    return NextResponse.json(
      errorResponse("PROCESS_CLOSED", "Kapatılmış süreç için mülakat planlanamaz"),
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createInterviewSchema.safeParse(body);
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

  const interview = await prisma.interview.create({
    data: {
      processId: id,
      scheduledAt: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      type: parsed.data.type,
      meetingLink: (cleaned.meetingLink as string) || null,
      location: (cleaned.location as string) || null,
      clientParticipants: (cleaned.clientParticipants as string) || null,
      notes: (cleaned.notes as string) || null,
      createdById: session!.user.id,
    },
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

  return NextResponse.json(successResponse(interview), { status: 201 });
}
