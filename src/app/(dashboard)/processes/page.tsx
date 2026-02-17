"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  STAGE_COLORS,
  STAGE_BG_COLORS,
} from "@/lib/constants";

type ProcessItem = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  stageChangedAt: string;
  updatedAt: string;
  candidate: { id: string; firstName: string; lastName: string; currentTitle: string | null };
  firm: { id: string; name: string };
  position: { id: string; title: string };
  assignedTo: { id: string; firstName: string; lastName: string };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [kanbanData, setKanbanData] = useState<Record<string, ProcessItem[]> | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (viewMode === "kanban") {
      params.set("view", "kanban");
    } else {
      params.set("page", String(page));
      params.set("limit", "20");
    }
    if (search) params.set("search", search);
    if (stageFilter) params.set("stage", stageFilter);

    try {
      const res = await fetch(`/api/processes?${params}`);
      const data = await res.json();
      if (data.success) {
        if (viewMode === "kanban") {
          setKanbanData(data.data);
        } else {
          setProcesses(data.data);
          setPagination(data.pagination);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, viewMode]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProcesses();
  }

  function renderStars(score: number | null) {
    if (!score) return <span className="text-slate-300">—</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`h-3.5 w-3.5 ${i <= score ? "text-amber-400" : "text-slate-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Süreçler</h1>
          <p className="mt-1 text-sm text-slate-500">İşe alım süreçlerinizi yönetin</p>
        </div>
        <Link
          href="/processes/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Süreç
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3.5 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            } rounded-l-lg`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3.5 py-2 text-sm font-medium transition-colors ${
              viewMode === "kanban"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            } rounded-r-lg border-l border-slate-200`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Aday, firma veya pozisyon ara..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </form>

        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Tüm Aşamalar</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>
              {PIPELINE_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-pulse-soft text-lg">Yükleniyor...</div>
            </div>
          ) : processes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
              <p className="mt-3 text-sm text-slate-500">Süreç bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-[800px] divide-y divide-slate-100 md:min-w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aday</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pozisyon</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Firma</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aşama</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sorumlu</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Uyum</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Son Güncelleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processes.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => window.location.href = `/processes/${p.id}`}
                    className={`cursor-pointer transition-colors duration-150 ${
                      p.closedAt ? "bg-slate-50/50 opacity-60" : "hover:bg-indigo-50/50"
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {p.candidate.firstName[0]}{p.candidate.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {p.candidate.firstName} {p.candidate.lastName}
                          </div>
                          {p.candidate.currentTitle && (
                            <div className="text-xs text-slate-500">{p.candidate.currentTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.position.title}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.firm.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_COLORS[p.stage] || "bg-slate-100 text-slate-700"}`}>
                        {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {p.assignedTo.firstName} {p.assignedTo.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{renderStars(p.fitnessScore)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
              <div className="animate-pulse-soft text-lg">Yükleniyor...</div>
            </div>
          ) : kanbanData ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map((stage) => {
                const items = kanbanData[stage] || [];
                return (
                  <div key={stage} className={`min-w-[280px] flex-shrink-0 rounded-xl border border-slate-200 ${STAGE_BG_COLORS[stage]} shadow-sm`}>
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {PIPELINE_STAGE_LABELS[stage]}
                      </h3>
                      <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${STAGE_COLORS[stage]}`}>
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-3 p-3">
                      {items.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-400">Süreç yok</p>
                      ) : (
                        items.map((p) => (
                          <Link
                            key={p.id}
                            href={`/processes/${p.id}`}
                            className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-150 hover:shadow-md"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                                {p.candidate.firstName[0]}{p.candidate.lastName[0]}
                              </div>
                              <span className="text-sm font-medium text-slate-900">
                                {p.candidate.firstName} {p.candidate.lastName}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-600">{p.position.title}</p>
                            <p className="text-xs text-slate-400">{p.firm.name}</p>
                            <div className="mt-2 flex items-center justify-between">
                              {renderStars(p.fitnessScore)}
                              <span className="text-[10px] text-slate-400">
                                {p.assignedTo.firstName[0]}{p.assignedTo.lastName[0]}
                              </span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* Pagination (list view only) */}
      {viewMode === "list" && pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Toplam {pagination.total} süreç ({pagination.totalPages} sayfa)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="px-2 text-slate-600">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
