import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { createCandidateSchema, candidateListSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET /api/candidates — List candidates with filtering
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = candidateListSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { page, limit, search, sector, city, status, minExperience, maxExperience, sort, order } =
    parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.CandidateWhereInput = { status };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  if (sector) where.currentSector = { contains: sector, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (minExperience !== undefined || maxExperience !== undefined) {
    where.totalExperienceYears = {
      ...(minExperience !== undefined && { gte: minExperience }),
      ...(maxExperience !== undefined && { lte: maxExperience }),
    };
  }

  const allowedSorts = ["createdAt", "firstName", "lastName", "totalExperienceYears"];
  const orderField = allowedSorts.includes(sort!) ? sort! : "createdAt";

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        currentTitle: true,
        currentSector: true,
        totalExperienceYears: true,
        city: true,
        salaryExpectation: true,
        salaryCurrency: true,
        status: true,
        createdAt: true,
        _count: { select: { processes: { where: { closedAt: null } } } },
      },
      orderBy: { [orderField]: order },
      skip,
      take: limit,
    }),
    prisma.candidate.count({ where }),
  ]);

  const data = candidates.map((c) => ({
    ...c,
    salaryExpectation: c.salaryExpectation ? Number(c.salaryExpectation) : null,
    activeProcessCount: c._count.processes,
    _count: undefined,
  }));

  return NextResponse.json(
    successResponse(data, { pagination: paginationMeta(page, limit, total) })
  );
}

// POST /api/candidates — Create candidate
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const { languages, ...candidateData } = parsed.data;

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(candidateData)) {
    cleaned[key] = value === "" ? null : value;
  }

  const candidate = await prisma.candidate.create({
    data: {
      ...(cleaned as Prisma.CandidateUncheckedCreateInput),
      createdById: session!.user.id,
      ...(languages && languages.length > 0
        ? {
            languages: {
              create: languages.map((l) => ({
                language: l.language,
                level: l.level,
              })),
            },
          }
        : {}),
    },
    include: {
      languages: true,
    },
  });

  return NextResponse.json(successResponse(candidate), { status: 201 });
}
