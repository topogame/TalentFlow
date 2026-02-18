import { z } from "zod";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

// User
export const createUserSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
  firstName: z.string().min(1, "Ad gerekli").max(100),
  lastName: z.string().min(1, "Soyad gerekli").max(100),
  role: z.enum(["admin", "consultant"]),
});

export const updateUserSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin").optional(),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli")
    .optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(["admin", "consultant"]).optional(),
  isActive: z.boolean().optional(),
});

// Candidate
const languageSchema = z.object({
  language: z.string().min(1).max(50),
  level: z.enum(["beginner", "intermediate", "advanced", "native"]),
});

export const createCandidateSchema = z.object({
  firstName: z.string().min(1, "Ad gerekli").max(100),
  lastName: z.string().min(1, "Soyad gerekli").max(100),
  email: z.string().email("Geçerli bir e-posta girin").max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Geçerli bir URL girin").max(500).optional().or(z.literal("")),
  educationLevel: z.string().max(100).optional().or(z.literal("")),
  universityName: z.string().max(200).optional().or(z.literal("")),
  universityDepartment: z.string().max(200).optional().or(z.literal("")),
  totalExperienceYears: z.coerce.number().int().min(0).max(50).optional().nullable(),
  currentSector: z.string().max(200).optional().or(z.literal("")),
  currentTitle: z.string().max(200).optional().or(z.literal("")),
  salaryExpectation: z.coerce.number().min(0).optional().nullable(),
  salaryCurrency: z.enum(["TRY", "USD", "EUR"]).optional(),
  salaryType: z.enum(["net", "gross"]).optional().nullable(),
  country: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  isRemoteEligible: z.boolean().optional(),
  isHybridEligible: z.boolean().optional(),
  languages: z.array(languageSchema).optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const candidateListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sector: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["active", "passive"]).optional().default("active"),
  minExperience: z.coerce.number().int().min(0).optional(),
  maxExperience: z.coerce.number().int().max(50).optional(),
  sort: z.string().optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const duplicateCheckSchema = z.object({
  linkedinUrl: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Not içeriği gerekli").max(5000),
});

// Firm
export const createFirmSchema = z.object({
  name: z.string().min(1, "Firma adı gerekli").max(255),
  sector: z.string().max(200).optional().or(z.literal("")),
  companySize: z.string().max(50).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  website: z.string().url("Geçerli bir URL girin").max(500).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const updateFirmSchema = createFirmSchema.partial();

// Position
export const createPositionSchema = z.object({
  firmId: z.string().uuid("Geçerli bir firma seçin"),
  title: z.string().min(1, "Pozisyon başlığı gerekli").max(255),
  department: z.string().max(200).optional().or(z.literal("")),
  minExperienceYears: z.coerce.number().int().min(0).max(50).optional().nullable(),
  salaryMin: z.coerce.number().min(0).optional().nullable(),
  salaryMax: z.coerce.number().min(0).optional().nullable(),
  salaryCurrency: z.enum(["TRY", "USD", "EUR"]).optional(),
  workModel: z.enum(["office", "remote", "hybrid"]).optional().nullable(),
  city: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  requiredSkills: z.string().optional().or(z.literal("")),
  sectorPreference: z.string().max(200).optional().or(z.literal("")),
  educationRequirement: z.string().max(200).optional().or(z.literal("")),
  languageRequirement: z.string().max(500).optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
});

export const updatePositionSchema = createPositionSchema.partial();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

// Firm list
export const firmListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sector: z.string().optional(),
  city: z.string().optional(),
});

// Position list
export const positionListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["open", "on_hold", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  workModel: z.enum(["office", "remote", "hybrid"]).optional(),
  city: z.string().optional(),
});

// Process
export const processListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  candidateId: z.string().uuid().optional(),
  firmId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  stage: z
    .enum([
      "pool",
      "initial_interview",
      "submitted",
      "interview",
      "positive",
      "negative",
      "on_hold",
    ])
    .optional(),
  view: z.enum(["list", "kanban"]).optional().default("list"),
});

export const createProcessSchema = z.object({
  candidateId: z.string().uuid("Geçerli bir aday seçin"),
  firmId: z.string().uuid("Geçerli bir firma seçin"),
  positionId: z.string().uuid("Geçerli bir pozisyon seçin"),
  stage: z
    .enum([
      "pool",
      "initial_interview",
      "submitted",
      "interview",
      "positive",
      "negative",
      "on_hold",
    ])
    .optional()
    .default("pool"),
  fitnessScore: z.coerce
    .number()
    .int()
    .min(1, "Uyum puanı en az 1 olmalı")
    .max(5, "Uyum puanı en fazla 5 olmalı")
    .optional()
    .nullable(),
});

export const updateProcessSchema = z.object({
  fitnessScore: z.coerce.number().int().min(1).max(5).optional().nullable(),
  assignedToId: z.string().uuid("Geçerli bir kullanıcı seçin").optional(),
});

