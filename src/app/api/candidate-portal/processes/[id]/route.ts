import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCandidateAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/candidate-portal/processes/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { candidateId, error } = await requireCandidateAuth();
  if (error) return error;

  const { id } = await params;

  const process = await prisma.process.findUnique({
    where: { id },
    select: {
      id: true,
      candidateId: true,
      stage: true,
      createdAt: true,
      closedAt: true,
      firm: { select: { name: true } },
      position: { select: { title: true, city: true, workModel: true } },
      interviews: {
        select: {
          id: true,
          scheduledAt: true,
          durationMinutes: true,
          type: true,
          meetingLink: true,
          isCompleted: true,
          location: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!process) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }

  // Ensure candidate can only see their own processes
  if (process.candidateId !== candidateId) {
    return NextResponse.json(errorResponse("FORBIDDEN", "Bu sürece erişiminiz yok"), { status: 403 });
  }

  // Remove candidateId from response
  const { candidateId: _cid, ...rest } = process;
  return NextResponse.json(successResponse(rest));
}
