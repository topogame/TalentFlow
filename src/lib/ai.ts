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

// ─── LinkedIn Profile Parse ───

export const LINKEDIN_EXTRACTION_PROMPT = `Sen bir LinkedIn profil analiz asistanısın. Aşağıdaki LinkedIn profil metnini analiz ederek belirtilen JSON formatında bilgileri çıkar.

KURALLAR:
- Sadece profil metninde açıkça belirtilen bilgileri çıkar
- Bulamadıkların için null döndür
- "Deneyim" bölümündeki pozisyonların tarihlerinden toplam deneyim yılını hesapla (tam sayı)
- En güncel pozisyonu currentTitle olarak al
- En güncel şirketin sektörünü currentSector olarak al
- educationLevel değerleri: "Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora" (sadece bunlar)
- Dil seviyeleri: "beginner", "intermediate", "advanced", "native" (sadece bunlar)
- LinkedIn profil URL'sini linkedinUrl olarak al (varsa)
- salaryCurrency: "TRY", "USD", "EUR" (sadece bunlar, bulunamazsa null)
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

export async function parseLinkedInProfile(
  text: string
): Promise<{ success: true; data: CVParseResult } | { success: false; error: string }> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${LINKEDIN_EXTRACTION_PROMPT}\n\n--- LİNKEDIN PROFİL ---\n${text}`,
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

// ─── Job Posting Parse ───

const jobPostingParseResultSchema = z.object({
  title: z.string().nullable().default(null),
  department: z.string().nullable().default(null),
  minExperienceYears: z.number().nullable().default(null),
  salaryMin: z.number().nullable().default(null),
  salaryMax: z.number().nullable().default(null),
  salaryCurrency: z.string().nullable().default(null),
  workModel: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  country: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  requirements: z.string().nullable().default(null),
  requiredSkills: z.string().nullable().default(null),
  sectorPreference: z.string().nullable().default(null),
  educationRequirement: z.string().nullable().default(null),
  languageRequirement: z.string().nullable().default(null),
});

export type JobPostingParseResult = z.infer<typeof jobPostingParseResultSchema>;

export const JOB_POSTING_EXTRACTION_PROMPT = `Sen bir iş ilanı analiz asistanısın. Aşağıdaki iş ilanı metnini analiz ederek belirtilen JSON formatında bilgileri çıkar.

KURALLAR:
- Sadece ilanda açıkça belirtilen bilgileri çıkar
- Bulamadıkların için null döndür
- workModel: "office", "remote", "hybrid" (sadece bunlar; uzaktan/evden çalışma → "remote", hibrit → "hybrid", ofis → "office")
- salaryCurrency: "TRY", "USD", "EUR" (sadece bunlar)
- requiredSkills: virgülle ayrılmış beceri listesi (ör. "React, TypeScript, Node.js")
- description: pozisyon açıklaması ve sorumluluklar (kısa özet)
- requirements: aranan nitelikler ve gereksinimler (kısa özet)
- educationRequirement: "Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora" (sadece bunlar)
- languageRequirement: "Dil (Seviye)" formatında (ör. "İngilizce (İleri), Almanca (Orta)")
- Türkçe karakterler doğru kullanılmalı (ö, ü, ş, ç, ğ, ı, İ)
- Yanıtı SADECE JSON olarak döndür, başka bir şey ekleme

JSON FORMATI:
{
  "title": string | null,
  "department": string | null,
  "minExperienceYears": number | null,
  "salaryMin": number | null,
  "salaryMax": number | null,
  "salaryCurrency": string | null,
  "workModel": string | null,
  "city": string | null,
  "country": string | null,
  "description": string | null,
  "requirements": string | null,
  "requiredSkills": string | null,
  "sectorPreference": string | null,
  "educationRequirement": string | null,
  "languageRequirement": string | null
}`;

