"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  STAGE_COLORS,
  INTERVIEW_TYPE_LABELS,
  MEETING_PROVIDER_LABELS,
  EMAIL_TEMPLATE_CATEGORY_LABELS,
} from "@/lib/constants";

type StageHistoryItem = {
  id: string;
  fromStage: string | null;
  toStage: string;
  note: string | null;
  createdAt: string;
  changedBy: { firstName: string; lastName: string };
};

type NoteItem = {
  id: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
};

type InterviewItem = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  meetingLink: string | null;
  meetingProvider: string | null;
  meetingId: string | null;
  location: string | null;
  clientParticipants: string | null;
  notes: string | null;
  resultNotes: string | null;
  isCompleted: boolean;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
};

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
};

type EmailLogItem = {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
  template: { id: string; name: string } | null;
  sentBy: { firstName: string; lastName: string };
};

type ProcessDetail = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  stageChangedAt: string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    currentTitle: string | null;
    email: string | null;
    phone: string | null;
  };
  firm: { id: string; name: string; sector: string | null };
  position: { id: string; title: string; department: string | null };
  assignedTo: { id: string; firstName: string; lastName: string };
  createdBy: { firstName: string; lastName: string };
  stageHistory: StageHistoryItem[];
  notes: NoteItem[];
  interviews: InterviewItem[];
};

