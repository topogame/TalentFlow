import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse } from "@/lib/utils";

// GET /api/dashboard — Dashboard stats
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [
    activeCandidates,
    openPositions,
    weekInterviews,
    activeProcesses,
    pipelineDistribution,
    recentActivity,
    upcomingInterviews,
  ] = await Promise.all([
    prisma.candidate.count({
      where: { status: "active" },
    }),
    prisma.position.count({
      where: { status: "open" },
    }),
    prisma.interview.count({
      where: {
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
    }),
    prisma.process.count({
      where: { closedAt: null },
    }),
    prisma.process.groupBy({
      by: ["stage"],
      where: { closedAt: null },
      _count: { id: true },
    }),
    prisma.processStageHistory.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fromStage: true,
        toStage: true,
        createdAt: true,
        changedBy: { select: { firstName: true, lastName: true } },
        process: {
          select: {
            id: true,
            candidate: { select: { firstName: true, lastName: true } },
            position: { select: { title: true } },
            firm: { select: { name: true } },
          },
        },
      },
    }),
    prisma.interview.findMany({
      where: { scheduledAt: { gte: now }, isCompleted: false },
      take: 5,
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        durationMinutes: true,
        process: {
          select: {
            id: true,
            candidate: { select: { firstName: true, lastName: true } },
            firm: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json(
    successResponse({
      activeCandidates,
      openPositions,
      weekInterviews,
      activeProcesses,
      pipelineDistribution: pipelineDistribution.map((p) => ({
        stage: p.stage,
        count: p._count.id,
      })),
      recentActivity,
      upcomingInterviews,
    })
  );
}
