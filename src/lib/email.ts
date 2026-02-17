import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export type SendEmailParams = {
  to: string;
  subject: string;
  body: string;
  from?: string;
};

export async function sendEmail({ to, subject, body, from }: SendEmailParams) {
  const fromAddress = from || `TalentFlow <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`;

  try {
    const { data, error } = await getResend().emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html: body.replace(/\n/g, "<br>"),
    });

    if (error) {
      return { success: false as const, error: error.message };
    }
    return { success: true as const, messageId: data?.id };
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
