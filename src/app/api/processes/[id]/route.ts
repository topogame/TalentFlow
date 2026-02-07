import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateProcessSchema } from "@/lib/validations";
import { createAuditLog, computeChanges } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/processes/:id — Full process detail
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const process = await prisma.process.findUnique({
    where: { id },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          currentTitle: true,
          email: true,
          phone: true,
        },
      },
      firm: {
        select: { id: true, name: true, sector: true },
      },
      position: {
        select: { id: true, title: true, department: true },
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
      stageHistory: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fromStage: true,
          toStage: true,
          note: true,
          createdAt: true,
          changedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          createdBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      interviews: {
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
      },
    },
  });

  if (!process) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }

  return NextResponse.json(successResponse(process));
}

// PUT /api/processes/:id — Update process metadata
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = updateProcessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.process.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }
  if (existing.closedAt) {
    return NextResponse.json(
      errorResponse("PROCESS_CLOSED", "Kapatılmış süreç güncellenemez"),
      { status: 400 }
    );
  }

  const process = await prisma.process.update({
    where: { id },
    data: parsed.data,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
      firm: { select: { id: true, name: true } },
      position: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  const changes = computeChanges(
    existing as unknown as Record<string, unknown>,
    parsed.data as unknown as Record<string, unknown>
  );
  await createAuditLog({
    userId: session!.user.id,
    action: "update",
    entityType: "Process",
    entityId: id,
    changes,
  });

  return NextResponse.json(successResponse(process));
}