export default function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("processes");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // Stage change
  const [newStage, setNewStage] = useState("");
  const [stageNote, setStageNote] = useState("");
  const [changingStage, setChangingStage] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Interview
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: "",
    type: "online" as string,
    durationMinutes: "60",
    meetingProvider: "" as string,
    meetingLink: "",
    location: "",
    clientParticipants: "",
    notes: "",
    sendInviteEmail: false,
  });
  const [savingInterview, setSavingInterview] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  // Email
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentMsg, setEmailSentMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Email history
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Interview edit
  const [editingInterview, setEditingInterview] = useState<InterviewItem | null>(null);
  const [editInterviewForm, setEditInterviewForm] = useState({
    scheduledAt: "", type: "online", durationMinutes: "60",
    meetingProvider: "", meetingLink: "", location: "", clientParticipants: "", notes: "",
  });
  const [updatingInterview, setUpdatingInterview] = useState(false);

  // Interview complete
  const [completingInterviewId, setCompletingInterviewId] = useState<string | null>(null);
  const [completeResultNotes, setCompleteResultNotes] = useState("");
  const [completingInterview, setCompletingInterview] = useState(false);

  // Interview delete
  const [deletingInterviewId, setDeletingInterviewId] = useState<string | null>(null);

  // Interview error
  const [interviewError, setInterviewError] = useState("");

  // Fitness score
  const [updatingScore, setUpdatingScore] = useState(false);

  const fetchProcess = useCallback(async () => {
    const res = await fetch(`/api/processes/${id}`);
    const data = await res.json();
    if (data.success) {
      setProcess(data.data);
      setNewStage(data.data.stage);
    } else {
      router.push("/processes");
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchProcess();
  }, [fetchProcess]);

  useEffect(() => {
    fetch("/api/meeting-providers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAvailableProviders(json.data);
      })
      .catch(() => {});
  }, []);

  async function handleStageChange() {
    if (!process || newStage === process.stage) return;

    const closingStages = ["positive", "negative"];
    if (closingStages.includes(newStage) && !showCloseConfirm) {
      setShowCloseConfirm(true);
      return;
    }

    setChangingStage(true);
    const res = await fetch(`/api/processes/${id}/stage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage, note: stageNote || undefined }),
    });
    const data = await res.json();
    if (data.success) {
      setShowCloseConfirm(false);
      setStageNote("");
      fetchProcess();
    }
    setChangingStage(false);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    await fetch(`/api/processes/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote("");
    setSavingNote(false);
    fetchProcess();
  }

  async function handleAddInterview(e: React.FormEvent) {
    e.preventDefault();
    setSavingInterview(true);
    setInterviewError("");
    const res = await fetch(`/api/processes/${id}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledAt: interviewForm.scheduledAt,
        type: interviewForm.type,
        durationMinutes: Number(interviewForm.durationMinutes),
        meetingProvider: interviewForm.meetingProvider || undefined,
        meetingLink: interviewForm.meetingLink || undefined,
        location: interviewForm.location || undefined,
        clientParticipants: interviewForm.clientParticipants || undefined,
        notes: interviewForm.notes || undefined,
        sendInviteEmail: interviewForm.sendInviteEmail,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setShowInterviewForm(false);
      setInterviewForm({ scheduledAt: "", type: "online", durationMinutes: "60", meetingProvider: "", meetingLink: "", location: "", clientParticipants: "", notes: "", sendInviteEmail: false });
      setInterviewError("");
      fetchProcess();
    } else {
      setInterviewError(data.error?.message || t("detail.interviews.createFailed"));
    }
    setSavingInterview(false);
  }

  function handleEditInterview(interview: InterviewItem) {
    setEditingInterview(interview);
    setEditInterviewForm({
      scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
      type: interview.type,
      durationMinutes: String(interview.durationMinutes),
      meetingProvider: interview.meetingProvider || "",
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      clientParticipants: interview.clientParticipants || "",
      notes: interview.notes || "",
    });
  }

  async function handleUpdateInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!editingInterview) return;
    setUpdatingInterview(true);
    const res = await fetch(`/api/processes/${id}/interviews/${editingInterview.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledAt: editInterviewForm.scheduledAt,
        type: editInterviewForm.type,
        durationMinutes: Number(editInterviewForm.durationMinutes),
        meetingLink: editInterviewForm.meetingLink || undefined,
        location: editInterviewForm.location || undefined,
        clientParticipants: editInterviewForm.clientParticipants || undefined,
        notes: editInterviewForm.notes || undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingInterview(null);
      fetchProcess();
    }
    setUpdatingInterview(false);
  }

  async function handleCompleteInterview(interviewId: string) {
    setCompletingInterview(true);
    const res = await fetch(`/api/processes/${id}/interviews/${interviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isCompleted: true,
        resultNotes: completeResultNotes || undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setCompletingInterviewId(null);
      setCompleteResultNotes("");
      fetchProcess();
    }
    setCompletingInterview(false);
  }

  async function handleDeleteInterview(interviewId: string) {
    if (!window.confirm(t("detail.interviews.deleteConfirm"))) return;
    setDeletingInterviewId(interviewId);
    const res = await fetch(`/api/processes/${id}/interviews/${interviewId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      fetchProcess();
    }
    setDeletingInterviewId(null);
  }

  async function handleFitnessScoreUpdate(score: number) {
    setUpdatingScore(true);
    const res = await fetch(`/api/processes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fitnessScore: score }),
    });
    const data = await res.json();
    if (data.success) {
      fetchProcess();
    }
    setUpdatingScore(false);
  }

  async function openEmailPanel() {
    setShowEmailPanel(true);
    setEmailSentMsg(null);
    setEmailTo(process?.candidate?.email || "");
    setEmailSubject("");
    setEmailBody("");
    setSelectedTemplateId("");
    // Fetch active templates
    const res = await fetch("/api/email-templates?limit=100&isActive=true");
    const json = await res.json();
    if (json.success) setEmailTemplates(json.data);
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = emailTemplates.find((tmpl) => tmpl.id === templateId);
    if (!tpl || !process) return;

    // Replace dynamic fields
    let subject = tpl.subject;
    let body = tpl.body;
    const replacements: Record<string, string> = {
      "{candidateName}": `${process.candidate.firstName} ${process.candidate.lastName}`,
      "{firmName}": process.firm.name,
      "{position}": process.position.title,
    };
    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replaceAll(key, value);
      body = body.replaceAll(key, value);
    }
    setEmailSubject(subject);
    setEmailBody(body);
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!process) return;
    setSendingEmail(true);
    setEmailSentMsg(null);
    const res = await fetch("/api/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: process.candidate.id,
        processId: process.id,
        templateId: selectedTemplateId || undefined,
        toEmail: emailTo,
        subject: emailSubject,
        body: emailBody,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setEmailSentMsg({ ok: true, text: t("detail.emailSent") });
      setShowEmailPanel(false);
      if (activeTab === "emails") fetchEmailLogs();
    } else {
      setEmailSentMsg({ ok: false, text: json.error?.message || t("detail.emailFailed") });
    }
    setSendingEmail(false);
  }

  const fetchEmailLogs = useCallback(async () => {
    if (!id) return;
    setEmailLogsLoading(true);
    const res = await fetch(`/api/emails?processId=${id}&limit=50`);
    const json = await res.json();
    if (json.success) setEmailLogs(json.data);
    setEmailLogsLoading(false);
  }, [id]);

  useEffect(() => {
    if (activeTab === "emails") fetchEmailLogs();
  }, [activeTab, fetchEmailLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-soft text-lg text-slate-400">{tc("loading")}</div>
      </div>
    );
  }

  if (!process) return null;

  const isClosed = !!process.closedAt;
  const tabs = [
    { key: "summary", label: t("detail.tabs.summary") },
    { key: "timeline", label: t("detail.tabs.timeline") },
    { key: "interviews", label: `${t("detail.tabs.interviews")} (${process.interviews.length})` },
    { key: "notes", label: `${t("detail.tabs.notes")} (${process.notes.length})` },
    { key: "emails", label: t("detail.tabs.emails") },
  ];

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/processes" className="transition-colors hover:text-indigo-600">{t("detail.backToList")}</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-slate-900">
          {process.candidate.firstName} {process.candidate.lastName} — {process.position.title}
        </span>
      </nav>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {process.candidate.firstName[0]}{process.candidate.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {process.candidate.firstName} {process.candidate.lastName}
              </h1>
              <p className="text-sm text-slate-500">
                {process.position.title} · {process.firm.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${STAGE_COLORS[process.stage] || "bg-slate-100 text-slate-700"}`}>
              {PIPELINE_STAGE_LABELS[process.stage] || process.stage}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  disabled={updatingScore}
                  onClick={() => handleFitnessScoreUpdate(i)}
                  className="transition-colors hover:scale-110 disabled:opacity-50"
                  title={`${i} ${t("detail.score")}`}
                >
                  <svg className={`h-4 w-4 ${process.fitnessScore && i <= process.fitnessScore ? "text-amber-400" : "text-slate-200 hover:text-amber-300"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {isClosed && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {t("detail.closed")}
              </span>
            )}
            <button
              onClick={openEmailPanel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              {t("detail.sendEmail")}
            </button>
          </div>
        </div>

        {/* Stage Change Controls */}
        {!isClosed && (
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>{PIPELINE_STAGE_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleStageChange}
              disabled={changingStage || newStage === process.stage}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {changingStage ? t("detail.changingStage") : t("detail.changeStage")}
            </button>
          </div>
        )}

        {/* Close Confirmation Modal */}
        {showCloseConfirm && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-800">{t("detail.closeProcess")}</h3>
            <p className="mt-1 text-sm text-amber-700">
              {t("detail.closeConfirmMsg", { stage: PIPELINE_STAGE_LABELS[newStage] })}
            </p>
            <textarea
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              placeholder={t("detail.closeNotePlaceholder")}
              rows={2}
              className="mt-3 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleStageChange}
                disabled={changingStage}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {changingStage ? t("detail.closing") : t("detail.confirm")}
              </button>
              <button
                onClick={() => { setShowCloseConfirm(false); setNewStage(process.stage); setStageNote(""); }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Email Sent Message */}
        {emailSentMsg && (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-medium ${
            emailSentMsg.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}>
            {emailSentMsg.text}
          </div>
        )}

        {/* Email Send Panel */}
        {showEmailPanel && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{t("detail.sendEmail")}</h3>
              <button
                onClick={() => setShowEmailPanel(false)}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t("detail.selectTemplate")}</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("detail.selectTemplatePlaceholder")}</option>
                  {emailTemplates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} {tmpl.category ? `(${EMAIL_TEMPLATE_CATEGORY_LABELS[tmpl.category] || tmpl.category})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{tc("recipient")}</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  required
                  placeholder="ornek@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{tc("subject")}</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  placeholder={t("detail.emailSubjectPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{tc("content")}</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                  rows={6}
                  placeholder={t("detail.emailBodyPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sendingEmail ? tc("sending") : tc("send")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPanel(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  {tc("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tabs */}
      <nav className="mt-6 flex gap-6 border-b border-slate-200">
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

      {/* Tab Content */}
      <div className="mt-6">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Candidate Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.candidateInfo")}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.fullName")}</dt>
                  <dd className="font-medium text-slate-900">
                    <Link href={`/candidates/${process.candidate.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {process.candidate.firstName} {process.candidate.lastName}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("detail.currentTitle")}</dt>
                  <dd className="text-slate-900">{process.candidate.currentTitle || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{tc("email")}</dt>
                  <dd className="text-slate-900">{process.candidate.email || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">{tc("phone")}</dt>
                  <dd className="text-slate-900">{process.candidate.phone || "—"}</dd>
                </div>
              </dl>
            </div>

            {/* Position Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.positionInfo")}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">{tc("position")}</dt>
                  <dd className="font-medium text-slate-900">
                    <Link href={`/positions/${process.position.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {process.position.title}
                    </Link>
                  </dd>
                </div>
                {process.position.department && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">{t("detail.department")}</dt>
                    <dd className="text-slate-900">{process.position.department}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">{tc("firm")}</dt>
                  <dd className="font-medium text-slate-900">
                    <Link href={`/firms/${process.firm.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {process.firm.name}
                    </Link>
                  </dd>
                </div>
                {process.firm.sector && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">{tc("sector")}</dt>
                    <dd className="text-slate-900">{process.firm.sector}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Process Metadata */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <h3 className="font-semibold text-slate-900">{t("detail.processInfo")}</h3>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">{t("detail.assignedTo")}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{process.assignedTo.firstName} {process.assignedTo.lastName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("detail.createdBy")}</dt>
                  <dd className="mt-1 text-slate-900">{process.createdBy.firstName} {process.createdBy.lastName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("detail.startDate")}</dt>
                  <dd className="mt-1 text-slate-900">{new Date(process.createdAt).toLocaleDateString(locale)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("detail.lastUpdate")}</dt>
                  <dd className="mt-1 text-slate-900">{new Date(process.updatedAt).toLocaleDateString(locale)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div>
            {process.stageHistory.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <p className="text-sm text-slate-500">{t("detail.timeline.noHistory")}</p>
              </div>
            ) : (
              <div className="space-y-0">
                {process.stageHistory.map((item, index) => (
                  <div key={item.id} className="relative flex gap-4 pb-8">
                    {/* Timeline line */}
                    {index < process.stageHistory.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-0.5 bg-slate-200" />
                    )}
                    {/* Dot */}
                    <div className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${STAGE_COLORS[item.toStage] || "bg-slate-100"}`}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-sm">
                        {item.fromStage ? (
                          <>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_COLORS[item.fromStage] || "bg-slate-100 text-slate-700"}`}>
                              {PIPELINE_STAGE_LABELS[item.fromStage] || item.fromStage}
                            </span>
                            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">{t("detail.timeline.start")}</span>
                        )}
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_COLORS[item.toStage] || "bg-slate-100 text-slate-700"}`}>
                          {PIPELINE_STAGE_LABELS[item.toStage] || item.toStage}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {item.changedBy.firstName} {item.changedBy.lastName} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString(locale, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === "interviews" && (
          <div>
            {!isClosed && (
              <div className="mb-6">
                {!showInterviewForm ? (
                  <button
                    onClick={() => setShowInterviewForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t("detail.interviews.schedule")}
                  </button>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">{t("detail.interviews.new")}</h3>
                    {interviewError && (
                      <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                        {interviewError}
                      </div>
                    )}
                    <form onSubmit={handleAddInterview} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.dateTime")}</label>
                        <input
                          type="datetime-local"
                          value={interviewForm.scheduledAt}
                          onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.type")}</label>
                        <select
                          value={interviewForm.type}
                          onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                          className={inputClass}
                        >
                          <option value="online">{INTERVIEW_TYPE_LABELS["online"]}</option>
                          <option value="face_to_face">{INTERVIEW_TYPE_LABELS["face_to_face"]}</option>
                          <option value="phone">{INTERVIEW_TYPE_LABELS["phone"]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.duration")}</label>
                        <input
                          type="number"
                          value={interviewForm.durationMinutes}
                          onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })}
                          min={15}
                          max={480}
                          className={inputClass}
                        />
                      </div>
                      {interviewForm.type === "online" && (
                        <>
                          {availableProviders.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.meetingCreation")}</label>
                              <select
                                value={interviewForm.meetingProvider}
                                onChange={(e) => setInterviewForm({
                                  ...interviewForm,
                                  meetingProvider: e.target.value,
                                  meetingLink: e.target.value ? "" : interviewForm.meetingLink,
                                })}
                                className={inputClass}
                              >
                                <option value="">{t("detail.interviews.manualLink")}</option>
                                {availableProviders.includes("zoom") && (
                                  <option value="zoom">{t("detail.interviews.createZoom")}</option>
                                )}
                                {availableProviders.includes("teams") && (
                                  <option value="teams">{t("detail.interviews.createTeams")}</option>
                                )}
                              </select>
                            </div>
                          )}
                          {!interviewForm.meetingProvider && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.meetingLink")}</label>
                              <input
                                type="url"
                                value={interviewForm.meetingLink}
                                onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                                placeholder="https://..."
                                required
                                className={inputClass}
                              />
                            </div>
                          )}
                          {interviewForm.meetingProvider && (
                            <div className={availableProviders.length > 0 ? "" : "sm:col-span-2"}>
                              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-6">
                                {interviewForm.meetingProvider === "zoom"
                                  ? t("detail.interviews.zoomAutoCreate")
                                  : t("detail.interviews.teamsAutoCreate")}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {interviewForm.type === "face_to_face" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{tc("location")}</label>
                          <input
                            type="text"
                            value={interviewForm.location}
                            onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                            placeholder={t("detail.interviews.addressPlaceholder")}
                            className={inputClass}
                          />
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.participants")}</label>
                        <input
                          type="text"
                          value={interviewForm.clientParticipants}
                          onChange={(e) => setInterviewForm({ ...interviewForm, clientParticipants: e.target.value })}
                          placeholder={t("detail.interviews.participantsPlaceholder")}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.notesLabel")}</label>
                        <textarea
                          value={interviewForm.notes}
                          onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                          rows={2}
                          placeholder={t("detail.interviews.notesPlaceholder")}
                          className={inputClass}
                        />
                      </div>
                      {process?.candidate?.email && (
                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={interviewForm.sendInviteEmail}
                              onChange={(e) => setInterviewForm({ ...interviewForm, sendInviteEmail: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {t("detail.interviews.sendInvite")}
                          </label>
                        </div>
                      )}
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <button
                          type="submit"
                          disabled={savingInterview}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {savingInterview ? tc("saving") : tc("save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInterviewForm(false)}
                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                        >
                          {tc("cancel")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {process.interviews.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.interviews.noInterviews")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {process.interviews.map((interview) => (
                  <div key={interview.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          interview.type === "online" ? "bg-blue-50 text-blue-700" :
                          interview.type === "face_to_face" ? "bg-purple-50 text-purple-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {INTERVIEW_TYPE_LABELS[interview.type] || interview.type}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(interview.scheduledAt).toLocaleDateString(locale, {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-xs text-slate-500">{interview.durationMinutes} {tc("minutes")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          interview.isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {interview.isCompleted ? tc("completed") : tc("scheduled")}
                        </span>
                        {!isClosed && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditInterview(interview)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                            >
                              {tc("edit")}
                            </button>
                            {!interview.isCompleted && (
                              <button
                                onClick={() => { setCompletingInterviewId(interview.id); setCompleteResultNotes(""); }}
                                className="rounded-lg border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                {t("detail.interviews.complete")}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInterview(interview.id)}
                              disabled={deletingInterviewId === interview.id}
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                            >
                              {deletingInterviewId === interview.id ? "..." : tc("delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {interview.meetingLink && (
                      <p className="mt-2 text-sm text-blue-600">
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {interview.meetingProvider
                            ? `${MEETING_PROVIDER_LABELS[interview.meetingProvider] || interview.meetingProvider} ${t("detail.interviews.meetingLink")}`
                            : t("detail.interviews.meetingLink")}
                        </a>
                      </p>
                    )}
                    {interview.location && (
                      <p className="mt-2 text-sm text-slate-600">{tc("location")}: {interview.location}</p>
                    )}
                    {interview.clientParticipants && (
                      <p className="mt-1 text-sm text-slate-500">{t("detail.interviews.participants")}: {interview.clientParticipants}</p>
                    )}
                    {interview.notes && (
                      <p className="mt-2 text-sm text-slate-600">{interview.notes}</p>
                    )}
                    {interview.resultNotes && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">{t("detail.interviews.result")}</p>
                        <p className="mt-1 text-sm text-slate-700">{interview.resultNotes}</p>
                      </div>
                    )}

                    {/* Complete Interview Inline Form */}
                    {completingInterviewId === interview.id && (
                      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">{t("detail.interviews.completeTitle")}</h4>
                        <textarea
                          value={completeResultNotes}
                          onChange={(e) => setCompleteResultNotes(e.target.value)}
                          placeholder={t("detail.interviews.resultPlaceholder")}
                          rows={2}
                          className={inputClass}
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleCompleteInterview(interview.id)}
                            disabled={completingInterview}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {completingInterview ? tc("saving") : t("detail.confirm")}
                          </button>
                          <button
                            onClick={() => { setCompletingInterviewId(null); setCompleteResultNotes(""); }}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            {tc("cancel")}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Edit Interview Inline Form */}
                    {editingInterview?.id === interview.id && (
                      <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-900">{t("detail.interviews.editTitle")}</h4>
                        <form onSubmit={handleUpdateInterview} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.dateTime")}</label>
                            <input
                              type="datetime-local"
                              value={editInterviewForm.scheduledAt}
                              onChange={(e) => setEditInterviewForm({ ...editInterviewForm, scheduledAt: e.target.value })}
                              required
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.type")}</label>
                            <select
                              value={editInterviewForm.type}
                              onChange={(e) => setEditInterviewForm({ ...editInterviewForm, type: e.target.value })}
                              className={inputClass}
                            >
                              <option value="online">{INTERVIEW_TYPE_LABELS["online"]}</option>
                              <option value="face_to_face">{INTERVIEW_TYPE_LABELS["face_to_face"]}</option>
                              <option value="phone">{INTERVIEW_TYPE_LABELS["phone"]}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.duration")}</label>
                            <input
                              type="number"
                              value={editInterviewForm.durationMinutes}
                              onChange={(e) => setEditInterviewForm({ ...editInterviewForm, durationMinutes: e.target.value })}
                              min={15}
                              max={480}
                              className={inputClass}
                            />
                          </div>
                          {editInterviewForm.type === "online" && (
                            <>
                              {availableProviders.length > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.meetingCreation")}</label>
                                  <select
                                    value={editInterviewForm.meetingProvider}
                                    onChange={(e) => setEditInterviewForm({
                                      ...editInterviewForm,
                                      meetingProvider: e.target.value,
                                      meetingLink: e.target.value ? "" : editInterviewForm.meetingLink,
                                    })}
                                    className={inputClass}
                                  >
                                    <option value="">{t("detail.interviews.manualLink")}</option>
                                    {availableProviders.includes("zoom") && (
                                      <option value="zoom">{t("detail.interviews.createZoom")}</option>
                                    )}
                                    {availableProviders.includes("teams") && (
                                      <option value="teams">{t("detail.interviews.createTeams")}</option>
                                    )}
                                  </select>
                                </div>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.meetingLink")}</label>
                                <input
                                  type="url"
                                  value={editInterviewForm.meetingLink}
                                  onChange={(e) => setEditInterviewForm({ ...editInterviewForm, meetingLink: e.target.value })}
                                  placeholder="https://..."
                                  className={inputClass}
                                />
                              </div>
                            </>
                          )}
                          {editInterviewForm.type === "face_to_face" && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700">{tc("location")}</label>
                              <input
                                type="text"
                                value={editInterviewForm.location}
                                onChange={(e) => setEditInterviewForm({ ...editInterviewForm, location: e.target.value })}
                                placeholder={t("detail.interviews.addressPlaceholder")}
                                className={inputClass}
                              />
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.participants")}</label>
                            <input
                              type="text"
                              value={editInterviewForm.clientParticipants}
                              onChange={(e) => setEditInterviewForm({ ...editInterviewForm, clientParticipants: e.target.value })}
                              placeholder={t("detail.interviews.participantsPlaceholder")}
                              className={inputClass}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">{t("detail.interviews.notesLabel")}</label>
                            <textarea
                              value={editInterviewForm.notes}
                              onChange={(e) => setEditInterviewForm({ ...editInterviewForm, notes: e.target.value })}
                              rows={2}
                              placeholder={t("detail.interviews.notesPlaceholder")}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex items-center gap-3 sm:col-span-2">
                            <button
                              type="submit"
                              disabled={updatingInterview}
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {updatingInterview ? t("detail.interviews.updating") : tc("update")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingInterview(null)}
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              {tc("cancel")}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div>
            {!isClosed && (
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
            )}

            {process.notes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.notes.noNotes")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {process.notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <div>
            {emailLogsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : emailLogs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">{t("detail.emails.noEmails")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emailLogs.map((email) => (
                  <div key={email.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <button
                      onClick={() => setExpandedEmailId(expandedEmailId === email.id ? null : email.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            email.status === "sent"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            {email.status === "sent" ? tc("sent") : tc("failed")}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{email.subject}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {email.toEmail} · {email.sentBy.firstName} {email.sentBy.lastName} ·{" "}
                          {new Date(email.sentAt).toLocaleDateString(locale, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {email.template && (
                            <span className="ml-1 text-indigo-500">· {email.template.name}</span>
                          )}
                        </p>
                      </div>
                      <svg className={`h-4 w-4 text-slate-400 transition-transform ${expandedEmailId === email.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedEmailId === email.id && (
                      <div className="border-t border-slate-100 p-4">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">{email.body}</div>
                        {email.errorMessage && (
                          <p className="mt-3 text-xs text-rose-600">{t("detail.emails.errorPrefix")}: {email.errorMessage}</p>
                        )}
                      </div>
                    )}
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
