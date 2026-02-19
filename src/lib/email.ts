import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export type SendEmailParams = {
  to: string;
  subject: string;
  body: string;
  from?: string;
};

export async function sendEmail({ to, subject, body, from }: SendEmailParams) {
  const fromAddress = from || `TalentFlow <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`;

  try {
    const info = await getTransporter().sendMail({
      from: fromAddress,
      to,
      subject,
      html: body.replace(/\n/g, "<br>"),
    });

    return { success: true as const, messageId: info.messageId };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Bilinmeyen hata",
    };
  }
}

export function replaceDynamicFields(
  template: string,
  fields: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(fields)) {
    result = result.replaceAll(key, value);
  }
  return result;
}
