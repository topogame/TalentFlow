import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import {
  scoreExperience,
  scoreSalary,
  scoreLocation,
  scoreEducation,
  analyzeMatchWithAI,
  computeOverallScore,
  type CandidateMatchResult,
  type MatchCategory,
} from "@/lib/ai";
import { MAX_MATCH_CANDIDATES } from "@/lib/constants";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // 1. Fetch position with all matching-relevant fields
  const position = await prisma.position.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      department: true,
      status: true,
      firmId: true,
      minExperienceYears: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      city: true,
      country: true,
      workModel: true,
      educationRequirement: true,
      requiredSkills: true,
      languageRequirement: true,
      sectorPreference: true,
      processes: {
        where: { closedAt: null },
        select: { candidateId: true },
      },
    },
  });

  if (!position) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Pozisyon bulunamadı"), { status: 404 });
  }

  if (position.status !== "open") {
    return NextResponse.json(
      errorResponse("POSITION_CLOSED", "Sadece açık pozisyonlar için eşleştirme yapılabilir"),
      { status: 400 }
    );
  }

  // 2. Exclude candidates already in active processes for this position
  const excludedCandidateIds = position.processes.map((p) => p.candidateId);

  // 3. Fetch eligible candidates
  const candidates = await prisma.candidate.findMany({
    where: {
      status: "active",
      ...(excludedCandidateIds.length > 0 ? { id: { notIn: excludedCandidateIds } } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      currentTitle: true,
      currentSector: true,
      totalExperienceYears: true,
      salaryExpectation: true,
      salaryCurrency: true,
      city: true,
      country: true,
      isRemoteEligible: true,
      isHybridEligible: true,
      educationLevel: true,
      languages: { select: { language: true, level: true } },
    },
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      successResponse({
        positionId: id,
        candidates: [],
        generatedAt: new Date().toISOString(),
        aiAvailable: true,
      })
    );
  }

  // 4. Rule-based scoring for all candidates
  const posMinSalary = position.salaryMin ? Number(position.salaryMin) : null;
  const posMaxSalary = position.salaryMax ? Number(position.salaryMax) : null;

  const scoredCandidates = candidates.map((c) => {
    const exp = scoreExperience(c.totalExperienceYears, position.minExperienceYears);
    const sal = scoreSalary(
      c.salaryExpectation ? Number(c.salaryExpectation) : null,
      c.salaryCurrency,
      posMinSalary,
      posMaxSalary,
      position.salaryCurrency
    );
    const loc = scoreLocation(
      c.city, c.isRemoteEligible, c.isHybridEligible,
      position.city, position.workModel
    );
    const edu = scoreEducation(c.educationLevel, position.educationRequirement);

    // Normalize rule-based score (out of 40%) to 0-100 for sorting
    const ruleBasedScore =
      (exp.score * 0.12 + sal.score * 0.12 + loc.score * 0.08 + edu.score * 0.08) / 0.40;

    return {
      candidate: c,
      ruleScores: { experience: exp, salary: sal, location: loc, education: edu },
      ruleBasedScore,
    };
  });

  // 5. Sort by rule-based score, take top N for AI analysis
  scoredCandidates.sort((a, b) => b.ruleBasedScore - a.ruleBasedScore);
  const topCandidates = scoredCandidates.slice(0, MAX_MATCH_CANDIDATES);

  // 6. AI analysis for unstructured fields
  const aiResult = await analyzeMatchWithAI(
    {
      title: position.title,
      department: position.department,
      requiredSkills: position.requiredSkills,
      languageRequirement: position.languageRequirement,
      sectorPreference: position.sectorPreference,
      description: null,
    },
    topCandidates.map((sc) => ({
      id: sc.candidate.id,
      name: `${sc.candidate.firstName} ${sc.candidate.lastName}`,
      currentTitle: sc.candidate.currentTitle,
      currentSector: sc.candidate.currentSector,
      languages: sc.candidate.languages,
    }))
  );

  // 7. Build AI scores map with fallback
  const aiScoresMap = new Map<string, {
    skills: { score: number; explanation: string };
    language: { score: number; explanation: string };
    sector: { score: number; explanation: string };
  }>();

  if (aiResult.success) {
    for (const r of aiResult.data.results) {
      aiScoresMap.set(r.candidateId, {
        skills: r.skills,
        language: r.language,
        sector: r.sector,
      });
    }
  }

  const defaultAI = {
    skills: { score: 50, explanation: "AI analizi yapılamadı" },
    language: { score: 50, explanation: "AI analizi yapılamadı" },
    sector: { score: 50, explanation: "AI analizi yapılamadı" },
  };

  // 8. Combine scores and build final results
  const results: CandidateMatchResult[] = topCandidates.map((sc) => {
    const ai = aiScoresMap.get(sc.candidate.id) || defaultAI;

    const categories: MatchCategory[] = [
      { category: "experience", score: sc.ruleScores.experience.score, explanation: sc.ruleScores.experience.explanation },
      { category: "salary", score: sc.ruleScores.salary.score, explanation: sc.ruleScores.salary.explanation },
      { category: "location", score: sc.ruleScores.location.score, explanation: sc.ruleScores.location.explanation },
      { category: "education", score: sc.ruleScores.education.score, explanation: sc.ruleScores.education.explanation },
      { category: "skills", score: ai.skills.score, explanation: ai.skills.explanation },
      { category: "language", score: ai.language.score, explanation: ai.language.explanation },
      { category: "sector", score: ai.sector.score, explanation: ai.sector.explanation },
    ];

    return {
      candidateId: sc.candidate.id,
      candidateName: `${sc.candidate.firstName} ${sc.candidate.lastName}`,
      currentTitle: sc.candidate.currentTitle,
      currentSector: sc.candidate.currentSector,
      city: sc.candidate.city,
      overallScore: computeOverallScore(categories),
      categories,
    };
  });

  // 9. Sort by overall score descending
  results.sort((a, b) => b.overallScore - a.overallScore);

  return NextResponse.json(
    successResponse({
      positionId: id,
      candidates: results,
      generatedAt: new Date().toISOString(),
      aiAvailable: aiResult.success,
    })
  );
}
