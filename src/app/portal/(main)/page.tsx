"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PORTAL_STAGE_LABELS } from "@/lib/constants";

type ProcessItem = {
  id: string;
  stage: string;
  createdAt: string;
  closedAt: string | null;
  firm: { name: string };
  position: { title: string };
  interviews: { scheduledAt: string; isCompleted: boolean }[];
};

const STAGE_COLORS: Record<string, string> = {
  pool: "bg-slate-100 text-slate-700",
  initial_interview: "bg-blue-100 text-blue-700",
  submitted: "bg-indigo-100 text-indigo-700",
  interview: "bg-purple-100 text-purple-700",
  positive: "bg-emerald-100 text-emerald-700",
  negative: "bg-rose-100 text-rose-700",
  on_hold: "bg-amber-100 text-amber-700",
};

export default function PortalDashboard() {
  const t = useTranslations("portal");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate-portal/processes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProcesses(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-900">{t("applications")}</h1>

      {processes.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            {t("noApplications")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processes.map((proc) => {
            const lastInterview = proc.interviews[0];
            return (
              <Link
                key={proc.id}
                href={`/portal/processes/${proc.id}`}
                className="block rounded-lg border bg-white p-4 transition-colors hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900">
                      {proc.position.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {proc.firm.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STAGE_COLORS[proc.stage] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {PORTAL_STAGE_LABELS[proc.stage] || proc.stage}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    {t("application")}{" "}
                    {new Date(proc.createdAt).toLocaleDateString(locale)}
                  </span>
                  {lastInterview && (
                    <span>
                      {t("lastInterview")}{" "}
                      {new Date(lastInterview.scheduledAt).toLocaleDateString(
                        locale
                      )}
                      {lastInterview.isCompleted ? ` (${tc("completed")})` : ""}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
