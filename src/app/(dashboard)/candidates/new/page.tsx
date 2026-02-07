"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LanguageEntry = { language: string; level: string };

export default function NewCandidatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      linkedinUrl: formData.get("linkedinUrl") || undefined,
      educationLevel: formData.get("educationLevel") || undefined,
      totalExperienceYears: formData.get("totalExperienceYears")
        ? Number(formData.get("totalExperienceYears"))
        : undefined,
      currentSector: formData.get("currentSector") || undefined,
      currentTitle: formData.get("currentTitle") || undefined,
      salaryExpectation: formData.get("salaryExpectation")
        ? Number(formData.get("salaryExpectation"))
        : undefined,
      salaryCurrency: formData.get("salaryCurrency") || undefined,
      salaryType: formData.get("salaryType") || undefined,
      country: formData.get("country") || undefined,
      city: formData.get("city") || undefined,
      isRemoteEligible: formData.get("isRemoteEligible") === "on",
      isHybridEligible: formData.get("isHybridEligible") === "on",
    };
    if (languages.length > 0) {
      body.languages = languages.filter((l) => l.language);
    }

    try {
      // Duplicate check first
      const dupRes = await fetch("/api/candidates/duplicate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: body.email,
          phone: body.phone,
          linkedinUrl: body.linkedinUrl,
          firstName: body.firstName,
          lastName: body.lastName,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.success && dupData.data.hasDuplicates) {
        const names = dupData.data.matches
          .map((m: { firstName: string; lastName: string; matchType: string }) =>
            `${m.firstName} ${m.lastName} (${m.matchType})`
          )
          .join(", ");
        if (!confirm(`Olası tekrar kayıt bulundu: ${names}\n\nYine de kaydetmek istiyor musunuz?`)) {
          setSaving(false);
          return;
        }
      }

      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }
      router.push(`/candidates/${data.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  function addLanguage() {
    setLanguages([...languages, { language: "", level: "intermediate" }]);
  }

  function removeLanguage(index: number) {
    setLanguages(languages.filter((_, i) => i !== index));
  }

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Yeni Aday</h1>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad *</label>
              <input name="firstName" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad *</label>
              <input name="lastName" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input name="email" type="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input name="phone" type="text" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input name="linkedinUrl" type="url" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Profesyonel Bilgiler */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profesyonel Bilgiler</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mevcut Pozisyon</label>
              <input name="currentTitle" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sektör</label>
              <input name="currentSector" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Toplam Deneyim (Yıl)</label>
              <input name="totalExperienceYears" type="number" min="0" max="50" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Eğitim Seviyesi</label>
              <input name="educationLevel" type="text" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Maaş & Konum */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Maaş ve Konum</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maaş Beklentisi</label>
              <input name="salaryExpectation" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
              <select name="salaryCurrency" defaultValue="TRY" className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maaş Tipi</label>
              <select name="salaryType" className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="net">Net</option>
                <option value="gross">Brüt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ülke</label>
              <input name="country" type="text" defaultValue="Türkiye" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şehir</label>
              <input name="city" type="text" className={inputClass} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input name="isRemoteEligible" type="checkbox" className="rounded" />
                Uzaktan
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="isHybridEligible" type="checkbox" className="rounded" />
                Hibrit
              </label>
            </div>
          </div>
        </div>

        {/* Yabancı Diller */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Yabancı Diller</h2>
            <button
              type="button"
              onClick={addLanguage}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Dil Ekle
            </button>
          </div>
          {languages.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz dil eklenmedi</p>
          ) : (
            <div className="space-y-2">
              {languages.map((lang, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => {
                      const updated = [...languages];
                      updated[i].language = e.target.value;
                      setLanguages(updated);
                    }}
                    placeholder="Dil adı"
                    className={inputClass + " flex-1"}
                  />
                  <select
                    value={lang.level}
                    onChange={(e) => {
                      const updated = [...languages];
                      updated[i].level = e.target.value;
                      setLanguages(updated);
                    }}
                    className={inputClass + " w-40"}
                  >
                    <option value="beginner">Başlangıç</option>
                    <option value="intermediate">Orta</option>
                    <option value="advanced">İleri</option>
                    <option value="native">Ana Dil</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguage(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
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
