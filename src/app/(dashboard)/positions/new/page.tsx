"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobPostingPaste from "@/components/job-posting-paste";
import type { JobPostingParseResult } from "@/lib/ai";

type FirmOption = { id: string; name: string };

export default function NewPositionPage() {
  return (
    <Suspense fallback={<div className="animate-pulse-soft text-center text-slate-400">Yükleniyor...</div>}>
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
  const [aiParsed, setAiParsed] = useState(false);

  // Controlled fields for AI pre-fill
  const [fields, setFields] = useState({
    firmId: preselectedFirmId,
    title: "",
    department: "",
    priority: "normal",
    minExperienceYears: "",
    workModel: "",
    city: "",
    sectorPreference: "",
    educationRequirement: "",
    languageRequirement: "",
    requiredSkills: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "TRY",
    description: "",
    requirements: "",
  });

  function updateField(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleJobParsed(data: JobPostingParseResult) {
    setFields((prev) => ({
      ...prev,
      title: data.title || prev.title,
      department: data.department || prev.department,
      minExperienceYears: data.minExperienceYears != null ? String(data.minExperienceYears) : prev.minExperienceYears,
      workModel: data.workModel || prev.workModel,
      city: data.city || prev.city,
      sectorPreference: data.sectorPreference || prev.sectorPreference,
      educationRequirement: data.educationRequirement || prev.educationRequirement,
      languageRequirement: data.languageRequirement || prev.languageRequirement,
      requiredSkills: data.requiredSkills || prev.requiredSkills,
      salaryMin: data.salaryMin != null ? String(data.salaryMin) : prev.salaryMin,
      salaryMax: data.salaryMax != null ? String(data.salaryMax) : prev.salaryMax,
      salaryCurrency: data.salaryCurrency || prev.salaryCurrency,
      description: data.description || prev.description,
      requirements: data.requirements || prev.requirements,
    }));
    setAiParsed(true);
  }

  useEffect(() => {
    fetch("/api/firms?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFirms(data.data);
      });
  }, []);

  // Sync firmId when preselectedFirmId is available after initial render
  useEffect(() => {
    if (preselectedFirmId) {
      setFields((prev) => ({ ...prev, firmId: preselectedFirmId }));
    }
  }, [preselectedFirmId]);

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      firmId: fields.firmId,
      title: fields.title,
      department: fields.department || undefined,
      minExperienceYears: fields.minExperienceYears ? Number(fields.minExperienceYears) : undefined,
      salaryMin: fields.salaryMin ? Number(fields.salaryMin) : undefined,
      salaryMax: fields.salaryMax ? Number(fields.salaryMax) : undefined,
      salaryCurrency: fields.salaryCurrency || undefined,
      workModel: fields.workModel || undefined,
      city: fields.city || undefined,
      country: undefined,
      description: fields.description || undefined,
      requirements: fields.requirements || undefined,
      requiredSkills: fields.requiredSkills || undefined,
      sectorPreference: fields.sectorPreference || undefined,
      educationRequirement: fields.educationRequirement || undefined,
      languageRequirement: fields.languageRequirement || undefined,
      priority: fields.priority || "normal",
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Pozisyon</h1>
        <p className="mt-1 text-sm text-slate-500">Firmaya yeni bir açık pozisyon ekleyin</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      {/* AI Quick-Fill */}
      <div className="mb-6">
        <JobPostingPaste onParsed={handleJobParsed} disabled={saving} />
      </div>

      {aiParsed && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
          AI tarafından doldurulan alanları kontrol edin ve gerekirse düzeltin
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <select name="firmId" required value={fields.firmId} onChange={(e) => updateField("firmId", e.target.value)} className={inputClass}>
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
              <input name="title" type="text" required value={fields.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Departman</label>
              <input name="department" type="text" value={fields.department} onChange={(e) => updateField("department", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Öncelik</label>
              <select name="priority" value={fields.priority} onChange={(e) => updateField("priority", e.target.value)} className={inputClass}>
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gerekli Deneyim (Yıl)</label>
              <input name="minExperienceYears" type="number" min="0" max="50" value={fields.minExperienceYears} onChange={(e) => updateField("minExperienceYears", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Çalışma Modeli</label>
              <select name="workModel" value={fields.workModel} onChange={(e) => updateField("workModel", e.target.value)} className={inputClass}>
                <option value="">Seçiniz</option>
                <option value="office">Ofis</option>
                <option value="remote">Uzaktan</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Şehir</label>
              <input name="city" type="text" value={fields.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sektör Tercihi</label>
              <input name="sectorPreference" type="text" value={fields.sectorPreference} onChange={(e) => updateField("sectorPreference", e.target.value)} className={inputClass} placeholder="ör. Teknoloji, Finans" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Eğitim Gereksinimi</label>
              <input name="educationRequirement" type="text" value={fields.educationRequirement} onChange={(e) => updateField("educationRequirement", e.target.value)} className={inputClass} placeholder="ör. Lisans" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Dil Gereksinimi</label>
              <input name="languageRequirement" type="text" value={fields.languageRequirement} onChange={(e) => updateField("languageRequirement", e.target.value)} className={inputClass} placeholder="ör. İngilizce (İleri), Almanca (Orta)" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Gerekli Beceriler</label>
              <textarea name="requiredSkills" rows={3} value={fields.requiredSkills} onChange={(e) => updateField("requiredSkills", e.target.value)} className={inputClass} placeholder="ör. React, TypeScript, Node.js, SQL" />
            </div>
          </div>
        </div>

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
              <input name="salaryMin" type="number" min="0" value={fields.salaryMin} onChange={(e) => updateField("salaryMin", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Maksimum</label>
              <input name="salaryMax" type="number" min="0" value={fields.salaryMax} onChange={(e) => updateField("salaryMax", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
              <select name="salaryCurrency" value={fields.salaryCurrency} onChange={(e) => updateField("salaryCurrency", e.target.value)} className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

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
              <textarea name="description" rows={4} value={fields.description} onChange={(e) => updateField("description", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gereksinimler</label>
              <textarea name="requirements" rows={4} value={fields.requirements} onChange={(e) => updateField("requirements", e.target.value)} className={inputClass} />
            </div>
          </div>
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
