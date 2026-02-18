import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { generatePortalToken, buildPortalLoginUrl, buildPortalInviteEmail } from "@/lib/candidate-portal";
import { sendEmail } from "@/lib/email";
import { PORTAL_TOKEN_EXPIRY_DAYS } from "@/lib/constants";

// POST /api/candidate-portal/send-access
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const { candidateId } = body;
  if (!candidateId || typeof candidateId !== "string") {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "candidateId gerekli"),
      { status: 400 }
    );
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  if (!candidate) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Aday bulunamadı"), { status: 404 });
  }

  if (!candidate.email) {
    return NextResponse.json(
      errorResponse("NO_EMAIL", "Adayın e-posta adresi bulunmuyor"),
      { status: 400 }
    );
  }

  const token = await generatePortalToken(candidateId, session!.user.id);
  const loginUrl = buildPortalLoginUrl(token);
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;

  const emailBody = buildPortalInviteEmail({
    candidateName,
    loginUrl,
    expiresInDays: PORTAL_TOKEN_EXPIRY_DAYS,
  });

  const emailResult = await sendEmail({
    to: candidate.email,
    subject: "TalentFlow Portal Erişim Bağlantınız",
    body: emailBody,
  });

  // Log the email
  await prisma.emailLog.create({
    data: {
      candidateId: candidate.id,
      toEmail: candidate.email,
      subject: "TalentFlow Portal Erişim Bağlantınız",
      body: emailBody,
      sentById: session!.user.id,
      status: emailResult.success ? "sent" : "failed",
      errorMessage: emailResult.success ? null : emailResult.error,
    },
  });

  if (!emailResult.success) {
    return NextResponse.json(
      errorResponse("EMAIL_FAILED", `E-posta gönderilemedi: ${emailResult.error}`),
      { status: 502 }
    );
  }

  return NextResponse.json(successResponse({ sent: true }));
}
