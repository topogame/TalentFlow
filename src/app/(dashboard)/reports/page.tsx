"use client";

import { useEffect, useState } from "react";
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

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  passive: "Pasif",
};

const TREND_COLORS = {
  candidate: "#3b82f6",
  process: "#a855f7",
  placement: "#10b981",
};

const TREND_LABELS: Record<string, string> = {
  candidate: "Yeni Adaylar",
  process: "Yeni Süreçler",
  placement: "Yerleştirmeler",
};

// ─── Date Presets ───

type DatePreset = { label: string; from: Date | null; to: Date | null };

function getPresets(): DatePreset[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start3m = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const start6m = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return [
    { label: "Bu Ay", from: startOfMonth, to: now },
    { label: "Son 3 Ay", from: start3m, to: now },
    { label: "Son 6 Ay", from: start6m, to: now },
    { label: "Bu Yıl", from: startOfYear, to: now },
    { label: "Tümü", from: null, to: null },
  ];
}

// ─── Page ───

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(4); // "Tümü"
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const presets = getPresets();

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

  async function handleExport(type: "candidates" | "processes" | "positions") {
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
          const key = new Date(item.month).toLocaleDateString("tr-TR", { year: "numeric", month: "short" });
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
          <h1 className="text-2xl font-bold text-slate-900">Raporlar</h1>
          <p className="mt-1 text-sm text-slate-500">Performans ve istatistik raporları</p>
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
            { type: "candidates" as const, label: "Adaylar" },
            { type: "processes" as const, label: "Süreçler" },
            { type: "positions" as const, label: "Pozisyonlar" },
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
            {exporting === item.type ? "İndiriliyor..." : `${item.label} Excel`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      ) : !data ? (
        <div className="mt-12 flex justify-center">
          <p className="text-sm text-slate-500">Veri yüklenemedi</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Row 1: Pipeline + Candidate Status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Pipeline Distribution */}
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">Pipeline Dağılımı</h3>
              <div className="mt-4 h-64">
                {pipelineData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Veri bulunamadı
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, "Süreç"]} />
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
              <h3 className="text-sm font-semibold text-slate-700">Aday Durum Dağılımı</h3>
              <div className="mt-4 h-64">
                {data.candidatesByStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Veri bulunamadı
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
            <h3 className="text-sm font-semibold text-slate-700">Aylık Trendler</h3>
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
              <h3 className="text-sm font-semibold text-slate-700">Firma Aktivitesi (Top 10)</h3>
              <div className="mt-4 h-64">
                {data.firmActivity.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Veri bulunamadı
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.firmActivity} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="firmName" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip formatter={(value) => [value, "Süreç"]} />
                      <Bar dataKey="processCount" fill="#6366f1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Consultant Performance */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">Danışman Performansı</h3>
              <div className="mt-4 h-64">
                {data.consultantPerformance.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Veri bulunamadı
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.consultantPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="userName" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, "Süreç"]} />
                      <Bar dataKey="processCount" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