export function extractJobJSON(text: string): JobPostingParseResult {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      return jobPostingParseResultSchema.parse(parsed);
    } catch {
      // Fall through
    }
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return jobPostingParseResultSchema.parse(parsed);
    } catch {
      // Fall through
    }
  }
  return jobPostingParseResultSchema.parse({});
}

export async function parseJobPosting(
  text: string
): Promise<{ success: true; data: JobPostingParseResult } | { success: false; error: string }> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${JOB_POSTING_EXTRACTION_PROMPT}\n\n--- İŞ İLANI ---\n${text}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "AI yanıt vermedi" };
    }

    const data = extractJobJSON(textBlock.text);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI analiz hatası",
    };
  }
}

// ─── Match Types ───

export type MatchCategory = {
  category: string;
  score: number;
  explanation: string;
};

export type CandidateMatchResult = {
  candidateId: string;
  candidateName: string;
  currentTitle: string | null;
  currentSector: string | null;
  city: string | null;
  overallScore: number;
  categories: MatchCategory[];
};

// ─── Rule-Based Scoring ───

export function scoreExperience(
  candidateYears: number | null,
  requiredYears: number | null
): { score: number; explanation: string } {
  if (requiredYears == null) return { score: 75, explanation: "Deneyim gereksinimi belirtilmemiş" };
  if (candidateYears == null) return { score: 25, explanation: "Adayın deneyim bilgisi mevcut değil" };

  if (candidateYears >= requiredYears) {
    const bonus = Math.min((candidateYears - requiredYears) * 5, 25);
    return {
      score: Math.min(75 + bonus, 100),
      explanation: `${candidateYears} yıl deneyim (min ${requiredYears} yıl gerekli)`,
    };
  }
  const deficit = requiredYears - candidateYears;
  if (deficit <= 1) return { score: 60, explanation: `${candidateYears} yıl deneyim, ${requiredYears} yıl gerekli (1 yıl eksik)` };
  if (deficit <= 2) return { score: 40, explanation: `${candidateYears} yıl deneyim, ${requiredYears} yıl gerekli (${deficit} yıl eksik)` };
  return { score: 15, explanation: `${candidateYears} yıl deneyim, ${requiredYears} yıl gerekli (${deficit} yıl eksik)` };
}

export function scoreSalary(
  candidateExpectation: number | null,
  candidateCurrency: string | null,
  positionMin: number | null,
  positionMax: number | null,
  positionCurrency: string | null
): { score: number; explanation: string } {
  if (!positionMin && !positionMax) return { score: 75, explanation: "Maaş aralığı belirtilmemiş" };
  if (!candidateExpectation) return { score: 50, explanation: "Adayın maaş beklentisi belirtilmemiş" };

  const candCur = candidateCurrency || "TRY";
  const posCur = positionCurrency || "TRY";
  if (candCur !== posCur) return { score: 50, explanation: `Farklı para birimleri (${candCur} / ${posCur})` };

  const min = positionMin || 0;
  const max = positionMax || Infinity;

  if (candidateExpectation >= min && candidateExpectation <= max) {
    return { score: 100, explanation: `Maaş beklentisi bütçe dahilinde` };
  }
  if (candidateExpectation < min) {
    return { score: 90, explanation: `Maaş beklentisi bütçenin altında` };
  }
  // candidateExpectation > max
  const overshoot = max > 0 && max !== Infinity ? ((candidateExpectation - max) / max) * 100 : 100;
  if (overshoot <= 10) return { score: 65, explanation: `Maaş beklentisi bütçeyi %${Math.round(overshoot)} aşıyor` };
  if (overshoot <= 25) return { score: 40, explanation: `Maaş beklentisi bütçeyi %${Math.round(overshoot)} aşıyor` };
  return { score: 15, explanation: `Maaş beklentisi bütçeyi %${Math.round(overshoot)} aşıyor` };
}

