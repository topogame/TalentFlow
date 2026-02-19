"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PIPELINE_STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import DocumentUpload from "@/components/document-upload";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  educationLevel: string | null;
  universityName: string | null;
  universityDepartment: string | null;
  totalExperienceYears: number | null;
  currentSector: string | null;
  currentTitle: string | null;
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  salaryType: string | null;
  country: string | null;
  city: string | null;
  isRemoteEligible: boolean;
  isHybridEligible: boolean;
  status: string;
  activeProcessCount: number;
  languages: { id: string; language: string; level: string }[];
  documents: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
};

type Note = {
  id: string;
  content: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
};

type ProcessItem = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  updatedAt: string;
  firm: { id: string; name: string };
  position: { id: string; title: string };
  assignedTo: { firstName: string; lastName: string } | null;
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("candidates");
  const tc = useTranslations("common");
  const tConst = useTranslations("constants");
  const locale = useLocale();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [sendingPortalAccess, setSendingPortalAccess] = useState(false);
  const [portalAccessMessage, setPortalAccessMessage] = useState("");
  const [portalAccessSuccess, setPortalAccessSuccess] = useState(false);

  const fetchCandidate = useCallback(async () => {
    const res = await fetch(`/api/candidates/${id}`);
    const data = await res.json();
    if (data.success) setCandidate(data.data);
    else router.push("/candidates");
    setLoading(false);
  }, [id, router]);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/candidates/${id}/notes`);
    const data = await res.json();
    if (data.success) setNotes(data.data);
  }, [id]);

  const fetchProcesses = useCallback(async () => {
    try {
      const res = await fetch(`/api/processes?candidateId=${id}&limit=50`);
      const data = await res.json();
      if (data.success) setProcesses(data.data);
    } catch {
      // silently ignore — processes tab will show empty state
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
    fetchNotes();
    fetchProcesses();
  }, [fetchCandidate, fetchNotes, fetchProcesses]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    await fetch(`/api/candidates/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote("");
    setSavingNote(false);
    fetchNotes();
  }

  async function handleSendPortalAccess() {
    if (!candidate?.email) return;
    setSendingPortalAccess(true);
    setPortalAccessMessage("");
    try {
      const res = await fetch("/api/candidate-portal/send-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setPortalAccessMessage(t("detail.portal.sent"));
        setPortalAccessSuccess(true);
      } else {
        setPortalAccessMessage(data.message || t("detail.portal.failed"));
        setPortalAccessSuccess(false);
      }
    } catch {
      setPortalAccessMessage(t("detail.portal.error"));
      setPortalAccessSuccess(false);
    } finally {
      setSendingPortalAccess(false);
      setTimeout(() => setPortalAccessMessage(""), 5000);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-soft text-lg text-slate-400">{tc("loading")}</div>
      </div>
    );
  if (!candidate) return null;

  const tabs = [
    { key: "summary", label: t("detail.tabs.summary") },
    { key: "processes", label: t("detail.tabs.processes", { count: processes.length }) },
    { key: "notes", label: t("detail.tabs.notes", { count: notes.length }) },
    { key: "documents", label: t("detail.tabs.documents", { count: candidate.documents.length }) },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/candidates" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              {t("detail.backToList")}
            </Link>
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-sm text-slate-500">
                {candidate.currentTitle || t("positionNotSpecified")}
                {candidate.currentSector ? ` · ${candidate.currentSector}` : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleSendPortalAccess}
              disabled={!candidate.email || sendingPortalAccess}
              title={!candidate.email ? t("candidateEmailRequired") : t("sendPortalAccessTooltip")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              {sendingPortalAccess ? t("detail.portal.sending") : t("sendPortalAccess")}
            </button>
            {portalAccessMessage && (
              <div className={`absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg ${
                portalAccessSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}>
                {portalAccessMessage}
              </div>
            )}
          </div>
          <Link
            href={`/candidates/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            {t("detail.edit")}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.contact")}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.email")}</dt>
                  <dd className="text-slate-900">{candidate.email || tc("noData")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.phone")}</dt>
                  <dd className="text-slate-900">{candidate.phone || tc("noData")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.linkedin")}</dt>
                  <dd>
                    {candidate.linkedinUrl ? (
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 transition-colors hover:text-indigo-700"
                      >
                        {t("detail.linkedinProfile")}
                      </a>
                    ) : (
                      tc("noData")
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.location")}</dt>
                  <dd className="text-slate-900">
                    {[candidate.city, candidate.country].filter(Boolean).join(", ") || tc("noData")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.workModel")}</dt>
                  <dd className="text-slate-900">
                    {[
                      candidate.isRemoteEligible && tc("remote"),
                      candidate.isHybridEligible && tc("hybrid"),
                    ]
                      .filter(Boolean)
                      .join(", ") || tc("office")}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.professional")}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.experience")}</dt>
                  <dd className="text-slate-900">
                    {candidate.totalExperienceYears != null
                      ? t("detail.yearsExp", { count: candidate.totalExperienceYears })
                      : tc("noData")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.education")}</dt>
                  <dd className="text-slate-900">{candidate.educationLevel || tc("noData")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.university")}</dt>
                  <dd className="text-slate-900">{candidate.universityName || tc("noData")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.department")}</dt>
                  <dd className="text-slate-900">{candidate.universityDepartment || tc("noData")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.salary")}</dt>
                  <dd className="text-slate-900">
                    {candidate.salaryExpectation
                      ? `${candidate.salaryExpectation.toLocaleString(locale)} ${candidate.salaryCurrency || "TRY"}${candidate.salaryType ? ` (${candidate.salaryType === "net" ? tc("net") : tc("gross")})` : ""}`
                      : tc("noData")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.activeProcesses")}</dt>
                  <dd>
                    {candidate.activeProcessCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        {candidate.activeProcessCount}
                      </span>
                    ) : (
                      <span className="text-slate-900">0</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {candidate.languages.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                  </svg>
                  <h3 className="font-semibold text-slate-900">{t("detail.languages")}</h3>
                </div>
                <div className="space-y-2">
                  {candidate.languages.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-900">{l.language}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {tConst(`languageLevels.${l.level}` as "languageLevels.beginner") || l.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.recordInfo")}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.createdBy")}</dt>
                  <dd className="text-slate-900">
                    {candidate.createdBy.firstName} {candidate.createdBy.lastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.createdDate")}</dt>
                  <dd className="text-slate-900">
                    {new Date(candidate.createdAt).toLocaleDateString(locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.lastUpdated")}</dt>
                  <dd className="text-slate-900">
                    {new Date(candidate.updatedAt).toLocaleDateString(locale)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "processes" && (
          <div>
            {processes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.processes.noProcesses")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {processes.map((proc) => (
                  <Link
                    key={proc.id}
                    href={`/processes/${proc.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {proc.position.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {proc.firm.name}
                        {proc.assignedTo
                          ? ` · ${t("detail.processes.assignedTo", { name: `${proc.assignedTo.firstName} ${proc.assignedTo.lastName}` })}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t("detail.processes.lastUpdate", { date: new Date(proc.updatedAt).toLocaleDateString(locale) })}
                        {proc.closedAt && ` · ${t("detail.processes.closedAt", { date: new Date(proc.closedAt).toLocaleDateString(locale) })}`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_COLORS[proc.stage] || "bg-slate-100 text-slate-700"}`}>
                      {PIPELINE_STAGE_LABELS[proc.stage] || proc.stage}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <form onSubmit={handleAddNote} className="mb-6 flex gap-3">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t("detail.notes.placeholder")}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={savingNote || !newNote.trim()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
              >
                {t("detail.notes.add")}
              </button>
            </form>

            {notes.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.notes.noNotes")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm text-slate-900">{note.content}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {note.createdBy.firstName} {note.createdBy.lastName} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            <DocumentUpload candidateId={candidate.id} onUploaded={fetchCandidate} />
            {candidate.documents.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.documents.noDocuments")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {candidate.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      {t("detail.documents.download")}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
