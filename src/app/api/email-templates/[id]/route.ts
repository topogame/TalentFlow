import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateEmailTemplateSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { createAuditLog, computeChanges } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/email-templates/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { emailLogs: true } },
    },
  });

  if (!template) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Şablon bulunamadı"), { status: 404 });
  }

  return NextResponse.json(
    successResponse({ ...template, usageCount: template._count.emailLogs, _count: undefined })
  );
}

// PUT /api/email-templates/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = updateEmailTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Şablon bulunamadı"), { status: 404 });
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: cleaned as Prisma.EmailTemplateUncheckedUpdateInput,
  });

  const changes = computeChanges(
    existing as unknown as Record<string, unknown>,
    cleaned
  );
  await createAuditLog({
    userId: session!.user.id,
    action: "update",
    entityType: "EmailTemplate",
    entityId: id,
    changes,
  });

  return NextResponse.json(successResponse(template));
}

// DELETE /api/email-templates/:id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
    include: { _count: { select: { emailLogs: true } } },
  });

  if (!template) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Şablon bulunamadı"), { status: 404 });
  }

  if (template._count.emailLogs > 0) {
    // Soft delete — deactivate template that has been used
    await prisma.emailTemplate.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json(successResponse({ deleted: false, deactivated: true }));
  }

  // Hard delete — template never used
  await prisma.emailTemplate.delete({ where: { id } });

  await createAuditLog({
    userId: session!.user.id,
    action: "delete",
    entityType: "EmailTemplate",
    entityId: id,
    changes: { deleted: true, deactivated: template._count.emailLogs > 0 },
  });

  return NextResponse.json(successResponse({ deleted: true, deactivated: false }));
}
