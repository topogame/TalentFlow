"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  currentSector: string | null;
  totalExperienceYears: number | null;
  city: string | null;
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  status: string;
  activeProcessCount: number;
  createdAt: string;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/candidates?${params}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adaylar</h1>
          <p className="mt-1 text-sm text-slate-500">Aday havuzunuzu yönetin</p>
        </div>
        <Link
          href="/candidates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Aday
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta veya telefon ile ara..."
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

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-pulse-soft text-lg">Yükleniyor...</div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">Aday bulunamadı</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aday
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pozisyon / Sektör
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Deneyim
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Şehir
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
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-indigo-50/50"
                  onClick={() => router.push(`/candidates/${c.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.email || c.phone || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{c.currentTitle || "—"}</div>
                    <div className="text-xs text-slate-400">{c.currentSector || ""}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {c.totalExperienceYears != null ? `${c.totalExperienceYears} yıl` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {c.city || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {c.activeProcessCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {c.activeProcessCount} aktif
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/candidates/${c.id}`}
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
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Toplam {pagination.total} aday ({pagination.totalPages} sayfa)
          </span>
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
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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
