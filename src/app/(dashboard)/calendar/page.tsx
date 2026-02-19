"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { INTERVIEW_TYPE_LABELS } from "@/lib/constants";

type CalendarInterview = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  meetingLink: string | null;
  location: string | null;
  notes: string | null;
  isCompleted: boolean;
  process: {
    id: string;
    candidate: { firstName: string; lastName: string };
    firm: { name: string };
    position: { title: string };
  };
};

const TYPE_COLORS: Record<string, string> = {
  face_to_face: "bg-purple-100 text-purple-700 border-purple-200",
  online: "bg-blue-100 text-blue-700 border-blue-200",
  phone: "bg-slate-100 text-slate-700 border-slate-200",
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 (adjust from Sunday-based)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  let dow = d.getDay() - 1;
  if (dow < 0) dow = 6;
  d.setDate(d.getDate() - dow);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const DAYS = [
    t("days.mon"), t("days.tue"), t("days.wed"), t("days.thu"),
    t("days.fri"), t("days.sat"), t("days.sun"),
  ];
  const MONTHS = [
    t("months.january"), t("months.february"), t("months.march"),
    t("months.april"), t("months.may"), t("months.june"),
    t("months.july"), t("months.august"), t("months.september"),
    t("months.october"), t("months.november"), t("months.december"),
  ];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [interviews, setInterviews] = useState<CalendarInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<CalendarInterview | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    let start: Date, end: Date;

    if (view === "month") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    } else {
      const weekDates = getWeekDates(currentDate);
      start = weekDates[0];
      end = new Date(weekDates[6]);
      end.setHours(23, 59, 59);
    }

    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const res = await fetch(`/api/calendar?${params}`);
    const json = await res.json();
    if (json.success) setInterviews(json.data);
    setLoading(false);
  }, [currentDate, view]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  function navigateMonth(delta: number) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  }

  function navigateWeek(delta: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta * 7);
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedInterview(null);
    }
    if (selectedInterview) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedInterview]);

  function getInterviewsForDate(date: Date) {
    return interviews.filter((i) => isSameDay(new Date(i.scheduledAt), date));
  }

  const today = new Date();
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const weekDates = getWeekDates(currentDate);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (view === "month" ? navigateMonth(-1) : navigateWeek(-1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 min-w-[200px] text-center">
            {view === "month"
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `${weekDates[0].getDate()} - ${weekDates[6].getDate()} ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`}
          </h2>
          <button
            onClick={() => (view === "month" ? navigateMonth(1) : navigateWeek(1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t("today")}
          </button>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setView("month")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("month")}
          </button>
          <button
            onClick={() => setView("week")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("week")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />
      ) : view === "month" ? (
        /* Monthly View */
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="border-b border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30" />;
              }
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayInterviews = getInterviewsForDate(date);
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${
                    isToday ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayInterviews.slice(0, 2).map((iv) => (
                      <button
                        key={iv.id}
                        onClick={() => setSelectedInterview(iv)}
                        title={`${iv.process.firm.name} — ${iv.process.position.title}`}
                        className={`w-full rounded border px-1.5 py-0.5 text-left text-[10px] leading-tight ${
                          TYPE_COLORS[iv.type] || TYPE_COLORS.phone
                        } ${iv.isCompleted ? "opacity-50" : ""}`}
                      >
                        <span className="font-medium">
                          {new Date(iv.scheduledAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}{" "}
                          {iv.process.candidate.firstName} {iv.process.candidate.lastName[0]}.
                        </span>
                        <span className="block truncate text-[9px] opacity-75">
                          {iv.process.firm.name} · {iv.process.position.title}
                        </span>
                      </button>
                    ))}
                    {dayInterviews.length > 2 && (
                      <p className="text-[10px] font-medium text-indigo-600 pl-1">
                        +{dayInterviews.length - 2} {tc("more")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly View */
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7">
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, today);
              const dayInterviews = getInterviewsForDate(date);

              return (
                <div key={i} className="border-r border-slate-100 last:border-r-0">
                  <div className={`border-b border-slate-100 px-2 py-3 text-center ${
                    isToday ? "bg-indigo-50" : "bg-slate-50/80"
                  }`}>
                    <p className="text-xs font-semibold uppercase text-slate-500">{DAYS[i]}</p>
                    <p className={`mt-1 text-lg font-bold ${isToday ? "text-indigo-600" : "text-slate-900"}`}>
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="min-h-[400px] space-y-2 p-2">
                    {dayInterviews.length === 0 ? (
                      <p className="pt-4 text-center text-xs text-slate-300">—</p>
                    ) : (
                      dayInterviews.map((iv) => (
                        <button
                          key={iv.id}
                          onClick={() => setSelectedInterview(iv)}
                          className={`w-full rounded-lg border p-2.5 text-left transition-shadow hover:shadow-md ${
                            TYPE_COLORS[iv.type] || TYPE_COLORS.phone
                          } ${iv.isCompleted ? "opacity-50" : ""}`}
                        >
                          <p className="text-xs font-bold">
                            {new Date(iv.scheduledAt).toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            <span className="font-normal"> · {iv.durationMinutes} {tc("minutes")}</span>
                          </p>
                          <p className="mt-1 truncate text-xs font-medium">
                            {iv.process.candidate.firstName} {iv.process.candidate.lastName}
                          </p>
                          <p className="truncate text-[10px] opacity-80">
                            {iv.process.firm.name}
                          </p>
                          <p className="mt-1 text-[10px] font-medium">
                            {INTERVIEW_TYPE_LABELS[iv.type] || iv.type}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-purple-200" />
          <span className="text-xs text-slate-500">{t("faceToFace")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-200" />
          <span className="text-xs text-slate-500">{t("online")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-slate-200" />
          <span className="text-xs text-slate-500">{t("phone")}</span>
        </div>
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInterview(null);
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-md mx-4 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("interviewDetail")}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {selectedInterview.process.candidate.firstName}{" "}
                  {selectedInterview.process.candidate.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Firm & Position */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t("firmPosition")}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInterview.process.firm.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedInterview.process.position.title}
                  </p>
                </div>
              </div>

              {/* Date/Time & Duration */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t("dateTime")}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(selectedInterview.scheduledAt).toLocaleDateString(locale, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {new Date(selectedInterview.scheduledAt).toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({selectedInterview.durationMinutes} {tc("minutesFull")})
                  </p>
                </div>
              </div>

              {/* Interview Type */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t("interviewType")}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[selectedInterview.type] || TYPE_COLORS.phone}`}>
                      {INTERVIEW_TYPE_LABELS[selectedInterview.type] || selectedInterview.type}
                    </span>
                  </p>
                </div>
              </div>

              {/* Meeting Link (only for online) */}
              {selectedInterview.type === "online" && selectedInterview.meetingLink && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{t("meetingLink")}</p>
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline break-all"
                    >
                      {selectedInterview.meetingLink}
                    </a>
                  </div>
                </div>
              )}

              {/* Location (only for face_to_face) */}
              {selectedInterview.type === "face_to_face" && selectedInterview.location && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{tc("location")}</p>
                    <p className="text-sm text-slate-900">{selectedInterview.location}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{tc("notes")}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedInterview.notes}</p>
                  </div>
                </div>
              )}

              {/* Completed badge */}
              {selectedInterview.isCompleted && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                  <span className="text-xs font-medium text-emerald-700">{tc("completed")}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => {
                  const processId = selectedInterview.process.id;
                  setSelectedInterview(null);
                  router.push(`/processes/${processId}`);
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
{tc("goToProcess")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
