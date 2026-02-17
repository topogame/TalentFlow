import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/utils";
import { createExcelResponse } from "@/lib/excel";
import { exportQuerySchema } from "@/lib/validations";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = exportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { dateFrom, dateTo } = parsed.data;
  const where: Prisma.ProcessWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const processes = await prisma.process.findMany({
    where,
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      firm: { select: { name: true } },
      position: { select: { title: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const columns = [
    { header: "Aday", key: "candidateName", width: 25 },
    { header: "Firma", key: "firmName", width: 25 },
    { header: "Pozisyon", key: "positionTitle", width: 25 },
    { header: "Aşama", key: "stage", width: 20 },
    { header: "Uyum Puanı", key: "fitnessScore", width: 12 },
    { header: "Danışman", key: "assignedTo", width: 20 },
    { header: "Notlar", key: "latestNote", width: 40 },
    { header: "Başlangıç", key: "createdAt", width: 18 },
    { header: "Kapanış", key: "closedAt", width: 18 },
  ];

  const rows = processes.map((p) => ({
    candidateName: `${p.candidate.firstName} ${p.candidate.lastName}`,
    firmName: p.firm.name,
    positionTitle: p.position.title,
    stage: PIPELINE_STAGE_LABELS[p.stage] || p.stage,
    fitnessScore: p.fitnessScore ?? "",
    assignedTo: p.assignedTo
      ? `${p.assignedTo.firstName} ${p.assignedTo.lastName}`
      : "",
    latestNote: p.notes[0]?.content || "",
    createdAt: p.createdAt.toLocaleDateString("tr-TR"),
    closedAt: p.closedAt ? p.closedAt.toLocaleDateString("tr-TR") : "",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  return createExcelResponse("Süreçler", columns, rows, `surecler_${timestamp}.xlsx`);
}
