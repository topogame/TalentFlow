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
  ]);

  return NextResponse.json(
    successResponse({
      activeCandidates,
      openPositions,
      weekInterviews,
      activeProcesses,
    })
  );
}
