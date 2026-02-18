"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PIPELINE_STAGE_LABELS, MATCH_CATEGORY_LABELS } from "@/lib/constants";

type Process = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  createdAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    currentTitle: string | null;
  };
};

type Position = {
  id: string;
  title: string;
  department: string | null;
  status: string;
  priority: string;
  city: string | null;
  country: string | null;
  workModel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  minExperienceYears: number | null;
  description: string | null;
  requirements: string | null;
  requiredSkills: string | null;
  sectorPreference: string | null;
  educationRequirement: string | null;
  languageRequirement: string | null;
  firm: { id: string; name: string };
  createdBy: { firstName: string; lastName: string };
  processes: Process[];
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapalı",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  office: "Ofis",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

type MatchCategoryResult = {
  category: string;
  score: number;
  explanation: string;
};

type MatchCandidateResult = {
  candidateId: string;
  candidateName: string;
  currentTitle: string | null;
  currentSector: string | null;
  city: string | null;
  overallScore: number;
  categories: MatchCategoryResult[];
};

type MatchData = {
  positionId: string;
  candidates: MatchCandidateResult[];
  generatedAt: string;
  aiAvailable: boolean;
};

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

function getBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export default function PositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  // Match state
  const [matchResults, setMatchResults] = useState<MatchData | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [addingToProcess, setAddingToProcess] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    const res = await fetch(`/api/positions/${id}`);
    const data = await res.json();
    if (data.success) setPosition(data.data);
    else router.push("/positions");
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  async function runMatching() {
    setMatchLoading(true);
    setMatchError("");
    setMatchResults(null);
    try {
      const res = await fetch(`/api/positions/${id}/match-candidates`);
      const data = await res.json();
      if (!data.success) {
        setMatchError(data.error?.message || "Eşleştirme yapılamadı");
        return;
      }
      setMatchResults(data.data);
    } catch {
      setMatchError("Eşleştirme sırasında bir hata oluştu");
    } finally {
      setMatchLoading(false);
    }
  }

  async function addToProcess(candidateId: string) {
    if (!position) return;
    setAddingToProcess(candidateId);
    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          firmId: position.firm.id,
          positionId: position.id,
          stage: "pool",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error?.message || "Sürece eklenemedi");
        return;
      }
      // Remove from match results and refresh position
      if (matchResults) {
        setMatchResults({
          ...matchResults,
          candidates: matchResults.candidates.filter((c) => c.candidateId !== candidateId),
        });
      }
      fetchPosition();
    } catch {
      alert("Sürece ekleme sırasında bir hata oluştu");
    } finally {
      setAddingToProcess(null);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-soft text-lg text-slate-400">Yükleniyor...</div>
      </div>
    );
  if (!position) return null;

  const activeProcesses = position.processes.filter((p) => !p.closedAt);
  const closedProcesses = position.processes.filter((p) => p.closedAt);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/positions" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              Pozisyonlar
            </Link>
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{position.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <Link href={`/firms/${position.firm.id}`} className="text-indigo-600 transition-colors hover:text-indigo-700">
              {position.firm.name}
            </Link>
            {position.department ? ` · ${position.department}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/positions/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Düzenle
          </Link>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[position.status] || "bg-slate-100 text-slate-600"}`}
          >
            {STATUS_LABELS[position.status] || position.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <h3 className="font-semibold text-slate-900">Pozisyon Detayları</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Konum</dt>
              <dd className="text-slate-900">
                {[position.city, position.country].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Çalışma Modeli</dt>
              <dd className="text-slate-900">
                {position.workModel ? WORK_MODEL_LABELS[position.workModel] || position.workModel : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Gerekli Deneyim</dt>
              <dd className="text-slate-900">
                {position.minExperienceYears != null
                  ? `${position.minExperienceYears} yıl`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Maaş Aralığı</dt>
              <dd className="text-slate-900">
                {position.salaryMin || position.salaryMax
                  ? `${position.salaryMin?.toLocaleString("tr-TR") || "?"} - ${position.salaryMax?.toLocaleString("tr-TR") || "?"} ${position.salaryCurrency || "TRY"}`
                  : "—"}
              </dd>
            </div>
          </dl>

          {position.description && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Açıklama</h4>
              <p className="whitespace-pre-line text-sm text-slate-600">{position.description}</p>
            </div>
          )}
          {position.requirements && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Gereksinimler</h4>
              <p className="whitespace-pre-line text-sm text-slate-600">{position.requirements}</p>
            </div>
          )}
          {position.requiredSkills && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Gerekli Beceriler</h4>
              <p className="whitespace-pre-line text-sm text-slate-600">{position.requiredSkills}</p>
            </div>
          )}
          {(position.sectorPreference || position.educationRequirement || position.languageRequirement) && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <dl className="space-y-3 text-sm">
                {position.sectorPreference && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Sektör Tercihi</dt>
                    <dd className="text-slate-900">{position.sectorPreference}</dd>
                  </div>
                )}
                {position.educationRequirement && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Eğitim Gereksinimi</dt>
                    <dd className="text-slate-900">{position.educationRequirement}</dd>
                  </div>
                )}
                {position.languageRequirement && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Dil Gereksinimi</dt>
                    <dd className="text-slate-900">{position.languageRequirement}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            <h3 className="font-semibold text-slate-900">
              Süreçler ({position.processes.length})
            </h3>
          </div>

          {activeProcesses.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif</h4>
              <div className="space-y-2">
                {activeProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-indigo-50/50"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                      <p className="text-xs text-slate-500">{p.candidate.currentTitle || ""}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {closedProcesses.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tamamlanan</h4>
              <div className="space-y-2">
                {closedProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 opacity-60"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                    </div>
                    <span className="text-xs text-slate-500">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {position.processes.length === 0 && (
            <div className="py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Henüz süreç yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Önerilen Adaylar Section */}
      {position.status === "open" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <h3 className="font-semibold text-slate-900">Önerilen Adaylar</h3>
            </div>
            {!matchLoading && (
              <button
                onClick={runMatching}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                {matchResults ? "Yeniden Analiz Et" : "AI Eşleşme Analizi Yap"}
              </button>
            )}
          </div>

          {matchLoading && (
            <div className="flex items-center justify-center gap-3 py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
              <span className="text-sm text-slate-600">Adaylar analiz ediliyor...</span>
            </div>
          )}

          {matchError && (
            <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{matchError}</div>
          )}

          {matchResults && !matchLoading && (
            <>
              {!matchResults.aiAvailable && (
                <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  AI analizi yapılamadı, sadece kural tabanlı puanlama kullanıldı
                </div>
              )}

              {matchResults.candidates.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">Uygun aday bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchResults.candidates.map((candidate) => (
                    <div
                      key={candidate.candidateId}
                      className="rounded-lg border border-slate-100 transition-colors hover:border-slate-200"
                    >
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        onClick={() =>
                          setExpandedCandidate(
                            expandedCandidate === candidate.candidateId ? null : candidate.candidateId
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-3 py-1 text-sm font-bold ${getScoreColor(candidate.overallScore)}`}
                          >
                            {candidate.overallScore}
                          </span>
                          <div>
                            <Link
                              href={`/candidates/${candidate.candidateId}`}
                              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {candidate.candidateName}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {[candidate.currentTitle, candidate.currentSector, candidate.city]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToProcess(candidate.candidateId);
                            }}
                            disabled={addingToProcess === candidate.candidateId}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                          >
                            {addingToProcess === candidate.candidateId ? (
                              <div className="h-3 w-3 animate-spin rounded-full border border-indigo-300 border-t-indigo-600" />
                            ) : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            )}
                            Sürece Ekle
                          </button>
                          <svg
                            className={`h-4 w-4 text-slate-400 transition-transform ${expandedCandidate === candidate.candidateId ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>

                      {expandedCandidate === candidate.candidateId && (
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                          <div className="space-y-2.5">
                            {candidate.categories.map((cat) => (
                              <div key={cat.category} className="flex items-center gap-3">
                                <span className="w-28 text-xs font-medium text-slate-500">
                                  {MATCH_CATEGORY_LABELS[cat.category] || cat.category}
                                </span>
                                <div className="flex flex-1 items-center gap-2">
                                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                                    <div
                                      className={`h-2 rounded-full ${getBarColor(cat.score)}`}
                                      style={{ width: `${cat.score}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-xs font-semibold text-slate-700">
                                    {cat.score}
                                  </span>
                                </div>
                                <span className="w-48 truncate text-xs text-slate-500" title={cat.explanation}>
                                  {cat.explanation}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!matchResults && !matchLoading && !matchError && (
            <p className="py-4 text-center text-sm text-slate-500">
              AI ile adayları analiz etmek için yukarıdaki butona tıklayın
            </p>
          )}
        </div>
      )}
    </div>
  );
}
