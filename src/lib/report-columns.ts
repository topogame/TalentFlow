import {
  PIPELINE_STAGE_LABELS,
  INTERVIEW_TYPE_LABELS,
  POSITION_STATUSES,
  POSITION_PRIORITIES,
  WORK_MODELS,
} from "./constants";

// ─── Types ───

export type ReportColumnDef = {
  key: string;
  label: string;
  dbField: string;
  width: number;
  transform?: (value: unknown) => string;
  /** Prisma relation to include */
  relation?: string;
};

export type ReportEntityType = "candidates" | "firms" | "positions" | "processes" | "interviews";

// ─── Transforms ───

const dateTransform = (v: unknown) => {
  if (!v) return "";
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR");
};

const dateTimeTransform = (v: unknown) => {
  if (!v) return "";
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? "" : d.toLocaleString("tr-TR");
};

const boolTransform = (v: unknown) => (v === true ? "Evet" : v === false ? "Hayır" : "");

const stageTransform = (v: unknown) => PIPELINE_STAGE_LABELS[v as string] || String(v || "");

const interviewTypeTransform = (v: unknown) => INTERVIEW_TYPE_LABELS[v as string] || String(v || "");

const POSITION_STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapandı",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  office: "Ofis",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

const SALARY_TYPE_LABELS: Record<string, string> = {
  net: "Net",
  gross: "Brüt",
};

const statusTransform = (v: unknown) => POSITION_STATUS_LABELS[v as string] || String(v || "");
const priorityTransform = (v: unknown) => PRIORITY_LABELS[v as string] || String(v || "");
const workModelTransform = (v: unknown) => WORK_MODEL_LABELS[v as string] || String(v || "");
const salaryTypeTransform = (v: unknown) => SALARY_TYPE_LABELS[v as string] || String(v || "");

const candidateStatusTransform = (v: unknown) =>
  v === "active" ? "Aktif" : v === "passive" ? "Pasif" : String(v || "");

const numberTransform = (v: unknown) =>
  v !== null && v !== undefined ? String(v) : "";

// ─── Column Definitions ───

