import { LANGUAGE_LEVELS } from "./constants";

// ─── Types ───

export type ImportRowStatus = "valid" | "warning" | "error";

export type ImportRowResult = {
  rowNumber: number;
  status: ImportRowStatus;
  data: Record<string, unknown> | null;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  duplicates: {
    candidateId: string;
    name: string;
    matchType: string;
    confidence: string;
  }[];
};

// ─── Header Mapping ───

const HEADER_TO_FIELD: Record<string, string> = {
  "Ad": "firstName",
  "Soyad": "lastName",
  "E-posta": "email",
  "Telefon": "phone",
  "LinkedIn URL": "linkedinUrl",
  "Eğitim Seviyesi": "educationLevel",
  "Üniversite": "universityName",
  "Bölüm": "universityDepartment",
  "Toplam Deneyim (Yıl)": "totalExperienceYears",
  "Sektör": "currentSector",
  "Mevcut Pozisyon": "currentTitle",
  "Maaş Beklentisi": "salaryExpectation",
  "Para Birimi": "salaryCurrency",
  "Maaş Tipi": "salaryType",
  "Ülke": "country",
  "Şehir": "city",
  "Uzaktan Çalışma": "isRemoteEligible",
  "Hibrit Çalışma": "isHybridEligible",
  "Diller": "languages",
};

export const EXPECTED_HEADERS = Object.keys(HEADER_TO_FIELD);

export function mapExcelRowToCandidate(
  row: Record<string, unknown>
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const [header, value] of Object.entries(row)) {
    const cleanHeader = header.replace(/\s*\*\s*$/, "").trim();
    const fieldName = HEADER_TO_FIELD[cleanHeader];
    if (fieldName) {
      mapped[fieldName] = value;
    }
  }

  return mapped;
}

// ─── Language Parsing ───

const VALID_LEVELS = new Set<string>(LANGUAGE_LEVELS);

export function parseLanguagesString(
  languagesStr: string
): { language: string; level: string }[] {
  if (!languagesStr || languagesStr.trim() === "") return [];

  const results: { language: string; level: string }[] = [];
  const parts = languagesStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.lastIndexOf(":");
    if (colonIdx === -1) {
      // No level specified, default to intermediate
      results.push({ language: trimmed, level: "intermediate" });
      continue;
    }

    const language = trimmed.substring(0, colonIdx).trim();
    const level = trimmed.substring(colonIdx + 1).trim().toLowerCase();

    if (!language) continue;

    results.push({
      language,
      level: VALID_LEVELS.has(level) ? level : "intermediate",
    });
  }

  return results;
}

// ─── Data Cleaning ───

export function cleanCandidateData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "languages") {
      // Handle languages string -> parsed array
      if (typeof value === "string") {
        const parsed = parseLanguagesString(value);
        cleaned.languages = parsed.length > 0 ? parsed : undefined;
      } else {
        cleaned[key] = value;
      }
      continue;
    }

    // Boolean fields
    if (key === "isRemoteEligible" || key === "isHybridEligible") {
      if (typeof value === "boolean") {
        cleaned[key] = value;
      } else if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "evet" || lower === "true") cleaned[key] = true;
        else if (lower === "hayır" || lower === "hayir" || lower === "false") cleaned[key] = false;
        else cleaned[key] = undefined;
      } else {
        cleaned[key] = undefined;
      }
      continue;
    }

    // Numeric fields
    if (key === "totalExperienceYears" || key === "salaryExpectation") {
      if (typeof value === "number") {
        cleaned[key] = value;
      } else if (typeof value === "string" && value.trim() !== "") {
        const num = Number(value);
        cleaned[key] = isNaN(num) ? undefined : num;
      } else {
        cleaned[key] = undefined;
      }
      continue;
    }

    // String fields: empty string -> undefined (will become null in DB)
    if (typeof value === "string") {
      cleaned[key] = value.trim() === "" ? undefined : value.trim();
    } else if (value === undefined || value === null) {
      cleaned[key] = undefined;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
