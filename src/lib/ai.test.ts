import {
  extractJSON,
  extractJobJSON,
  CV_EXTRACTION_PROMPT,
  LINKEDIN_EXTRACTION_PROMPT,
  JOB_POSTING_EXTRACTION_PROMPT,
  type CVParseResult,
  type JobPostingParseResult,
} from "./ai";

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

// ─── LINKEDIN_EXTRACTION_PROMPT ───

describe("LINKEDIN_EXTRACTION_PROMPT", () => {
  it("is defined and non-empty", () => {
    expect(LINKEDIN_EXTRACTION_PROMPT).toBeTruthy();
    expect(LINKEDIN_EXTRACTION_PROMPT.length).toBeGreaterThan(100);
  });

  it("mentions LinkedIn-specific terms", () => {
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("LinkedIn");
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("Deneyim");
  });

  it("uses same JSON format as CV prompt", () => {
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("firstName");
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("lastName");
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("languages");
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("currentTitle");
  });

  it("mentions education levels", () => {
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("Lisans");
    expect(LINKEDIN_EXTRACTION_PROMPT).toContain("Yüksek Lisans");
  });
});

// ─── extractJobJSON ───

describe("extractJobJSON", () => {
  it("extracts job posting JSON from code fence", () => {
    const text = '```json\n{"title": "Frontend Developer", "department": "Engineering"}\n```';
    const result = extractJobJSON(text);
    expect(result.title).toBe("Frontend Developer");
    expect(result.department).toBe("Engineering");
  });

  it("extracts JSON from plain text", () => {
    const text = '{"title": "Backend Developer", "city": "İstanbul", "workModel": "remote"}';
    const result = extractJobJSON(text);
    expect(result.title).toBe("Backend Developer");
    expect(result.city).toBe("İstanbul");
    expect(result.workModel).toBe("remote");
  });

  it("returns default structure on invalid JSON", () => {
    const result = extractJobJSON("Bu bir JSON değil");
    expect(result.title).toBeNull();
    expect(result.department).toBeNull();
    expect(result.workModel).toBeNull();
  });

  it("returns default structure on empty string", () => {
    const result = extractJobJSON("");
    expect(result.title).toBeNull();
    expect(result.salaryMin).toBeNull();
  });

  it("handles all position fields correctly", () => {
    const fullData: JobPostingParseResult = {
      title: "Full Stack Developer",
      department: "IT",
      minExperienceYears: 5,
      salaryMin: 40000,
      salaryMax: 60000,
      salaryCurrency: "TRY",
      workModel: "hybrid",
      city: "Ankara",
      country: "Türkiye",
      description: "Pozisyon açıklaması",
      requirements: "5 yıl deneyim gerekli",
      requiredSkills: "React, TypeScript, Node.js",
      sectorPreference: "Teknoloji",
      educationRequirement: "Lisans",
      languageRequirement: "İngilizce (İleri)",
    };
    const text = JSON.stringify(fullData);
    const result = extractJobJSON(text);
    expect(result).toEqual(fullData);
  });

  it("handles partial JSON with missing fields", () => {
    const text = '{"title": "Data Engineer", "minExperienceYears": 3}';
    const result = extractJobJSON(text);
    expect(result.title).toBe("Data Engineer");
    expect(result.minExperienceYears).toBe(3);
    expect(result.department).toBeNull();
    expect(result.workModel).toBeNull();
  });

  it("handles null values", () => {
    const text = JSON.stringify({
      title: null,
      salaryMin: null,
      city: null,
    });
    const result = extractJobJSON(text);
    expect(result.title).toBeNull();
    expect(result.salaryMin).toBeNull();
    expect(result.city).toBeNull();
  });
});

// ─── JOB_POSTING_EXTRACTION_PROMPT ───

describe("JOB_POSTING_EXTRACTION_PROMPT", () => {
  it("is defined and non-empty", () => {
    expect(JOB_POSTING_EXTRACTION_PROMPT).toBeTruthy();
    expect(JOB_POSTING_EXTRACTION_PROMPT.length).toBeGreaterThan(100);
  });

  it("mentions position fields", () => {
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("title");
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("workModel");
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("requiredSkills");
  });

  it("mentions valid workModel values", () => {
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("office");
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("remote");
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("hybrid");
  });

  it("instructs to return only JSON", () => {
    expect(JOB_POSTING_EXTRACTION_PROMPT).toContain("SADECE JSON");
  });
});
