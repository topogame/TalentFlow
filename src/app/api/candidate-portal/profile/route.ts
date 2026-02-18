import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCandidateAuth } from "@/lib/auth-guard";
import { successResponse } from "@/lib/utils";

// GET /api/candidate-portal/profile
export async function GET() {
  const { candidateId, error } = await requireCandidateAuth();
  if (error) return error;

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId! },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      country: true,
      totalExperienceYears: true,
      educationLevel: true,
      universityName: true,
      universityDepartment: true,
      currentTitle: true,
      currentSector: true,
      linkedinUrl: true,
      languages: {
        select: { language: true, level: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ success: false, error: "Profil bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(successResponse(candidate));
}
