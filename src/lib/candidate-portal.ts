import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { PORTAL_TOKEN_EXPIRY_DAYS } from "@/lib/constants";

// ─── Token Generation ───

export async function generatePortalToken(
  candidateId: string,
  createdById: string
): Promise<string> {
  // Invalidate existing active tokens for this candidate
  await prisma.candidatePortalToken.updateMany({
    where: {
      candidateId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex"); // 64 char
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PORTAL_TOKEN_EXPIRY_DAYS);

  await prisma.candidatePortalToken.create({
    data: {
      token,
      candidateId,
      expiresAt,
      createdById,
    },
  });

  return token;
}

// ─── Token Validation ───

export async function validatePortalToken(
  token: string
): Promise<
  | { valid: true; candidateId: string }
  | { valid: false; error: string }
> {
  const record = await prisma.candidatePortalToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { valid: false, error: "Token bulunamadı" };
  }

  if (record.usedAt) {
    return { valid: false, error: "Bu link daha önce kullanılmış" };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, error: "Link süresi dolmuş" };
  }

  // Mark as used (single-use)
  await prisma.candidatePortalToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { valid: true, candidateId: record.candidateId };
}

// ─── URL Builder ───

export function buildPortalLoginUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/portal/login?token=${token}`;
}

// ─── Invite Email Builder ───

export function buildPortalInviteEmail(params: {
  candidateName: string;
  loginUrl: string;
  expiresInDays: number;
}): string {
  let body = `Sayın ${params.candidateName},\n\n`;
  body += `Başvuru süreçlerinizi takip edebileceğiniz TalentFlow Aday Portalı'na erişiminiz hazır.\n\n`;
  body += `Portala giriş yapmak için aşağıdaki bağlantıyı tıklayın:\n`;
  body += `${params.loginUrl}\n\n`;
  body += `Bu bağlantı ${params.expiresInDays} gün boyunca geçerlidir ve yalnızca bir kez kullanılabilir.\n\n`;
  body += `Portalda şunları görüntüleyebilirsiniz:\n`;
  body += `• Başvuru durumlarınız\n`;
  body += `• Mülakat bilgileriniz\n`;
  body += `• Size gönderilen e-postalar\n`;
  body += `• Profil bilgileriniz\n\n`;
  body += `İyi günler dileriz.\n`;
  body += `TalentFlow`;

  return body;
}