export function scoreLocation(
  candidateCity: string | null,
  candidateRemote: boolean,
  candidateHybrid: boolean,
  positionCity: string | null,
  positionWorkModel: string | null
): { score: number; explanation: string } {
  if (!positionWorkModel) return { score: 75, explanation: "Çalışma modeli belirtilmemiş" };

  if (positionWorkModel === "remote") {
    if (candidateRemote) return { score: 100, explanation: "Uzaktan çalışmaya uygun" };
    return { score: 50, explanation: "Uzaktan çalışma tercihi yok" };
  }

  if (positionWorkModel === "hybrid") {
    if (candidateHybrid || candidateRemote) {
      const cityMatch = !positionCity || !candidateCity ||
        candidateCity.toLocaleLowerCase("tr-TR") === positionCity.toLocaleLowerCase("tr-TR");
      return cityMatch
        ? { score: 100, explanation: "Hibrit çalışmaya uygun, şehir eşleşiyor" }
        : { score: 70, explanation: "Hibrit çalışmaya uygun ama farklı şehir" };
    }
    return { score: 40, explanation: "Hibrit çalışma tercihi yok" };
  }

  // office
  if (!positionCity || !candidateCity) return { score: 50, explanation: "Şehir bilgisi eksik" };
  if (candidateCity.toLocaleLowerCase("tr-TR") === positionCity.toLocaleLowerCase("tr-TR")) {
    return { score: 100, explanation: `Aynı şehir (${candidateCity})` };
  }
  return { score: 20, explanation: `Farklı şehir (${candidateCity} / ${positionCity})` };
}

export function scoreEducation(
  candidateLevel: string | null,
  requiredLevel: string | null
): { score: number; explanation: string } {
  if (!requiredLevel) return { score: 75, explanation: "Eğitim gereksinimi belirtilmemiş" };
  if (!candidateLevel) return { score: 25, explanation: "Adayın eğitim bilgisi mevcut değil" };

  const HIERARCHY: Record<string, number> = {
    "Lise": 1, "Ön Lisans": 2, "Lisans": 3, "Yüksek Lisans": 4, "Doktora": 5,
  };

  // Extract base level from compound strings like "Lisans - Bilgisayar Mühendisliği"
  // Order: longest first to avoid "Lisans" matching before "Ön Lisans" or "Yüksek Lisans"
  const extractLevel = (s: string): string => {
    const levels = ["Yüksek Lisans", "Ön Lisans", "Doktora", "Lisans", "Lise"];
    for (const l of levels) {
      if (s.includes(l)) return l;
    }
    return s;
  };

  const candRank = HIERARCHY[extractLevel(candidateLevel)] ?? 0;
  const reqRank = HIERARCHY[extractLevel(requiredLevel)] ?? 0;

  if (candRank === 0 || reqRank === 0) return { score: 50, explanation: "Eğitim seviyesi karşılaştırılamadı" };
  if (candRank >= reqRank) return { score: 100, explanation: `${extractLevel(candidateLevel)} (${extractLevel(requiredLevel)} gerekli)` };
  if (candRank === reqRank - 1) return { score: 60, explanation: `${extractLevel(candidateLevel)} (${extractLevel(requiredLevel)} gerekli, 1 seviye eksik)` };
  return { score: 20, explanation: `${extractLevel(candidateLevel)} (${extractLevel(requiredLevel)} gerekli)` };
}

// ─── AI Matching Prompt ───

export const MATCH_ANALYSIS_PROMPT = `Sen bir İK uzmanı asistanısın. Aşağıda bir pozisyon ve aday listesi var.
Her aday için 3 kategoriyi 0-100 arasında puanla ve kısa Türkçe açıklama yaz.

KATEGORİLER:
1. "skills" — Adayın mevcut unvanı ve sektörü, pozisyonun gerektirdiği beceriler ile ne kadar örtüşüyor?
2. "language" — Adayın dilleri ve seviyeleri, pozisyonun dil gereksinimleri ile uyumlu mu?
3. "sector" — Adayın sektör deneyimi, pozisyonun sektör tercihi ile ne kadar uyumlu?

KURALLAR:
- Puanlama 0-100 arası olmalı
- Açıklamalar kısa ve Türkçe olmalı (max 80 karakter)
- Bilgi eksikse orta puan (50) ver ve açıkla
- Yanıtı SADECE JSON olarak döndür

JSON FORMATI:
{
  "results": [
    {
      "candidateId": "uuid",
      "skills": { "score": number, "explanation": "string" },
      "language": { "score": number, "explanation": "string" },
      "sector": { "score": number, "explanation": "string" }
    }
  ]
}`;

