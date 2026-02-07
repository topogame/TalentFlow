"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
      setFormError(json.error || "Bir hata oluştu");
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
                    <>
                      <tr
                        key={e.id}
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
                        <tr key={`${e.id}-body`}>
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
                    </>
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
