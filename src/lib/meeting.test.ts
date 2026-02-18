import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  getAvailableProviders,
  isProviderConfigured,
  buildInterviewInviteEmail,
} from "./meeting";

// ─── getAvailableProviders ───

describe("getAvailableProviders", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ZOOM_ACCOUNT_ID;
    delete process.env.ZOOM_CLIENT_ID;
    delete process.env.ZOOM_CLIENT_SECRET;
    delete process.env.MS_TENANT_ID;
    delete process.env.MS_CLIENT_ID;
    delete process.env.MS_CLIENT_SECRET;
  });

  afterAll(() => {
    process.env = origEnv;
  });

  it("returns empty array when no providers configured", () => {
    expect(getAvailableProviders()).toEqual([]);
  });

  it("returns ['zoom'] when only Zoom is configured", () => {
    process.env.ZOOM_ACCOUNT_ID = "test-account";
    process.env.ZOOM_CLIENT_ID = "test-client";
    process.env.ZOOM_CLIENT_SECRET = "test-secret";
    expect(getAvailableProviders()).toEqual(["zoom"]);
  });

  it("returns ['teams'] when only Teams is configured", () => {
    process.env.MS_TENANT_ID = "test-tenant";
    process.env.MS_CLIENT_ID = "test-client";
    process.env.MS_CLIENT_SECRET = "test-secret";
    expect(getAvailableProviders()).toEqual(["teams"]);
  });

  it("returns both when both are configured", () => {
    process.env.ZOOM_ACCOUNT_ID = "test-account";
    process.env.ZOOM_CLIENT_ID = "test-client";
    process.env.ZOOM_CLIENT_SECRET = "test-secret";
    process.env.MS_TENANT_ID = "test-tenant";
    process.env.MS_CLIENT_ID = "test-client";
    process.env.MS_CLIENT_SECRET = "test-secret";
    expect(getAvailableProviders()).toEqual(["zoom", "teams"]);
  });

  it("does not include zoom when ZOOM_CLIENT_ID is missing", () => {
    process.env.ZOOM_ACCOUNT_ID = "test-account";
    process.env.ZOOM_CLIENT_SECRET = "test-secret";
    expect(getAvailableProviders()).toEqual([]);
  });

  it("does not include teams when MS_CLIENT_SECRET is missing", () => {
    process.env.MS_TENANT_ID = "test-tenant";
    process.env.MS_CLIENT_ID = "test-client";
    expect(getAvailableProviders()).toEqual([]);
  });
});

// ─── isProviderConfigured ───

describe("isProviderConfigured", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ZOOM_ACCOUNT_ID;
    delete process.env.ZOOM_CLIENT_ID;
    delete process.env.ZOOM_CLIENT_SECRET;
    delete process.env.MS_TENANT_ID;
    delete process.env.MS_CLIENT_ID;
    delete process.env.MS_CLIENT_SECRET;
  });

  afterAll(() => {
    process.env = origEnv;
  });

  it("returns false for unconfigured zoom", () => {
    expect(isProviderConfigured("zoom")).toBe(false);
  });

  it("returns true for configured zoom", () => {
    process.env.ZOOM_ACCOUNT_ID = "a";
    process.env.ZOOM_CLIENT_ID = "b";
    process.env.ZOOM_CLIENT_SECRET = "c";
    expect(isProviderConfigured("zoom")).toBe(true);
  });

  it("returns false for unconfigured teams", () => {
    expect(isProviderConfigured("teams")).toBe(false);
  });

  it("returns true for configured teams", () => {
    process.env.MS_TENANT_ID = "a";
    process.env.MS_CLIENT_ID = "b";
    process.env.MS_CLIENT_SECRET = "c";
    expect(isProviderConfigured("teams")).toBe(true);
  });
});

// ─── buildInterviewInviteEmail ───

describe("buildInterviewInviteEmail", () => {
  it("includes all fields for online interview with meeting link", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Ali Kaya",
      firmName: "Test A.Ş.",
      position: "Yazılım Mühendisi",
      interviewDate: "14 Şubat 2026, Cumartesi 14:00",
      durationMinutes: 60,
      meetingLink: "https://zoom.us/j/123",
      interviewType: "online",
    });
    expect(body).toContain("Ali Kaya");
    expect(body).toContain("Test A.Ş.");
    expect(body).toContain("Yazılım Mühendisi");
    expect(body).toContain("60 dakika");
    expect(body).toContain("Online");
    expect(body).toContain("https://zoom.us/j/123");
    expect(body).toContain("TalentFlow");
  });

  it("omits meeting link when not provided", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Ayşe Demir",
      firmName: "ABC Ltd.",
      position: "Muhasebe Müdürü",
      interviewDate: "15 Şubat 2026",
      durationMinutes: 45,
      interviewType: "face_to_face",
    });
    expect(body).not.toContain("Toplantı Linki");
    expect(body).toContain("Yüz Yüze");
    expect(body).toContain("45 dakika");
  });

  it("shows Telefon label for phone interview", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Mehmet Yılmaz",
      firmName: "XYZ A.Ş.",
      position: "Satış Müdürü",
      interviewDate: "20 Şubat 2026",
      durationMinutes: 30,
      interviewType: "phone",
    });
    expect(body).toContain("Telefon");
    expect(body).not.toContain("Online");
    expect(body).not.toContain("Yüz Yüze");
  });

  it("includes candidate and firm name in greeting", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Zeynep Ak",
      firmName: "Delta A.Ş.",
      position: "İK Uzmanı",
      interviewDate: "1 Mart 2026",
      durationMinutes: 60,
      interviewType: "online",
      meetingLink: "https://teams.live.com/meet/123",
    });
    expect(body).toContain("Sayın Zeynep Ak");
    expect(body).toContain("Delta A.Ş. firmasının İK Uzmanı pozisyonu");
  });

  it("includes correct duration", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Test",
      firmName: "Firma",
      position: "Pozisyon",
      interviewDate: "1 Mart 2026",
      durationMinutes: 120,
      interviewType: "online",
    });
    expect(body).toContain("120 dakika");
  });

  it("includes interview date", () => {
    const body = buildInterviewInviteEmail({
      candidateName: "Test",
      firmName: "Firma",
      position: "Pozisyon",
      interviewDate: "25 Şubat 2026, Çarşamba 10:00",
      durationMinutes: 60,
      interviewType: "online",
    });
    expect(body).toContain("25 Şubat 2026, Çarşamba 10:00");
  });
});
