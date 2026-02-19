"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type CandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
  currentTitle: string | null;
  email: string | null;
};

type FirmOption = {
  id: string;
  name: string;
  sector: string | null;
};

type PositionOption = {
  id: string;
  title: string;
  department: string | null;
  status: string;
};

export default function NewProcessPage() {
  const tc = useTranslations("common");
  return (
    <Suspense fallback={<div className="animate-pulse text-center text-slate-400 py-12">{tc("loading")}</div>}>
      <NewProcessForm />
    </Suspense>
  );
}

function NewProcessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCandidateId = searchParams.get("candidateId");
  const t = useTranslations("processes");
  const tc = useTranslations("common");

  // Selected entities
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption | null>(null);
  const [selectedFirm, setSelectedFirm] = useState<FirmOption | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionOption | null>(null);
  const [fitnessScore, setFitnessScore] = useState<number | null>(null);

  // Search states
  const [candidateSearch, setCandidateSearch] = useState("");
  const [firmSearch, setFirmSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState<CandidateOption[]>([]);
  const [firmResults, setFirmResults] = useState<FirmOption[]>([]);
  const [positionResults, setPositionResults] = useState<PositionOption[]>([]);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showFirmDropdown, setShowFirmDropdown] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<{ code: string; message: string }[]>([]);

  // Refs for click outside
  const candidateRef = useRef<HTMLDivElement>(null);
  const firmRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const candidateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firmTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (candidateRef.current && !candidateRef.current.contains(e.target as Node)) {
        setShowCandidateDropdown(false);
      }
      if (firmRef.current && !firmRef.current.contains(e.target as Node)) {
        setShowFirmDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch pre-selected candidate from query param
  useEffect(() => {
    if (preselectedCandidateId && !selectedCandidate) {
      fetch(`/api/candidates/${preselectedCandidateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSelectedCandidate({
              id: data.data.id,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              currentTitle: data.data.currentTitle,
              email: data.data.email,
            });
          }
        })
        .catch(() => {});
    }
  }, [preselectedCandidateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search candidates
  const searchCandidates = useCallback(async (query: string) => {
    if (!query.trim()) { setCandidateResults([]); return; }
    const res = await fetch(`/api/candidates?search=${encodeURIComponent(query)}&limit=10&status=active`);
    const data = await res.json();
    if (data.success) setCandidateResults(data.data);
  }, []);

  // Search firms
  const searchFirms = useCallback(async (query: string) => {
    if (!query.trim()) { setFirmResults([]); return; }
    const res = await fetch(`/api/firms?search=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    if (data.success) setFirmResults(data.data);
  }, []);

  // Fetch positions for selected firm
  const fetchPositions = useCallback(async (firmId: string) => {
    const res = await fetch(`/api/positions?firmId=${firmId}&limit=50`);
    const data = await res.json();
    if (data.success) setPositionResults(data.data.filter((p: PositionOption) => p.status === "open"));
  }, []);

  function handleCandidateSearchChange(value: string) {
    setCandidateSearch(value);
    clearTimeout(candidateTimer.current);
    candidateTimer.current = setTimeout(() => searchCandidates(value), 300);
    setShowCandidateDropdown(true);
  }

  function handleFirmSearchChange(value: string) {
    setFirmSearch(value);
    clearTimeout(firmTimer.current);
    firmTimer.current = setTimeout(() => searchFirms(value), 300);
    setShowFirmDropdown(true);
  }

  function selectCandidate(c: CandidateOption) {
    setSelectedCandidate(c);
    setCandidateSearch("");
    setShowCandidateDropdown(false);
  }

  function selectFirm(f: FirmOption) {
    setSelectedFirm(f);
    setSelectedPosition(null);
    setFirmSearch("");
    setShowFirmDropdown(false);
    fetchPositions(f.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCandidate || !selectedFirm || !selectedPosition) return;

    setError("");
    setWarnings([]);
    setSaving(true);

    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          firmId: selectedFirm.id,
          positionId: selectedPosition.id,
          fitnessScore: fitnessScore || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || t("form.error"));
        return;
      }

      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }

      router.push(`/processes/${data.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("form.newTitle")}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{t("form.newDescription")}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600">{error}</div>
      )}

      {warnings.length > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 p-3.5 text-sm text-amber-700">
          {warnings.map((w, i) => (
            <p key={i}>{w.message}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("form.candidateSelection")}</h2>
          </div>

          {selectedCandidate ? (
            <>
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </p>
                    {selectedCandidate.currentTitle && (
                      <p className="text-xs text-slate-500">{selectedCandidate.currentTitle}</p>
                    )}
                  </div>
                </div>
                {!preselectedCandidateId && (
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {t("form.change")}
                  </button>
                )}
              </div>
              {preselectedCandidateId && (
                <p className="mt-2 text-xs text-indigo-600">
                  {t("form.candidatePreselected", {
                    name: `${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
                  })}
                </p>
              )}
            </>
          ) : (
            <div ref={candidateRef} className="relative">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => handleCandidateSearchChange(e.target.value)}
                  onFocus={() => candidateSearch && setShowCandidateDropdown(true)}
                  placeholder={t("form.searchCandidatePlaceholder")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {showCandidateDropdown && candidateResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {candidateResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCandidate(c)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-indigo-50/50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-slate-500">{c.currentTitle || c.email || "—"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Firm & Position Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("form.firmAndPosition")}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Firm search */}
            <div>
              <label className="block text-sm font-medium text-slate-700">{tc("firm")}</label>
              {selectedFirm ? (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{selectedFirm.name}</p>
                    {selectedFirm.sector && <p className="text-xs text-slate-500">{selectedFirm.sector}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFirm(null); setSelectedPosition(null); setPositionResults([]); }}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {t("form.change")}
                  </button>
                </div>
              ) : (
                <div ref={firmRef} className="relative">
                  <input
                    type="text"
                    value={firmSearch}
                    onChange={(e) => handleFirmSearchChange(e.target.value)}
                    onFocus={() => firmSearch && setShowFirmDropdown(true)}
                    placeholder={t("form.searchFirmPlaceholder")}
                    className={inputClass}
                  />
                  {showFirmDropdown && firmResults.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {firmResults.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => selectFirm(f)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50/50"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700">
                            {f.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{f.name}</p>
                            {f.sector && <p className="text-xs text-slate-500">{f.sector}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Position select */}
            <div>
              <label className="block text-sm font-medium text-slate-700">{tc("position")}</label>
              {!selectedFirm ? (
                <p className="mt-1.5 rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  {t("form.selectFirmFirst")}
                </p>
              ) : positionResults.length === 0 ? (
                <p className="mt-1.5 rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  {t("form.noOpenPositions")}
                </p>
              ) : (
                <select
                  value={selectedPosition?.id || ""}
                  onChange={(e) => {
                    const pos = positionResults.find((p) => p.id === e.target.value);
                    setSelectedPosition(pos || null);
                  }}
                  className={inputClass}
                  required
                >
                  <option value="">{t("form.selectPosition")}</option>
                  {positionResults.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}{p.department ? ` — ${p.department}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Fitness Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("form.fitnessAssessment")}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">{t("form.fitnessScoreOptional")}</label>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFitnessScore(fitnessScore === i ? null : i)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`h-8 w-8 ${
                      fitnessScore && i <= fitnessScore ? "text-amber-400" : "text-slate-200"
                    } transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {fitnessScore && (
                <span className="ml-2 text-sm text-slate-500">{fitnessScore}/5</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !selectedCandidate || !selectedFirm || !selectedPosition}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
          >
            {saving ? tc("saving") : t("form.startProcess")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {tc("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
