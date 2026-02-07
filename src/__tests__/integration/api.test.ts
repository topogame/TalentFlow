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
