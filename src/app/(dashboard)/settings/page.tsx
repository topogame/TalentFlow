"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_TYPE_LABELS, AUDIT_ENTITY_TYPES } from "@/lib/constants";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type UserForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "consultant";
};

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
};

type AuditFilters = {
  entityType: string;
  action: string;
  dateFrom: string;
  dateTo: string;
};

const emptyForm: UserForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "consultant",
};

const emptyFilters: AuditFilters = {
  entityType: "",
  action: "",
  dateFrom: "",
  dateTo: "",
};

type Tab = "users" | "audit";

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // ─── User Management State ───
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ─── Audit Log State ───
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditFilters, setAuditFilters] = useState<AuditFilters>(emptyFilters);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const auditLimit = 20;

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchAuditLogs = useCallback(async () => {
    if (!isAdmin) return;
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(auditPage));
      params.set("limit", String(auditLimit));
      if (auditFilters.entityType) params.set("entityType", auditFilters.entityType);
      if (auditFilters.action) params.set("action", auditFilters.action);
      if (auditFilters.dateFrom) params.set("dateFrom", new Date(auditFilters.dateFrom).toISOString());
      if (auditFilters.dateTo) {
        const endOfDay = new Date(auditFilters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        params.set("dateTo", endOfDay.toISOString());
      }

      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.data);
        setAuditTotal(data.pagination?.total || 0);
      }
    } finally {
      setAuditLoading(false);
    }
  }, [isAdmin, auditPage, auditFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">
            Sistem ayarlarını yalnızca admin kullanıcılar yönetebilir.
          </p>
        </div>
      </div>
    );
  }

  // ─── User Management Handlers ───

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(user: User) {
    setEditingId(user.id);
    setForm({
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "admin" | "consultant",
    });
    setShowForm(true);
    setError("");
  }

  async function handleToggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  // ─── Audit Log Handlers ───

  function handleAuditFilterChange(key: keyof AuditFilters, value: string) {
    setAuditFilters((prev) => ({ ...prev, [key]: value }));
    setAuditPage(1);
  }

  function handleClearAuditFilters() {
    setAuditFilters(emptyFilters);
    setAuditPage(1);
  }

  function getActionLabel(action: string): string {
    const parts = action.split(".");
    const actionKey = parts.length > 1 ? parts[1] : action;
    return AUDIT_ACTION_LABELS[actionKey] || action;
  }

  const totalAuditPages = Math.ceil(auditTotal / auditLimit);

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  const filterInputClass =
    "block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-slate-500">Sistem yönetimi ve denetim kayıtları</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Kullanıcı Yönetimi
          </span>
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "audit"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            Denetim Kayıtları
          </span>
        </button>
      </div>

      {/* ════════════════ Users Tab ════════════════ */}
      {activeTab === "users" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Kullanıcılar</h2>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setError(""); }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Yeni Kullanıcı
              </button>
            )}
          </div>

          {showForm && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
                </h2>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Ad</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Soyad</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">E-posta</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{editingId ? "Yeni Şifre (boş bırakılabilir)" : "Şifre"}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} minLength={8} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rol</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "consultant" })} className={inputClass}>
                    <option value="consultant">Danışman</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end gap-3 sm:col-span-2">
                  <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50">
                    {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
                  </button>
                  <button type="button" onClick={handleCancel} className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400"><div className="animate-pulse-soft text-lg">Yükleniyor...</div></div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">Henüz kullanıcı yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-[750px] divide-y divide-slate-100 md:min-w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kullanıcı</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">E-posta</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Son Giriş</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className={`transition-colors duration-150 ${!user.isActive ? "bg-slate-50/50 opacity-60" : "hover:bg-indigo-50/50"}`}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-violet-50 text-violet-700" : "bg-indigo-50 text-indigo-700"}`}>
                          {user.role === "admin" ? "Admin" : "Danışman"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {user.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button onClick={() => handleEdit(user)} className="mr-3 font-medium text-indigo-600 transition-colors hover:text-indigo-700">Düzenle</button>
                        {user.id !== session?.user?.id && (
                          <button onClick={() => handleToggleActive(user)} className={`font-medium transition-colors ${user.isActive ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"}`}>
                            {user.isActive ? "Devre Dışı" : "Aktifleştir"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ Audit Log Tab ════════════════ */}
      {activeTab === "audit" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Denetim Kayıtları</h2>
            <span className="text-sm text-slate-500">{auditTotal} kayıt</span>
          </div>

          {/* Filters */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Varlık Tipi</label>
                <select
                  value={auditFilters.entityType}
                  onChange={(e) => handleAuditFilterChange("entityType", e.target.value)}
                  className={filterInputClass}
                >
                  <option value="">Tümü</option>
                  {AUDIT_ENTITY_TYPES.map((t) => (
                    <option key={t} value={t}>{AUDIT_ENTITY_TYPE_LABELS[t] || t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">İşlem</label>
                <select
                  value={auditFilters.action}
                  onChange={(e) => handleAuditFilterChange("action", e.target.value)}
                  className={filterInputClass}
                >
                  <option value="">Tümü</option>
                  {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Başlangıç</label>
                <input
                  type="date"
                  value={auditFilters.dateFrom}
                  onChange={(e) => handleAuditFilterChange("dateFrom", e.target.value)}
                  className={filterInputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Bitiş</label>
                <input
                  type="date"
                  value={auditFilters.dateTo}
                  onChange={(e) => handleAuditFilterChange("dateTo", e.target.value)}
                  className={filterInputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleClearAuditFilters}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {auditLoading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="animate-pulse-soft text-lg">Yükleniyor...</div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">Denetim kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-[700px] divide-y divide-slate-100 md:min-w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="w-8 px-3 py-3.5"></th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tarih</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kullanıcı</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">İşlem</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Varlık Tipi</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Varlık ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <>
                      <tr
                        key={log.id}
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className={`cursor-pointer transition-colors duration-150 hover:bg-indigo-50/50 ${expandedLogId === log.id ? "bg-indigo-50/30" : ""}`}
                      >
                        <td className="px-3 py-3 text-center">
                          <svg
                            className={`h-4 w-4 text-slate-400 transition-transform ${expandedLogId === log.id ? "rotate-90" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {new Date(log.createdAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {log.user.firstName} {log.user.lastName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {AUDIT_ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-slate-400">
                          {log.entityId.slice(0, 8)}...
                        </td>
                      </tr>
                      {expandedLogId === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} className="bg-slate-50 px-6 py-4">
                            {log.changes ? (() => {
                              const ch = log.changes as { before?: unknown; after?: unknown };
                              return (
                                <div className="space-y-3">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Değişiklikler</p>
                                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    {ch.before ? (
                                      <div>
                                        <p className="mb-1 text-xs font-medium text-rose-600">Önceki</p>
                                        <pre className="overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200">
                                          {JSON.stringify(ch.before, null, 2)}
                                        </pre>
                                      </div>
                                    ) : null}
                                    {ch.after ? (
                                      <div>
                                        <p className="mb-1 text-xs font-medium text-emerald-600">Sonraki</p>
                                        <pre className="overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200">
                                          {JSON.stringify(ch.after, null, 2)}
                                        </pre>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })() : (
                              <p className="text-sm text-slate-400">Değişiklik detayı bulunmuyor</p>
                            )}
                            <div className="mt-3 text-xs text-slate-400">
                              <span className="font-medium">Tam ID:</span> {log.entityId}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalAuditPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Sayfa {auditPage} / {totalAuditPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                  disabled={auditPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                  disabled={auditPage === totalAuditPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
