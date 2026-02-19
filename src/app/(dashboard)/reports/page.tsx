"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";
import {
  REPORT_COLUMNS,
  REPORT_FILTERS,
  type ReportEntityType,
  type FilterOption,
} from "@/lib/report-columns";

// ─── Types ───

type PipelineItem = { stage: string; count: number };
type CandidateStatusItem = { status: string; count: number };
type FirmActivityItem = { firmId: string; firmName: string; processCount: number };
type MonthlyTrendItem = { month: string; type: string; count: number };
type ConsultantItem = { userId: string; userName: string; processCount: number };

type ReportsData = {
  pipelineDistribution: PipelineItem[];
  candidatesByStatus: CandidateStatusItem[];
  firmActivity: FirmActivityItem[];
  monthlyTrends: MonthlyTrendItem[];
  consultantPerformance: ConsultantItem[];
};

// ─── Colors ───

const STAGE_CHART_COLORS: Record<string, string> = {
  pool: "#94a3b8",
  initial_interview: "#3b82f6",
  submitted: "#6366f1",
  interview: "#a855f7",
  positive: "#10b981",
  negative: "#f43f5e",
  on_hold: "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  passive: "#94a3b8",
};

const TREND_COLORS = {
  candidate: "#3b82f6",
  process: "#a855f7",
  placement: "#10b981",
};

// ─── Date Presets ───

type DatePreset = { label: string; from: Date | null; to: Date | null };

// ─── Page ───

// ENTITY_OPTIONS moved inside component to access translations

