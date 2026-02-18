import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createCandidateSchema,
  updateCandidateSchema,
  candidateListSchema,
  duplicateCheckSchema,
  noteSchema,
  createFirmSchema,
  updateFirmSchema,
  createPositionSchema,
  updatePositionSchema,
  paginationSchema,
  processListSchema,
  createProcessSchema,
  updateProcessSchema,
  stageChangeSchema,
  createInterviewSchema,
  updateInterviewSchema,
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  emailTemplateListSchema,
  sendEmailSchema,
  emailLogListSchema,
  calendarQuerySchema,
  auditLogListSchema,
  exportQuerySchema,
  reportsQuerySchema,
  importCandidateRowSchema,
  customReportSchema,
} from "./validations";

// ─── Login Schema ───
describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── Create User Schema ───
describe("createUserSchema", () => {
  const validUser = {
    email: "user@example.com",
    password: "Password1",
    firstName: "John",
    lastName: "Doe",
    role: "admin" as const,
  };

  it("accepts valid user data", () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("rejects weak password (no uppercase)", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no lowercase)", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "PASSWORD1" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no digit)", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "Password" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "Pa1" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = createUserSchema.safeParse({ ...validUser, role: "superadmin" });
    expect(result.success).toBe(false);
  });

  it("rejects empty firstName", () => {
    const result = createUserSchema.safeParse({ ...validUser, firstName: "" });
    expect(result.success).toBe(false);
  });
});

