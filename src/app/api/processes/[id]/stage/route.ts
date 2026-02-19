import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { stageChangeSchema } from "@/lib/validations";
import { CLOSED_STAGES } from "@/lib/constants";
import { createAuditLog } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/processes/:id/stage — Change pipeline stage
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

  const parsed = stageChangeSchema.safeParse(body);
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
  const newStage = parsed.data.stage;
  if (existing.stage === newStage) {
    return NextResponse.json(
      errorResponse("SAME_STAGE", "Süreç zaten bu aşamada"),
      { status: 400 }
    );
  }

  const isClosing = CLOSED_STAGES.includes(newStage as (typeof CLOSED_STAGES)[number]);
  const isReopening = existing.closedAt && !isClosing;

  const process = await prisma.$transaction(async (tx) => {
    const updated = await tx.process.update({
      where: { id },
      data: {
        stage: newStage,
        stageChangedAt: new Date(),
        ...(isClosing ? { closedAt: new Date() } : {}),
        ...(isReopening ? { closedAt: null } : {}),
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        firm: { select: { id: true, name: true } },
        position: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await tx.processStageHistory.create({
      data: {
        processId: id,
        fromStage: existing.stage,
        toStage: newStage,
        note: parsed.data.note || null,
        changedById: session!.user.id,
      },
    });

    return updated;
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "stage_change",
    entityType: "Process",
    entityId: id,
    changes: { before: { stage: existing.stage }, after: { stage: newStage } },
  });

  return NextResponse.json(successResponse(process));
}
