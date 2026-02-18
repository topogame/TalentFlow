"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CVUpload from "@/components/cv-upload";
import type { CVParseResult } from "@/lib/ai";

type LanguageEntry = { language: string; level: string };

type FileInfo = {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export default function NewCandidatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [cvFileInfo, setCvFileInfo] = useState<FileInfo | null>(null);
  const [aiParsed, setAiParsed] = useState(false);

  // Controlled fields for AI pre-fill
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    currentTitle: "",
    currentSector: "",
    totalExperienceYears: "",
    educationLevel: "",
    universityName: "",
    universityDepartment: "",
    salaryExpectation: "",
    salaryCurrency: "TRY",
    salaryType: "",
    country: "Türkiye",
    city: "",
    isRemoteEligible: false,
    isHybridEligible: false,
  });

  function updateField(name: string, value: string | boolean) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleCVParsed(data: CVParseResult) {
    setFields((prev) => ({
      ...prev,
      firstName: data.firstName || prev.firstName,
      lastName: data.lastName || prev.lastName,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
      linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
      currentTitle: data.currentTitle || prev.currentTitle,
      currentSector: data.currentSector || prev.currentSector,
      totalExperienceYears: data.totalExperienceYears != null ? String(data.totalExperienceYears) : prev.totalExperienceYears,
      educationLevel: data.educationLevel || prev.educationLevel,
      universityName: data.universityName || prev.universityName,
      universityDepartment: data.universityDepartment || prev.universityDepartment,
      salaryExpectation: data.salaryExpectation != null ? String(data.salaryExpectation) : prev.salaryExpectation,
      salaryCurrency: data.salaryCurrency || prev.salaryCurrency,
      country: data.country || prev.country,
      city: data.city || prev.city,
    }));

    if (data.languages && data.languages.length > 0) {
      setLanguages(data.languages.map((l) => ({ language: l.language, level: l.level })));
    }

    setAiParsed(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body: Record<string, unknown> = {
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email || undefined,
      phone: fields.phone || undefined,
      linkedinUrl: fields.linkedinUrl || undefined,
      educationLevel: fields.educationLevel || undefined,
      universityName: fields.universityName || undefined,
      universityDepartment: fields.universityDepartment || undefined,
      totalExperienceYears: fields.totalExperienceYears ? Number(fields.totalExperienceYears) : undefined,
      currentSector: fields.currentSector || undefined,
      currentTitle: fields.currentTitle || undefined,
      salaryExpectation: fields.salaryExpectation ? Number(fields.salaryExpectation) : undefined,
      salaryCurrency: fields.salaryCurrency || undefined,
      salaryType: fields.salaryType || undefined,
      country: fields.country || undefined,
      city: fields.city || undefined,
      isRemoteEligible: fields.isRemoteEligible,
      isHybridEligible: fields.isHybridEligible,
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

      // If we have a CV file, save it as CandidateDocument
      if (cvFileInfo) {
        const docForm = new FormData();
        const blob = await fetch(cvFileInfo.url).then((r) => r.blob());
        docForm.append("file", blob, cvFileInfo.fileName);
        docForm.append("candidateId", data.data.id);
        await fetch("/api/documents/upload", { method: "POST", body: docForm }).catch(() => {});
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

      {/* CV Upload Section */}
      <div className="mb-6">
        <CVUpload
          onParsed={handleCVParsed}
          onFileUploaded={(f) => setCvFileInfo(f)}
          disabled={saving}
        />
      </div>

      {aiParsed && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
          AI tarafından doldurulan alanları kontrol edin ve gerekirse düzeltin
        </div>
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
              <input name="firstName" type="text" required value={fields.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Soyad *</label>
              <input name="lastName" type="text" required value={fields.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-posta</label>
              <input name="email" type="email" value={fields.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
              <input name="phone" type="text" value={fields.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
              <input name="linkedinUrl" type="url" value={fields.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} className={inputClass} />
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
              <input name="currentTitle" type="text" value={fields.currentTitle} onChange={(e) => updateField("currentTitle", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sektör</label>
              <input name="currentSector" type="text" value={fields.currentSector} onChange={(e) => updateField("currentSector", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Toplam Deneyim (Yıl)</label>
              <input name="totalExperienceYears" type="number" min="0" max="50" value={fields.totalExperienceYears} onChange={(e) => updateField("totalExperienceYears", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Eğitim Seviyesi</label>
              <select name="educationLevel" value={fields.educationLevel} onChange={(e) => updateField("educationLevel", e.target.value)} className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="Lise">Lise</option>
                <option value="Ön Lisans">Ön Lisans</option>
                <option value="Lisans">Lisans</option>
                <option value="Yüksek Lisans">Yüksek Lisans</option>
                <option value="Doktora">Doktora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Üniversite</label>
              <input name="universityName" type="text" value={fields.universityName} onChange={(e) => updateField("universityName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Bölüm</label>
              <input name="universityDepartment" type="text" value={fields.universityDepartment} onChange={(e) => updateField("universityDepartment", e.target.value)} className={inputClass} />
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
              <input name="salaryExpectation" type="number" min="0" value={fields.salaryExpectation} onChange={(e) => updateField("salaryExpectation", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
              <select name="salaryCurrency" value={fields.salaryCurrency} onChange={(e) => updateField("salaryCurrency", e.target.value)} className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Maaş Tipi</label>
              <select name="salaryType" value={fields.salaryType} onChange={(e) => updateField("salaryType", e.target.value)} className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="net">Net</option>
                <option value="gross">Brüt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ülke</label>
              <input name="country" type="text" value={fields.country} onChange={(e) => updateField("country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <input name="city" type="text" value={fields.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isRemoteEligible" type="checkbox" checked={fields.isRemoteEligible} onChange={(e) => updateField("isRemoteEligible", e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Uzaktan
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isHybridEligible" type="checkbox" checked={fields.isHybridEligible} onChange={(e) => updateField("isHybridEligible", e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
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
                <div key={i} className="grid grid-cols-[1fr_160px_36px] items-center gap-3">
                  <select
                    value={lang.language}
                    onChange={(e) => {
                      const updated = [...languages];
                      updated[i].language = e.target.value;
                      setLanguages(updated);
                    }}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Dil seçin</option>
                    <option value="İngilizce">İngilizce</option>
                    <option value="Almanca">Almanca</option>
                    <option value="Fransızca">Fransızca</option>
                    <option value="İspanyolca">İspanyolca</option>
                    <option value="Rusça">Rusça</option>
                    <option value="Arapça">Arapça</option>
                    <option value="Çince">Çince</option>
                    <option value="Japonca">Japonca</option>
                    <option value="Korece">Korece</option>
                    <option value="İtalyanca">İtalyanca</option>
                    <option value="Portekizce">Portekizce</option>
                    <option value="Hollandaca">Hollandaca</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                  <select
                    value={lang.level}
                    onChange={(e) => {
                      const updated = [...languages];
                      updated[i].level = e.target.value;
                      setLanguages(updated);
                    }}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
