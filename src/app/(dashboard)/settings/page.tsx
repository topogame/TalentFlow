"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

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

const emptyForm: UserForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "consultant",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kullanıcı Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Sistem kullanıcılarını yönetin</p>
        </div>
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
          <table className="min-w-full divide-y divide-slate-100">
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
        )}
      </div>
    </div>
  );
}
