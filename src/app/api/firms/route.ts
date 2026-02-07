import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { createFirmSchema, paginationSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET /api/firms — List firms
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = paginationSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.FirmWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sector: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [firms, total] = await Promise.all([
    prisma.firm.findMany({
      where,
      select: {
        id: true,
        name: true,
        sector: true,
        companySize: true,
        city: true,
        country: true,
        website: true,
        status: true,
        createdAt: true,
        _count: { select: { positions: true, contacts: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.firm.count({ where }),
  ]);

  const data = firms.map((f) => ({
    ...f,
    positionCount: f._count.positions,
    contactCount: f._count.contacts,
    _count: undefined,
  }));

  return NextResponse.json(
    successResponse(data, { pagination: paginationMeta(page, limit, total) })
  );
}

// POST /api/firms — Create firm
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createFirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const firm = await prisma.firm.create({
    data: {
      ...(cleaned as Prisma.FirmUncheckedCreateInput),
      createdById: session!.user.id,
    },
  });

  return NextResponse.json(successResponse(firm), { status: 201 });
}
