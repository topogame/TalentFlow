import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Prisma ───
const mockFindUnique = vi.fn();
const mockUpdateMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidatePortalToken: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import {
  generatePortalToken,
  validatePortalToken,
  buildPortalLoginUrl,
  buildPortalInviteEmail,
} from "./candidate-portal";

// ─── generatePortalToken ───
describe("generatePortalToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({ id: "tok1", token: "abc123" });
  });

  it("invalidates existing active tokens before creating new one", async () => {
    const token = await generatePortalToken("cand-1", "user-1");

    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
    const updateCall = mockUpdateMany.mock.calls[0][0];
    expect(updateCall.where.candidateId).toBe("cand-1");
    expect(updateCall.where.usedAt).toBeNull();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(typeof token).toBe("string");
    expect(token.length).toBe(64); // hex encoded 32 bytes
  });

  it("creates token with 7-day expiry", async () => {
    await generatePortalToken("cand-1", "user-1");

    const createCall = mockCreate.mock.calls[0][0];
    const expiresAt = new Date(createCall.data.expiresAt);
    const now = new Date();
    const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });

  it("stores candidateId and createdById", async () => {
    await generatePortalToken("cand-2", "user-3");

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.candidateId).toBe("cand-2");
    expect(createCall.data.createdById).toBe("user-3");
  });
});

// ─── validatePortalToken ───
describe("validatePortalToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns valid with candidateId for unused, non-expired token", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    mockFindUnique.mockResolvedValue({
      id: "tok1",
      token: "abc",
      candidateId: "cand-1",
      expiresAt: future,
      usedAt: null,
    });
    mockUpdate.mockResolvedValue({});

    const result = await validatePortalToken("abc");
    expect(result).toEqual({ valid: true, candidateId: "cand-1" });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it("returns invalid for non-existent token", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await validatePortalToken("nonexistent");
    expect(result).toEqual({ valid: false, error: "Token bulunamadı" });
  });

  it("returns invalid for already-used token", async () => {
    mockFindUnique.mockResolvedValue({
      id: "tok1",
      token: "abc",
      candidateId: "cand-1",
      expiresAt: new Date(Date.now() + 86400000),
      usedAt: new Date(),
    });

    const result = await validatePortalToken("abc");
    expect(result).toEqual({ valid: false, error: "Bu link daha önce kullanılmış" });
  });

  it("returns invalid for expired token", async () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);

    mockFindUnique.mockResolvedValue({
      id: "tok1",
      token: "abc",
      candidateId: "cand-1",
      expiresAt: past,
      usedAt: null,
    });

    const result = await validatePortalToken("abc");
    expect(result).toEqual({ valid: false, error: "Link süresi dolmuş" });
  });

  it("marks token as used after successful validation", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    mockFindUnique.mockResolvedValue({
      id: "tok1",
      token: "abc",
      candidateId: "cand-1",
      expiresAt: future,
      usedAt: null,
    });
    mockUpdate.mockResolvedValue({});

    await validatePortalToken("abc");

    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.where.id).toBe("tok1");
    expect(updateCall.data.usedAt).toBeInstanceOf(Date);
  });
});

// ─── buildPortalLoginUrl ───
describe("buildPortalLoginUrl", () => {
  it("builds correct URL with token", () => {
    const originalUrl = process.env.NEXTAUTH_URL;
    process.env.NEXTAUTH_URL = "https://app.talentflow.com";

    const url = buildPortalLoginUrl("abc123def456");
    expect(url).toBe("https://app.talentflow.com/portal/login?token=abc123def456");

    process.env.NEXTAUTH_URL = originalUrl;
  });

  it("falls back to localhost when NEXTAUTH_URL is not set", () => {
    const originalUrl = process.env.NEXTAUTH_URL;
    delete process.env.NEXTAUTH_URL;

    const url = buildPortalLoginUrl("token123");
    expect(url).toBe("http://localhost:3000/portal/login?token=token123");

    process.env.NEXTAUTH_URL = originalUrl;
  });
});

// ─── buildPortalInviteEmail ───
describe("buildPortalInviteEmail", () => {
  it("includes candidate name", () => {
    const email = buildPortalInviteEmail({
      candidateName: "Ali Kaya",
      loginUrl: "https://example.com/portal/login?token=abc",
      expiresInDays: 7,
    });
    expect(email).toContain("Ali Kaya");
  });

  it("includes login URL", () => {
    const url = "https://example.com/portal/login?token=abc123";
    const email = buildPortalInviteEmail({
      candidateName: "Test",
      loginUrl: url,
      expiresInDays: 7,
    });
    expect(email).toContain(url);
  });

  it("includes expiry days", () => {
    const email = buildPortalInviteEmail({
      candidateName: "Test",
      loginUrl: "https://example.com",
      expiresInDays: 7,
    });
    expect(email).toContain("7 gün");
  });

  it("includes portal features list", () => {
    const email = buildPortalInviteEmail({
      candidateName: "Test",
      loginUrl: "https://example.com",
      expiresInDays: 7,
    });
    expect(email).toContain("Başvuru durumlarınız");
    expect(email).toContain("Mülakat bilgileriniz");
    expect(email).toContain("e-postalar");
    expect(email).toContain("Profil bilgileriniz");
  });

  it("includes TalentFlow signature", () => {
    const email = buildPortalInviteEmail({
      candidateName: "Test",
      loginUrl: "https://example.com",
      expiresInDays: 7,
    });
    expect(email).toContain("TalentFlow");
  });
});
