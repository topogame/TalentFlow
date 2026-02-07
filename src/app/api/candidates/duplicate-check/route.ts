import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { duplicateCheckSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// POST /api/candidates/duplicate-check
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = duplicateCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const { linkedinUrl, email, phone, firstName, lastName } = parsed.data;

  type Match = {
    candidateId: string;
    firstName: string;
    lastName: string;
    matchType: string;
    confidence: string;
  };

  const matches: Match[] = [];

  // Priority 1: LinkedIn URL (exact match)
  if (linkedinUrl) {
    const found = await prisma.candidate.findMany({
      where: { linkedinUrl: { equals: linkedinUrl, mode: "insensitive" } },
      select: { id: true, firstName: true, lastName: true },
    });
    for (const c of found) {
      matches.push({
        candidateId: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        matchType: "linkedin",
        confidence: "exact",
      });
    }
  }

  // Priority 2: Email (exact match)
  if (email && matches.length === 0) {
    const found = await prisma.candidate.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, firstName: true, lastName: true },
    });
    for (const c of found) {
      if (!matches.some((m) => m.candidateId === c.id)) {
        matches.push({
          candidateId: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          matchType: "email",
          confidence: "exact",
        });
      }
    }
  }

  // Priority 3: Phone (exact match)
  if (phone && matches.length === 0) {
    const cleanPhone = phone.replace(/\D/g, "");
    const found = await prisma.candidate.findMany({
      where: { phone: { contains: cleanPhone } },
      select: { id: true, firstName: true, lastName: true },
    });
    for (const c of found) {
      if (!matches.some((m) => m.candidateId === c.id)) {
        matches.push({
          candidateId: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          matchType: "phone",
          confidence: "exact",
        });
      }
    }
  }

  // Priority 4: Name similarity (fuzzy)
  if (firstName && lastName && matches.length === 0) {
    const where: Prisma.CandidateWhereInput = {
      AND: [
        { firstName: { contains: firstName, mode: "insensitive" } },
        { lastName: { contains: lastName, mode: "insensitive" } },
      ],
    };
    const found = await prisma.candidate.findMany({
      where,
      select: { id: true, firstName: true, lastName: true },
      take: 5,
    });
    for (const c of found) {
      if (!matches.some((m) => m.candidateId === c.id)) {
        matches.push({
          candidateId: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          matchType: "name",
          confidence: "partial",
        });
      }
    }
  }

  return NextResponse.json(
    successResponse({
      hasDuplicates: matches.length > 0,
      matches,
    })
  );
}
