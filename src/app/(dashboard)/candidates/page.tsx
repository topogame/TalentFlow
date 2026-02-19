"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("candidates");
  const tc = useTranslations("common");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("active");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (sector) params.set("sector", sector);
    if (city) params.set("city", city);
    params.set("status", status);
    if (minExp) params.set("minExperience", minExp);
    if (maxExp) params.set("maxExperience", maxExp);
    if (sort !== "createdAt") params.set("sort", sort);
    if (order !== "desc") params.set("order", order);

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
  }, [page, search, sector, city, status, minExp, maxExp, sort, order]);

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
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/candidates/import"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            {t("bulkImport")}
          </Link>
          <Link
            href="/candidates/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t("newCandidate")}
          </Link>
        </div>
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
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          {tc("search")}
        </button>
      </form>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{tc("sector")}</label>
          <input
            type="text"
            value={sector}
            onChange={(e) => { setSector(e.target.value); setPage(1); }}
            placeholder={t("sectorPlaceholder")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-36"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{tc("city")}</label>
          <input
            type="text"
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            placeholder={t("cityPlaceholder")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-36"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{tc("status")}</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="active">{tc("active")}</option>
            <option value="passive">{tc("passive")}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{tc("experienceYears")}</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={minExp}
              onChange={(e) => { setMinExp(e.target.value); setPage(1); }}
              placeholder="Min"
              min="0"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-20"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              value={maxExp}
              onChange={(e) => { setMaxExp(e.target.value); setPage(1); }}
              placeholder="Max"
              min="0"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-20"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{tc("sortBy")}</label>
          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split("-");
              setSort(s);
              setOrder(o as "asc" | "desc");
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="createdAt-desc">{t("sortNewest")}</option>
            <option value="createdAt-asc">{t("sortOldest")}</option>
            <option value="firstName-asc">{t("sortNameAZ")}</option>
            <option value="firstName-desc">{t("sortNameZA")}</option>
            <option value="totalExperienceYears-desc">{t("sortExpDesc")}</option>
            <option value="totalExperienceYears-asc">{t("sortExpAsc")}</option>
          </select>
        </div>
        {(sector || city || status !== "active" || minExp || maxExp || sort !== "createdAt" || order !== "desc") && (
          <button
            type="button"
            onClick={() => { setSector(""); setCity(""); setStatus("active"); setMinExp(""); setMaxExp(""); setSort("createdAt"); setOrder("desc"); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 transition-colors"
          >
            {tc("clear")}
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-pulse-soft text-lg">{tc("loading")}</div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">{t("notFoundEmpty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-[700px] divide-y divide-slate-100 md:min-w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tc("candidate")}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("positionSector")}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tc("experience")}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tc("city")}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tc("processes")}
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tc("actions")}
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
                    {c.totalExperienceYears != null ? `${c.totalExperienceYears} ${tc("year")}` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {c.city || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {c.activeProcessCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {t("activeCount", { count: c.activeProcessCount })}
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
                      {tc("view")}
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
          <span className="text-slate-500">
            {tc("totalItemsWithPages", { count: pagination.total, entity: t("title").toLowerCase(), pages: pagination.totalPages })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {tc("previous")}
            </button>
            <span className="px-3 py-2 text-sm font-medium text-slate-700">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {tc("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
