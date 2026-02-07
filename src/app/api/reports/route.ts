import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { reportsQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = reportsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { dateFrom, dateTo } = parsed.data;
  const hasDateFilter = dateFrom || dateTo;
  const dateFilter = {
    ...(dateFrom && { gte: dateFrom }),
    ...(dateTo && { lte: dateTo }),
  };

  const [
    pipelineDistribution,
    candidatesByStatus,
    firmActivity,
    monthlyTrends,
    consultantPerformance,
  ] = await Promise.all([
    // 1. Pipeline distribution
    prisma.process.groupBy({
      by: ["stage"],
      ...(hasDateFilter ? { where: { createdAt: dateFilter } } : {}),
      _count: { id: true },
    }),

    // 2. Candidates by status
    prisma.candidate.groupBy({
      by: ["status"],
      ...(hasDateFilter ? { where: { createdAt: dateFilter } } : {}),
      _count: { id: true },
    }),

    // 3. Firm activity — top 10 firms by process count
    prisma.process.groupBy({
      by: ["firmId"],
      ...(hasDateFilter ? { where: { createdAt: dateFilter } } : {}),
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    // 4. Monthly trends
    prisma.$queryRaw<{ month: Date; type: string; count: number }[]>`
      SELECT date_trunc('month', created_at) as month, 'candidate' as type, COUNT(*)::int as count
      FROM candidates
      ${hasDateFilter ? Prisma.sql`WHERE created_at >= ${dateFrom || new Date("2000-01-01")} AND created_at <= ${dateTo || new Date("2100-01-01")}` : Prisma.empty}
      GROUP BY month
      UNION ALL
      SELECT date_trunc('month', created_at) as month, 'process' as type, COUNT(*)::int as count
      FROM processes
      ${hasDateFilter ? Prisma.sql`WHERE created_at >= ${dateFrom || new Date("2000-01-01")} AND created_at <= ${dateTo || new Date("2100-01-01")}` : Prisma.empty}
      GROUP BY month
      UNION ALL
      SELECT date_trunc('month', closed_at) as month, 'placement' as type, COUNT(*)::int as count
      FROM processes
      WHERE stage = 'positive' AND closed_at IS NOT NULL
      ${hasDateFilter ? Prisma.sql`AND closed_at >= ${dateFrom || new Date("2000-01-01")} AND closed_at <= ${dateTo || new Date("2100-01-01")}` : Prisma.empty}
      GROUP BY month
      ORDER BY month ASC
    `,

    // 5. Consultant performance
    prisma.process.groupBy({
      by: ["assignedToId"],
      ...(hasDateFilter ? { where: { createdAt: dateFilter } } : {}),
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  // Enrich firm activity with names
  const firmIds = firmActivity.map((f) => f.firmId);
  const firms = firmIds.length > 0
    ? await prisma.firm.findMany({
        where: { id: { in: firmIds } },
        select: { id: true, name: true },
      })
    : [];
  const firmMap = Object.fromEntries(firms.map((f) => [f.id, f.name]));

  // Enrich consultant performance with names
  const userIds = consultantPerformance.map((c) => c.assignedToId);
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];
  const userMap = Object.fromEntries(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
  );

  return NextResponse.json(
    successResponse({
      pipelineDistribution: pipelineDistribution.map((p) => ({
        stage: p.stage,
        count: p._count.id,
      })),
      candidatesByStatus: candidatesByStatus.map((c) => ({
        status: c.status,
        count: c._count.id,
      })),
      firmActivity: firmActivity.map((f) => ({
        firmId: f.firmId,
        firmName: firmMap[f.firmId] || "Bilinmiyor",
        processCount: f._count.id,
      })),
      monthlyTrends,
      consultantPerformance: consultantPerformance.map((c) => ({
        userId: c.assignedToId,
        userName: userMap[c.assignedToId] || "Bilinmiyor",
        processCount: c._count.id,
      })),
    })
  );
}
