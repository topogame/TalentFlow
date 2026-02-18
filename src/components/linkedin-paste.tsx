"use client";

import { useState } from "react";
import type { CVParseResult } from "@/lib/ai";

type LinkedInPasteProps = {
  onParsed: (data: CVParseResult) => void;
  disabled?: boolean;
};

export default function LinkedInPaste({ onParsed, disabled }: LinkedInPasteProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (text.trim().length < 50) {
      setError("Profil metni en az 50 karakter olmalıdır");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/parse-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "Profil analiz edilemedi");
        return;
      }

      onParsed(json.data);
      setOpen(false);
      setText("");
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setText("");
    setError("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
      >
        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn Profil Yapıştır
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900">LinkedIn Profil Yapıştır</h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-3 rounded-lg bg-blue-100/60 px-3 py-2.5">
        <p className="text-xs font-medium text-blue-800 mb-1.5">Nasıl kullanılır?</p>
        <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
          <li>LinkedIn'de adayın profil sayfasını açın</li>
          <li><strong>Ctrl+A</strong> ile tüm sayfayı seçin, <strong>Ctrl+C</strong> ile kopyalayın</li>
          <li>Aşağıdaki alana <strong>Ctrl+V</strong> ile yapıştırın</li>
          <li><strong>"AI ile Analiz Et"</strong> butonuna tıklayın — form otomatik dolacak</li>
        </ol>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="LinkedIn profil sayfasının içeriğini buraya yapıştırın (Ctrl+V)...&#10;&#10;Örnek:&#10;Ahmet Yılmaz&#10;İstanbul, Türkiye&#10;Yazılım Mühendisi | TechCorp&#10;&#10;Deneyim:&#10;- Senior Yazılım Mühendisi, TechCorp (2021 - Günümüz)&#10;..."
        rows={8}
        disabled={loading}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
      />

      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
          <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-xs text-rose-700">{error}</span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || text.trim().length < 50}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analiz Ediliyor...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              AI ile Analiz Et
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </div>
  );
}
