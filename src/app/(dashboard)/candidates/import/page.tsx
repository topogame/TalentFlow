"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ─── Types ───

type RowDuplicate = {
  candidateId: string;
  name: string;
  matchType: string;
  confidence: string;
};

type ImportRow = {
  rowNumber: number;
  status: "valid" | "warning" | "error";
  data: Record<string, unknown> | null;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  duplicates: RowDuplicate[];
};

type PreviewResult = {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: ImportRow[];
  parseWarnings: string[];
};

type ExecuteResult = {
  imported: number;
  failed: number;
  total: number;
  results: { rowNumber: number; status: "success" | "error"; candidateId?: string; error?: string }[];
};

type Step = "upload" | "preview" | "importing" | "results";

// ─── Page ───

export default function CandidateImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [executeResult, setExecuteResult] = useState<ExecuteResult | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Template Download ───
  async function downloadTemplate() {
    const res = await fetch("/api/imports/candidates/template");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aday_sablonu.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // ─── File Upload ───
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setUploadError("");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (!f.name.toLowerCase().endsWith(".xlsx")) {
        setUploadError("Sadece .xlsx dosyaları desteklenir");
        return;
      }
      setFile(f);
      setUploadError("");
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/imports/candidates/preview", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        const errMsg = typeof json.error === "string" ? json.error : json.error?.message || "Dosya işlenemedi";
        setUploadError(errMsg);
        setUploading(false);
        return;
      }

      const data = json.data as PreviewResult;
      setPreview(data);

      // Auto-select valid rows
      const autoSelected = new Set<number>();
      for (const row of data.rows) {
        if (row.status === "valid") {
          autoSelected.add(row.rowNumber);
        }
      }
      setSelectedRows(autoSelected);
      setStep("preview");
    } catch {
      setUploadError("Bağlantı hatası");
    }
    setUploading(false);
  }

  // ─── Row Selection ───
  function toggleRow(rowNumber: number) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  }

  function selectAllValid() {
    if (!preview) return;
    const all = new Set<number>();
    for (const row of preview.rows) {
      if (row.status !== "error") all.add(row.rowNumber);
    }
    setSelectedRows(all);
  }

  function deselectAll() {
    setSelectedRows(new Set());
  }

  // ─── Execute Import ───
  async function handleExecute() {
    if (!preview || selectedRows.size === 0) return;
    setStep("importing");

    const candidates = preview.rows
      .filter((r) => selectedRows.has(r.rowNumber) && r.data)
      .map((r) => ({ rowNumber: r.rowNumber, data: r.data! }));

    try {
      const res = await fetch("/api/imports/candidates/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates }),
      });
      const json = await res.json();
      setExecuteResult(json.data as ExecuteResult);
    } catch {
      setExecuteResult({ imported: 0, failed: candidates.length, total: candidates.length, results: [] });
    }
    setStep("results");
  }

  // ─── Reset ───
  function handleReset() {
    setStep("upload");
    setFile(null);
    setUploadError("");
    setPreview(null);
    setSelectedRows(new Set());
    setExecuteResult(null);
    setExpandedRow(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ─── Render ───
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Toplu Aday Yükleme</h1>
          <p className="mt-1 text-sm text-slate-500">Excel dosyasından aday verilerini içe aktarın</p>
        </div>
        <Link
          href="/candidates"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Geri Dön
        </Link>
      </div>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        {[
          { key: "upload", label: "1. Dosya Yükle" },
          { key: "preview", label: "2. Önizle" },
          { key: "importing", label: "3. İçe Aktar" },
          { key: "results", label: "4. Sonuç" },
        ].map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            {idx > 0 && <div className="h-px w-6 bg-slate-300" />}
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                step === s.key
                  ? "bg-indigo-600 text-white"
                  : ["upload", "preview", "importing", "results"].indexOf(step) > idx
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Dosya Yükle</h2>
            <p className="mt-1 text-sm text-slate-500">
              Önce şablonu indirin, doldurun ve tekrar yükleyin. Zorunlu alanlar şablonda * ile işaretlidir.
            </p>
          </div>

          <button
            onClick={downloadTemplate}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Şablonu İndir (.xlsx)
          </button>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition-colors hover:border-indigo-400 hover:bg-indigo-50/30"
          >
            <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm text-slate-600">
              Dosyayı buraya sürükleyin veya{" "}
              <label className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500">
                seçin
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-slate-400">Sadece .xlsx dosyaları, en fazla 5MB</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="text-sm font-medium text-indigo-700">{file.name}</span>
              <span className="text-xs text-indigo-500">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{uploadError}</div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Kontrol ediliyor...
              </>
            ) : (
              "Yükle ve Kontrol Et"
            )}
          </button>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && preview && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              {preview.validCount} geçerli
            </div>
            <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              {preview.warningCount} uyarılı (olası tekrar)
            </div>
            <div className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
              {preview.errorCount} hatalı
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              Toplam: {preview.totalRows} satır
            </div>
          </div>

          {preview.parseWarnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {preview.parseWarnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          )}

          {/* Selection actions */}
          <div className="flex gap-2">
            <button onClick={selectAllValid} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
              Tümünü Seç
            </button>
            <button onClick={deselectAll} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
              Seçimi Temizle
            </button>
          </div>

          {/* Rows table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-10"></th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-12">Satır</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Ad</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Soyad</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">E-posta</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Telefon</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-24">Durum</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => {
                    const bgColor =
                      row.status === "valid"
                        ? "bg-emerald-50/50"
                        : row.status === "warning"
                          ? "bg-amber-50/50"
                          : "bg-rose-50/50";

                    const statusBadge =
                      row.status === "valid" ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Geçerli</span>
                      ) : row.status === "warning" ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Uyarı</span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">Hatalı</span>
                      );

                    return (
                      <tr key={row.rowNumber}>
                        <td className={`px-3 py-2 ${bgColor}`} colSpan={8}>
                          <div className="flex items-center">
                            <div className="w-10">
                              {row.status !== "error" && (
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(row.rowNumber)}
                                  onChange={() => toggleRow(row.rowNumber)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                              )}
                            </div>
                            <div className="w-12 text-slate-500">{row.rowNumber}</div>
                            <div className="flex-1 grid grid-cols-5 gap-2">
                              <span>{(row.data?.firstName as string) || "-"}</span>
                              <span>{(row.data?.lastName as string) || "-"}</span>
                              <span className="text-slate-500 truncate">{(row.data?.email as string) || "-"}</span>
                              <span className="text-slate-500">{(row.data?.phone as string) || "-"}</span>
                              <span>{statusBadge}</span>
                            </div>
                            <button
                              onClick={() => setExpandedRow(expandedRow === row.rowNumber ? null : row.rowNumber)}
                              className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            >
                              <svg className={`h-4 w-4 transition-transform ${expandedRow === row.rowNumber ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>

                          {/* Expanded detail */}
                          {expandedRow === row.rowNumber && (
                            <div className="mt-2 ml-[82px] space-y-2 rounded-lg bg-white p-3 text-xs">
                              {row.errors.length > 0 && (
                                <div>
                                  <p className="font-semibold text-rose-700">Hatalar:</p>
                                  {row.errors.map((e, i) => (
                                    <p key={i} className="text-rose-600">• {e.field}: {e.message}</p>
                                  ))}
                                </div>
                              )}
                              {row.duplicates.length > 0 && (
                                <div>
                                  <p className="font-semibold text-amber-700">Olası tekrarlar:</p>
                                  {row.duplicates.map((d, i) => (
                                    <p key={i} className="text-amber-600">
                                      • {d.name} ({d.matchType} eşleşmesi, {d.confidence === "exact" ? "kesin" : "kısmi"})
                                    </p>
                                  ))}
                                </div>
                              )}
                              {row.errors.length === 0 && row.duplicates.length === 0 && (
                                <p className="text-slate-400">Tüm veriler geçerli.</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              onClick={handleExecute}
              disabled={selectedRows.size === 0}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              Seçilenleri İçe Aktar ({selectedRows.size} aday)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === "importing" && (
        <div className="mt-12 flex flex-col items-center justify-center">
          <svg className="h-12 w-12 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-slate-600">İçe aktarılıyor... {selectedRows.size} aday</p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === "results" && executeResult && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {executeResult.imported > 0 ? (
                <div className="rounded-full bg-emerald-100 p-3">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
              ) : (
                <div className="rounded-full bg-rose-100 p-3">
                  <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-slate-800">İçe Aktarma Tamamlandı</h2>
                <p className="text-sm text-slate-500">
                  {executeResult.imported} aday başarıyla eklendi
                  {executeResult.failed > 0 && `, ${executeResult.failed} hata oluştu`}
                </p>
              </div>
            </div>
          </div>

          {/* Failed rows */}
          {executeResult.results.filter((r) => r.status === "error").length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h3 className="text-sm font-semibold text-rose-700">Hatalı Satırlar</h3>
              <div className="mt-2 space-y-1">
                {executeResult.results
                  .filter((r) => r.status === "error")
                  .map((r) => (
                    <p key={r.rowNumber} className="text-xs text-rose-600">
                      Satır {r.rowNumber}: {r.error}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/candidates"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Aday Listesine Git
            </Link>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Yeni Yükleme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