export default function ReportsPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const locale = useLocale();

  const STATUS_LABELS: Record<string, string> = {
    active: tc("active"),
    passive: tc("passive"),
  };

  const TREND_LABELS: Record<string, string> = {
    candidate: t("trendNewCandidates"),
    process: t("trendNewProcesses"),
    placement: t("trendPlacements"),
  };

  const tn = useTranslations("nav");
  const ENTITY_OPTIONS: { value: ReportEntityType; label: string }[] = [
    { value: "candidates", label: tn("candidates") },
    { value: "firms", label: tn("firms") },
    { value: "positions", label: tn("positions") },
    { value: "processes", label: tn("processes") },
    { value: "interviews", label: t("interviews") },
  ];

  function getPresets(): DatePreset[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start3m = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const start6m = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return [
      { label: t("thisMonth"), from: startOfMonth, to: now },
      { label: t("last3Months"), from: start3m, to: now },
      { label: t("last6Months"), from: start6m, to: now },
      { label: t("thisYear"), from: startOfYear, to: now },
      { label: tc("all"), from: null, to: null },
    ];
  }

  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(4); // "Tümü"
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const presets = getPresets();

  // Custom Report Builder state
  const [crEntity, setCrEntity] = useState<ReportEntityType>("candidates");
  const [crColumns, setCrColumns] = useState<string[]>([]);
  const [crFilters, setCrFilters] = useState<Record<string, string>>({});
  const [crSortField, setCrSortField] = useState("");
  const [crSortOrder, setCrSortOrder] = useState<"asc" | "desc">("desc");
  const [crDateFrom, setCrDateFrom] = useState("");
  const [crDateTo, setCrDateTo] = useState("");
  const [crExporting, setCrExporting] = useState(false);
  const [crError, setCrError] = useState("");

  // Reset selections when entity type changes
  function handleEntityChange(entity: ReportEntityType) {
    setCrEntity(entity);
    setCrColumns([]);
    setCrFilters({});
    setCrSortField("");
    setCrSortOrder("desc");
    setCrError("");
  }

  function toggleColumn(key: string) {
    setCrColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function selectAllColumns() {
    setCrColumns(REPORT_COLUMNS[crEntity].map((c) => c.key));
  }

  function deselectAllColumns() {
    setCrColumns([]);
  }

  async function handleCustomExport() {
    if (crColumns.length === 0) {
      setCrError(t("minOneColumn"));
      return;
    }
    setCrError("");
    setCrExporting(true);

    const body: Record<string, unknown> = {
      entityType: crEntity,
      columns: crColumns,
      filters: crFilters,
    };

    if (crSortField) {
      body.sort = { field: crSortField, order: crSortOrder };
    }
    if (crDateFrom) body.dateFrom = new Date(crDateFrom).toISOString();
    if (crDateTo) body.dateTo = new Date(crDateTo).toISOString();

    try {
      const res = await fetch("/api/exports/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ozel_rapor_${crEntity}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const json = await res.json();
        setCrError(json.error?.message || t("reportFailed"));
      }
    } catch {
      setCrError(t("connectionError"));
    } finally {
      setCrExporting(false);
    }
  }

  const crAvailableColumns = REPORT_COLUMNS[crEntity] || [];
  const crAvailableFilters: FilterOption[] = REPORT_FILTERS[crEntity] || [];

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString());
    if (dateTo) params.set("dateTo", dateTo.toISOString());
    const res = await fetch(`/api/reports?${params}`);
    if (res.ok) {
      const json = await res.json();
      setData(json.data);
    }
    setLoading(false);
  }

  function applyPreset(idx: number) {
    setActivePreset(idx);
    setDateFrom(presets[idx].from);
    setDateTo(presets[idx].to);
  }

  async function handleExport(type: "candidates" | "processes" | "positions" | "firms" | "interviews") {
    setExporting(type);
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString());
    if (dateTo) params.set("dateTo", dateTo.toISOString());
    const res = await fetch(`/api/exports/${type}?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(null);
  }

  // Prepare monthly trends for LineChart
  const trendData = data
    ? (() => {
        const grouped: Record<string, { month: string; candidate: number; process: number; placement: number }> = {};
        for (const item of data.monthlyTrends) {
          const key = new Date(item.month).toLocaleDateString(locale, { year: "numeric", month: "short" });
          if (!grouped[key]) grouped[key] = { month: key, candidate: 0, process: 0, placement: 0 };
          const trendKey = item.type as "candidate" | "process" | "placement";
          grouped[key][trendKey] = item.count;
        }
        return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
      })()
    : [];

  // Pipeline data
  const pipelineData = data
    ? data.pipelineDistribution.map((p) => ({
        ...p,
        label: PIPELINE_STAGE_LABELS[p.stage] || p.stage,
      }))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {presets.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => applyPreset(idx)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activePreset === idx
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { type: "candidates" as const, label: tn("candidates") },
            { type: "processes" as const, label: tn("processes") },
            { type: "positions" as const, label: tn("positions") },
            { type: "firms" as const, label: tn("firms") },
            { type: "interviews" as const, label: t("interviews") },
          ] as const
        ).map((item) => (
          <button
            key={item.type}
            onClick={() => handleExport(item.type)}
            disabled={exporting !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting === item.type ? t("downloading") : `${item.label} ${t("excel")}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <p className="text-sm text-slate-500">{tc("loading")}</p>
        </div>
      ) : !data ? (
        <div className="mt-12 flex justify-center">
          <p className="text-sm text-slate-500">{t("dataLoadFailed")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Row 1: Pipeline + Candidate Status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Pipeline Distribution */}
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">{t("pipelineDistribution")}</h3>
              <div className="mt-4 h-64">
                {pipelineData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("noDataFound")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, tc("process")]} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {pipelineData.map((entry) => (
                          <Cell key={entry.stage} fill={STAGE_CHART_COLORS[entry.stage] || "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Candidate Status Pie */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">{t("candidateStatusDist")}</h3>
              <div className="mt-4 h-64">
                {data.candidatesByStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("noDataFound")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.candidatesByStatus.map((c) => ({
                          name: STATUS_LABELS[c.status] || c.status,
                          value: c.count,
                          fill: STATUS_COLORS[c.status] || "#94a3b8",
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {data.candidatesByStatus.map((c) => (
                          <Cell key={c.status} fill={STATUS_COLORS[c.status] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Monthly Trends */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700">{t("monthlyTrends")}</h3>
            <div className="mt-4 h-72">
              {trendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Veri bulunamadı
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend formatter={(value) => TREND_LABELS[value] || value} />
                    <Line type="monotone" dataKey="candidate" stroke={TREND_COLORS.candidate} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="process" stroke={TREND_COLORS.process} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="placement" stroke={TREND_COLORS.placement} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row 3: Firm Activity + Consultant Performance */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Firm Activity */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">{t("firmActivity")}</h3>
              <div className="mt-4 h-64">
                {data.firmActivity.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("noDataFound")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.firmActivity} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="firmName" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip formatter={(value) => [value, tc("process")]} />
                      <Bar dataKey="processCount" fill="#6366f1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Consultant Performance */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">{t("consultantPerformance")}</h3>
              <div className="mt-4 h-64">
                {data.consultantPerformance.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    {t("noDataFound")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.consultantPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="userName" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, tc("process")]} />
                      <Bar dataKey="processCount" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Custom Report Builder ─── */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">{t("customReportBuilder")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("customReportDesc")}
        </p>

        {/* Entity Type */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700">{t("dataType")}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ENTITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEntityChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  crEntity === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column Selection */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              {t("columns")} ({crColumns.length} / {crAvailableColumns.length})
            </label>
            <div className="flex gap-2">
              <button
                onClick={selectAllColumns}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                {t("selectAll")}
              </button>
              <button
                onClick={deselectAllColumns}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {tc("clear")}
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {crAvailableColumns.map((col) => (
              <label
                key={col.key}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                  crColumns.includes(col.key)
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                    : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={crColumns.includes(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="sr-only"
                />
                {crColumns.includes(col.key) && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
                {col.label}
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        {crAvailableFilters.length > 0 && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700">{t("filters")}</label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {crAvailableFilters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-xs text-slate-500">{filter.label}</label>
                  {filter.type === "select" ? (
                    <select
                      value={crFilters[filter.key] || ""}
                      onChange={(e) =>
                        setCrFilters((prev) => {
                          const next = { ...prev };
                          if (e.target.value) next[filter.key] = e.target.value;
                          else delete next[filter.key];
                          return next;
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
                    >
                      <option value="">{tc("all")}</option>
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={crFilters[filter.key] || ""}
                      onChange={(e) =>
                        setCrFilters((prev) => {
                          const next = { ...prev };
                          if (e.target.value) next[filter.key] = e.target.value;
                          else delete next[filter.key];
                          return next;
                        })
                      }
                      placeholder={filter.label}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort + Date Range */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sort Field */}
          <div>
            <label className="block text-xs text-slate-500">{tc("sortBy")}</label>
            <select
              value={crSortField}
              onChange={(e) => setCrSortField(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
            >
              <option value="">{t("default")}</option>
              {crAvailableColumns
                .filter((c) => !c.relation || c.relation === "_count")
                .map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs text-slate-500">{t("sortDirection")}</label>
            <select
              value={crSortOrder}
              onChange={(e) => setCrSortOrder(e.target.value as "asc" | "desc")}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
            >
              <option value="desc">{t("descending")}</option>
              <option value="asc">{t("ascending")}</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs text-slate-500">{t("startDate")}</label>
            <input
              type="date"
              value={crDateFrom}
              onChange={(e) => setCrDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-slate-500">{t("endDate")}</label>
            <input
              type="date"
              value={crDateTo}
              onChange={(e) => setCrDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700"
            />
          </div>
        </div>

        {/* Error + Download Button */}
        {crError && (
          <p className="mt-3 text-sm text-rose-600">{crError}</p>
        )}

        <div className="mt-5">
          <button
            onClick={handleCustomExport}
            disabled={crExporting || crColumns.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {crExporting ? t("generatingReport") : t("downloadReport")}
          </button>
          <span className="ml-3 text-xs text-slate-400">
            {t("maxRows")}
          </span>
        </div>
      </div>
    </div>
  );
}
