"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

type LanguageEntry = { language: string; level: string };

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  educationLevel: string | null;
  universityName: string | null;
  universityDepartment: string | null;
  totalExperienceYears: number | null;
  currentSector: string | null;
  currentTitle: string | null;
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  salaryType: string | null;
  country: string | null;
  city: string | null;
  isRemoteEligible: boolean;
  isHybridEligible: boolean;
  status: string;
  languages: { id: string; language: string; level: string }[];
};

export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("candidates");
  const tc = useTranslations("common");
  const tConst = useTranslations("constants");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/candidates/${id}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message || t("form.loadError"));
          return;
        }
        setCandidate(data.data);
        if (data.data.languages && data.data.languages.length > 0) {
          setLanguages(
            data.data.languages.map((l: { language: string; level: string }) => ({
              language: l.language,
              level: l.level,
            }))
          );
        }
      } catch {
        setError(t("form.loadErrorGeneral"));
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [id, t]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      linkedinUrl: formData.get("linkedinUrl") || undefined,
      educationLevel: formData.get("educationLevel") || undefined,
      universityName: formData.get("universityName") || undefined,
      universityDepartment: formData.get("universityDepartment") || undefined,
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
      const res = await fetch(`/api/candidates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || t("form.error"));
        return;
      }
      setSuccess(t("form.updateSuccess"));
      setTimeout(() => {
        router.push(`/candidates/${id}`);
      }, 1000);
    } catch {
      setError(t("form.updateError"));
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">{t("form.loadingCandidate")}</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-rose-600">{error || t("form.notFound")}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {t("form.goBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t("form.editTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("form.editDescription")}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kisisel Bilgiler */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("form.personalInfo")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.firstName")} {t("form.required")}</label>
              <input name="firstName" type="text" required defaultValue={candidate.firstName} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.lastName")} {t("form.required")}</label>
              <input name="lastName" type="text" required defaultValue={candidate.lastName} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.email")}</label>
              <input name="email" type="email" defaultValue={candidate.email ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.phone")}</label>
              <input name="phone" type="text" defaultValue={candidate.phone ?? ""} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">{t("form.linkedinUrl")}</label>
              <input name="linkedinUrl" type="url" defaultValue={candidate.linkedinUrl ?? ""} className={inputClass} />
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
            <h2 className="text-lg font-semibold text-slate-900">{t("form.professionalInfo")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.currentPosition")}</label>
              <input name="currentTitle" type="text" defaultValue={candidate.currentTitle ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.sector")}</label>
              <input name="currentSector" type="text" defaultValue={candidate.currentSector ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.experienceYears")}</label>
              <input name="totalExperienceYears" type="number" min="0" max="50" defaultValue={candidate.totalExperienceYears ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.educationLevel")}</label>
              <select name="educationLevel" defaultValue={candidate.educationLevel ?? ""} className={inputClass}>
                <option value="">{t("form.selectOption")}</option>
                <option value="Lise">{t("form.educationOptionsAlt.highSchool")}</option>
                <option value="MYO">{t("form.educationOptionsAlt.myo")}</option>
                <option value="Üniversite">{t("form.educationOptionsAlt.university")}</option>
                <option value="Yüksek Lisans">{t("form.educationOptionsAlt.master")}</option>
                <option value="Doktora">{t("form.educationOptionsAlt.doctorate")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.university")}</label>
              <input name="universityName" type="text" defaultValue={candidate.universityName ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.department")}</label>
              <input name="universityDepartment" type="text" defaultValue={candidate.universityDepartment ?? ""} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Maas & Konum */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("form.salaryLocation")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.salaryExpectation")}</label>
              <input name="salaryExpectation" type="number" min="0" defaultValue={candidate.salaryExpectation ?? ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.currency")}</label>
              <select name="salaryCurrency" defaultValue={candidate.salaryCurrency ?? "TRY"} className={inputClass}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.salaryType")}</label>
              <select name="salaryType" defaultValue={candidate.salaryType ?? ""} className={inputClass}>
                <option value="">{t("form.selectOption")}</option>
                <option value="net">{t("form.salaryTypes.net")}</option>
                <option value="gross">{t("form.salaryTypes.gross")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.country")}</label>
              <input name="country" type="text" defaultValue={candidate.country ?? "Türkiye"} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.city")}</label>
              <input name="city" type="text" defaultValue={candidate.city ?? ""} className={inputClass} />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isRemoteEligible" type="checkbox" defaultChecked={candidate.isRemoteEligible} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {t("form.remote")}
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isHybridEligible" type="checkbox" defaultChecked={candidate.isHybridEligible} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {t("form.hybrid")}
              </label>
            </div>
          </div>
        </div>

        {/* Yabanci Diller */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("form.languages")}</h2>
            </div>
            <button
              type="button"
              onClick={addLanguage}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("form.addLanguage")}
            </button>
          </div>
          {languages.length === 0 ? (
            <p className="text-sm text-slate-500">{t("form.noLanguages")}</p>
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
                    <option value="">{t("form.selectLanguage")}</option>
                    <option value="İngilizce">{tConst("languageNames.english")}</option>
                    <option value="Almanca">{tConst("languageNames.german")}</option>
                    <option value="Fransızca">{tConst("languageNames.french")}</option>
                    <option value="İspanyolca">{tConst("languageNames.spanish")}</option>
                    <option value="Rusça">{tConst("languageNames.russian")}</option>
                    <option value="Arapça">{tConst("languageNames.arabic")}</option>
                    <option value="Çince">{tConst("languageNames.chinese")}</option>
                    <option value="Japonca">{tConst("languageNames.japanese")}</option>
                    <option value="Korece">{tConst("languageNames.korean")}</option>
                    <option value="İtalyanca">{tConst("languageNames.italian")}</option>
                    <option value="Portekizce">{tConst("languageNames.portuguese")}</option>
                    <option value="Hollandaca">{tConst("languageNames.dutch")}</option>
                    <option value="Diğer">{tConst("languageNames.other")}</option>
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
                    <option value="beginner">{tConst("languageLevels.beginner")}</option>
                    <option value="intermediate">{tConst("languageLevels.intermediate")}</option>
                    <option value="advanced">{tConst("languageLevels.advanced")}</option>
                    <option value="native">{tConst("languageLevels.native")}</option>
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
            {saving ? t("form.updating") : t("form.update")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/candidates/${id}`)}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {t("form.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
