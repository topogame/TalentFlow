import {
  scoreExperience,
  scoreSalary,
  scoreLocation,
  scoreEducation,
  extractMatchJSON,
  computeOverallScore,
  MATCH_ANALYSIS_PROMPT,
} from "./ai";

// ─── scoreExperience ───

describe("scoreExperience", () => {
  it("gives 75 when requirement is null", () => {
    expect(scoreExperience(5, null).score).toBe(75);
  });

  it("gives 25 when candidate years is null", () => {
    expect(scoreExperience(null, 3).score).toBe(25);
  });

  it("gives high score when candidate meets requirement exactly", () => {
    const result = scoreExperience(5, 5);
    expect(result.score).toBe(75);
  });

  it("gives bonus for exceeding requirement", () => {
    const result = scoreExperience(8, 5);
    expect(result.score).toBeGreaterThan(75);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("caps score at 100", () => {
    const result = scoreExperience(30, 5);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("gives 60 when 1 year short", () => {
    expect(scoreExperience(4, 5).score).toBe(60);
  });

  it("gives 40 when 2 years short", () => {
    expect(scoreExperience(3, 5).score).toBe(40);
  });

  it("gives 15 when significantly short", () => {
    expect(scoreExperience(1, 5).score).toBe(15);
  });

  it("gives 75 when both are null", () => {
    expect(scoreExperience(null, null).score).toBe(75);
  });

  it("includes explanation text", () => {
    const result = scoreExperience(5, 3);
    expect(result.explanation).toContain("5");
    expect(result.explanation).toContain("3");
  });
});

// ─── scoreSalary ───

describe("scoreSalary", () => {
  it("gives 75 when no salary range specified", () => {
    expect(scoreSalary(50000, "TRY", null, null, "TRY").score).toBe(75);
  });

  it("gives 50 when candidate has no expectation", () => {
    expect(scoreSalary(null, null, 40000, 60000, "TRY").score).toBe(50);
  });

  it("gives 100 when salary is within range", () => {
    expect(scoreSalary(50000, "TRY", 40000, 60000, "TRY").score).toBe(100);
  });

  it("gives 100 when salary equals min", () => {
    expect(scoreSalary(40000, "TRY", 40000, 60000, "TRY").score).toBe(100);
  });

  it("gives 100 when salary equals max", () => {
    expect(scoreSalary(60000, "TRY", 40000, 60000, "TRY").score).toBe(100);
  });

  it("gives 90 when salary is below range", () => {
    expect(scoreSalary(30000, "TRY", 40000, 60000, "TRY").score).toBe(90);
  });

  it("gives 65 when salary exceeds by ≤10%", () => {
    // 66000 is 10% over 60000
    expect(scoreSalary(66000, "TRY", 40000, 60000, "TRY").score).toBe(65);
  });

  it("gives 40 when salary exceeds by ≤25%", () => {
    // 75000 is 25% over 60000
    expect(scoreSalary(75000, "TRY", 40000, 60000, "TRY").score).toBe(40);
  });

  it("gives 15 when salary greatly exceeds", () => {
    expect(scoreSalary(100000, "TRY", 40000, 60000, "TRY").score).toBe(15);
  });

  it("gives 50 when currencies differ", () => {
    expect(scoreSalary(50000, "USD", 40000, 60000, "TRY").score).toBe(50);
  });

  it("handles only min specified", () => {
    const result = scoreSalary(50000, "TRY", 40000, null, "TRY");
    expect(result.score).toBe(100); // 50000 >= 40000
  });

  it("handles only max specified", () => {
    const result = scoreSalary(50000, "TRY", null, 60000, "TRY");
    expect(result.score).toBe(100); // 50000 <= 60000
  });
});

// ─── scoreLocation ───

describe("scoreLocation", () => {
  it("gives 75 when work model not specified", () => {
    expect(scoreLocation("İstanbul", true, true, "İstanbul", null).score).toBe(75);
  });

  it("gives 100 for remote + remote-eligible", () => {
    expect(scoreLocation("Ankara", true, false, "İstanbul", "remote").score).toBe(100);
  });

  it("gives 50 for remote + not remote-eligible", () => {
    expect(scoreLocation("İstanbul", false, false, "İstanbul", "remote").score).toBe(50);
  });

  it("gives 100 for same city office", () => {
    expect(scoreLocation("İstanbul", false, false, "İstanbul", "office").score).toBe(100);
  });

  it("gives 20 for different city office", () => {
    expect(scoreLocation("Ankara", false, false, "İstanbul", "office").score).toBe(20);
  });

  it("gives 50 for office with missing city", () => {
    expect(scoreLocation(null, false, false, "İstanbul", "office").score).toBe(50);
  });

  it("gives 100 for hybrid + hybrid-eligible same city", () => {
    expect(scoreLocation("İstanbul", false, true, "İstanbul", "hybrid").score).toBe(100);
  });

  it("gives 70 for hybrid + hybrid-eligible different city", () => {
    expect(scoreLocation("Ankara", false, true, "İstanbul", "hybrid").score).toBe(70);
  });

  it("gives 40 for hybrid + not hybrid/remote-eligible", () => {
    expect(scoreLocation("İstanbul", false, false, "İstanbul", "hybrid").score).toBe(40);
  });

  it("is case-insensitive for city comparison", () => {
    expect(scoreLocation("istanbul", false, false, "İstanbul", "office").score).toBe(100);
  });
});

// ─── scoreEducation ───

describe("scoreEducation", () => {
  it("gives 75 when no requirement", () => {
    expect(scoreEducation("Lisans", null).score).toBe(75);
  });

  it("gives 25 when no candidate education", () => {
    expect(scoreEducation(null, "Lisans").score).toBe(25);
  });

  it("gives 100 when levels match", () => {
    expect(scoreEducation("Lisans", "Lisans").score).toBe(100);
  });

  it("gives 100 when candidate exceeds", () => {
    expect(scoreEducation("Yüksek Lisans", "Lisans").score).toBe(100);
    expect(scoreEducation("Doktora", "Lisans").score).toBe(100);
  });

  it("gives 60 when 1 level below", () => {
    expect(scoreEducation("Ön Lisans", "Lisans").score).toBe(60);
  });

  it("gives 20 when significantly below", () => {
    expect(scoreEducation("Lise", "Yüksek Lisans").score).toBe(20);
  });

  it("handles compound education strings", () => {
    expect(scoreEducation("Lisans - Bilgisayar Mühendisliği", "Lisans").score).toBe(100);
  });

  it("handles unknown levels", () => {
    expect(scoreEducation("Sertifika", "Lisans").score).toBe(50);
  });

  it("gives 75 when both are null", () => {
    expect(scoreEducation(null, null).score).toBe(75);
  });
});

// ─── extractMatchJSON ───

describe("extractMatchJSON", () => {
  it("parses valid response from code fence", () => {
    const text = '```json\n{"results":[{"candidateId":"abc","skills":{"score":80,"explanation":"İyi"},"language":{"score":70,"explanation":"Uygun"},"sector":{"score":90,"explanation":"Çok iyi"}}]}\n```';
    const result = extractMatchJSON(text);
    expect(result).not.toBeNull();
    expect(result!.results).toHaveLength(1);
    expect(result!.results[0].skills.score).toBe(80);
    expect(result!.results[0].candidateId).toBe("abc");
  });

  it("parses valid response from plain JSON", () => {
    const text = '{"results":[{"candidateId":"xyz","skills":{"score":60,"explanation":"Orta"},"language":{"score":50,"explanation":"Eksik"},"sector":{"score":80,"explanation":"İyi"}}]}';
    const result = extractMatchJSON(text);
    expect(result).not.toBeNull();
    expect(result!.results[0].candidateId).toBe("xyz");
  });

  it("returns null for invalid JSON", () => {
    expect(extractMatchJSON("Bu JSON değil")).toBeNull();
  });

  it("returns null for wrong structure", () => {
    expect(extractMatchJSON('{"wrong": "structure"}')).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractMatchJSON("")).toBeNull();
  });

  it("handles multiple candidates", () => {
    const data = {
      results: [
        { candidateId: "a", skills: { score: 80, explanation: "İyi" }, language: { score: 70, explanation: "Ok" }, sector: { score: 90, explanation: "Harika" } },
        { candidateId: "b", skills: { score: 60, explanation: "Orta" }, language: { score: 50, explanation: "Eksik" }, sector: { score: 40, explanation: "Zayıf" } },
      ],
    };
    const result = extractMatchJSON(JSON.stringify(data));
    expect(result).not.toBeNull();
    expect(result!.results).toHaveLength(2);
  });

  it("rejects scores out of range", () => {
    const data = {
      results: [
        { candidateId: "a", skills: { score: 150, explanation: "Çok yüksek" }, language: { score: 70, explanation: "Ok" }, sector: { score: 90, explanation: "İyi" } },
      ],
    };
    expect(extractMatchJSON(JSON.stringify(data))).toBeNull();
  });
});

// ─── computeOverallScore ───

describe("computeOverallScore", () => {
  it("returns 100 when all categories are 100", () => {
    const categories = [
      { category: "experience", score: 100 },
      { category: "salary", score: 100 },
      { category: "location", score: 100 },
      { category: "education", score: 100 },
      { category: "skills", score: 100 },
      { category: "language", score: 100 },
      { category: "sector", score: 100 },
    ];
    expect(computeOverallScore(categories)).toBe(100);
  });

  it("returns 0 when all categories are 0", () => {
    const categories = [
      { category: "experience", score: 0 },
      { category: "salary", score: 0 },
      { category: "location", score: 0 },
      { category: "education", score: 0 },
      { category: "skills", score: 0 },
      { category: "language", score: 0 },
      { category: "sector", score: 0 },
    ];
    expect(computeOverallScore(categories)).toBe(0);
  });

  it("returns 0 for empty categories", () => {
    expect(computeOverallScore([])).toBe(0);
  });

  it("weights skills higher than location", () => {
    const highSkills = [
      { category: "skills", score: 100 },
      { category: "location", score: 0 },
    ];
    const highLocation = [
      { category: "skills", score: 0 },
      { category: "location", score: 100 },
    ];
    expect(computeOverallScore(highSkills)).toBeGreaterThan(computeOverallScore(highLocation));
  });

  it("weights sector higher than education", () => {
    const highSector = [
      { category: "sector", score: 100 },
      { category: "education", score: 0 },
    ];
    const highEducation = [
      { category: "sector", score: 0 },
      { category: "education", score: 100 },
    ];
    expect(computeOverallScore(highSector)).toBeGreaterThan(computeOverallScore(highEducation));
  });

  it("ignores unknown categories", () => {
    const categories = [
      { category: "unknown", score: 100 },
    ];
    expect(computeOverallScore(categories)).toBe(0);
  });

  it("computes correct weighted average", () => {
    // skills: 80 * 0.25 = 20, sector: 60 * 0.20 = 12 → total 32, weight 0.45 → 32/0.45 ≈ 71
    const categories = [
      { category: "skills", score: 80 },
      { category: "sector", score: 60 },
    ];
    const result = computeOverallScore(categories);
    expect(result).toBe(71); // (80*0.25 + 60*0.20) / (0.25+0.20) = 32/0.45 = 71.11 → 71
  });
});

// ─── MATCH_ANALYSIS_PROMPT ───

describe("MATCH_ANALYSIS_PROMPT", () => {
  it("is defined and non-empty", () => {
    expect(MATCH_ANALYSIS_PROMPT).toBeTruthy();
    expect(MATCH_ANALYSIS_PROMPT.length).toBeGreaterThan(100);
  });

  it("mentions 3 AI categories", () => {
    expect(MATCH_ANALYSIS_PROMPT).toContain("skills");
    expect(MATCH_ANALYSIS_PROMPT).toContain("language");
    expect(MATCH_ANALYSIS_PROMPT).toContain("sector");
  });

  it("instructs JSON-only response", () => {
    expect(MATCH_ANALYSIS_PROMPT).toContain("SADECE JSON");
  });

  it("includes scoring range", () => {
    expect(MATCH_ANALYSIS_PROMPT).toContain("0-100");
  });

  it("mentions Turkish language requirement", () => {
    expect(MATCH_ANALYSIS_PROMPT).toContain("Türkçe");
  });
});
