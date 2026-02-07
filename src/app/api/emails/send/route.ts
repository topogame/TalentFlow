import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { sendEmailSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";

// POST /api/emails/send — Send an email
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  const { candidateId, processId, templateId, toEmail, subject, body: emailBody } = parsed.data;

  // Verify candidate exists
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  // Verify process if provided
  if (processId) {
    const process = await prisma.process.findUnique({ where: { id: processId } });
    if (!process) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
    }
  }

  // Verify template if provided
  if (templateId) {
    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (!template || !template.isActive) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Şablon bulunamadı veya deaktif"), { status: 404 });
    }
  }

  // Send email via Resend
  const result = await sendEmail({ to: toEmail, subject, body: emailBody });

  // Log to database
  const emailLog = await prisma.emailLog.create({
    data: {
      candidateId,
      processId: processId || null,
      templateId: templateId || null,
      toEmail,
      subject,
      body: emailBody,
      sentById: session!.user.id,
      sentAt: new Date(),
      status: result.success ? "sent" : "failed",
      errorMessage: result.success ? null : result.error,
    },
  });

  if (!result.success) {
    return NextResponse.json(
      errorResponse("EMAIL_FAILED", `E-posta gönderilemedi: ${result.error}`),
      { status: 502 }
    );
  }

  return NextResponse.json(successResponse(emailLog), { status: 201 });
}
