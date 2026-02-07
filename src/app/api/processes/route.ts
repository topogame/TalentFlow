import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { processListSchema, createProcessSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { CLOSED_STAGES, PIPELINE_STAGES } from "@/lib/constants";
import { createAuditLog } from "@/lib/audit";

const processSelect = {
  id: true,
  stage: true,
  fitnessScore: true,
  closedAt: true,
  stageChangedAt: true,
  updatedAt: true,
  candidate: {
    select: { id: true, firstName: true, lastName: true, currentTitle: true },
  },
  firm: {
    select: { id: true, name: true },
  },
  position: {
    select: { id: true, title: true },
  },
  assignedTo: {
    select: { id: true, firstName: true, lastName: true },
  },
};

// GET /api/processes — List processes with filtering
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = processListSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { page, limit, search, candidateId, firmId, positionId, assignedToId, stage, view } =
    parsed.data;

  const where: Prisma.ProcessWhereInput = {};

  if (candidateId) where.candidateId = candidateId;
  if (firmId) where.firmId = firmId;
  if (positionId) where.positionId = positionId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (stage) where.stage = stage;

  if (search) {
    where.OR = [
      { candidate: { firstName: { contains: search, mode: "insensitive" } } },
      { candidate: { lastName: { contains: search, mode: "insensitive" } } },
      { firm: { name: { contains: search, mode: "insensitive" } } },
      { position: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (view === "kanban") {
    const processes = await prisma.process.findMany({
      where,
      select: processSelect,
      orderBy: { stageChangedAt: "desc" },
    });

    const grouped: Record<string, typeof processes> = {};
    for (const s of PIPELINE_STAGES) {
      grouped[s] = [];
    }
    for (const p of processes) {
      grouped[p.stage]?.push(p);
    }

    return NextResponse.json(successResponse(grouped));
  }

  // List view
  const skip = (page - 1) * limit;

  const [processes, total] = await Promise.all([
    prisma.process.findMany({
      where,
      select: processSelect,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.process.count({ where }),
  ]);

  return NextResponse.json(
    successResponse(processes, { pagination: paginationMeta(page, limit, total) })
  );
}

// POST /api/processes — Create process
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createProcessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const { candidateId, firmId, positionId, stage, fitnessScore } = parsed.data;

  // Verify entities exist
  const [candidate, firm, position] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: candidateId }, select: { id: true } }),
    prisma.firm.findUnique({ where: { id: firmId }, select: { id: true } }),
    prisma.position.findUnique({ where: { id: positionId }, select: { id: true, firmId: true } }),
  ]);

  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }
  if (!firm) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Firma bulunamadı"), { status: 404 });
  }
  if (!position) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Pozisyon bulunamadı"), { status: 404 });
  }
  if (position.firmId !== firmId) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Pozisyon seçilen firmaya ait değil"),
      { status: 400 }
    );
  }

  // Check duplicate active process
  const existing = await prisma.process.findFirst({
    where: { candidateId, firmId, positionId, closedAt: null },
  });
  if (existing) {
    return NextResponse.json(
      errorResponse("DUPLICATE_PROCESS", "Bu aday için bu pozisyonda aktif bir süreç zaten mevcut"),
      { status: 409 }
    );
  }

  // Check negative history for warnings
  const warnings: { code: string; message: string }[] = [];
  const negativeHistory = await prisma.process.findFirst({
    where: { candidateId, firmId, stage: "negative" },
  });
  if (negativeHistory) {
    warnings.push({
      code: "NEGATIVE_HISTORY",
      message: "Bu aday daha önce bu firmada olumsuz sonuçlanmış",
    });
  }

  const isClosing = CLOSED_STAGES.includes(stage as (typeof CLOSED_STAGES)[number]);

  const process = await prisma.$transaction(async (tx) => {
    const created = await tx.process.create({
      data: {
        candidateId,
        firmId,
        positionId,
        assignedToId: session!.user.id,
        createdById: session!.user.id,
        stage,
        fitnessScore: fitnessScore ?? null,
        ...(isClosing ? { closedAt: new Date() } : {}),
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
        processId: created.id,
        fromStage: null,
        toStage: stage,
        changedById: session!.user.id,
      },
    });

    return created;
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "create",
    entityType: "Process",
    entityId: process.id,
    changes: { created: { candidateId, firmId, positionId, stage, fitnessScore } },
  });

  return NextResponse.json(successResponse(process, { warnings: warnings.length > 0 ? warnings : undefined }), {
    status: 201,
  });
}
