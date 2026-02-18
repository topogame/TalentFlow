import {
  mapExcelRowToCandidate,
  mapRowToCandidate,
  detectImportFormat,
  parseLanguagesString,
  cleanCandidateData,
  EXPECTED_HEADERS,
} from "./import-helpers";

// ─── mapExcelRowToCandidate ───

describe("mapExcelRowToCandidate", () => {
  it("maps Turkish headers to field names", () => {
    const row = {
      "Ad": "Ayşe",
      "Soyad": "Yılmaz",
      "E-posta": "ayse@test.com",
      "Telefon": "+90 555 1234567",
    };
    const result = mapExcelRowToCandidate(row);
    expect(result).toEqual({
      firstName: "Ayşe",
      lastName: "Yılmaz",
      email: "ayse@test.com",
      phone: "+90 555 1234567",
    });
  });

  it("strips trailing asterisk from required headers", () => {
    const row = { "Ad *": "Test", "Soyad *": "User" };
    const result = mapExcelRowToCandidate(row);
    expect(result).toEqual({ firstName: "Test", lastName: "User" });
  });

  it("maps all known headers", () => {
    const row: Record<string, unknown> = {};
    for (const header of EXPECTED_HEADERS) {
      row[header] = "test_value";
    }
    const result = mapExcelRowToCandidate(row);
    expect(Object.keys(result).length).toBe(EXPECTED_HEADERS.length);
    expect(result.firstName).toBe("test_value");
    expect(result.lastName).toBe("test_value");
    expect(result.languages).toBe("test_value");
  });

  it("ignores unknown headers", () => {
    const row = { "Ad": "Ali", "Bilinmeyen Alan": "xyz" };
    const result = mapExcelRowToCandidate(row);
    expect(result).toEqual({ firstName: "Ali" });
    expect(result).not.toHaveProperty("Bilinmeyen Alan");
  });

  it("returns empty object for empty row", () => {
    const result = mapExcelRowToCandidate({});
    expect(result).toEqual({});
  });
});

// ─── detectImportFormat ───

describe("detectImportFormat", () => {
  it("detects TalentFlow format", () => {
    const headers = ["Ad", "Soyad", "E-posta", "Telefon", "LinkedIn URL"];
    expect(detectImportFormat(headers)).toBe("talentflow");
  });

  it("detects TalentFlow format with asterisk markers", () => {
    const headers = ["Ad *", "Soyad *", "E-posta", "Telefon"];
    expect(detectImportFormat(headers)).toBe("talentflow");
  });

  it("detects Kariyer.net format", () => {
    const headers = ["İsim", "Soyisim", "E-Posta", "Telefon", "Şehir"];
    expect(detectImportFormat(headers)).toBe("kariyer_net");
  });

  it("detects Kariyer.net alternative headers", () => {
    const headers = ["Ad", "Soyisim", "Email", "Cep Telefonu", "İl"];
    expect(detectImportFormat(headers)).toBe("kariyer_net");
  });

  it("returns unknown for unrecognized format", () => {
    const headers = ["Column1", "Column2", "Column3"];
    expect(detectImportFormat(headers)).toBe("unknown");
  });

  it("returns unknown for empty headers", () => {
    expect(detectImportFormat([])).toBe("unknown");
  });
});

// ─── mapRowToCandidate (Kariyer.net) ───

describe("mapRowToCandidate with kariyer_net format", () => {
  it("maps Kariyer.net headers to field names", () => {
    const row = {
      "İsim": "Fatma",
      "Soyisim": "Kara",
      "E-Posta": "fatma@test.com",
      "Telefon": "+90 532 1234567",
      "Şehir": "Ankara",
    };
    const result = mapRowToCandidate(row, "kariyer_net");
    expect(result).toEqual({
      firstName: "Fatma",
      lastName: "Kara",
      email: "fatma@test.com",
      phone: "+90 532 1234567",
      city: "Ankara",
    });
  });

  it("maps professional fields from Kariyer.net", () => {
    const row = {
      "Pozisyon": "Yazılım Mühendisi",
      "Sektör": "Teknoloji",
      "Deneyim Süresi": 5,
      "Eğitim Durumu": "Lisans",
      "Üniversite": "ODTÜ",
      "Bölüm": "Bilgisayar Mühendisliği",
    };
    const result = mapRowToCandidate(row, "kariyer_net");
    expect(result.currentTitle).toBe("Yazılım Mühendisi");
    expect(result.currentSector).toBe("Teknoloji");
    expect(result.totalExperienceYears).toBe(5);
    expect(result.educationLevel).toBe("Lisans");
    expect(result.universityName).toBe("ODTÜ");
    expect(result.universityDepartment).toBe("Bilgisayar Mühendisliği");
  });

  it("ignores unknown Kariyer.net headers", () => {
    const row = { "İsim": "Test", "Başvuru Tarihi": "2026-01-01" };
    const result = mapRowToCandidate(row, "kariyer_net");
    expect(result).toEqual({ firstName: "Test" });
  });
});

// ─── parseLanguagesString ───

