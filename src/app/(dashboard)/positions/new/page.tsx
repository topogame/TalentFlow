"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FirmOption = { id: string; name: string };

export default function NewPositionPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Yükleniyor...</div>}>
      <NewPositionForm />
    </Suspense>
  );
}

function NewPositionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFirmId = searchParams.get("firmId") || "";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [firms, setFirms] = useState<FirmOption[]>([]);

  useEffect(() => {
    fetch("/api/firms?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFirms(data.data);
      });
  }, []);

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      firmId: formData.get("firmId"),
      title: formData.get("title"),
      department: formData.get("department") || undefined,
      requiredExperienceYears: formData.get("requiredExperienceYears")
        ? Number(formData.get("requiredExperienceYears"))
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
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }
      router.push(`/positions/${data.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Yeni Pozisyon</h1>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pozisyon Bilgileri</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Firma *</label>
              <select name="firmId" required defaultValue={preselectedFirmId} className={inputClass}>
                <option value="">Firma seçin</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pozisyon Başlığı *</label>
              <input name="title" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Departman</label>
              <input name="department" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Öncelik</label>
              <select name="priority" defaultValue="normal" className={inputClass}>
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gerekli Deneyim (Yıl)</label>
              <input name="requiredExperienceYears" type="number" min="0" max="50" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Çalışma Modeli</label>
              <select name="workModel" className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="office">Ofis</option>
                <option value="remote">Uzaktan</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şehir</label>
              <input name="city" type="text" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Maaş Aralığı</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum</label>
              <input name="salaryMin" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maksimum</label>
              <input name="salaryMax" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
              <select name="salaryCurrency" defaultValue="TRY" className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Detaylar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea name="description" rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gereksinimler</label>
              <textarea name="requirements" rows={4} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
