"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Firm = {
  id: string;
  name: string;
  sector: string | null;
  companySize: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
};

export default function EditFirmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  useEffect(() => {
    async function fetchFirm() {
      try {
        const res = await fetch(`/api/firms/${id}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message || "Firma bilgileri yüklenemedi");
          return;
        }
        setFirm(data.data);
      } catch {
        setError("Firma bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchFirm();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      sector: formData.get("sector") || undefined,
      companySize: formData.get("companySize") || undefined,
      city: formData.get("city") || undefined,
      country: formData.get("country") || undefined,
      website: formData.get("website") || undefined,
      notes: formData.get("notes") || undefined,
    };

    try {
      const res = await fetch(`/api/firms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }
      setSuccess("Firma başarıyla güncellendi");
      setTimeout(() => {
        router.push(`/firms/${id}`);
      }, 600);
    } catch {
      setError("Güncelleme sırasında bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-slate-500">Firma bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!firm && !loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-rose-600">{error || "Firma bulunamadı"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Firma Düzenle</h1>
        <p className="mt-1 text-sm text-slate-500">Firma bilgilerini güncelleyin</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Firma Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Firma Adı *</label>
              <input name="name" type="text" required defaultValue={firm?.name ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sektör</label>
              <input name="sector" type="text" defaultValue={firm?.sector ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Firma Büyüklüğü</label>
              <select name="companySize" defaultValue={firm?.companySize ?? ""} className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <input name="city" type="text" defaultValue={firm?.city ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ülke</label>
              <input name="country" type="text" defaultValue={firm?.country ?? "Türkiye"} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Website</label>
              <input name="website" type="url" defaultValue={firm?.website ?? ""} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Notlar</label>
              <textarea name="notes" rows={3} defaultValue={firm?.notes ?? ""} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Güncelleniyor..." : "Güncelle"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
