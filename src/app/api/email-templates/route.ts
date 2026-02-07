import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { createEmailTemplateSchema, emailTemplateListSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

// GET /api/email-templates — List templates
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = emailTemplateListSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { page, limit, search, category, isActive } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.EmailTemplateWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (isActive !== undefined) where.isActive = isActive;

  const [templates, total] = await Promise.all([
    prisma.emailTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        subject: true,
        body: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { emailLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.emailTemplate.count({ where }),
  ]);

  const data = templates.map((t) => ({
    ...t,
    usageCount: t._count.emailLogs,
    _count: undefined,
  }));

  return NextResponse.json(
    successResponse(data, { pagination: paginationMeta(page, limit, total) })
  );
}

// POST /api/email-templates — Create template
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createEmailTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  const template = await prisma.emailTemplate.create({
    data: {
      ...(cleaned as Prisma.EmailTemplateUncheckedCreateInput),
      createdById: session!.user.id,
    },
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "create",
    entityType: "EmailTemplate",
    entityId: template.id,
    changes: { created: cleaned },
  });

  return NextResponse.json(successResponse(template), { status: 201 });
}