describe("parseLanguagesString", () => {
  it("parses single language with level", () => {
    const result = parseLanguagesString("İngilizce:advanced");
    expect(result).toEqual([{ language: "İngilizce", level: "advanced" }]);
  });

  it("parses multiple languages", () => {
    const result = parseLanguagesString("İngilizce:advanced, Almanca:intermediate");
    expect(result).toEqual([
      { language: "İngilizce", level: "advanced" },
      { language: "Almanca", level: "intermediate" },
    ]);
  });

  it("defaults to intermediate for missing level", () => {
    const result = parseLanguagesString("İngilizce");
    expect(result).toEqual([{ language: "İngilizce", level: "intermediate" }]);
  });

  it("defaults to intermediate for invalid level", () => {
    const result = parseLanguagesString("İngilizce:expert");
    expect(result).toEqual([{ language: "İngilizce", level: "intermediate" }]);
  });

  it("handles all valid levels", () => {
    const levels = ["beginner", "intermediate", "advanced", "native"];
    for (const level of levels) {
      const result = parseLanguagesString(`Test:${level}`);
      expect(result[0].level).toBe(level);
    }
  });

  it("returns empty array for empty string", () => {
    expect(parseLanguagesString("")).toEqual([]);
    expect(parseLanguagesString("  ")).toEqual([]);
  });

  it("handles extra whitespace", () => {
    const result = parseLanguagesString("  İngilizce : advanced ,  Almanca : beginner  ");
    expect(result).toEqual([
      { language: "İngilizce", level: "advanced" },
      { language: "Almanca", level: "beginner" },
    ]);
  });

  it("skips empty parts", () => {
    const result = parseLanguagesString("İngilizce:advanced,,");
    expect(result).toHaveLength(1);
  });

  it("handles level case insensitivity", () => {
    const result = parseLanguagesString("İngilizce:ADVANCED");
    expect(result[0].level).toBe("advanced");
  });
});

// ─── cleanCandidateData ───

describe("cleanCandidateData", () => {
  it("trims string values", () => {
    const result = cleanCandidateData({ firstName: "  Ali  ", lastName: " Veli " });
    expect(result.firstName).toBe("Ali");
    expect(result.lastName).toBe("Veli");
  });

  it("converts empty strings to undefined", () => {
    const result = cleanCandidateData({ email: "", phone: "   " });
    expect(result.email).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });

  it("converts boolean strings (Turkish)", () => {
    const result = cleanCandidateData({
      isRemoteEligible: "Evet",
      isHybridEligible: "Hayır",
    });
    expect(result.isRemoteEligible).toBe(true);
    expect(result.isHybridEligible).toBe(false);
  });

  it("converts boolean strings (English)", () => {
    const result = cleanCandidateData({
      isRemoteEligible: "true",
      isHybridEligible: "false",
    });
    expect(result.isRemoteEligible).toBe(true);
    expect(result.isHybridEligible).toBe(false);
  });

  it("keeps actual boolean values", () => {
    const result = cleanCandidateData({
      isRemoteEligible: true,
      isHybridEligible: false,
    });
    expect(result.isRemoteEligible).toBe(true);
    expect(result.isHybridEligible).toBe(false);
  });

  it("converts numeric strings", () => {
    const result = cleanCandidateData({
      totalExperienceYears: "5",
      salaryExpectation: "45000",
    });
    expect(result.totalExperienceYears).toBe(5);
    expect(result.salaryExpectation).toBe(45000);
  });

  it("keeps actual numbers", () => {
    const result = cleanCandidateData({
      totalExperienceYears: 8,
      salaryExpectation: 60000,
    });
    expect(result.totalExperienceYears).toBe(8);
    expect(result.salaryExpectation).toBe(60000);
  });

  it("converts invalid numeric strings to undefined", () => {
    const result = cleanCandidateData({
      totalExperienceYears: "abc",
      salaryExpectation: "",
    });
    expect(result.totalExperienceYears).toBeUndefined();
    expect(result.salaryExpectation).toBeUndefined();
  });

  it("parses languages string", () => {
    const result = cleanCandidateData({
      languages: "İngilizce:advanced, Almanca:beginner",
    });
    expect(result.languages).toEqual([
      { language: "İngilizce", level: "advanced" },
      { language: "Almanca", level: "beginner" },
    ]);
  });

  it("handles empty languages string", () => {
    const result = cleanCandidateData({ languages: "" });
    expect(result.languages).toBeUndefined();
  });

  it("keeps non-string language values as-is", () => {
    const languages = [{ language: "İngilizce", level: "advanced" }];
    const result = cleanCandidateData({ languages });
    expect(result.languages).toEqual(languages);
  });

  it("handles null and undefined values", () => {
    const result = cleanCandidateData({
      email: null,
      phone: undefined,
    });
    expect(result.email).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });

  it("handles hayir (without ı) for boolean", () => {
    const result = cleanCandidateData({ isRemoteEligible: "hayir" });
    expect(result.isRemoteEligible).toBe(false);
  });

  it("sets invalid boolean strings to undefined", () => {
    const result = cleanCandidateData({ isRemoteEligible: "belki" });
    expect(result.isRemoteEligible).toBeUndefined();
  });
});
