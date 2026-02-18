import { extractJSON, CV_EXTRACTION_PROMPT, type CVParseResult } from "./ai";

// ─── extractJSON ───

describe("extractJSON", () => {
  it("extracts JSON from markdown code fence", () => {
    const text = '```json\n{"firstName": "Ali", "lastName": "Kaya"}\n```';
    const result = extractJSON(text);
    expect(result.firstName).toBe("Ali");
    expect(result.lastName).toBe("Kaya");
  });

  it("extracts JSON from code fence without json label", () => {
    const text = '```\n{"firstName": "Ayşe", "lastName": "Demir"}\n```';
    const result = extractJSON(text);
    expect(result.firstName).toBe("Ayşe");
    expect(result.lastName).toBe("Demir");
  });

  it("extracts JSON from plain text response", () => {
    const text = 'İşte sonuç: {"firstName": "Mehmet", "email": "m@test.com"}';
    const result = extractJSON(text);
    expect(result.firstName).toBe("Mehmet");
    expect(result.email).toBe("m@test.com");
  });

  it("returns default structure on invalid JSON", () => {
    const result = extractJSON("Bu bir JSON değil");
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.languages).toEqual([]);
  });

  it("returns default structure on empty string", () => {
    const result = extractJSON("");
    expect(result.firstName).toBeNull();
    expect(result.email).toBeNull();
  });

  it("handles partial JSON (missing fields)", () => {
    const text = '{"firstName": "Zeynep"}';
    const result = extractJSON(text);
    expect(result.firstName).toBe("Zeynep");
    expect(result.lastName).toBeNull();
    expect(result.email).toBeNull();
    expect(result.languages).toEqual([]);
  });

  it("parses all candidate fields correctly", () => {
    const fullData: CVParseResult = {
      firstName: "Ali",
      lastName: "Kaya",
      email: "ali@test.com",
      phone: "+90 555 1234567",
      linkedinUrl: "https://linkedin.com/in/alikaya",
      educationLevel: "Lisans",
      universityName: "İTÜ",
      universityDepartment: "Bilgisayar Mühendisliği",
      totalExperienceYears: 5,
      currentSector: "Teknoloji",
      currentTitle: "Senior Developer",
      salaryExpectation: 45000,
      salaryCurrency: "TRY",
      country: "Türkiye",
      city: "İstanbul",
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "Almanca", level: "beginner" },
      ],
    };
    const text = JSON.stringify(fullData);
    const result = extractJSON(text);
    expect(result).toEqual(fullData);
  });

  it("handles languages with valid levels", () => {
    const text = JSON.stringify({
      firstName: "Test",
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "Fransızca", level: "native" },
        { language: "Almanca", level: "beginner" },
        { language: "İspanyolca", level: "intermediate" },
      ],
    });
    const result = extractJSON(text);
    expect(result.languages).toHaveLength(4);
    expect(result.languages[0].level).toBe("advanced");
    expect(result.languages[1].level).toBe("native");
  });

  it("handles null values in fields", () => {
    const text = JSON.stringify({
      firstName: null,
      lastName: null,
      email: null,
      totalExperienceYears: null,
    });
    const result = extractJSON(text);
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.totalExperienceYears).toBeNull();
  });

  it("handles numeric fields correctly", () => {
    const text = JSON.stringify({
      totalExperienceYears: 10,
      salaryExpectation: 50000,
    });
    const result = extractJSON(text);
    expect(result.totalExperienceYears).toBe(10);
    expect(result.salaryExpectation).toBe(50000);
  });

  it("prefers code fence over plain JSON", () => {
    const text = '{"firstName": "wrong"}\n```json\n{"firstName": "right"}\n```';
    const result = extractJSON(text);
    expect(result.firstName).toBe("right");
  });

  it("handles JSON with extra whitespace in code fence", () => {
    const text = '```json\n\n  {"firstName": "Ali"}\n\n```';
    const result = extractJSON(text);
    expect(result.firstName).toBe("Ali");
  });

  it("handles Turkish characters in values", () => {
    const text = JSON.stringify({
      firstName: "Şükrü",
      lastName: "Öztürk",
      city: "İstanbul",
      universityName: "Galatasaray Üniversitesi",
    });
    const result = extractJSON(text);
    expect(result.firstName).toBe("Şükrü");
    expect(result.lastName).toBe("Öztürk");
    expect(result.city).toBe("İstanbul");
  });
});

// ─── CV_EXTRACTION_PROMPT ───

describe("CV_EXTRACTION_PROMPT", () => {
  it("is defined and non-empty", () => {
    expect(CV_EXTRACTION_PROMPT).toBeTruthy();
    expect(CV_EXTRACTION_PROMPT.length).toBeGreaterThan(100);
  });

  it("contains JSON format instructions", () => {
    expect(CV_EXTRACTION_PROMPT).toContain("firstName");
    expect(CV_EXTRACTION_PROMPT).toContain("lastName");
    expect(CV_EXTRACTION_PROMPT).toContain("languages");
  });

  it("mentions Turkish education levels", () => {
    expect(CV_EXTRACTION_PROMPT).toContain("Lise");
    expect(CV_EXTRACTION_PROMPT).toContain("Lisans");
    expect(CV_EXTRACTION_PROMPT).toContain("Yüksek Lisans");
    expect(CV_EXTRACTION_PROMPT).toContain("Doktora");
  });

  it("mentions language levels", () => {
    expect(CV_EXTRACTION_PROMPT).toContain("beginner");
    expect(CV_EXTRACTION_PROMPT).toContain("intermediate");
    expect(CV_EXTRACTION_PROMPT).toContain("advanced");
    expect(CV_EXTRACTION_PROMPT).toContain("native");
  });

  it("mentions currency options", () => {
    expect(CV_EXTRACTION_PROMPT).toContain("TRY");
    expect(CV_EXTRACTION_PROMPT).toContain("USD");
    expect(CV_EXTRACTION_PROMPT).toContain("EUR");
  });

  it("instructs to return only JSON", () => {
    expect(CV_EXTRACTION_PROMPT).toContain("SADECE JSON");
  });
});
