"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFirmPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

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
        setError(data.error?.message || "Bir hata oluştu");
        return;
      }
      router.push(`/firms/${data.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Yeni Firma</h1>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Firma Bilgileri</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Firma Adı *</label>
              <input name="name" type="text" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sektör</label>
              <input name="sector" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Firma Büyüklüğü</label>
              <select name="companySize" className={inputClass}>
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
              <label className="block text-sm font-medium text-gray-700">Şehir</label>
              <input name="city" type="text" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ülke</label>
              <input name="country" type="text" defaultValue="Türkiye" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input name="website" type="url" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notlar</label>
              <textarea name="notes" rows={3} className={inputClass} />
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
