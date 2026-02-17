"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Position = {
  id: string;
  title: string;
  department: string | null;
  status: string;
  priority: string;
  city: string | null;
  workModel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  activeProcessCount: number;
  createdAt: string;
  firm: { id: string; name: string };
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

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

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-indigo-50 text-indigo-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};

export default function PositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [workModelFilter, setWorkModelFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (workModelFilter) params.set("workModel", workModelFilter);
    if (cityFilter) params.set("city", cityFilter);
    try {
      const res = await fetch(`/api/positions?${params}`);
      const data = await res.json();
      if (data.success) {
        setPositions(data.data);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, workModelFilter, cityFilter]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pozisyonlar</h1>
          <p className="mt-1 text-sm text-slate-500">Açık pozisyonları takip edin</p>
        </div>
        <Link
          href="/positions/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Pozisyon
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          fetchPositions();
        }}
        className="mt-6 flex gap-3"
      >
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pozisyon, firma veya şehir ile ara..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Ara
        </button>
      </form>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tümü</option>
            <option value="open">Açık</option>
            <option value="on_hold">Beklemede</option>
            <option value="closed">Kapalı</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Öncelik</label>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tümü</option>
            <option value="low">Düşük</option>
            <option value="normal">Normal</option>
            <option value="high">Yüksek</option>
            <option value="urgent">Acil</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Çalışma Modeli</label>
          <select
            value={workModelFilter}
            onChange={(e) => { setWorkModelFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tümü</option>
            <option value="office">Ofis</option>
            <option value="remote">Uzaktan</option>
            <option value="hybrid">Hibrit</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Şehir</label>
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            placeholder="Şehir..."
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-36"
          />
        </div>
        {(statusFilter || priorityFilter || workModelFilter || cityFilter) && (
          <button
            type="button"
            onClick={() => { setStatusFilter(""); setPriorityFilter(""); setWorkModelFilter(""); setCityFilter(""); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-pulse-soft text-lg">Yükleniyor...</div>
          </div>
        ) : positions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">Pozisyon bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-[700px] divide-y divide-slate-100 md:min-w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pozisyon
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Firma
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Durum
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Öncelik
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Süreçler
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-indigo-50/50"
                  onClick={() => router.push(`/positions/${p.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">
                      {[p.city, p.workModel].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {p.firm.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_COLORS[p.priority] || ""}`}
                    >
                      {PRIORITY_LABELS[p.priority] || p.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {p.activeProcessCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {p.activeProcessCount} aktif
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/positions/${p.id}`}
                      className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Toplam {pagination.total} pozisyon</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="px-3 py-2 text-sm font-medium text-slate-700">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination!.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
