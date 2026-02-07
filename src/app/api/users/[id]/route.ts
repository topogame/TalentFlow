import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateUserSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/users/:id — Get single user (admin only)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Kullanıcı bulunamadı"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(user));
}

// PATCH /api/users/:id — Update user (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Kullanıcı bulunamadı"), {
      status: 404,
    });
  }

  const { password, ...rest } = parsed.data;

  // Check email uniqueness if changing email
  if (rest.email && rest.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: rest.email } });
    if (emailTaken) {
      return NextResponse.json(
        errorResponse("DUPLICATE_EMAIL", "Bu e-posta adresi zaten kullanılıyor"),
        { status: 409 }
      );
    }
  }

  const updateData: Record<string, unknown> = { ...rest };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "update",
    entityType: "User",
    entityId: user.id,
    changes: {
      before: {
        email: existing.email,
        firstName: existing.firstName,
        lastName: existing.lastName,
        role: existing.role,
        isActive: existing.isActive,
      },
      after: parsed.data,
    },
  });

  return NextResponse.json(successResponse(user));
}

// DELETE /api/users/:id — Soft-delete user (admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  // Prevent self-deletion
  if (id === session!.user.id) {
    return NextResponse.json(
      errorResponse("SELF_DELETE", "Kendinizi silemezsiniz"),
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Kullanıcı bulunamadı"), {
      status: 404,
    });
  }

  // Soft delete — deactivate
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: session!.user.id,
    action: "deactivate",
    entityType: "User",
    entityId: id,
    changes: { before: { isActive: true }, after: { isActive: false } },
  });

  return NextResponse.json(successResponse({ message: "Kullanıcı devre dışı bırakıldı" }));
}
