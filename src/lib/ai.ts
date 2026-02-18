import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── Lazy singleton (email.ts pattern) ───

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

// ─── Types ───

const cvParseResultSchema = z.object({
  firstName: z.string().nullable().default(null),
  lastName: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  linkedinUrl: z.string().nullable().default(null),
  educationLevel: z.string().nullable().default(null),
  universityName: z.string().nullable().default(null),
  universityDepartment: z.string().nullable().default(null),
  totalExperienceYears: z.number().nullable().default(null),
  currentSector: z.string().nullable().default(null),
  currentTitle: z.string().nullable().default(null),
  salaryExpectation: z.number().nullable().default(null),
  salaryCurrency: z.string().nullable().default(null),
  country: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  languages: z
    .array(
      z.object({
        language: z.string(),
        level: z.enum(["beginner", "intermediate", "advanced", "native"]),
      })
    )
    .default([]),
});

export type CVParseResult = z.infer<typeof cvParseResultSchema>;

// ─── Prompt ───

export const CV_EXTRACTION_PROMPT = `Sen bir CV/özgeçmiş analiz asistanısın. Aşağıdaki CV içeriğini analiz ederek belirtilen JSON formatında bilgileri çıkar.

KURALLAR:
- Sadece CV'de açıkça belirtilen bilgileri çıkar
- Bulamadıkların için null döndür
- educationLevel değerleri: "Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora" (sadece bunlar)
- Dil seviyeleri: "beginner", "intermediate", "advanced", "native" (sadece bunlar)
- salaryCurrency: "TRY", "USD", "EUR" (sadece bunlar, bulunamazsa null)
- totalExperienceYears: toplam iş deneyimini yıl olarak hesapla (tam sayı)
- Türkçe karakterler doğru kullanılmalı (ö, ü, ş, ç, ğ, ı, İ)
- Yanıtı SADECE JSON olarak döndür, başka bir şey ekleme

JSON FORMATI:
{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "linkedinUrl": string | null,
  "educationLevel": string | null,
  "universityName": string | null,
  "universityDepartment": string | null,
  "totalExperienceYears": number | null,
  "currentSector": string | null,
  "currentTitle": string | null,
  "salaryExpectation": number | null,
  "salaryCurrency": string | null,
  "country": string | null,
  "city": string | null,
  "languages": [{ "language": string, "level": "beginner" | "intermediate" | "advanced" | "native" }]
}`;

// ─── JSON extraction ───

export function extractJSON(text: string): CVParseResult {
  // Try to find JSON in markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      return cvParseResultSchema.parse(parsed);
    } catch {
      // Fall through to next attempt
    }
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return cvParseResultSchema.parse(parsed);
    } catch {
      // Fall through to default
    }
  }

  // Return empty default
  return cvParseResultSchema.parse({});
}

// ─── CV Parse from PDF (base64 document) ───

export async function parseCVFromPDF(
  base64Content: string
): Promise<{ success: true; data: CVParseResult } | { success: false; error: string }> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Content,
              },
            },
            { type: "text", text: CV_EXTRACTION_PROMPT },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "AI yanıt vermedi" };
    }

    const data = extractJSON(textBlock.text);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI analiz hatası",
    };
  }
}

// ─── CV Parse from text (DOCX extracted text) ───

export async function parseCVFromText(
  textContent: string
): Promise<{ success: true; data: CVParseResult } | { success: false; error: string }> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${CV_EXTRACTION_PROMPT}\n\n--- CV İÇERİĞİ ---\n${textContent}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "AI yanıt vermedi" };
    }

    const data = extractJSON(textBlock.text);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI analiz hatası",
    };
  }
}
