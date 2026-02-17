"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";

type Process = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  createdAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    currentTitle: string | null;
  };
};

type Position = {
  id: string;
  title: string;
  department: string | null;
  status: string;
  priority: string;
  city: string | null;
  country: string | null;
  workModel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  minExperienceYears: number | null;
  description: string | null;
  requirements: string | null;
  firm: { id: string; name: string };
  createdBy: { firstName: string; lastName: string };
  processes: Process[];
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapalı",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  office: "Ofis",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

export default function PositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosition = useCallback(async () => {
    const res = await fetch(`/api/positions/${id}`);
    const data = await res.json();
    if (data.success) setPosition(data.data);
    else router.push("/positions");
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-soft text-lg text-slate-400">Yükleniyor...</div>
      </div>
    );
  if (!position) return null;

  const activeProcesses = position.processes.filter((p) => !p.closedAt);
  const closedProcesses = position.processes.filter((p) => p.closedAt);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/positions" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              Pozisyonlar
            </Link>
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{position.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <Link href={`/firms/${position.firm.id}`} className="text-indigo-600 transition-colors hover:text-indigo-700">
              {position.firm.name}
            </Link>
            {position.department ? ` · ${position.department}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/positions/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Düzenle
          </Link>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[position.status] || "bg-slate-100 text-slate-600"}`}
          >
            {STATUS_LABELS[position.status] || position.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <h3 className="font-semibold text-slate-900">Pozisyon Detayları</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Konum</dt>
              <dd className="text-slate-900">
                {[position.city, position.country].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Çalışma Modeli</dt>
              <dd className="text-slate-900">
                {position.workModel ? WORK_MODEL_LABELS[position.workModel] || position.workModel : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Gerekli Deneyim</dt>
              <dd className="text-slate-900">
                {position.minExperienceYears != null
                  ? `${position.minExperienceYears} yıl`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Maaş Aralığı</dt>
              <dd className="text-slate-900">
                {position.salaryMin || position.salaryMax
                  ? `${position.salaryMin?.toLocaleString("tr-TR") || "?"} - ${position.salaryMax?.toLocaleString("tr-TR") || "?"} ${position.salaryCurrency || "TRY"}`
                  : "—"}
              </dd>
            </div>
          </dl>

          {position.description && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Açıklama</h4>
              <p className="whitespace-pre-line text-sm text-slate-600">{position.description}</p>
            </div>
          )}
          {position.requirements && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Gereksinimler</h4>
              <p className="whitespace-pre-line text-sm text-slate-600">{position.requirements}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            <h3 className="font-semibold text-slate-900">
              Süreçler ({position.processes.length})
            </h3>
          </div>

          {activeProcesses.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif</h4>
              <div className="space-y-2">
                {activeProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-indigo-50/50"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                      <p className="text-xs text-slate-500">{p.candidate.currentTitle || ""}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {closedProcesses.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tamamlanan</h4>
              <div className="space-y-2">
                {closedProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 opacity-60"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                    </div>
                    <span className="text-xs text-slate-500">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {position.processes.length === 0 && (
            <div className="py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Henüz süreç yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
