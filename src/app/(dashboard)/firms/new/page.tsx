"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NewFirmPage() {
  const router = useRouter();
  const t = useTranslations("firms");
  const tc = useTranslations("common");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
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
      const res = await fetch("/api/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || tc("error"));
        return;
      }
      router.push(`/firms/${data.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t("newFirm")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("form.newDescription")}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{t("detail.firmInfo")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">{t("form.nameLabel")} *</label>
              <input name="name" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{tc("sector")}</label>
              <input name="sector" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.companySize")}</label>
              <select name="companySize" className={inputClass}>
                <option value="">{tc("selectOption")}</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{tc("city")}</label>
              <input name="city" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("form.country")}</label>
              <input name="country" type="text" defaultValue="Türkiye" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">{t("detail.website")}</label>
              <input name="website" type="url" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">{tc("notes")}</label>
              <textarea name="notes" rows={3} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
          >
            {saving ? tc("saving") : tc("save")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {tc("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
