"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { EMAIL_TEMPLATE_CATEGORY_LABELS, EMAIL_DYNAMIC_FIELDS } from "@/lib/constants";

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
};

type EmailLog = {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  errorMessage: string | null;
  sentAt: string;
  candidate: { id: string; firstName: string; lastName: string };
  process: { id: string; position: { title: string }; firm: { name: string } } | null;
  template: { id: string; name: string } | null;
  sentBy: { firstName: string; lastName: string };
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

type CandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  currentTitle: string | null;
};

type ComposeTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
};

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "sent">("templates");

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesPagination, setTemplatesPagination] = useState<Pagination | null>(null);
  const [templatesPage, setTemplatesPage] = useState(1);
  const [templatesSearch, setTemplatesSearch] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Email logs state
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [emailsPagination, setEmailsPagination] = useState<Pagination | null>(null);
  const [emailsPage, setEmailsPage] = useState(1);
  const [loadingEmails, setLoadingEmails] = useState(true);

  // Template form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expanded email
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // ─── Compose Modal State ───
  const [showCompose, setShowCompose] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState<CandidateOption[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption | null>(null);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [composeTemplates, setComposeTemplates] = useState<ComposeTemplate[]>([]);
  const [loadingComposeTemplates, setLoadingComposeTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");
  const candidateSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const candidateDropdownRef = useRef<HTMLDivElement>(null);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const params = new URLSearchParams({ page: String(templatesPage), limit: "20" });
    if (templatesSearch) params.set("search", templatesSearch);
    const res = await fetch(`/api/email-templates?${params}`);
    const json = await res.json();
    if (json.success) {
      setTemplates(json.data);
      setTemplatesPagination(json.pagination);
    }
    setLoadingTemplates(false);
  }, [templatesPage, templatesSearch]);

  const fetchEmails = useCallback(async () => {
    setLoadingEmails(true);
    const params = new URLSearchParams({ page: String(emailsPage), limit: "20" });
    const res = await fetch(`/api/emails?${params}`);
    const json = await res.json();
    if (json.success) {
      setEmails(json.data);
      setEmailsPagination(json.pagination);
    }
    setLoadingEmails(false);
  }, [emailsPage]);

  useEffect(() => {
    if (activeTab === "templates") fetchTemplates();
  }, [activeTab, fetchTemplates]);

  useEffect(() => {
    if (activeTab === "sent") fetchEmails();
  }, [activeTab, fetchEmails]);

  // Close candidate dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        candidateDropdownRef.current &&
        !candidateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCandidateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch compose templates when modal opens
  useEffect(() => {
    if (showCompose) {
      setLoadingComposeTemplates(true);
      fetch("/api/email-templates?isActive=true&limit=50")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setComposeTemplates(json.data);
          }
        })
        .finally(() => setLoadingComposeTemplates(false));
    }
  }, [showCompose]);

  // Search candidates with debounce
  useEffect(() => {
    if (!candidateSearch.trim()) {
      setCandidateResults([]);
      setShowCandidateDropdown(false);
      return;
    }

    if (candidateSearchTimer.current) {
      clearTimeout(candidateSearchTimer.current);
    }

    candidateSearchTimer.current = setTimeout(async () => {
      setLoadingCandidates(true);
      try {
        const params = new URLSearchParams({
          search: candidateSearch.trim(),
          limit: "10",
        });
        const res = await fetch(`/api/candidates?${params}`);
        const json = await res.json();
        if (json.success) {
          setCandidateResults(json.data);
          setShowCandidateDropdown(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingCandidates(false);
      }
    }, 300);

    return () => {
      if (candidateSearchTimer.current) {
        clearTimeout(candidateSearchTimer.current);
      }
    };
  }, [candidateSearch]);

  function resetForm() {
    setForm({ name: "", subject: "", body: "", category: "" });
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  }

  function editTemplate(t: Template) {
    setForm({ name: t.name, subject: t.subject, body: t.body, category: t.category || "" });
    setEditingId(t.id);
    setShowForm(true);
    setFormError("");
  }

  async function handleSave() {
    setSaving(true);
    setFormError("");

    const url = editingId ? `/api/email-templates/${editingId}` : "/api/email-templates";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (!json.success) {
      const errMsg = typeof json.error === "string"
        ? json.error
        : json.error?.message || "Bir hata oluştu";
      setFormError(errMsg);
      setSaving(false);
      return;
    }

    resetForm();
    setSaving(false);
    fetchTemplates();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu şablonu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
    fetchTemplates();
  }

  function insertField(fieldKey: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setForm({ ...form, body: form.body + fieldKey });
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newBody = form.body.slice(0, start) + fieldKey + form.body.slice(end);
    setForm({ ...form, body: newBody });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + fieldKey.length, start + fieldKey.length);
    }, 0);
  }

  // ─── Compose helpers ───
  function openCompose() {
    setShowCompose(true);
    setCandidateSearch("");
    setCandidateResults([]);
    setSelectedCandidate(null);
    setSelectedTemplateId("");
    setComposeSubject("");
    setComposeBody("");
    setComposeError("");
    setComposeSuccess("");
    setSending(false);
    setShowCandidateDropdown(false);
  }

  function closeCompose() {
    setShowCompose(false);
    setComposeError("");
    setComposeSuccess("");
  }

  function selectCandidate(c: CandidateOption) {
    setSelectedCandidate(c);
    setCandidateSearch(`${c.firstName} ${c.lastName}`);
    setShowCandidateDropdown(false);

    // Re-apply template variables if a template was already selected
    if (selectedTemplateId) {
      const tpl = composeTemplates.find((t) => t.id === selectedTemplateId);
      if (tpl) {
        setComposeSubject(replaceTemplateVars(tpl.subject, c));
        setComposeBody(replaceTemplateVars(tpl.body, c));
      }
    }
  }

  function replaceTemplateVars(text: string, candidate: CandidateOption | null): string {
    if (!candidate) return text;
    return text
      .replace(/\{candidateName\}/g, `${candidate.firstName} ${candidate.lastName}`)
      .replace(/\{\{candidateName\}\}/g, `${candidate.firstName} ${candidate.lastName}`)
      .replace(/\{firstName\}/g, candidate.firstName)
      .replace(/\{\{firstName\}\}/g, candidate.firstName)
      .replace(/\{lastName\}/g, candidate.lastName)
      .replace(/\{\{lastName\}\}/g, candidate.lastName);
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setComposeSubject("");
      setComposeBody("");
      return;
    }
    const tpl = composeTemplates.find((t) => t.id === templateId);
    if (tpl) {
      setComposeSubject(replaceTemplateVars(tpl.subject, selectedCandidate));
      setComposeBody(replaceTemplateVars(tpl.body, selectedCandidate));
    }
  }

  async function handleSendEmail() {
    setComposeError("");
    setComposeSuccess("");

    if (!selectedCandidate) {
      setComposeError("Lütfen bir aday seçin.");
      return;
    }
    if (!selectedCandidate.email) {
      setComposeError("Seçilen adayın e-posta adresi bulunmuyor.");
      return;
    }
    if (!composeSubject.trim()) {
      setComposeError("Konu alanı boş bırakılamaz.");
      return;
    }
    if (!composeBody.trim()) {
      setComposeError("İçerik alanı boş bırakılamaz.");
      return;
    }

    setSending(true);

    try {
      const payload: Record<string, string> = {
        candidateId: selectedCandidate.id,
        toEmail: selectedCandidate.email,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
      };
      if (selectedTemplateId) {
        payload.templateId = selectedTemplateId;
      }

      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        const errMsg = typeof json.error === "string"
          ? json.error
          : json.error?.message || "E-posta gönderilemedi.";
        setComposeError(errMsg);
        setSending(false);
        return;
      }

      setComposeSuccess("E-posta başarıyla gönderildi!");
      // Refresh sent emails list if currently on that tab
      if (activeTab === "sent") {
        fetchEmails();
      }

      // Auto-close after 1.5s
      setTimeout(() => {
        closeCompose();
      }, 1500);
    } catch {
      setComposeError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  }

  const tabs = [
    { key: "templates" as const, label: "Şablonlar" },
    { key: "sent" as const, label: "Gönderilmiş" },
  ];

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-postalar</h1>
          <p className="mt-1 text-sm text-slate-500">E-posta şablonları ve gönderim geçmişi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCompose}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            Yeni E-posta
          </button>
          {activeTab === "templates" && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Yeni Şablon
            </button>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-slate-900">Yeni E-posta Gönder</h3>
              <button
                onClick={closeCompose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {composeError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{composeError}</div>
              )}
              {composeSuccess && (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{composeSuccess}</div>
              )}

              {/* Candidate Search */}
              <div ref={candidateDropdownRef} className="relative">
                <label className="block text-sm font-medium text-slate-700">Aday *</label>
                {selectedCandidate ? (
                  <div className="mt-1.5 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/50 px-4 py-2.5">
                    <div>
                      <span className="text-sm font-medium text-slate-900">
                        {selectedCandidate.firstName} {selectedCandidate.lastName}
                      </span>
                      {selectedCandidate.email && (
                        <span className="ml-2 text-sm text-slate-500">({selectedCandidate.email})</span>
                      )}
                      {selectedCandidate.currentTitle && (
                        <span className="ml-2 text-xs text-slate-400">- {selectedCandidate.currentTitle}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        setCandidateSearch("");
                        setCandidateResults([]);
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        className={inputClass}
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        onFocus={() => {
                          if (candidateResults.length > 0) setShowCandidateDropdown(true);
                        }}
                        placeholder="Aday adı veya e-posta ile arayın..."
                      />
                      {loadingCandidates && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
                          <svg className="h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {showCandidateDropdown && candidateResults.length > 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {candidateResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCandidate(c)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {c.firstName} {c.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {c.email || "E-posta yok"}
                                {c.currentTitle ? ` - ${c.currentTitle}` : ""}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showCandidateDropdown && candidateSearch.trim() && !loadingCandidates && candidateResults.length === 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white p-3 text-center shadow-lg">
                        <p className="text-sm text-slate-500">Sonuc bulunamadi.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Sablon</label>
                <select
                  className={inputClass}
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={loadingComposeTemplates}
                >
                  <option value="">
                    {loadingComposeTemplates ? "Yükleniyor..." : "Sablon seçin (isteğe bağlı)"}
                  </option>
                  {composeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.category
                        ? ` (${EMAIL_TEMPLATE_CATEGORY_LABELS[t.category] || t.category})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Konu *</label>
                <input
                  className={inputClass}
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="E-posta konusu"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Icerik *</label>
                <textarea
                  className={`${inputClass} min-h-[180px]`}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="E-posta içeriğini yazın..."
                />
              </div>

              {/* Recipient info */}
              {selectedCandidate && (
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alici</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedCandidate.firstName} {selectedCandidate.lastName}
                    {selectedCandidate.email ? (
                      <span className="ml-1 text-slate-500">&lt;{selectedCandidate.email}&gt;</span>
                    ) : (
                      <span className="ml-1 text-red-500">(E-posta adresi yok)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 rounded-b-xl">
              <button
                onClick={closeCompose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending || !!composeSuccess}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {sending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Template Form */}
      {showForm && activeTab === "templates" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            {editingId ? "Şablonu Düzenle" : "Yeni Şablon"}
          </h3>

          {formError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Şablon Adı *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mülakat daveti"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Seçiniz</option>
                {Object.entries(EMAIL_TEMPLATE_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Konu *</label>
            <input
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Mülakat daveti - {position}"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Dinamik Alanlar</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EMAIL_DYNAMIC_FIELDS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => insertField(f.key)}
                  className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  title={f.description}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">İçerik *</label>
            <textarea
              ref={textareaRef}
              className={`${inputClass} min-h-[160px]`}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Sayın {candidateName},&#10;&#10;{firmName} firmasında {position} pozisyonu için..."
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="mt-6">
          <div className="mb-4">
            <input
              className={inputClass}
              placeholder="Şablon ara..."
              value={templatesSearch}
              onChange={(e) => { setTemplatesSearch(e.target.value); setTemplatesPage(1); }}
            />
          </div>

          {loadingTemplates ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Henüz şablon yok</h3>
              <p className="mt-2 text-sm text-slate-500">İlk e-posta şablonunuzu oluşturun.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Konu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kullanım</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.category ? (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {EMAIL_TEMPLATE_CATEGORY_LABELS[t.category] || t.category}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-600">{t.subject}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{t.usageCount}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {t.isActive ? "Aktif" : "Deaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => editTemplate(t)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {templatesPagination && templatesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Toplam {templatesPagination.total} şablon
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={templatesPage <= 1}
                      onClick={() => setTemplatesPage((p) => p - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    <button
                      disabled={templatesPage >= templatesPagination.totalPages}
                      onClick={() => setTemplatesPage((p) => p + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sent Emails Tab */}
      {activeTab === "sent" && (
        <div className="mt-6">
          {loadingEmails ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Henüz e-posta yok</h3>
              <p className="mt-2 text-sm text-slate-500">Gönderilmiş e-postalar burada görünecek.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Alıcı</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Konu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aday</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gönderen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emails.map((e) => (
                    <Fragment key={e.id}>
                      <tr
                        onClick={() => setExpandedEmail(expandedEmail === e.id ? null : e.id)}
                        className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(e.sentAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{e.toEmail}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-900">{e.subject}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {e.candidate.firstName} {e.candidate.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            e.status === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}>
                            {e.status === "sent" ? "Gönderildi" : "Başarısız"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {e.sentBy.firstName} {e.sentBy.lastName}
                        </td>
                      </tr>
                      {expandedEmail === e.id && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 px-4 py-4">
                            <div className="rounded-lg bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                              {e.body}
                            </div>
                            {e.errorMessage && (
                              <p className="mt-2 text-sm text-red-600">Hata: {e.errorMessage}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>

              {emailsPagination && emailsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Toplam {emailsPagination.total} e-posta
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={emailsPage <= 1}
                      onClick={() => setEmailsPage((p) => p - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    <button
                      disabled={emailsPage >= emailsPagination.totalPages}
                      onClick={() => setEmailsPage((p) => p + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
