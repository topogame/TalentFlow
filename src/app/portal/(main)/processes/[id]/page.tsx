"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PORTAL_STAGE_LABELS, INTERVIEW_TYPE_LABELS } from "@/lib/constants";

type Interview = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  meetingLink: string | null;
  isCompleted: boolean;
  location: string | null;
};

type ProcessDetail = {
  id: string;
  stage: string;
  createdAt: string;
  closedAt: string | null;
  firm: { name: string };
  position: { title: string; city: string | null; workModel: string | null };
  interviews: Interview[];
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

const WORK_MODEL_KEYS: Record<string, string> = {
  office: "office",
  remote: "remote",
  hybrid: "hybrid",
};

export default function PortalProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("portal");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/candidate-portal/processes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProcess(data.data);
        } else {
          setError(data.message || t("processNotFound"));
        }
      })
      .catch(() => setError(tc("error")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-sm text-red-600">{error || t("processNotFound")}</p>
        <Link href="/portal" className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900">
          &larr; {t("backToApplications")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/portal" className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
        &larr; {t("backToApplications")}
      </Link>

      {/* Header */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {process.position.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{process.firm.name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              {process.position.city && <span>{process.position.city}</span>}
              {process.position.workModel && (
                <span>
                  {WORK_MODEL_KEYS[process.position.workModel]
                    ? tc(WORK_MODEL_KEYS[process.position.workModel])
                    : process.position.workModel}
                </span>
              )}
              <span>
                {t("application")} {new Date(process.createdAt).toLocaleDateString(locale)}
              </span>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${
              STAGE_COLORS[process.stage] || "bg-slate-100 text-slate-700"
            }`}
          >
            {PORTAL_STAGE_LABELS[process.stage] || process.stage}
          </span>
        </div>
      </div>

      {/* Interviews */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          {t("interviews")}
        </h2>
        {process.interviews.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              {t("noInterviews")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {process.interviews.map((interview) => {
              const date = new Date(interview.scheduledAt);
              const isPast = date < new Date();
              return (
                <div
                  key={interview.id}
                  className="rounded-lg border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {date.toLocaleDateString(locale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {" "}
                        {date.toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>
                          {INTERVIEW_TYPE_LABELS[interview.type] || interview.type}
                        </span>
                        <span>{interview.durationMinutes} {tc("minutes")}</span>
                        {interview.location && (
                          <span>{interview.location}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        interview.isCompleted
                          ? "bg-emerald-50 text-emerald-700"
                          : isPast
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {interview.isCompleted
                        ? tc("completed")
                        : isPast
                          ? tc("waiting")
                          : tc("scheduled")}
                    </span>
                  </div>
                  {interview.meetingLink && !interview.isCompleted && !isPast && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {t("joinMeeting")}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
