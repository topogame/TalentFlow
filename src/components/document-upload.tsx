"use client";

import { useRef, useState } from "react";

type DocumentUploadProps = {
  candidateId: string;
  onUploaded: () => void;
};

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUpload({ candidateId, onUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return "Desteklenmeyen format. PDF veya DOCX yükleyin.";
    }
    if (f.size > MAX_SIZE) {
      return "Dosya boyutu 10MB'ı aşamaz.";
    }
    return null;
  }

  async function uploadFile(file: File) {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("candidateId", candidateId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Yükleme başarısız");
        return;
      }

      onUploaded();
    } catch {
      setError("Yükleme sırasında bir hata oluştu");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  }

  return (
    <div className="mb-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 bg-slate-50/50 hover:border-indigo-300"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        {uploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <span className="text-sm text-slate-600">Yükleniyor...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm text-slate-600">
              Belge yükle <span className="text-xs text-slate-400">(PDF, DOCX — Maks. 10MB)</span>
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}
