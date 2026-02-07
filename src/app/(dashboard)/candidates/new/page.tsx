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
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Aday</h1>
        <p className="mt-1 text-sm text-slate-500">Aday havuzuna yeni bir kayıt ekleyin</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Kişisel Bilgiler</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ad *</label>
              <input name="firstName" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Soyad *</label>
              <input name="lastName" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-posta</label>
              <input name="email" type="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
              <input name="phone" type="text" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
              <input name="linkedinUrl" type="url" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Profesyonel Bilgiler */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Profesyonel Bilgiler</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Mevcut Pozisyon</label>
              <input name="currentTitle" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sektör</label>
              <input name="currentSector" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Toplam Deneyim (Yıl)</label>
              <input name="totalExperienceYears" type="number" min="0" max="50" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Eğitim Seviyesi</label>
              <input name="educationLevel" type="text" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Maaş & Konum */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Maaş ve Konum</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Maaş Beklentisi</label>
              <input name="salaryExpectation" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
              <select name="salaryCurrency" defaultValue="TRY" className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Maaş Tipi</label>
              <select name="salaryType" className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="net">Net</option>
                <option value="gross">Brüt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ülke</label>
              <input name="country" type="text" defaultValue="Türkiye" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <input name="city" type="text" className={inputClass} />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isRemoteEligible" type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Uzaktan
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isHybridEligible" type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Hibrit
              </label>
            </div>
          </div>
        </div>

        {/* Yabancı Diller */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Yabancı Diller</h2>
            </div>
            <button
              type="button"
              onClick={addLanguage}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Dil Ekle
            </button>
          </div>
          {languages.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz dil eklenmedi</p>
          ) : (
            <div className="space-y-3">
              {languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-3">
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
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
