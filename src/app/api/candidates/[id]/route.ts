import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateCandidateSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/candidates/:id — Get full candidate profile
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      languages: true,
      documents: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { processes: { where: { closedAt: null } } } },
    },
  });

  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  const data = {
    ...candidate,
    salaryExpectation: candidate.salaryExpectation ? Number(candidate.salaryExpectation) : null,
    activeProcessCount: candidate._count.processes,
    _count: undefined,
  };

  return NextResponse.json(successResponse(data));
}

// PUT /api/candidates/:id — Update candidate
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = updateCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.candidate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  const { languages, ...candidateData } = parsed.data;

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(candidateData)) {
    cleaned[key] = value === "" ? null : value;
  }

  const candidate = await prisma.candidate.update({
    where: { id },
    data: {
      ...(cleaned as Prisma.CandidateUncheckedUpdateInput),
      ...(languages !== undefined
        ? {
            languages: {
              deleteMany: {},
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
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(successResponse(candidate));
}
