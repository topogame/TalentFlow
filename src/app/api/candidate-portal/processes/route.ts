import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCandidateAuth } from "@/lib/auth-guard";
import { successResponse } from "@/lib/utils";

// GET /api/candidate-portal/processes
export async function GET() {
  const { candidateId, error } = await requireCandidateAuth();
  if (error) return error;

  const processes = await prisma.process.findMany({
    where: { candidateId: candidateId! },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      stage: true,
      createdAt: true,
      closedAt: true,
      firm: { select: { name: true } },
      position: { select: { title: true } },
      interviews: {
        select: { scheduledAt: true, isCompleted: true },
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(successResponse(processes));
}
