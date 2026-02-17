"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PIPELINE_STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";

type Position = {
  id: string;
  title: string;
  status: string;
  priority: string;
  city: string | null;
  workModel: string | null;
  createdAt: string;
};

type Firm = {
  id: string;
  name: string;
  sector: string | null;
  companySize: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  positions: Position[];
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
};

type ProcessItem = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  stageChangedAt: string;
  updatedAt: string;
  candidate: { id: string; firstName: string; lastName: string; currentTitle: string | null };
  position: { id: string; title: string };
  assignedTo: { id: string; firstName: string; lastName: string };
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

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

export default function FirmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateSearch, setCandidateSearch] = useState("");

  const fetchFirm = useCallback(async () => {
    const res = await fetch(`/api/firms/${id}`);
    const data = await res.json();
    if (data.success) setFirm(data.data);
    else router.push("/firms");
    setLoading(false);
  }, [id, router]);

  const fetchProcesses = useCallback(async () => {
    const res = await fetch(`/api/processes?firmId=${id}&limit=100`);
    const data = await res.json();
    if (data.success) setProcesses(data.data);
  }, [id]);

  useEffect(() => {
    fetchFirm();
    fetchProcesses();
  }, [fetchFirm, fetchProcesses]);

  const filteredProcesses = useMemo(() => {
    if (!candidateSearch.trim()) return processes;
    const term = candidateSearch.toLowerCase().trim();
    return processes.filter((p) => {
      const fullName = `${p.candidate.firstName} ${p.candidate.lastName}`.toLowerCase();
      return fullName.includes(term);
    });
  }, [processes, candidateSearch]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-soft text-lg text-slate-400">Yükleniyor...</div>
      </div>
    );
  if (!firm) return null;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/firms" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              Firmalar
            </Link>
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
              {firm.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{firm.name}</h1>
              <p className="text-sm text-slate-500">
                {[firm.sector, firm.city].filter(Boolean).join(" · ") || "Bilgi yok"}
              </p>
            </div>
          </div>
        </div>
        <Link
          href={`/firms/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Düzenle
        </Link>
      </div>

      {/* Süreçler / Aday Arama */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <h3 className="font-semibold text-slate-900">Süreçler ({processes.length})</h3>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            placeholder="Aday ara..."
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        {filteredProcesses.length === 0 ? (
          <div className="py-6 text-center">
            <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p className="mt-2 text-sm text-slate-500">
              {candidateSearch.trim() ? "Aramayla eşleşen süreç bulunamadı" : "Henüz süreç yok"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProcesses.map((proc) => (
              <Link
                key={proc.id}
                href={`/processes/${proc.id}`}
                className="block rounded-lg border border-slate-100 p-3 transition-colors hover:bg-indigo-50/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {proc.candidate.firstName} {proc.candidate.lastName}
                    </span>
                    {proc.candidate.currentTitle && (
                      <span className="ml-2 text-xs text-slate-500">{proc.candidate.currentTitle}</span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_COLORS[proc.stage] || "bg-slate-100 text-slate-600"}`}
                  >
                    {PIPELINE_STAGE_LABELS[proc.stage] || proc.stage}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {proc.position.title} · {proc.assignedTo.firstName} {proc.assignedTo.lastName}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <h3 className="font-semibold text-slate-900">Firma Bilgileri</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Sektör</dt>
              <dd className="text-slate-900">{firm.sector || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Büyüklük</dt>
              <dd className="text-slate-900">{firm.companySize || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Konum</dt>
              <dd className="text-slate-900">
                {[firm.city, firm.country].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Website</dt>
              <dd>
                {firm.website ? (
                  <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 transition-colors hover:text-indigo-700">
                    {firm.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Oluşturan</dt>
              <dd className="text-slate-900">{firm.createdBy.firstName} {firm.createdBy.lastName}</dd>
            </div>
          </dl>
          {firm.notes && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600">{firm.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <h3 className="font-semibold text-slate-900">Pozisyonlar ({firm.positions.length})</h3>
            </div>
            <Link
              href={`/positions/new?firmId=${firm.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Yeni Pozisyon
            </Link>
          </div>
          {firm.positions.length === 0 ? (
            <div className="py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Henüz pozisyon yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {firm.positions.map((p) => (
                <Link
                  key={p.id}
                  href={`/positions/${p.id}`}
                  className="block rounded-lg border border-slate-100 p-3 transition-colors hover:bg-indigo-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{p.title}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {[p.city, PRIORITY_LABELS[p.priority]].filter(Boolean).join(" · ")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
