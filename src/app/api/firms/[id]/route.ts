import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateFirmSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/firms/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const firm = await prisma.firm.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      positions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          city: true,
          workModel: true,
          createdAt: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!firm) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Firma bulunamadı"), { status: 404 });
  }

  return NextResponse.json(successResponse(firm));
}

// PUT /api/firms/:id
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

  const parsed = updateFirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.firm.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Firma bulunamadı"), { status: 404 });
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const firm = await prisma.firm.update({
    where: { id },
    data: cleaned as Prisma.FirmUncheckedUpdateInput,
  });

  return NextResponse.json(successResponse(firm));
}
