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
