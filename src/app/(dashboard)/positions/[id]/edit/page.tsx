"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type FirmOption = { id: string; name: string };

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
  firm: { id: string; name: string };
};

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [firms, setFirms] = useState<FirmOption[]>([]);
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [posRes, firmsRes] = await Promise.all([
          fetch(`/api/positions/${id}`),
          fetch("/api/firms?limit=100"),
        ]);

        const posData = await posRes.json();
        const firmsData = await firmsRes.json();

        if (!posData.success) {
          setError(posData.error?.message || "Pozisyon bulunamadı");
          setLoading(false);
          return;
        }

        setPosition(posData.data);

        if (firmsData.success) {
          setFirms(firmsData.data);
        }
      } catch {
        setError("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      firmId: formData.get("firmId"),
      title: formData.get("title"),
      department: formData.get("department") || undefined,
      minExperienceYears: formData.get("minExperienceYears")
        ? Number(formData.get("minExperienceYears"))
        : undefined,
      salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : undefined,
      salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : undefined,
      salaryCurrency: formData.get("salaryCurrency") || undefined,
      workModel: formData.get("workModel") || undefined,
      city: formData.get("city") || undefined,
      country: formData.get("country") || undefined,
      description: formData.get("description") || undefined,
      requirements: formData.get("requirements") || undefined,
      priority: formData.get("priority") || "normal",
    };

    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }
      setSuccess("Pozisyon başarıyla güncellendi");
      setTimeout(() => {
        router.push(`/positions/${id}`);
      }, 1000);
    } catch {
      setError("Bir hata oluştu");
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
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error || "Pozisyon bulunamadı"}</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Pozisyon Düzenle</h1>
        <p className="mt-1 text-sm text-slate-500">Pozisyon bilgilerini güncelleyin</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1 - Pozisyon Bilgileri */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Pozisyon Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Firma *</label>
              <select name="firmId" required defaultValue={position.firm.id} className={inputClass}>
                <option value="">Firma seçin</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Pozisyon Başlığı *</label>
              <input name="title" type="text" required defaultValue={position.title} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Departman</label>
              <input name="department" type="text" defaultValue={position.department ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Öncelik</label>
              <select name="priority" defaultValue={position.priority} className={inputClass}>
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gerekli Deneyim (Yıl)</label>
              <input
                name="minExperienceYears"
                type="number"
                min="0"
                max="50"
                defaultValue={position.minExperienceYears ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Çalışma Modeli</label>
              <select name="workModel" defaultValue={position.workModel ?? ""} className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="office">Ofis</option>
                <option value="remote">Uzaktan</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <input name="city" type="text" defaultValue={position.city ?? ""} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Card 2 - Maaş Aralığı */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Maaş Aralığı</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Minimum</label>
              <input
                name="salaryMin"
                type="number"
                min="0"
                defaultValue={position.salaryMin ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Maksimum</label>
              <input
                name="salaryMax"
                type="number"
                min="0"
                defaultValue={position.salaryMax ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
              <select name="salaryCurrency" defaultValue={position.salaryCurrency ?? "TRY"} className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3 - Detaylar */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Detaylar</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Açıklama</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={position.description ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gereksinimler</label>
              <textarea
                name="requirements"
                rows={4}
                defaultValue={position.requirements ?? ""}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Güncelle"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/positions/${id}`)}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
