"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PIPELINE_STAGE_LABELS, INTERVIEW_TYPE_LABELS } from "@/lib/constants";

type PipelineItem = { stage: string; count: number };
type RecentActivityItem = {
  id: string;
  fromStage: string | null;
  toStage: string;
  createdAt: string;
  changedBy: { firstName: string; lastName: string };
  process: {
    id: string;
    candidate: { firstName: string; lastName: string };
    position: { title: string };
    firm: { name: string };
  };
};
type UpcomingInterview = {
  id: string;
  scheduledAt: string;
  type: string;
  durationMinutes: number;
  process: {
    id: string;
    candidate: { firstName: string; lastName: string };
    firm: { name: string };
    position: { title: string };
  };
};

type DashboardData = {
  activeCandidates: number;
  openPositions: number;
  weekInterviews: number;
  activeProcesses: number;
  pipelineDistribution: PipelineItem[];
  recentActivity: RecentActivityItem[];
  upcomingInterviews: UpcomingInterview[];
};

const statCards = [
  {
    key: "activeCandidates" as const,
    title: "Aktif Adaylar",
    accent: "border-indigo-500",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    key: "openPositions" as const,
    title: "Açık Pozisyonlar",
    accent: "border-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
  },
  {
    key: "weekInterviews" as const,
    title: "Bu Hafta Mülakatlar",
    accent: "border-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    key: "activeProcesses" as const,
    title: "Aktif Süreçler",
    accent: "border-sky-500",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
];

const STAGE_CHART_COLORS: Record<string, string> = {
  pool: "#94a3b8",
  initial_interview: "#60a5fa",
  submitted: "#818cf8",
  interview: "#a78bfa",
  positive: "#34d399",
  negative: "#fb7185",
  on_hold: "#fbbf24",
};

const STAGE_ORDER = [
  "pool",
  "initial_interview",
  "submitted",
  "interview",
  "positive",
  "negative",
  "on_hold",
];

const ACTIVITY_STAGE_COLORS: Record<string, string> = {
  pool: "bg-slate-400",
  initial_interview: "bg-blue-400",
  submitted: "bg-indigo-400",
  interview: "bg-purple-400",
  positive: "bg-emerald-400",
  negative: "bg-rose-400",
  on_hold: "bg-amber-400",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} saat önce`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} gün önce`;
  return date.toLocaleDateString("tr-TR");
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Sort pipeline data by stage order
  const pipelineData = data?.pipelineDistribution
    ? STAGE_ORDER.map((stage) => ({
        stage,
        label: PIPELINE_STAGE_LABELS[stage] || stage,
        count: data.pipelineDistribution.find((p) => p.stage === stage)?.count || 0,
      }))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Hoş geldiniz{session?.user?.firstName ? `, ${session.user.firstName}` : ""}
        </h1>
        <p className="mt-1 text-slate-500">İşte bugünkü genel bakış</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border-l-4 ${card.accent} bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? (
                    <span className="animate-pulse-soft">—</span>
                  ) : (
                    data?.[card.key] ?? 0
                  )}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Chart + Upcoming Interviews */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Distribution Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Pipeline Dağılımı</h2>
          <p className="mt-1 text-sm text-slate-500">Aktif süreçlerin aşama dağılımı</p>

          {loading ? (
            <div className="mt-4 h-64 animate-pulse rounded-lg bg-slate-100" />
          ) : pipelineData.every((p) => p.count === 0) ? (
            <div className="mt-4 flex h-64 items-center justify-center text-sm text-slate-400">
              Henüz aktif süreç bulunmuyor
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [value, "Süreç"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {pipelineData.map((entry) => (
                      <Cell
                        key={entry.stage}
                        fill={STAGE_CHART_COLORS[entry.stage] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Yaklaşan Mülakatlar</h2>
          <p className="mt-1 text-sm text-slate-500">Önümüzdeki 5 mülakat</p>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : !data?.upcomingInterviews?.length ? (
            <div className="mt-4 flex h-48 items-center justify-center text-sm text-slate-400">
              Yaklaşan mülakat yok
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {data.upcomingInterviews.map((iv) => {
                const dt = new Date(iv.scheduledAt);
                return (
                  <button
                    key={iv.id}
                    onClick={() => router.push(`/processes/${iv.process.id}`)}
                    className="w-full rounded-lg border border-slate-100 p-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">
                        {iv.process.candidate.firstName} {iv.process.candidate.lastName}
                      </p>
                      <span className="text-xs font-medium text-indigo-600">
                        {INTERVIEW_TYPE_LABELS[iv.type] || iv.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {iv.process.firm.name} — {iv.process.position.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {dt.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}{" "}
                      {dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      <span className="font-normal text-slate-400"> · {iv.durationMinutes} dk</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Son Aktiviteler</h2>
        <p className="mt-1 text-sm text-slate-500">Son 10 süreç hareketliliği</p>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !data?.recentActivity?.length ? (
          <div className="mt-4 flex h-32 items-center justify-center text-sm text-slate-400">
            Henüz aktivite bulunmuyor
          </div>
        ) : (
          <div className="mt-4">
            <div className="space-y-0">
              {data.recentActivity.map((activity, idx) => (
                <div key={activity.id} className="flex gap-3">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                        ACTIVITY_STAGE_COLORS[activity.toStage] || "bg-slate-400"
                      }`}
                    />
                    {idx < data.recentActivity.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200" />
                    )}
                  </div>

                  {/* Content */}
                  <button
                    onClick={() => router.push(`/processes/${activity.process.id}`)}
                    className="mb-4 flex-1 rounded-lg p-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">
                        {activity.process.candidate.firstName} {activity.process.candidate.lastName}
                      </span>
                      {" — "}
                      {activity.fromStage ? (
                        <>
                          <span className="font-medium text-slate-500">
                            {PIPELINE_STAGE_LABELS[activity.fromStage] || activity.fromStage}
                          </span>
                          {" → "}
                        </>
                      ) : null}
                      <span className="font-medium text-indigo-600">
                        {PIPELINE_STAGE_LABELS[activity.toStage] || activity.toStage}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {activity.process.firm.name} · {activity.process.position.title}
                      {" · "}
                      {activity.changedBy.firstName} {activity.changedBy.lastName}
                      {" · "}
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