// ─── AI Match Result Schema ───

const aiMatchCategorySchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string(),
});

const aiMatchResultSchema = z.object({
  results: z.array(
    z.object({
      candidateId: z.string(),
      skills: aiMatchCategorySchema,
      language: aiMatchCategorySchema,
      sector: aiMatchCategorySchema,
    })
  ),
});

export type AIMatchResult = z.infer<typeof aiMatchResultSchema>;

export function extractMatchJSON(text: string): AIMatchResult | null {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      return aiMatchResultSchema.parse(parsed);
    } catch { /* fall through */ }
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return aiMatchResultSchema.parse(parsed);
    } catch { /* fall through */ }
  }
  return null;
}

// ─── AI Matching Call ───

type CandidateSummary = {
  id: string;
  name: string;
  currentTitle: string | null;
  currentSector: string | null;
  languages: { language: string; level: string }[];
};

type PositionSummary = {
  title: string;
  department: string | null;
  requiredSkills: string | null;
  languageRequirement: string | null;
  sectorPreference: string | null;
  description: string | null;
};

export async function analyzeMatchWithAI(
  position: PositionSummary,
  candidates: CandidateSummary[]
): Promise<{ success: true; data: AIMatchResult } | { success: false; error: string }> {
  if (candidates.length === 0) {
    return { success: true, data: { results: [] } };
  }

  const positionText = [
    `Pozisyon: ${position.title}`,
    position.department ? `Departman: ${position.department}` : null,
    position.requiredSkills ? `Gerekli Beceriler: ${position.requiredSkills}` : null,
    position.languageRequirement ? `Dil Gereksinimi: ${position.languageRequirement}` : null,
    position.sectorPreference ? `Sektör Tercihi: ${position.sectorPreference}` : null,
    position.description ? `Açıklama: ${position.description.slice(0, 500)}` : null,
  ].filter(Boolean).join("\n");

  const candidatesText = candidates.map((c) => {
    const langs = c.languages.length > 0
      ? c.languages.map((l) => `${l.language} (${l.level})`).join(", ")
      : "Belirtilmemiş";
    return [
      `- ID: ${c.id}`,
      `  Ad: ${c.name}`,
      `  Unvan: ${c.currentTitle || "Belirtilmemiş"}`,
      `  Sektör: ${c.currentSector || "Belirtilmemiş"}`,
      `  Diller: ${langs}`,
    ].join("\n");
  }).join("\n");

  const userMessage = `${MATCH_ANALYSIS_PROMPT}\n\n--- POZİSYON ---\n${positionText}\n\n--- ADAYLAR ---\n${candidatesText}`;

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "AI yanıt vermedi" };
    }

    const data = extractMatchJSON(textBlock.text);
    if (!data) {
      return { success: false, error: "AI yanıtı ayrıştırılamadı" };
    }
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI analiz hatası",
    };
  }
}

// ─── Score Weights & Computation ───

const SCORE_WEIGHTS: Record<string, number> = {
  experience: 0.12,
  salary: 0.12,
  location: 0.08,
  education: 0.08,
  skills: 0.25,
  language: 0.15,
  sector: 0.20,
};

export function computeOverallScore(
  categories: { category: string; score: number }[]
): number {
  let total = 0;
  let weightSum = 0;
  for (const cat of categories) {
    const weight = SCORE_WEIGHTS[cat.category] ?? 0;
    total += cat.score * weight;
    weightSum += weight;
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 0;
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