export const REPORT_COLUMNS: Record<ReportEntityType, ReportColumnDef[]> = {
  candidates: [
    { key: "firstName", label: "Ad", dbField: "firstName", width: 15 },
    { key: "lastName", label: "Soyad", dbField: "lastName", width: 15 },
    { key: "email", label: "E-posta", dbField: "email", width: 25 },
    { key: "phone", label: "Telefon", dbField: "phone", width: 18 },
    { key: "linkedinUrl", label: "LinkedIn URL", dbField: "linkedinUrl", width: 30 },
    { key: "educationLevel", label: "Eğitim Seviyesi", dbField: "educationLevel", width: 18 },
    { key: "universityName", label: "Üniversite", dbField: "universityName", width: 25 },
    { key: "universityDepartment", label: "Bölüm", dbField: "universityDepartment", width: 25 },
    { key: "totalExperienceYears", label: "Deneyim (Yıl)", dbField: "totalExperienceYears", width: 15, transform: numberTransform },
    { key: "currentSector", label: "Sektör", dbField: "currentSector", width: 20 },
    { key: "currentTitle", label: "Mevcut Pozisyon", dbField: "currentTitle", width: 25 },
    { key: "salaryExpectation", label: "Maaş Beklentisi", dbField: "salaryExpectation", width: 18, transform: numberTransform },
    { key: "salaryCurrency", label: "Para Birimi", dbField: "salaryCurrency", width: 12 },
    { key: "salaryType", label: "Maaş Tipi", dbField: "salaryType", width: 12, transform: salaryTypeTransform },
    { key: "country", label: "Ülke", dbField: "country", width: 15 },
    { key: "city", label: "Şehir", dbField: "city", width: 15 },
    { key: "isRemoteEligible", label: "Uzaktan Çalışma", dbField: "isRemoteEligible", width: 15, transform: boolTransform },
    { key: "isHybridEligible", label: "Hibrit Çalışma", dbField: "isHybridEligible", width: 15, transform: boolTransform },
    { key: "status", label: "Durum", dbField: "status", width: 12, transform: candidateStatusTransform },
    { key: "createdAt", label: "Kayıt Tarihi", dbField: "createdAt", width: 15, transform: dateTransform },
  ],

  firms: [
    { key: "name", label: "Firma Adı", dbField: "name", width: 25 },
    { key: "sector", label: "Sektör", dbField: "sector", width: 20 },
    { key: "companySize", label: "Şirket Büyüklüğü", dbField: "companySize", width: 18 },
    { key: "city", label: "Şehir", dbField: "city", width: 15 },
    { key: "country", label: "Ülke", dbField: "country", width: 15 },
    { key: "website", label: "Website", dbField: "website", width: 30 },
    { key: "status", label: "Durum", dbField: "status", width: 12, transform: (v) => v === "active" ? "Aktif" : v === "passive" ? "Pasif" : String(v || "") },
    { key: "notes", label: "Notlar", dbField: "notes", width: 40 },
    { key: "positionCount", label: "Açık Pozisyon", dbField: "_count.positions", width: 15, relation: "_count", transform: numberTransform },
    { key: "processCount", label: "Toplam Süreç", dbField: "_count.processes", width: 15, relation: "_count", transform: numberTransform },
    { key: "createdAt", label: "Kayıt Tarihi", dbField: "createdAt", width: 15, transform: dateTransform },
  ],

  positions: [
    { key: "title", label: "Pozisyon Başlığı", dbField: "title", width: 25 },
    { key: "firmName", label: "Firma", dbField: "firm.name", width: 25, relation: "firm" },
    { key: "department", label: "Departman", dbField: "department", width: 20 },
    { key: "status", label: "Durum", dbField: "status", width: 12, transform: statusTransform },
    { key: "priority", label: "Öncelik", dbField: "priority", width: 12, transform: priorityTransform },
    { key: "workModel", label: "Çalışma Modeli", dbField: "workModel", width: 15, transform: workModelTransform },
    { key: "city", label: "Şehir", dbField: "city", width: 15 },
    { key: "country", label: "Ülke", dbField: "country", width: 15 },
    { key: "minExperienceYears", label: "Min Deneyim (Yıl)", dbField: "minExperienceYears", width: 18, transform: numberTransform },
    { key: "salaryMin", label: "Min Maaş", dbField: "salaryMin", width: 15, transform: numberTransform },
    { key: "salaryMax", label: "Max Maaş", dbField: "salaryMax", width: 15, transform: numberTransform },
    { key: "salaryCurrency", label: "Para Birimi", dbField: "salaryCurrency", width: 12 },
    { key: "processCount", label: "Süreç Sayısı", dbField: "_count.processes", width: 15, relation: "_count", transform: numberTransform },
    { key: "createdAt", label: "Oluşturulma Tarihi", dbField: "createdAt", width: 18, transform: dateTransform },
  ],

  processes: [
    { key: "candidateName", label: "Aday", dbField: "candidate.firstName", width: 25, relation: "candidate" },
    { key: "firmName", label: "Firma", dbField: "firm.name", width: 25, relation: "firm" },
    { key: "positionTitle", label: "Pozisyon", dbField: "position.title", width: 25, relation: "position" },
    { key: "stage", label: "Aşama", dbField: "stage", width: 18, transform: stageTransform },
    { key: "fitnessScore", label: "Uyum Puanı", dbField: "fitnessScore", width: 12, transform: numberTransform },
    { key: "assignedToName", label: "Sorumlu", dbField: "assignedTo.firstName", width: 20, relation: "assignedTo" },
    { key: "stageChangedAt", label: "Aşama Değişim Tarihi", dbField: "stageChangedAt", width: 20, transform: dateTransform },
    { key: "closedAt", label: "Kapanış Tarihi", dbField: "closedAt", width: 18, transform: dateTransform },
    { key: "createdAt", label: "Oluşturulma Tarihi", dbField: "createdAt", width: 18, transform: dateTransform },
  ],

  interviews: [
    { key: "scheduledAt", label: "Tarih/Saat", dbField: "scheduledAt", width: 20, transform: dateTimeTransform },
    { key: "type", label: "Mülakat Türü", dbField: "type", width: 15, transform: interviewTypeTransform },
    { key: "durationMinutes", label: "Süre (dk)", dbField: "durationMinutes", width: 12, transform: numberTransform },
    { key: "candidateName", label: "Aday", dbField: "process.candidate.firstName", width: 25, relation: "process" },
    { key: "firmName", label: "Firma", dbField: "process.firm.name", width: 25, relation: "process" },
    { key: "positionTitle", label: "Pozisyon", dbField: "process.position.title", width: 25, relation: "process" },
    { key: "location", label: "Konum", dbField: "location", width: 25 },
    { key: "meetingLink", label: "Toplantı Linki", dbField: "meetingLink", width: 30 },
    { key: "clientParticipants", label: "Katılımcılar", dbField: "clientParticipants", width: 25 },
    { key: "isCompleted", label: "Tamamlandı", dbField: "isCompleted", width: 12, transform: boolTransform },
    { key: "notes", label: "Notlar", dbField: "notes", width: 40 },
    { key: "resultNotes", label: "Sonuç Notu", dbField: "resultNotes", width: 40 },
  ],
};

