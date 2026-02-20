"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { CVParseResult } from "@/lib/ai";

type FileInfo = {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

type CVUploadProps = {
  onParsed: (data: CVParseResult) => void;
  onFileUploaded?: (file: FileInfo) => void;
  disabled?: boolean;
};

type UploadState = "idle" | "selected" | "uploading" | "uploaded" | "parsing" | "parsed" | "error";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CVUpload({ onParsed, onFileUploaded, disabled }: CVUploadProps) {
  const t = useTranslations("components");
  const tc = useTranslations("common");
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return t("cvUpload.unsupportedFormat");
    }
    if (f.size === 0) {
      return t("cvUpload.fileEmpty");
    }
    if (f.size > MAX_SIZE) {
      return t("cvUpload.fileTooLarge");
    }
    return null;
  }

  function handleFileSelect(f: File) {
    const err = validateFile(f);
    if (err) {
      setErrorMsg(err);
      setState("error");
      return;
    }
    setFile(f);
    setErrorMsg("");
    setState("selected");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }

  async function handleUpload() {
    if (!file) return;
    setState("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error?.message || t("cvUpload.uploadFailed"));
        setState("error");
        return;
      }

      const info: FileInfo = {
        url: json.data.url,
        fileName: json.data.fileName,
        fileType: json.data.fileType,
        fileSize: json.data.fileSize,
      };
      setFileInfo(info);
      onFileUploaded?.(info);
      setState("uploaded");
    } catch {
      setErrorMsg(t("cvUpload.uploadError"));
      setState("error");
    }
  }

  async function handleParse() {
    if (!fileInfo) return;
    setState("parsing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/documents/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: fileInfo.url,
          fileType: fileInfo.fileType,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error?.message || t("cvUpload.analyzeFailed"));
        setState("error");
        return;
      }

      onParsed(json.data);
      setState("parsed");
    } catch {
      setErrorMsg(t("cvUpload.analyzeError"));
      setState("error");
    }
  }

  function handleReset() {
    setFile(null);
    setFileInfo(null);
    setErrorMsg("");
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
          <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t("cvUpload.title")}</h3>
          <p className="text-xs text-slate-500">{t("cvUpload.description")}</p>
        </div>
      </div>

      {/* Idle / Selected — Drop zone */}
      {(state === "idle" || state === "selected") && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
              dragOver
                ? "border-violet-400 bg-violet-50"
                : "border-slate-200 bg-slate-50/50 hover:border-violet-300 hover:bg-violet-50/50"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <svg className="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm text-slate-600">
              {t("cvUpload.dragOrSelect")} <span className="font-medium text-violet-600">{tc("select")}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">{t("cvUpload.fileTypes")}</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {file && state === "selected" && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="text-sm text-slate-700">{file.name}</span>
                <span className="text-xs text-slate-400">({formatFileSize(file.size)})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {tc("remove")}
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  {tc("upload")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Uploading */}
      {state === "uploading" && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <span className="text-sm text-slate-600">{tc("uploading")}</span>
        </div>
      )}

      {/* Uploaded — Ready to parse */}
      {state === "uploaded" && fileInfo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm text-emerald-700">{fileInfo.fileName} {tc("uploaded")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleParse}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              {tc("analyzeWithAI")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {tc("differentFile")}
            </button>
          </div>
        </div>
      )}

      {/* Parsing */}
      {state === "parsing" && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <span className="text-sm text-violet-700">{t("cvUpload.analyzing")}</span>
        </div>
      )}

      {/* Parsed */}
      {state === "parsed" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm text-emerald-700">{t("cvUpload.analyzed")}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("cvUpload.uploadDifferent")}
          </button>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5">
            <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className="text-sm text-rose-700">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {tc("tryAgain")}
          </button>
        </div>
      )}
    </div>
  );
}
