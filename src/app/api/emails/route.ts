import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";
import { emailLogListSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET /api/emails — List sent emails
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = emailLogListSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { page, limit, candidateId, processId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.EmailLogWhereInput = {};
  if (candidateId) where.candidateId = candidateId;
  if (processId) where.processId = processId;
  if (status) where.status = status;

  const [emails, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      select: {
        id: true,
        toEmail: true,
        subject: true,
        body: true,
        status: true,
        errorMessage: true,
        sentAt: true,
        candidate: { select: { id: true, firstName: true, lastName: true } },
        process: {
          select: {
            id: true,
            position: { select: { title: true } },
            firm: { select: { name: true } },
          },
        },
        template: { select: { id: true, name: true } },
        sentBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { sentAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.emailLog.count({ where }),
  ]);

  return NextResponse.json(
    successResponse(emails, { pagination: paginationMeta(page, limit, total) })
  );
}
