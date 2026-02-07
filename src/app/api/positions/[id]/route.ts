import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updatePositionSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/positions/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      firm: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      processes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          stage: true,
          fitnessScore: true,
          closedAt: true,
          createdAt: true,
          candidate: {
            select: { id: true, firstName: true, lastName: true, currentTitle: true },
          },
        },
      },
    },
  });

  if (!position) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Pozisyon bulunamadı"), { status: 404 });
  }

  const data = {
    ...position,
    salaryMin: position.salaryMin ? Number(position.salaryMin) : null,
    salaryMax: position.salaryMax ? Number(position.salaryMax) : null,
  };

  return NextResponse.json(successResponse(data));
}

// PUT /api/positions/:id
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

  const parsed = updatePositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.position.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Pozisyon bulunamadı"), { status: 404 });
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const position = await prisma.position.update({
    where: { id },
    data: cleaned as Prisma.PositionUncheckedUpdateInput,
    include: {
      firm: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(successResponse(position));
}