export const stageChangeSchema = z.object({
  stage: z.enum(
    [
      "pool",
      "initial_interview",
      "submitted",
      "interview",
      "positive",
      "negative",
      "on_hold",
    ],
    { message: "Geçerli bir aşama seçin" }
  ),
  note: z.string().max(5000).optional(),
});

// Interview
export const createInterviewSchema = z
  .object({
    scheduledAt: z.coerce.date().refine((d) => d > new Date(), {
      message: "Mülakat tarihi gelecekte olmalı",
    }),
    type: z.enum(["face_to_face", "online", "phone"], {
      message: "Geçerli bir mülakat tipi seçin",
    }),
    durationMinutes: z.coerce.number().int().min(15).max(480).optional().default(60),
    meetingProvider: z.enum(["zoom", "teams"]).optional().nullable(),
    meetingLink: z.string().url("Geçerli bir URL girin").max(500).optional().or(z.literal("")),
    location: z.string().max(500).optional().or(z.literal("")),
    clientParticipants: z.string().max(1000).optional().or(z.literal("")),
    notes: z.string().max(5000).optional().or(z.literal("")),
    sendInviteEmail: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (
        data.type === "online" &&
        !data.meetingProvider &&
        (!data.meetingLink || data.meetingLink === "")
      ) {
        return false;
      }
      return true;
    },
    { message: "Online mülakat için toplantı linki veya sağlayıcı seçimi gerekli", path: ["meetingLink"] }
  );

export const updateInterviewSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  type: z.enum(["face_to_face", "online", "phone"]).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  meetingProvider: z.enum(["zoom", "teams"]).optional().nullable(),
  meetingLink: z.string().url("Geçerli bir URL girin").max(500).optional().or(z.literal("")),
  location: z.string().max(500).optional().or(z.literal("")),
  clientParticipants: z.string().max(1000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  resultNotes: z.string().max(5000).optional().or(z.literal("")),
  isCompleted: z.boolean().optional(),
});

// Email Template
export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Şablon adı gerekli").max(255),
  subject: z.string().min(1, "Konu gerekli").max(500),
  body: z.string().min(1, "İçerik gerekli"),
  category: z.string().max(100).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export const emailTemplateListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// Email Sending
export const sendEmailSchema = z.object({
  candidateId: z.string().uuid("Geçerli bir aday seçin"),
  processId: z.string().uuid("Geçerli bir süreç seçin").optional(),
  templateId: z.string().uuid("Geçerli bir şablon seçin").optional(),
  toEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  subject: z.string().min(1, "Konu gerekli").max(500),
  body: z.string().min(1, "İçerik gerekli"),
});

// Email Log
export const emailLogListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  candidateId: z.string().uuid().optional(),
  processId: z.string().uuid().optional(),
  status: z.enum(["sent", "failed"]).optional(),
});

// Calendar
export const calendarQuerySchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

// Audit Log
export const auditLogListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Export
export const exportQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  format: z.enum(["xlsx"]).optional().default("xlsx"),
});

// Reports
export const reportsQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  period: z.enum(["week", "month", "quarter", "year"]).optional().default("month"),
});

// Import
export const importCandidateRowSchema = z.object({
  firstName: z.string().min(1, "Ad gerekli").max(100),
  lastName: z.string().min(1, "Soyad gerekli").max(100),
  email: z.string().email("Geçerli bir e-posta girin").max(255).optional().or(z.literal("")).or(z.literal(undefined)),
  phone: z.string().max(30).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Geçerli bir URL girin").max(500).optional().or(z.literal("")).or(z.literal(undefined)),
  educationLevel: z.string().max(100).optional().or(z.literal("")),
  universityName: z.string().max(200).optional().or(z.literal("")),
  universityDepartment: z.string().max(200).optional().or(z.literal("")),
  totalExperienceYears: z.coerce.number().int().min(0).max(50).optional().nullable(),
  currentSector: z.string().max(200).optional().or(z.literal("")),
  currentTitle: z.string().max(200).optional().or(z.literal("")),
  salaryExpectation: z.coerce.number().min(0).optional().nullable(),
  salaryCurrency: z.enum(["TRY", "USD", "EUR"]).optional(),
  salaryType: z.enum(["net", "gross"]).optional().nullable(),
  country: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  isRemoteEligible: z.boolean().optional(),
  isHybridEligible: z.boolean().optional(),
  languages: z.array(z.object({
    language: z.string().min(1).max(50),
    level: z.enum(["beginner", "intermediate", "advanced", "native"]),
  })).optional(),
});

// CV Parse
export const cvParseRequestSchema = z.object({
  fileUrl: z.string().url("Geçerli bir dosya URL'si gerekli"),
  fileType: z.string().min(1, "Dosya türü gerekli"),
});

// Custom Report
export const customReportSchema = z.object({
  entityType: z.enum(["candidates", "firms", "positions", "processes", "interviews"]),
  columns: z.array(z.string().min(1)).min(1, "En az bir sütun seçin").max(30),
  filters: z.record(z.string(), z.unknown()).optional().default({}),
  sort: z.object({
    field: z.string(),
    order: z.enum(["asc", "desc"]),
  }).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
