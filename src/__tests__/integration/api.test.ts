import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let testUserId: string;
let testFirmId: string;
let testCandidateId: string;
let testPositionId: string;

// ─── Database Integration Tests ───
// These tests verify Prisma operations against the real database

describe("Database Integration", () => {
  beforeAll(async () => {
    // Create a test user
    const hash = await bcrypt.hash("TestPass1!", 4); // low rounds for speed
    const user = await prisma.user.upsert({
      where: { email: "integration-test@talentflow.local" },
      update: {},
      create: {
        email: "integration-test@talentflow.local",
        passwordHash: hash,
        firstName: "Test",
        lastName: "User",
        role: "admin",
        isActive: true,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data in correct order (respecting foreign keys)
    await prisma.auditLog.deleteMany({ where: { userId: testUserId } });
    await prisma.emailLog.deleteMany({ where: { sentById: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { createdById: testUserId } });
    await prisma.interview.deleteMany({ where: { process: { createdById: testUserId } } });
    await prisma.processNote.deleteMany({ where: { process: { createdById: testUserId } } });
    await prisma.processStageHistory.deleteMany({ where: { process: { createdById: testUserId } } });
    await prisma.process.deleteMany({ where: { createdById: testUserId } });
    await prisma.candidateNote.deleteMany({ where: { createdById: testUserId } });
    await prisma.candidateLanguage.deleteMany({ where: { candidate: { createdById: testUserId } } });
    await prisma.candidate.deleteMany({ where: { createdById: testUserId } });
    await prisma.position.deleteMany({ where: { createdById: testUserId } });
    await prisma.firm.deleteMany({ where: { createdById: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    await prisma.$disconnect();
  });

  // ─── Firm CRUD ───
  describe("Firm CRUD", () => {
    it("creates a firm", async () => {
      const firm = await prisma.firm.create({
        data: {
          name: "Test Firma A.Ş.",
          sector: "Bilişim",
          companySize: "51-200",
          city: "İstanbul",
          country: "Türkiye",
          website: "https://testfirma.com",
          createdById: testUserId,
        },
      });

      expect(firm.id).toBeDefined();
      expect(firm.name).toBe("Test Firma A.Ş.");
      expect(firm.status).toBe("active");
      testFirmId = firm.id;
    });

    it("lists firms with search", async () => {
      const firms = await prisma.firm.findMany({
        where: {
          name: { contains: "Test Firma", mode: "insensitive" },
          createdById: testUserId,
        },
      });
      expect(firms.length).toBeGreaterThanOrEqual(1);
      expect(firms[0].name).toContain("Test Firma");
    });

    it("updates a firm", async () => {
      const updated = await prisma.firm.update({
        where: { id: testFirmId },
        data: { sector: "Finans" },
      });
      expect(updated.sector).toBe("Finans");
    });

    it("includes position count", async () => {
      const firm = await prisma.firm.findUnique({
        where: { id: testFirmId },
        include: { _count: { select: { positions: true } } },
      });
      expect(firm?._count.positions).toBe(0);
    });
  });

  // ─── Candidate CRUD ───
  describe("Candidate CRUD", () => {
    it("creates a candidate with languages", async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: "Test",
          lastName: "Aday",
          email: "test.aday@example.com",
          phone: "+90 555 000 0000",
          totalExperienceYears: 5,
          currentTitle: "Software Developer",
          currentSector: "Bilişim",
          city: "İstanbul",
          country: "Türkiye",
          createdById: testUserId,
          languages: {
            create: [
              { language: "İngilizce", level: "advanced" },
              { language: "Almanca", level: "beginner" },
            ],
          },
        },
        include: { languages: true },
      });

      expect(candidate.id).toBeDefined();
      expect(candidate.firstName).toBe("Test");
      expect(candidate.status).toBe("active");
      expect(candidate.languages).toHaveLength(2);
      testCandidateId = candidate.id;
    });

    it("finds candidate by email search", async () => {
      const candidates = await prisma.candidate.findMany({
        where: {
          email: { contains: "test.aday", mode: "insensitive" },
        },
      });
      expect(candidates.length).toBeGreaterThanOrEqual(1);
    });

    it("filters candidates by experience range", async () => {
      const candidates = await prisma.candidate.findMany({
        where: {
          totalExperienceYears: { gte: 3, lte: 10 },
          createdById: testUserId,
        },
      });
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      candidates.forEach((c) => {
        expect(c.totalExperienceYears).toBeGreaterThanOrEqual(3);
        expect(c.totalExperienceYears).toBeLessThanOrEqual(10);
      });
    });

    it("creates a candidate note", async () => {
      const note = await prisma.candidateNote.create({
        data: {
          candidateId: testCandidateId,
          content: "Test not - çok iyi aday.",
          createdById: testUserId,
        },
      });
      expect(note.id).toBeDefined();
      expect(note.content).toBe("Test not - çok iyi aday.");
    });

    it("lists candidate notes", async () => {
      const notes = await prisma.candidateNote.findMany({
        where: { candidateId: testCandidateId },
        orderBy: { createdAt: "desc" },
      });
      expect(notes.length).toBeGreaterThanOrEqual(1);
    });

    it("updates candidate languages", async () => {
      // Delete old, add new
      await prisma.candidateLanguage.deleteMany({
        where: { candidateId: testCandidateId },
      });
      await prisma.candidateLanguage.createMany({
        data: [
          { candidateId: testCandidateId, language: "Fransızca", level: "intermediate" },
        ],
      });

      const updated = await prisma.candidate.findUnique({
        where: { id: testCandidateId },
        include: { languages: true },
      });
      expect(updated?.languages).toHaveLength(1);
      expect(updated?.languages[0].language).toBe("Fransızca");
    });
  });

  // ─── Position CRUD ───
  describe("Position CRUD", () => {
    it("creates a position", async () => {
      const position = await prisma.position.create({
        data: {
          firmId: testFirmId,
          title: "Test Pozisyon",
          department: "Yazılım",
          minExperienceYears: 3,
          salaryMin: 50000,
          salaryMax: 80000,
          salaryCurrency: "TRY",
          workModel: "hybrid",
          city: "İstanbul",
          country: "Türkiye",
          priority: "high",
          status: "open",
          createdById: testUserId,
        },
      });

      expect(position.id).toBeDefined();
      expect(position.title).toBe("Test Pozisyon");
      expect(position.status).toBe("open");
      expect(position.priority).toBe("high");
      testPositionId = position.id;
    });

    it("reads position with firm info", async () => {
      const position = await prisma.position.findUnique({
        where: { id: testPositionId },
        include: {
          firm: { select: { id: true, name: true } },
        },
      });

      expect(position?.firm.name).toBe("Test Firma A.Ş.");
    });

    it("updates position status", async () => {
      const updated = await prisma.position.update({
        where: { id: testPositionId },
        data: { status: "on_hold" },
      });
      expect(updated.status).toBe("on_hold");
    });

    it("lists positions for a firm", async () => {
      const positions = await prisma.position.findMany({
        where: { firmId: testFirmId },
      });
      expect(positions.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Process CRUD ───
  describe("Process CRUD", () => {
    let testProcessId: string;

    it("creates a process linking candidate to position", async () => {
      const process = await prisma.process.create({
        data: {
          candidateId: testCandidateId,
          firmId: testFirmId,
          positionId: testPositionId,
          stage: "pool",
          fitnessScore: 4,
          assignedToId: testUserId,
          createdById: testUserId,
        },
      });

      expect(process.id).toBeDefined();
      expect(process.stage).toBe("pool");
      expect(process.closedAt).toBeNull();
      testProcessId = process.id;
    });

    it("advances process stage", async () => {
      const updated = await prisma.process.update({
        where: { id: testProcessId },
        data: { stage: "submitted" },
      });
      expect(updated.stage).toBe("submitted");
    });

    it("creates an interview for process", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const interview = await prisma.interview.create({
        data: {
          processId: testProcessId,
          scheduledAt: tomorrow,
          durationMinutes: 60,
          type: "online",
          meetingLink: "https://meet.google.com/test",
          notes: "Test mülakat",
          createdById: testUserId,
        },
      });

      expect(interview.id).toBeDefined();
      expect(interview.type).toBe("online");
    });

    it("counts active processes for position", async () => {
      const position = await prisma.position.findUnique({
        where: { id: testPositionId },
        include: {
          _count: { select: { processes: { where: { closedAt: null } } } },
        },
      });
      expect(position?._count.processes).toBeGreaterThanOrEqual(1);
    });

    it("closes a process", async () => {
      const updated = await prisma.process.update({
        where: { id: testProcessId },
        data: { closedAt: new Date(), stage: "positive" },
      });
      expect(updated.closedAt).not.toBeNull();
      expect(updated.stage).toBe("positive");
    });
  });

  // ─── Process Stage History & Notes ───
  describe("Process Stage History & Notes", () => {
    let processId: string;

    beforeAll(async () => {
      const process = await prisma.process.create({
        data: {
          candidateId: testCandidateId,
          firmId: testFirmId,
          positionId: testPositionId,
          stage: "pool",
          createdById: testUserId,
          assignedToId: testUserId,
        },
      });
      processId = process.id;
    });

    it("creates stage history record", async () => {
      const history = await prisma.processStageHistory.create({
        data: {
          processId,
          fromStage: null,
          toStage: "pool",
          changedById: testUserId,
          note: "Süreç başlatıldı",
        },
      });
      expect(history.id).toBeDefined();
      expect(history.toStage).toBe("pool");
      expect(history.note).toBe("Süreç başlatıldı");
    });

    it("tracks stage transition with from/to", async () => {
      await prisma.process.update({
        where: { id: processId },
        data: { stage: "initial_interview" },
      });

      const history = await prisma.processStageHistory.create({
        data: {
          processId,
          fromStage: "pool",
          toStage: "initial_interview",
          changedById: testUserId,
        },
      });
      expect(history.fromStage).toBe("pool");
      expect(history.toStage).toBe("initial_interview");
    });

    it("lists stage history in order", async () => {
      const histories = await prisma.processStageHistory.findMany({
        where: { processId },
        orderBy: { createdAt: "asc" },
      });
      expect(histories.length).toBeGreaterThanOrEqual(2);
      expect(histories[0].toStage).toBe("pool");
      expect(histories[1].toStage).toBe("initial_interview");
    });

    it("creates a process note", async () => {
      const note = await prisma.processNote.create({
        data: {
          processId,
          content: "Aday ile ilk görüşme yapıldı.",
          createdById: testUserId,
        },
      });
      expect(note.id).toBeDefined();
      expect(note.content).toBe("Aday ile ilk görüşme yapıldı.");
    });

    it("lists process notes with author", async () => {
      const notes = await prisma.processNote.findMany({
        where: { processId },
        include: { createdBy: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      });
      expect(notes.length).toBeGreaterThanOrEqual(1);
      expect(notes[0].createdBy.firstName).toBe("Test");
    });

    it("closes process and prevents further stage changes conceptually", async () => {
      const closed = await prisma.process.update({
        where: { id: processId },
        data: { stage: "negative", closedAt: new Date() },
      });
      expect(closed.closedAt).not.toBeNull();
      expect(closed.stage).toBe("negative");
    });
  });

  // ─── Interview Scheduling ───
  describe("Interview Scheduling", () => {
    let processId: string;
    let interviewId: string;

    beforeAll(async () => {
      const process = await prisma.process.create({
        data: {
          candidateId: testCandidateId,
          firmId: testFirmId,
          positionId: testPositionId,
          stage: "interview",
          createdById: testUserId,
          assignedToId: testUserId,
        },
      });
      processId = process.id;
    });

    it("schedules an interview", async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const interview = await prisma.interview.create({
        data: {
          processId,
          scheduledAt: nextWeek,
          type: "face_to_face",
          durationMinutes: 45,
          location: "Levent Ofis, İstanbul",
          clientParticipants: "Ahmet Bey (CTO)",
          notes: "Teknik mülakat",
          createdById: testUserId,
        },
      });

      expect(interview.id).toBeDefined();
      expect(interview.type).toBe("face_to_face");
      expect(interview.durationMinutes).toBe(45);
      interviewId = interview.id;
    });

    it("updates interview with reschedule", async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 10);

      const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: { scheduledAt: newDate, durationMinutes: 60 },
      });
      expect(updated.durationMinutes).toBe(60);
    });

    it("marks interview as completed with notes", async () => {
      const completed = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          isCompleted: true,
          resultNotes: "Aday teknik olarak güçlü, iletişimi iyi.",
        },
      });
      expect(completed.isCompleted).toBe(true);
      expect(completed.resultNotes).toContain("teknik olarak güçlü");
    });

    it("lists interviews for process ordered by date", async () => {
      const interviews = await prisma.interview.findMany({
        where: { processId },
        orderBy: { scheduledAt: "asc" },
      });
      expect(interviews.length).toBeGreaterThanOrEqual(1);
    });

    it("creates interview with meetingProvider and meetingId", async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 14);

      const interview = await prisma.interview.create({
        data: {
          processId,
          scheduledAt: nextWeek,
          type: "online",
          durationMinutes: 60,
          meetingProvider: "zoom",
          meetingId: "zoom-test-123456",
          meetingLink: "https://zoom.us/j/123456",
          createdById: testUserId,
        },
      });

      expect(interview.meetingProvider).toBe("zoom");
      expect(interview.meetingId).toBe("zoom-test-123456");
      expect(interview.meetingLink).toBe("https://zoom.us/j/123456");
    });

    it("allows null meetingProvider for manual link entry", async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 15);

      const interview = await prisma.interview.create({
        data: {
          processId,
          scheduledAt: nextWeek,
          type: "online",
          meetingLink: "https://meet.google.com/abc-def",
          createdById: testUserId,
        },
      });

      expect(interview.meetingProvider).toBeNull();
      expect(interview.meetingId).toBeNull();
      expect(interview.meetingLink).toBe("https://meet.google.com/abc-def");
    });

    it("reads meetingProvider field from existing interview", async () => {
      const interviews = await prisma.interview.findMany({
        where: { processId, meetingProvider: "zoom" },
      });
      expect(interviews.length).toBeGreaterThanOrEqual(1);
      expect(interviews[0].meetingProvider).toBe("zoom");
    });
  });

  // ─── User Operations ───
  describe("User Operations", () => {
    it("finds user by email", async () => {
      const user = await prisma.user.findUnique({
        where: { email: "integration-test@talentflow.local" },
      });
      expect(user).not.toBeNull();
      expect(user?.firstName).toBe("Test");
    });

    it("verifies password hash", async () => {
      const user = await prisma.user.findUnique({
        where: { email: "integration-test@talentflow.local" },
      });
      const isValid = await bcrypt.compare("TestPass1!", user!.passwordHash);
      expect(isValid).toBe(true);
    });

    it("rejects wrong password", async () => {
      const user = await prisma.user.findUnique({
        where: { email: "integration-test@talentflow.local" },
      });
      const isValid = await bcrypt.compare("WrongPassword", user!.passwordHash);
      expect(isValid).toBe(false);
    });

    it("deactivates user (soft delete)", async () => {
      await prisma.user.update({
        where: { id: testUserId },
        data: { isActive: false },
      });

      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user?.isActive).toBe(false);

      // Re-activate for cleanup
      await prisma.user.update({
        where: { id: testUserId },
        data: { isActive: true },
      });
    });
  });

  // ─── Dashboard Queries ───
  describe("Dashboard Queries", () => {
    it("counts active candidates", async () => {
      const count = await prisma.candidate.count({
        where: { status: "active" },
      });
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("counts open positions", async () => {
      const count = await prisma.position.count({
        where: { status: "open" },
      });
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("counts upcoming interviews", async () => {
      const now = new Date();
      const weekLater = new Date();
      weekLater.setDate(now.getDate() + 7);

      const count = await prisma.interview.count({
        where: {
          scheduledAt: { gte: now, lte: weekLater },
        },
      });
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("counts active processes", async () => {
      const count = await prisma.process.count({
        where: { closedAt: null },
      });
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Email Template CRUD ───
  describe("Email Template CRUD", () => {
    let templateId: string;

    it("creates an email template", async () => {
      const template = await prisma.emailTemplate.create({
        data: {
          name: "Test Mülakat Daveti",
          subject: "{candidateName} - Mülakat Daveti",
          body: "Sayın {candidateName}, {firmName} firmasında {position} pozisyonu için mülakata davetlisiniz.",
          category: "mulakat_daveti",
          isActive: true,
          createdById: testUserId,
        },
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe("Test Mülakat Daveti");
      expect(template.isActive).toBe(true);
      templateId = template.id;
    });

    it("lists templates with search", async () => {
      const templates = await prisma.emailTemplate.findMany({
        where: {
          name: { contains: "Mülakat", mode: "insensitive" },
          createdById: testUserId,
        },
      });
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });

    it("updates a template", async () => {
      const updated = await prisma.emailTemplate.update({
        where: { id: templateId },
        data: { subject: "Güncellenmiş Konu" },
      });
      expect(updated.subject).toBe("Güncellenmiş Konu");
    });

    it("lists templates filtered by category", async () => {
      const templates = await prisma.emailTemplate.findMany({
        where: {
          category: "mulakat_daveti",
          createdById: testUserId,
        },
      });
      expect(templates.length).toBeGreaterThanOrEqual(1);
      expect(templates[0].category).toBe("mulakat_daveti");
    });

    it("deactivates a template", async () => {
      const deactivated = await prisma.emailTemplate.update({
        where: { id: templateId },
        data: { isActive: false },
      });
      expect(deactivated.isActive).toBe(false);
    });

    it("includes usage count via _count", async () => {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
        include: { _count: { select: { emailLogs: true } } },
      });
      expect(template).not.toBeNull();
      expect(template!._count.emailLogs).toBe(0);
    });
  });

  // ─── Email Log Operations ───
  describe("Email Log Operations", () => {
    it("creates an email log record", async () => {
      const log = await prisma.emailLog.create({
        data: {
          candidateId: testCandidateId,
          toEmail: "test@example.com",
          subject: "Test E-posta",
          body: "Bu bir test e-postasıdır.",
          status: "sent",
          sentById: testUserId,
          sentAt: new Date(),
        },
      });

      expect(log.id).toBeDefined();
      expect(log.status).toBe("sent");
      expect(log.toEmail).toBe("test@example.com");
    });

    it("creates a failed email log", async () => {
      const log = await prisma.emailLog.create({
        data: {
          candidateId: testCandidateId,
          toEmail: "fail@example.com",
          subject: "Failed E-posta",
          body: "Bu e-posta başarısız oldu.",
          status: "failed",
          errorMessage: "SMTP connection timeout",
          sentById: testUserId,
          sentAt: new Date(),
        },
      });

      expect(log.status).toBe("failed");
      expect(log.errorMessage).toContain("timeout");
    });

    it("lists email logs with candidate filter", async () => {
      const logs = await prisma.emailLog.findMany({
        where: { candidateId: testCandidateId },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          sentBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { sentAt: "desc" },
      });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].candidate.firstName).toBeDefined();
    });

    it("counts email logs by status", async () => {
      const sentCount = await prisma.emailLog.count({
        where: { sentById: testUserId, status: "sent" },
      });
      const failedCount = await prisma.emailLog.count({
        where: { sentById: testUserId, status: "failed" },
      });
      expect(sentCount).toBeGreaterThanOrEqual(1);
      expect(failedCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Extended Dashboard Data ───
  describe("Extended Dashboard Data", () => {
    it("groups processes by stage (pipeline distribution)", async () => {
      const pipeline = await prisma.process.groupBy({
        by: ["stage"],
        where: { closedAt: null },
        _count: { id: true },
      });
      expect(Array.isArray(pipeline)).toBe(true);
      pipeline.forEach((item) => {
        expect(item.stage).toBeDefined();
        expect(item._count.id).toBeGreaterThanOrEqual(0);
      });
    });

    it("fetches recent stage history", async () => {
      const history = await prisma.processStageHistory.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fromStage: true,
          toStage: true,
          createdAt: true,
          changedBy: { select: { firstName: true, lastName: true } },
          process: {
            select: {
              candidate: { select: { firstName: true, lastName: true } },
              position: { select: { title: true } },
              firm: { select: { name: true } },
            },
          },
        },
      });
      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        expect(history[0].toStage).toBeDefined();
        expect(history[0].changedBy.firstName).toBeDefined();
      }
    });

    it("fetches upcoming interviews", async () => {
      const interviews = await prisma.interview.findMany({
        where: { scheduledAt: { gte: new Date() }, isCompleted: false },
        take: 5,
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          type: true,
          process: {
            select: {
              candidate: { select: { firstName: true, lastName: true } },
              firm: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      });
      expect(Array.isArray(interviews)).toBe(true);
    });
  });

  // ─── Audit Log Operations ───
  describe("Audit Log Operations", () => {
    let auditLogId: string;

    it("creates an audit log entry", async () => {
      const log = await prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: "candidate.create",
          entityType: "Candidate",
          entityId: testCandidateId,
          changes: { after: { firstName: "Test", lastName: "Aday" } },
        },
      });

      expect(log.id).toBeDefined();
      expect(log.action).toBe("candidate.create");
      expect(log.entityType).toBe("Candidate");
      auditLogId = log.id;
    });

    it("creates an audit log with before/after diff", async () => {
      const log = await prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: "firm.update",
          entityType: "Firm",
          entityId: testFirmId,
          changes: {
            before: { sector: "Bilişim" },
            after: { sector: "Finans" },
          },
        },
      });

      expect(log.changes).toEqual({
        before: { sector: "Bilişim" },
        after: { sector: "Finans" },
      });
    });

    it("lists audit logs with pagination", async () => {
      const logs = await prisma.auditLog.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
      expect(logs.length).toBeGreaterThanOrEqual(2);
    });

    it("filters audit logs by entityType", async () => {
      const logs = await prisma.auditLog.findMany({
        where: { userId: testUserId, entityType: "Candidate" },
      });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      logs.forEach((l) => expect(l.entityType).toBe("Candidate"));
    });

    it("includes user relation on audit log", async () => {
      const log = await prisma.auditLog.findUnique({
        where: { id: auditLogId },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      });
      expect(log?.user.firstName).toBe("Test");
      expect(log?.user.email).toBe("integration-test@talentflow.local");
    });

    it("counts audit logs for a user", async () => {
      const count = await prisma.auditLog.count({
        where: { userId: testUserId },
      });
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it("filters audit logs by action pattern", async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          userId: testUserId,
          action: { contains: "create" },
        },
      });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      logs.forEach((l) => expect(l.action).toContain("create"));
    });
  });

  // ─── Reports Queries ───
  describe("Reports Queries", () => {
    it("groups processes by stage for pipeline report", async () => {
      const pipeline = await prisma.process.groupBy({
        by: ["stage"],
        _count: { id: true },
      });
      expect(Array.isArray(pipeline)).toBe(true);
      pipeline.forEach((item) => {
        expect(item.stage).toBeDefined();
        expect(item._count.id).toBeGreaterThanOrEqual(0);
      });
    });

    it("groups candidates by status", async () => {
      const statuses = await prisma.candidate.groupBy({
        by: ["status"],
        _count: { id: true },
      });
      expect(Array.isArray(statuses)).toBe(true);
      statuses.forEach((item) => {
        expect(["active", "passive"]).toContain(item.status);
      });
    });

    it("gets firm activity (top firms by process count)", async () => {
      const firmActivity = await prisma.process.groupBy({
        by: ["firmId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });
      expect(Array.isArray(firmActivity)).toBe(true);
    });

    it("gets consultant performance (groupBy assignedToId)", async () => {
      const performance = await prisma.process.groupBy({
        by: ["assignedToId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });
      expect(Array.isArray(performance)).toBe(true);
    });

    it("applies date filter to process groupBy", async () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      const pipeline = await prisma.process.groupBy({
        by: ["stage"],
        where: { createdAt: { gte: lastYear } },
        _count: { id: true },
      });
      expect(Array.isArray(pipeline)).toBe(true);
    });
  });

  // ─── Export Data Queries ───
  describe("Export Data Queries", () => {
    it("fetches candidates with export fields", async () => {
      const candidates = await prisma.candidate.findMany({
        where: { createdById: testUserId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          currentTitle: true,
          currentSector: true,
          totalExperienceYears: true,
          city: true,
          createdAt: true,
        },
        take: 100,
      });
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      expect(candidates[0].firstName).toBeDefined();
    });

    it("fetches processes with related data for export", async () => {
      const processes = await prisma.process.findMany({
        where: { createdById: testUserId },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          firm: { select: { name: true } },
          position: { select: { title: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
        take: 100,
      });
      expect(processes.length).toBeGreaterThanOrEqual(1);
      expect(processes[0].candidate.firstName).toBeDefined();
      expect(processes[0].firm.name).toBeDefined();
    });

    it("fetches positions with firm and process count for export", async () => {
      const positions = await prisma.position.findMany({
        where: { createdById: testUserId },
        include: {
          firm: { select: { name: true } },
          _count: { select: { processes: { where: { closedAt: null } } } },
        },
        take: 100,
      });
      expect(positions.length).toBeGreaterThanOrEqual(1);
      expect(positions[0].firm.name).toBeDefined();
    });

    it("applies date filter to candidate export", async () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      const candidates = await prisma.candidate.findMany({
        where: {
          createdById: testUserId,
          createdAt: { gte: lastYear },
        },
        take: 100,
      });
      expect(Array.isArray(candidates)).toBe(true);
    });

    it("applies date filter to position export", async () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      const positions = await prisma.position.findMany({
        where: {
          createdById: testUserId,
          createdAt: { gte: lastYear },
        },
        include: { firm: { select: { name: true } } },
        take: 100,
      });
      expect(Array.isArray(positions)).toBe(true);
    });

    it("respects safety limit of 5000 rows", async () => {
      const candidates = await prisma.candidate.findMany({
        take: 5000,
      });
      expect(candidates.length).toBeLessThanOrEqual(5000);
    });
  });

  // ─── Firm Export Queries ───
  describe("Firm Export Queries", () => {
    it("fetches firms with contacts and counts", async () => {
      const firms = await prisma.firm.findMany({
        where: { createdById: testUserId },
        include: {
          contacts: { where: { isPrimary: true }, take: 1 },
          _count: { select: { positions: true, processes: true } },
        },
        take: 100,
      });
      expect(firms.length).toBeGreaterThanOrEqual(1);
      expect(firms[0]._count).toBeDefined();
      expect(firms[0]._count.positions).toBeGreaterThanOrEqual(0);
      expect(firms[0]._count.processes).toBeGreaterThanOrEqual(0);
    });

    it("applies date filter to firm export", async () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      const firms = await prisma.firm.findMany({
        where: {
          createdById: testUserId,
          createdAt: { gte: lastYear },
        },
        include: {
          _count: { select: { positions: true, processes: true } },
        },
        take: 100,
      });
      expect(Array.isArray(firms)).toBe(true);
    });
  });

  // ─── Interview Export Queries ───
  describe("Interview Export Queries", () => {
    it("fetches interviews with process relations", async () => {
      const interviews = await prisma.interview.findMany({
        include: {
          process: {
            include: {
              candidate: { select: { firstName: true, lastName: true } },
              firm: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
        take: 100,
      });
      expect(Array.isArray(interviews)).toBe(true);
      if (interviews.length > 0) {
        expect(interviews[0].process.candidate.firstName).toBeDefined();
        expect(interviews[0].process.firm.name).toBeDefined();
        expect(interviews[0].process.position.title).toBeDefined();
      }
    });

    it("filters interviews by date range", async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const interviews = await prisma.interview.findMany({
        where: {
          scheduledAt: {
            gte: lastMonth,
            lte: nextMonth,
          },
        },
        take: 100,
      });
      expect(Array.isArray(interviews)).toBe(true);
    });
  });

  // ─── Bulk Import Queries ───
  describe("Bulk Import Queries", () => {
    it("creates multiple candidates in sequence", async () => {
      const candidates = [];
      for (let i = 0; i < 3; i++) {
        const c = await prisma.candidate.create({
          data: {
            firstName: `Import${i}`,
            lastName: `Test${i}`,
            email: `import${i}@test.local`,
            currentSector: "Test Sektör",
            createdById: testUserId,
          },
        });
        candidates.push(c);
      }
      expect(candidates.length).toBe(3);
      expect(candidates[0].firstName).toBe("Import0");
      expect(candidates[2].firstName).toBe("Import2");
    });

    it("creates candidate with nested languages", async () => {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: "Dil",
          lastName: "Testi",
          createdById: testUserId,
          languages: {
            create: [
              { language: "İngilizce", level: "advanced" },
              { language: "Almanca", level: "intermediate" },
            ],
          },
        },
        include: { languages: true },
      });
      expect(candidate.languages.length).toBe(2);
      expect(candidate.languages[0].language).toBe("İngilizce");
    });

    it("batch duplicate detection by email", async () => {
      const emails = ["import0@test.local", "import1@test.local", "nonexistent@test.local"];
      const matches = await prisma.candidate.findMany({
        where: { email: { in: emails } },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      expect(matches.length).toBeGreaterThanOrEqual(2);
      expect(matches.every((m) => emails.includes(m.email!))).toBe(true);
    });

    it("batch duplicate detection by phone", async () => {
      const matches = await prisma.candidate.findMany({
        where: {
          phone: { not: null },
          OR: [
            { phone: { contains: "555" } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, phone: true },
        take: 100,
      });
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  // ─── Custom Report Queries ───
  describe("Custom Report Queries", () => {
    it("queries candidates with dynamic filters", async () => {
      const candidates = await prisma.candidate.findMany({
        where: {
          status: "active",
          city: { contains: "İstanbul", mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      expect(Array.isArray(candidates)).toBe(true);
    });

    it("queries firms with _count include", async () => {
      const firms = await prisma.firm.findMany({
        include: {
          _count: { select: { positions: true, processes: true } },
        },
        take: 5000,
      });
      expect(Array.isArray(firms)).toBe(true);
      if (firms.length > 0) {
        expect(firms[0]._count).toBeDefined();
      }
    });

    it("queries positions with firm relation", async () => {
      const positions = await prisma.position.findMany({
        where: { status: "open" },
        include: {
          firm: { select: { name: true } },
          _count: { select: { processes: true } },
        },
        take: 5000,
      });
      expect(Array.isArray(positions)).toBe(true);
      if (positions.length > 0) {
        expect(positions[0].firm.name).toBeDefined();
      }
    });

    it("queries processes with all relations", async () => {
      const processes = await prisma.process.findMany({
        where: { stage: "pool" },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          firm: { select: { name: true } },
          position: { select: { title: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      expect(Array.isArray(processes)).toBe(true);
    });

    it("queries interviews with nested process relations", async () => {
      const interviews = await prisma.interview.findMany({
        where: { type: "face_to_face" },
        include: {
          process: {
            include: {
              candidate: { select: { firstName: true, lastName: true } },
              firm: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
        take: 5000,
      });
      expect(Array.isArray(interviews)).toBe(true);
    });

    it("applies custom sort order", async () => {
      const candidates = await prisma.candidate.findMany({
        orderBy: { totalExperienceYears: "desc" },
        take: 10,
      });
      expect(Array.isArray(candidates)).toBe(true);
      // Verify descending order (null values may be mixed in)
      for (let i = 0; i < candidates.length - 1; i++) {
        const a = candidates[i].totalExperienceYears;
        const b = candidates[i + 1].totalExperienceYears;
        if (a !== null && b !== null) {
          expect(a).toBeGreaterThanOrEqual(b);
        }
      }
    });
  });

  // ─── Edge Cases ───
  describe("Edge Cases", () => {
    it("handles duplicate user email gracefully", async () => {
      // User email has unique constraint — attempting duplicate should throw
      await expect(
        prisma.user.create({
          data: {
            email: "integration-test@talentflow.local",
            passwordHash: "hash",
            firstName: "Dup",
            lastName: "User",
            role: "admin",
          },
        })
      ).rejects.toThrow();
    });

    it("handles non-existent record lookup", async () => {
      const result = await prisma.firm.findUnique({
        where: { id: "00000000-0000-0000-0000-000000000000" },
      });
      expect(result).toBeNull();
    });

    it("handles pagination correctly", async () => {
      const page1 = await prisma.candidate.findMany({
        where: { createdById: testUserId },
        take: 1,
        skip: 0,
      });
      const page2 = await prisma.candidate.findMany({
        where: { createdById: testUserId },
        take: 1,
        skip: 1,
      });

      // Page 1 should have at most 1 result
      expect(page1.length).toBeLessThanOrEqual(1);
      // Pages should not overlap if both have results
      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    });
  });
});
