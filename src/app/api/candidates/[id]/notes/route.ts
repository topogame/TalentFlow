import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { noteSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/candidates/:id/notes
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({ where: { id }, select: { id: true } });
  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  const notes = await prisma.candidateNote.findMany({
    where: { candidateId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(successResponse(notes));
}

// POST /api/candidates/:id/notes
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({ where: { id }, select: { id: true } });
  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const note = await prisma.candidateNote.create({
    data: {
      candidateId: id,
      content: parsed.data.content,
      createdById: session!.user.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(successResponse(note), { status: 201 });
}
