import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { createPositionSchema, paginationSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

// GET /api/positions — List positions
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

  const where: Prisma.PositionWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { firm: { name: { contains: search, mode: "insensitive" } } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [positions, total] = await Promise.all([
    prisma.position.findMany({
      where,
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        priority: true,
        city: true,
        workModel: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        createdAt: true,
        firm: {
          select: { id: true, name: true },
        },
        _count: { select: { processes: { where: { closedAt: null } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.position.count({ where }),
  ]);

  const data = positions.map((p) => ({
    ...p,
    salaryMin: p.salaryMin ? Number(p.salaryMin) : null,
    salaryMax: p.salaryMax ? Number(p.salaryMax) : null,
    activeProcessCount: p._count.processes,
    _count: undefined,
  }));

  return NextResponse.json(
    successResponse(data, { pagination: paginationMeta(page, limit, total) })
  );
}

// POST /api/positions — Create position
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createPositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  // Verify firm exists
  const firm = await prisma.firm.findUnique({ where: { id: parsed.data.firmId } });
  if (!firm) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Firma bulunamadı"), { status: 404 });
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const position = await prisma.position.create({
    data: {
      ...(cleaned as Prisma.PositionUncheckedCreateInput),
      createdById: session!.user.id,
    },
    include: {
      firm: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "create",
    entityType: "Position",
    entityId: position.id,
    changes: { created: cleaned },
  });

  return NextResponse.json(successResponse(position), { status: 201 });
}
