import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCandidateAuth } from "@/lib/auth-guard";
import { successResponse } from "@/lib/utils";

// GET /api/candidate-portal/emails
export async function GET() {
  const { candidateId, error } = await requireCandidateAuth();
  if (error) return error;

  const emails = await prisma.emailLog.findMany({
    where: { candidateId: candidateId! },
    orderBy: { sentAt: "desc" },
    select: {
      id: true,
      subject: true,
      sentAt: true,
      status: true,
      toEmail: true,
    },
  });

  return NextResponse.json(successResponse(emails));
}
