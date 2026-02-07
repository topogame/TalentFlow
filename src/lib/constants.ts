export const PIPELINE_STAGES = [
  "pool",
  "initial_interview",
  "submitted",
  "interview",
  "positive",
  "negative",
  "on_hold",
] as const;

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  pool: "Havuzda",
  initial_interview: "İlk Görüşme",
  submitted: "Müşteriye Sunuldu",
  interview: "Mülakat",
  positive: "Olumlu",
  negative: "Olumsuz",
  on_hold: "Beklemede",
};

export const CLOSED_STAGES = ["positive", "negative"] as const;

export const USER_ROLES = ["admin", "consultant"] as const;

export const POSITION_STATUSES = ["open", "on_hold", "closed"] as const;

export const POSITION_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const WORK_MODELS = ["office", "remote", "hybrid"] as const;

export const SALARY_CURRENCIES = ["TRY", "USD", "EUR"] as const;

export const LANGUAGE_LEVELS = ["beginner", "intermediate", "advanced", "native"] as const;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const SESSION_TIMEOUT_HOURS = 8;

export const STALE_PROCESS_DAYS = 7;

export const STAGE_COLORS: Record<string, string> = {
  pool: "bg-slate-100 text-slate-700",
  initial_interview: "bg-blue-100 text-blue-700",
  submitted: "bg-indigo-100 text-indigo-700",
  interview: "bg-purple-100 text-purple-700",
  positive: "bg-emerald-100 text-emerald-700",
  negative: "bg-rose-100 text-rose-700",
  on_hold: "bg-amber-100 text-amber-700",
};

export const STAGE_BG_COLORS: Record<string, string> = {
  pool: "bg-slate-50",
  initial_interview: "bg-blue-50/50",
  submitted: "bg-indigo-50/50",
  interview: "bg-purple-50/50",
  positive: "bg-emerald-50/50",
  negative: "bg-rose-50/50",
  on_hold: "bg-amber-50/50",
};

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  face_to_face: "Yüz Yüze",
  online: "Online",
  phone: "Telefon",
};