// ─── Filter Definitions ───

export type FilterOption = {
  key: string;
  label: string;
  type: "select" | "text";
  options?: { value: string; label: string }[];
};

export const REPORT_FILTERS: Record<ReportEntityType, FilterOption[]> = {
  candidates: [
    {
      key: "status",
      label: "Durum",
      type: "select",
      options: [
        { value: "active", label: "Aktif" },
        { value: "passive", label: "Pasif" },
      ],
    },
    { key: "city", label: "Şehir", type: "text" },
    { key: "currentSector", label: "Sektör", type: "text" },
  ],

  firms: [
    {
      key: "status",
      label: "Durum",
      type: "select",
      options: [
        { value: "active", label: "Aktif" },
        { value: "passive", label: "Pasif" },
      ],
    },
    { key: "city", label: "Şehir", type: "text" },
    { key: "sector", label: "Sektör", type: "text" },
  ],

  positions: [
    {
      key: "status",
      label: "Durum",
      type: "select",
      options: POSITION_STATUSES.map((s) => ({ value: s, label: POSITION_STATUS_LABELS[s] || s })),
    },
    {
      key: "priority",
      label: "Öncelik",
      type: "select",
      options: POSITION_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] || p })),
    },
    {
      key: "workModel",
      label: "Çalışma Modeli",
      type: "select",
      options: WORK_MODELS.map((w) => ({ value: w, label: WORK_MODEL_LABELS[w] || w })),
    },
    { key: "city", label: "Şehir", type: "text" },
  ],

  processes: [
    {
      key: "stage",
      label: "Aşama",
      type: "select",
      options: Object.entries(PIPELINE_STAGE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ],

  interviews: [
    {
      key: "type",
      label: "Mülakat Türü",
      type: "select",
      options: Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "isCompleted",
      label: "Tamamlanma Durumu",
      type: "select",
      options: [
        { value: "true", label: "Tamamlandı" },
        { value: "false", label: "Tamamlanmadı" },
      ],
    },
  ],
};

// ─── Helpers ───

export function getColumnsForEntity(entityType: ReportEntityType): ReportColumnDef[] {
  return REPORT_COLUMNS[entityType] || [];
}

export function getFiltersForEntity(entityType: ReportEntityType): FilterOption[] {
  return REPORT_FILTERS[entityType] || [];
}

/** Extract a nested value from a record using dot notation (e.g., "firm.name") */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Build a row for the Excel export from a DB record and selected columns */
export function buildReportRow(
  record: Record<string, unknown>,
  columns: ReportColumnDef[],
  entityType: ReportEntityType
): Record<string, string> {
  const row: Record<string, string> = {};

  for (const col of columns) {
    let value: unknown;

    // Special computed columns
    if (entityType === "processes" && col.key === "candidateName") {
      const c = record.candidate as Record<string, unknown> | undefined;
      value = c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : "";
    } else if (entityType === "processes" && col.key === "assignedToName") {
      const u = record.assignedTo as Record<string, unknown> | undefined;
      value = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
    } else if (entityType === "interviews" && col.key === "candidateName") {
      const p = record.process as Record<string, unknown> | undefined;
      const c = p?.candidate as Record<string, unknown> | undefined;
      value = c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : "";
    } else if (entityType === "interviews" && col.key === "firmName") {
      const p = record.process as Record<string, unknown> | undefined;
      const f = p?.firm as Record<string, unknown> | undefined;
      value = f?.name || "";
    } else if (entityType === "interviews" && col.key === "positionTitle") {
      const p = record.process as Record<string, unknown> | undefined;
      const pos = p?.position as Record<string, unknown> | undefined;
      value = pos?.title || "";
    } else if (entityType === "positions" && col.key === "firmName") {
      const f = record.firm as Record<string, unknown> | undefined;
      value = f?.name || "";
    } else if (entityType === "firms" && col.key === "positionCount") {
      const cnt = record._count as Record<string, number> | undefined;
      value = cnt?.positions ?? 0;
    } else if (entityType === "firms" && col.key === "processCount") {
      const cnt = record._count as Record<string, number> | undefined;
      value = cnt?.processes ?? 0;
    } else if (entityType === "positions" && col.key === "processCount") {
      const cnt = record._count as Record<string, number> | undefined;
      value = cnt?.processes ?? 0;
    } else {
      // Direct field or nested field
      value = getNestedValue(record, col.dbField);
    }

    // Apply transform
    if (col.transform) {
      row[col.key] = col.transform(value);
    } else {
      row[col.key] = value !== null && value !== undefined ? String(value) : "";
    }
  }

  return row;
}