// ─── Update User Schema ───
describe("updateUserSchema", () => {
  it("accepts partial updates", () => {
    const result = updateUserSchema.safeParse({ firstName: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates password when provided", () => {
    const result = updateUserSchema.safeParse({ password: "weak" });
    expect(result.success).toBe(false);
  });

  it("accepts isActive boolean", () => {
    const result = updateUserSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });
});

// ─── Create Candidate Schema ───
describe("createCandidateSchema", () => {
  it("accepts minimal valid candidate", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full candidate with languages", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet@test.com",
      phone: "+90 555 123 4567",
      totalExperienceYears: 5,
      city: "İstanbul",
      languages: [{ language: "İngilizce", level: "advanced" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid language level", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      languages: [{ language: "İngilizce", level: "fluent" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for optional fields", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("coerces totalExperienceYears string to number", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      totalExperienceYears: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalExperienceYears).toBe(5);
    }
  });

  it("rejects negative experience years", () => {
    const result = createCandidateSchema.safeParse({
      firstName: "Ahmet",
      lastName: "Yılmaz",
      totalExperienceYears: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ─── Update Candidate Schema ───
describe("updateCandidateSchema", () => {
  it("accepts partial update", () => {
    const result = updateCandidateSchema.safeParse({ city: "Ankara" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateCandidateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── Candidate List Schema ───
describe("candidateListSchema", () => {
  it("provides defaults for empty query", () => {
    const result = candidateListSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.status).toBe("active");
      expect(result.data.order).toBe("desc");
    }
  });

  it("coerces string page/limit to number", () => {
    const result = candidateListSchema.safeParse({ page: "3", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = candidateListSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = candidateListSchema.safeParse({ status: "deleted" });
    expect(result.success).toBe(false);
  });
});

// ─── Duplicate Check Schema ───
describe("duplicateCheckSchema", () => {
  it("accepts linkedin URL", () => {
    const result = duplicateCheckSchema.safeParse({ linkedinUrl: "https://linkedin.com/in/test" });
    expect(result.success).toBe(true);
  });

  it("accepts name combo", () => {
    const result = duplicateCheckSchema.safeParse({ firstName: "Ahmet", lastName: "Yılmaz" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = duplicateCheckSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── Note Schema ───
describe("noteSchema", () => {
  it("accepts valid note", () => {
    const result = noteSchema.safeParse({ content: "This is a note" });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = noteSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects content over 5000 chars", () => {
    const result = noteSchema.safeParse({ content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });
});

// ─── Create Firm Schema ───
describe("createFirmSchema", () => {
  it("accepts minimal valid firm", () => {
    const result = createFirmSchema.safeParse({ name: "TechCorp" });
    expect(result.success).toBe(true);
  });

  it("accepts full firm data", () => {
    const result = createFirmSchema.safeParse({
      name: "TechCorp",
      sector: "Bilişim",
      companySize: "51-200",
      city: "İstanbul",
      country: "Türkiye",
      website: "https://techcorp.com",
      notes: "İyi bir firma",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFirmSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = createFirmSchema.safeParse({ name: "Test", website: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for website", () => {
    const result = createFirmSchema.safeParse({ name: "Test", website: "" });
    expect(result.success).toBe(true);
  });
});

// ─── Update Firm Schema ───
describe("updateFirmSchema", () => {
  it("accepts partial update", () => {
    const result = updateFirmSchema.safeParse({ sector: "Finans" });
    expect(result.success).toBe(true);
  });
});

// ─── Create Position Schema ───
describe("createPositionSchema", () => {
  it("accepts valid position", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Senior Developer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID firmId", () => {
    const result = createPositionSchema.safeParse({
      firmId: "not-a-uuid",
      title: "Developer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates work model enum", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Developer",
      workModel: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid work model", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Developer",
      workModel: "remote",
    });
    expect(result.success).toBe(true);
  });

  it("validates priority enum", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Developer",
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });

  it("defaults priority to normal", () => {
    const result = createPositionSchema.safeParse({
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Developer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("normal");
    }
  });
});

// ─── Pagination Schema ───
describe("paginationSchema", () => {
  it("provides defaults for empty query", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("coerces strings to numbers", () => {
    const result = paginationSchema.safeParse({ page: "2", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative page", () => {
    const result = paginationSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = paginationSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

// ─── Process List Schema ───
describe("processListSchema", () => {
  it("provides defaults for empty query", () => {
    const result = processListSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.view).toBe("list");
    }
  });

  it("accepts valid filters", () => {
    const result = processListSchema.safeParse({
      candidateId: "550e8400-e29b-41d4-a716-446655440000",
      firmId: "550e8400-e29b-41d4-a716-446655440000",
      stage: "pool",
      view: "kanban",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for candidateId", () => {
    const result = processListSchema.safeParse({ candidateId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for firmId", () => {
    const result = processListSchema.safeParse({ firmId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for positionId", () => {
    const result = processListSchema.safeParse({ positionId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stage", () => {
    const result = processListSchema.safeParse({ stage: "hired" });
    expect(result.success).toBe(false);
  });

  it("accepts kanban view", () => {
    const result = processListSchema.safeParse({ view: "kanban" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.view).toBe("kanban");
  });

  it("rejects invalid view", () => {
    const result = processListSchema.safeParse({ view: "grid" });
    expect(result.success).toBe(false);
  });
});

// ─── Create Process Schema ───
describe("createProcessSchema", () => {
  const validProcess = {
    candidateId: "550e8400-e29b-41d4-a716-446655440000",
    firmId: "550e8400-e29b-41d4-a716-446655440001",
    positionId: "550e8400-e29b-41d4-a716-446655440002",
  };

  it("accepts minimal valid data", () => {
    const result = createProcessSchema.safeParse(validProcess);
    expect(result.success).toBe(true);
  });

  it("defaults stage to pool", () => {
    const result = createProcessSchema.safeParse(validProcess);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.stage).toBe("pool");
  });

  it("accepts fitnessScore 1-5", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, fitnessScore: 3 });
    expect(result.success).toBe(true);
  });

  it("rejects fitnessScore 0", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, fitnessScore: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects fitnessScore 6", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, fitnessScore: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid candidateId", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, candidateId: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stage", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, stage: "placed" });
    expect(result.success).toBe(false);
  });

  it("coerces fitnessScore string to number", () => {
    const result = createProcessSchema.safeParse({ ...validProcess, fitnessScore: "4" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.fitnessScore).toBe(4);
  });
});

// ─── Update Process Schema ───
describe("updateProcessSchema", () => {
  it("accepts partial update", () => {
    const result = updateProcessSchema.safeParse({ fitnessScore: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateProcessSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates assignedToId as UUID", () => {
    const result = updateProcessSchema.safeParse({ assignedToId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects fitnessScore out of range", () => {
    const result = updateProcessSchema.safeParse({ fitnessScore: 10 });
    expect(result.success).toBe(false);
  });
});

// ─── Stage Change Schema ───
describe("stageChangeSchema", () => {
  it("accepts valid stage", () => {
    const result = stageChangeSchema.safeParse({ stage: "submitted" });
    expect(result.success).toBe(true);
  });

  it("accepts stage with note", () => {
    const result = stageChangeSchema.safeParse({ stage: "positive", note: "İyi bir aday" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid stage", () => {
    const result = stageChangeSchema.safeParse({ stage: "hired" });
    expect(result.success).toBe(false);
  });

  it("rejects missing stage", () => {
    const result = stageChangeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects note over 5000 chars", () => {
    const result = stageChangeSchema.safeParse({ stage: "pool", note: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });
});

// ─── Create Interview Schema ───
describe("createInterviewSchema", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const validInterview = {
    scheduledAt: tomorrow.toISOString(),
    type: "face_to_face" as const,
  };

  it("accepts valid face-to-face interview", () => {
    const result = createInterviewSchema.safeParse(validInterview);
    expect(result.success).toBe(true);
  });

  it("defaults durationMinutes to 60", () => {
    const result = createInterviewSchema.safeParse(validInterview);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.durationMinutes).toBe(60);
  });

  it("rejects past date", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = createInterviewSchema.safeParse({ ...validInterview, scheduledAt: yesterday.toISOString() });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createInterviewSchema.safeParse({ ...validInterview, type: "client" });
    expect(result.success).toBe(false);
  });

  it("requires meetingLink for online type", () => {
    const result = createInterviewSchema.safeParse({ ...validInterview, type: "online" });
    expect(result.success).toBe(false);
  });

  it("accepts online with meetingLink", () => {
    const result = createInterviewSchema.safeParse({
      ...validInterview,
      type: "online",
      meetingLink: "https://meet.google.com/abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects duration below 15", () => {
    const result = createInterviewSchema.safeParse({ ...validInterview, durationMinutes: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects duration above 480", () => {
    const result = createInterviewSchema.safeParse({ ...validInterview, durationMinutes: 500 });
    expect(result.success).toBe(false);
  });
});

// ─── Update Interview Schema ───
describe("updateInterviewSchema", () => {
  it("accepts partial update", () => {
    const result = updateInterviewSchema.safeParse({ notes: "Updated notes" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateInterviewSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts isCompleted boolean", () => {
    const result = updateInterviewSchema.safeParse({ isCompleted: true, resultNotes: "Başarılı" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid meetingLink", () => {
    const result = updateInterviewSchema.safeParse({ meetingLink: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

// ─── Create Email Template Schema ───
describe("createEmailTemplateSchema", () => {
  const validTemplate = {
    name: "Mülakat Daveti",
    subject: "{candidateName} için mülakat daveti",
    body: "Sayın {candidateName}, {firmName} firmasında {position} pozisyonu için mülakata davetlisiniz.",
  };

  it("accepts valid template", () => {
    const result = createEmailTemplateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });

  it("defaults isActive to true", () => {
    const result = createEmailTemplateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(true);
  });

  it("accepts category", () => {
    const result = createEmailTemplateSchema.safeParse({ ...validTemplate, category: "mulakat_daveti" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createEmailTemplateSchema.safeParse({ ...validTemplate, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty subject", () => {
    const result = createEmailTemplateSchema.safeParse({ ...validTemplate, subject: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty body", () => {
    const result = createEmailTemplateSchema.safeParse({ ...validTemplate, body: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = createEmailTemplateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── Update Email Template Schema ───
describe("updateEmailTemplateSchema", () => {
  it("accepts partial update", () => {
    const result = updateEmailTemplateSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateEmailTemplateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts isActive false", () => {
    const result = updateEmailTemplateSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });
});

// ─── Email Template List Schema ───
describe("emailTemplateListSchema", () => {
  it("provides defaults for empty query", () => {
    const result = emailTemplateListSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts search filter", () => {
    const result = emailTemplateListSchema.safeParse({ search: "mülakat" });
    expect(result.success).toBe(true);
  });

  it("accepts category filter", () => {
    const result = emailTemplateListSchema.safeParse({ category: "mulakat_daveti" });
    expect(result.success).toBe(true);
  });

  it("accepts isActive filter", () => {
    const result = emailTemplateListSchema.safeParse({ isActive: "true" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(true);
  });
});

// ─── Send Email Schema ───
describe("sendEmailSchema", () => {
  const validEmail = {
    candidateId: "550e8400-e29b-41d4-a716-446655440000",
    toEmail: "candidate@example.com",
    subject: "Mülakat Daveti",
    body: "Merhaba, mülakata davetlisiniz.",
  };

  it("accepts valid email data", () => {
    const result = sendEmailSchema.safeParse(validEmail);
    expect(result.success).toBe(true);
  });

  it("accepts with processId", () => {
    const result = sendEmailSchema.safeParse({
      ...validEmail,
      processId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with templateId", () => {
    const result = sendEmailSchema.safeParse({
      ...validEmail,
      templateId: "550e8400-e29b-41d4-a716-446655440002",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid candidateId", () => {
    const result = sendEmailSchema.safeParse({ ...validEmail, candidateId: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid toEmail", () => {
    const result = sendEmailSchema.safeParse({ ...validEmail, toEmail: "not-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty subject", () => {
    const result = sendEmailSchema.safeParse({ ...validEmail, subject: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty body", () => {
    const result = sendEmailSchema.safeParse({ ...validEmail, body: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid processId", () => {
    const result = sendEmailSchema.safeParse({ ...validEmail, processId: "not-uuid" });
    expect(result.success).toBe(false);
  });
});

// ─── Email Log List Schema ───
describe("emailLogListSchema", () => {
  it("provides defaults for empty query", () => {
    const result = emailLogListSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = emailLogListSchema.safeParse({
      candidateId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts status filter sent", () => {
    const result = emailLogListSchema.safeParse({ status: "sent" });
    expect(result.success).toBe(true);
  });

  it("accepts status filter failed", () => {
    const result = emailLogListSchema.safeParse({ status: "failed" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = emailLogListSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid candidateId", () => {
    const result = emailLogListSchema.safeParse({ candidateId: "bad" });
    expect(result.success).toBe(false);
  });
});

// ─── Calendar Query Schema ───
describe("calendarQuerySchema", () => {
  it("accepts valid date range", () => {
    const result = calendarQuerySchema.safeParse({
      start: "2025-01-01T00:00:00Z",
      end: "2025-01-31T23:59:59Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.start).toBeInstanceOf(Date);
      expect(result.data.end).toBeInstanceOf(Date);
    }
  });

  it("coerces date strings to Date objects", () => {
    const result = calendarQuerySchema.safeParse({
      start: "2025-06-01",
      end: "2025-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing start", () => {
    const result = calendarQuerySchema.safeParse({ end: "2025-01-31" });
    expect(result.success).toBe(false);
  });

  it("rejects missing end", () => {
    const result = calendarQuerySchema.safeParse({ start: "2025-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = calendarQuerySchema.safeParse({ start: "not-a-date", end: "2025-01-31" });
    expect(result.success).toBe(false);
  });
});

// ─── Audit Log List Schema ───
describe("auditLogListSchema", () => {
  it("provides defaults for empty query", () => {
    const result = auditLogListSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("coerces string page/limit to number", () => {
    const result = auditLogListSchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts valid entityType filter", () => {
    const result = auditLogListSchema.safeParse({ entityType: "Candidate" });
    expect(result.success).toBe(true);
  });

  it("accepts valid UUID entityId", () => {
    const result = auditLogListSchema.safeParse({ entityId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for entityId", () => {
    const result = auditLogListSchema.safeParse({ entityId: "not-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for userId", () => {
    const result = auditLogListSchema.safeParse({ userId: "bad" });
    expect(result.success).toBe(false);
  });

  it("accepts action filter", () => {
    const result = auditLogListSchema.safeParse({ action: "create" });
    expect(result.success).toBe(true);
  });

  it("coerces dateFrom and dateTo strings to dates", () => {
    const result = auditLogListSchema.safeParse({
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });
});

// ─── Export Query Schema ───
describe("exportQuerySchema", () => {
  it("provides default format xlsx for empty query", () => {
    const result = exportQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.format).toBe("xlsx");
    }
  });

  it("accepts valid date range", () => {
    const result = exportQuerySchema.safeParse({
      dateFrom: "2025-01-01",
      dateTo: "2025-06-30",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it("accepts xlsx format", () => {
    const result = exportQuerySchema.safeParse({ format: "xlsx" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid format", () => {
    const result = exportQuerySchema.safeParse({ format: "csv" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date string", () => {
    const result = exportQuerySchema.safeParse({ dateFrom: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

// ─── Reports Query Schema ───
describe("reportsQuerySchema", () => {
  it("provides default period month for empty query", () => {
    const result = reportsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe("month");
    }
  });

  it("accepts valid period values", () => {
    for (const period of ["week", "month", "quarter", "year"]) {
      const result = reportsQuerySchema.safeParse({ period });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid period", () => {
    const result = reportsQuerySchema.safeParse({ period: "day" });
    expect(result.success).toBe(false);
  });

  it("accepts date range", () => {
    const result = reportsQuerySchema.safeParse({
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it("rejects invalid date", () => {
    const result = reportsQuerySchema.safeParse({ dateFrom: "xyz" });
    expect(result.success).toBe(false);
  });
});

// ─── Import Candidate Row Schema ───

describe("importCandidateRowSchema", () => {
  it("accepts valid minimal row (firstName + lastName)", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ayşe",
      lastName: "Yılmaz",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing firstName", () => {
    const result = importCandidateRowSchema.safeParse({
      lastName: "Yılmaz",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing lastName", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ayşe",
    });
    expect(result.success).toBe(false);
  });

  it("accepts full candidate data", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ayşe",
      lastName: "Yılmaz",
      email: "ayse@test.com",
      phone: "+90 555 1234567",
      linkedinUrl: "https://linkedin.com/in/ayseyilmaz",
      educationLevel: "Lisans",
      universityName: "İTÜ",
      universityDepartment: "Bilgisayar Mühendisliği",
      totalExperienceYears: 5,
      currentSector: "Teknoloji",
      currentTitle: "Yazılım Mühendisi",
      salaryExpectation: 45000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: true,
      isHybridEligible: false,
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "Almanca", level: "intermediate" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for optional email", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined for optional email", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      email: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid salaryCurrency", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      salaryCurrency: "GBP",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid languages array", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      languages: [{ language: "İngilizce", level: "native" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid language level", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      languages: [{ language: "İngilizce", level: "expert" }],
    });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers for experience years", () => {
    const result = importCandidateRowSchema.safeParse({
      firstName: "Ali",
      lastName: "Kaya",
      totalExperienceYears: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalExperienceYears).toBe(5);
    }
  });
});

// ─── Custom Report Schema ───

describe("customReportSchema", () => {
  it("accepts valid custom report request", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: ["firstName", "lastName", "email"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all entity types", () => {
    const types = ["candidates", "firms", "positions", "processes", "interviews"];
    for (const entityType of types) {
      const result = customReportSchema.safeParse({
        entityType,
        columns: ["col1"],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid entity type", () => {
    const result = customReportSchema.safeParse({
      entityType: "users",
      columns: ["col1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty columns", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts filters", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: ["firstName"],
      filters: { status: "active", city: "İstanbul" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filters).toEqual({ status: "active", city: "İstanbul" });
    }
  });

  it("accepts sort", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: ["firstName"],
      sort: { field: "createdAt", order: "desc" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sort order", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: ["firstName"],
      sort: { field: "createdAt", order: "random" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts date range", () => {
    const result = customReportSchema.safeParse({
      entityType: "firms",
      columns: ["name"],
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it("defaults filters to empty object", () => {
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns: ["firstName"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filters).toEqual({});
    }
  });

  it("rejects more than 30 columns", () => {
    const columns = Array.from({ length: 31 }, (_, i) => `col${i}`);
    const result = customReportSchema.safeParse({
      entityType: "candidates",
      columns,
    });
    expect(result.success).toBe(false);
  });
});
